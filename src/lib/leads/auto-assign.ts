import { connectDB } from "@/lib/db/connection";
import User from "@/lib/db/models/user";
import Lead from "@/lib/db/models/lead";

interface AutoAssignResult {
  assignedUserId: string;
  assignedUserName: string;
}

/**
 * Auto-assign a lead to the SALES user with the fewest active leads.
 * Active = status NOT in ["WON", "LOST"].
 * Only considers users with role=SALES and active=true.
 */
export async function autoAssignLead(leadId: string): Promise<AutoAssignResult | null> {
  await connectDB();

  const salesUsers = await User.find({ role: "SALES", active: true })
    .select("_id name")
    .lean();

  if (salesUsers.length === 0) return null;

  // Count active leads per sales user
  const activeLeadCounts = await Lead.aggregate([
    {
      $match: {
        status: { $nin: ["WON", "LOST"] },
        assignedUserId: { $in: salesUsers.map((u) => u._id) },
      },
    },
    {
      $group: {
        _id: "$assignedUserId",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map<string, number>();
  for (const entry of activeLeadCounts) {
    countMap.set(entry._id.toString(), entry.count);
  }

  // Find user with lowest active lead count
  let minUser = salesUsers[0];
  let minCount = countMap.get(salesUsers[0]._id.toString()) ?? 0;

  for (const user of salesUsers.slice(1)) {
    const count = countMap.get(user._id.toString()) ?? 0;
    if (count < minCount) {
      minCount = count;
      minUser = user;
    }
  }

  // Assign and tag as auto-assigned
  await Lead.findByIdAndUpdate(leadId, {
    assignedUserId: minUser._id,
    $addToSet: { tags: "auto-assigned" },
  });

  return {
    assignedUserId: minUser._id.toString(),
    assignedUserName: (minUser as any).name,
  };
}
