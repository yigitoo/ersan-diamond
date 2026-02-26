import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import bcrypt from "bcryptjs";
import { successResponse, errorResponse, paginatedResponse, parseSearchParams } from "@/lib/utils/api-response";
import { getSessionUser } from "@/lib/auth/session";
import { logCrud } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();
    const { page, limit, skip } = parseSearchParams(req.nextUrl.searchParams);

    const [users, total] = await Promise.all([
      User.find({}).select("-passwordHash").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments({}),
    ]);

    return paginatedResponse(users, total, page, limit);
  } catch (error) {
    console.error("[API] GET /api/team error:", error);
    return errorResponse("Failed to fetch team", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "OWNER") {
      return errorResponse("Only OWNER can create users", 403);
    }

    await connectDB();
    const body = await req.json();

    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) return errorResponse("Email already exists", 409);

    const passwordHash = await bcrypt.hash(body.password, 12);
    const newUser = await User.create({
      ...body,
      email: body.email.toLowerCase(),
      passwordHash,
    });

    await logCrud(sessionUser.id, sessionUser.role, "create", "User", newUser._id.toString(), {
      after: { name: body.name, email: body.email, role: body.role },
    });

    const userObj = newUser.toObject();
    const { passwordHash: _, ...safeUser } = userObj;
    return successResponse(safeUser, 201);
  } catch (error) {
    console.error("[API] POST /api/team error:", error);
    return errorResponse("Failed to create user", 500);
  }
}
