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

const VALID_ACTIONS = ["archive", "close", "reopen", "markRead", "markUnread"] as const;
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
    }

    const thread = await EmailThread.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!thread) return errorResponse("Thread not found", 404);

    return successResponse(thread);
  } catch (error) {
    console.error("[API] PATCH /api/mail/threads/[id] error:", error);
    return errorResponse("Failed to update thread", 500);
  }
}
