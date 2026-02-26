import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { EmailThread, Email } from "@/lib/db/models";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { getSessionUser } from "@/lib/auth/session";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    const thread = await EmailThread.findById(id).lean();
    if (!thread) return errorResponse("Thread not found", 404);

    const emails = await Email.find({ threadId: id }).sort({ sentAt: 1 }).lean();

    return successResponse({ thread, emails });
  } catch (error) {
    console.error("[API] GET /api/mail/threads/[id] error:", error);
    return errorResponse("Failed to fetch thread", 500);
  }
}
