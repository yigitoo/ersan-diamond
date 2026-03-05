import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { EmailThread, Email } from "@/lib/db/models";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { getSessionUser } from "@/lib/auth/session";
import { logAudit, getRequestMeta } from "@/lib/audit/logger";
import type { AuditActionType } from "@/types";

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

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    await connectDB();

    const thread = await EmailThread.findById(id);
    if (!thread) return errorResponse("Thread not found", 404);

    const permanent = req.nextUrl.searchParams.get("permanent") === "true";

    if (permanent || thread.folder === "TRASH") {
      await Email.deleteMany({ threadId: id });
      await EmailThread.findByIdAndDelete(id);
      logAudit({ actorUserId: user.id, actorRole: user.role, actionType: "MAIL:thread_deleted", entityType: "EmailThread", entityId: id, route: `/api/mail/threads/${id}`, ...getRequestMeta(req) });
      return successResponse({ deleted: true });
    }

    // Soft delete: move to trash
    await EmailThread.findByIdAndUpdate(id, { folder: "TRASH" });
    await Email.updateMany({ threadId: id }, { folder: "TRASH" });
    logAudit({ actorUserId: user.id, actorRole: user.role, actionType: "MAIL:thread_trashed", entityType: "EmailThread", entityId: id, route: `/api/mail/threads/${id}`, ...getRequestMeta(req) });
    return successResponse({ trashedThread: id });
  } catch (error) {
    console.error("[API] DELETE /api/mail/threads/[id] error:", error);
    return errorResponse("Failed to delete thread", 500);
  }
}

const VALID_ACTIONS = ["archive", "close", "reopen", "markRead", "markUnread", "star", "unstar", "moveToTrash", "moveToInbox"] as const;
type ThreadAction = (typeof VALID_ACTIONS)[number];

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();
    const action: ThreadAction = body.action;

    if (!VALID_ACTIONS.includes(action)) {
      return errorResponse(`Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}`, 400);
    }

    await connectDB();

    const update: Record<string, unknown> = {};

    switch (action) {
      case "archive":
        update.status = "ARCHIVED";
        break;
      case "close":
        update.status = "CLOSED";
        break;
      case "reopen":
        update.status = "OPEN";
        break;
      case "markRead":
        update.unread = false;
        break;
      case "markUnread":
        update.unread = true;
        break;
      case "star":
        update.starred = true;
        break;
      case "unstar":
        update.starred = false;
        break;
      case "moveToTrash":
        update.folder = "TRASH";
        break;
      case "moveToInbox":
        update.folder = "INBOX";
        update.status = "OPEN";
        break;
    }

    const thread = await EmailThread.findByIdAndUpdate(id, update, { returnDocument: "after" }).lean();
    if (!thread) return errorResponse("Thread not found", 404);

    const actionAuditMap: Record<string, AuditActionType> = {
      star: "MAIL:thread_starred",
      unstar: "MAIL:thread_unstarred",
      moveToTrash: "MAIL:thread_trashed",
      moveToInbox: "MAIL:thread_restored",
      archive: "MAIL:thread_archived",
      close: "MAIL:thread_closed",
      reopen: "MAIL:thread_opened",
    };
    const auditAction = actionAuditMap[action];
    if (auditAction) {
      logAudit({ actorUserId: user.id, actorRole: user.role, actionType: auditAction, entityType: "EmailThread", entityId: id, after: update, route: `/api/mail/threads/${id}`, ...getRequestMeta(req) });
    }

    return successResponse(thread);
  } catch (error) {
    console.error("[API] PATCH /api/mail/threads/[id] error:", error);
    return errorResponse("Failed to update thread", 500);
  }
}
