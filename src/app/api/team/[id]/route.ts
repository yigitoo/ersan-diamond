import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import bcrypt from "bcryptjs";
import { updateUserSchema } from "@/lib/validations/user";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { getSessionUser } from "@/lib/auth/session";
import { logCrud } from "@/lib/audit";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "OWNER") {
      return errorResponse("Only OWNER can update users", 403);
    }

    const { id } = await params;
    await connectDB();

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return errorResponse("User not found", 404);
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Validation error", 400);
    }

    const data = parsed.data;

    // OWNER cannot deactivate or change own role
    if (id === sessionUser.id) {
      if (data.active === false) {
        return errorResponse("OWNER cannot deactivate own account", 400);
      }
      if (data.role && data.role !== "OWNER") {
        return errorResponse("OWNER cannot change own role", 400);
      }
    }

    // Build update object
    const updateFields: Record<string, unknown> = {};
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.email !== undefined) updateFields.email = data.email.toLowerCase();
    if (data.role !== undefined) updateFields.role = data.role;
    if (data.active !== undefined) updateFields.active = data.active;
    if (data.signatureName !== undefined) updateFields.signatureName = data.signatureName;
    if (data.signatureTitle !== undefined) updateFields.signatureTitle = data.signatureTitle;
    if (data.phoneInternal !== undefined) updateFields.phoneInternal = data.phoneInternal;

    // Hash password if provided
    if (data.password) {
      updateFields.passwordHash = await bcrypt.hash(data.password, 12);
    }

    const before = {
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      active: existingUser.active,
    };

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true })
      .select("-passwordHash")
      .lean();

    await logCrud(sessionUser.id, sessionUser.role, "update", "User", id, {
      before,
      after: updateFields,
    });

    return successResponse(updatedUser);
  } catch (error) {
    console.error("[API] PATCH /api/team/[id] error:", error);
    return errorResponse("Failed to update user", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "OWNER") {
      return errorResponse("Only OWNER can delete users", 403);
    }

    const { id } = await params;

    // OWNER cannot delete self
    if (id === sessionUser.id) {
      return errorResponse("OWNER cannot delete own account", 400);
    }

    await connectDB();

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return errorResponse("User not found", 404);
    }

    // Soft delete: set active to false
    await User.findByIdAndUpdate(id, { active: false });

    await logCrud(sessionUser.id, sessionUser.role, "delete", "User", id, {
      before: { name: existingUser.name, email: existingUser.email, active: existingUser.active },
      after: { active: false },
    });

    return successResponse({ message: "User deactivated" });
  } catch (error) {
    console.error("[API] DELETE /api/team/[id] error:", error);
    return errorResponse("Failed to delete user", 500);
  }
}
