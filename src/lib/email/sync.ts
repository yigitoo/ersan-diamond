import { connectDB } from "@/lib/db/connection";
import { EmailThread, Email, AppSetting } from "@/lib/db/models";
import { fetchAllFolders, SYNC_FOLDERS } from "./imap";
import { matchThread } from "./thread-matcher";
import { uploadBuffer, generateAttachmentKey } from "@/lib/r2";
import type { MailFolder } from "@/types";

const UID_KEY_PREFIX = "imap_last_uid_";

async function getFolderUidMap(): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  const settings = await AppSetting.find({ key: { $regex: `^${UID_KEY_PREFIX}` } });
  for (const s of settings) {
    const folder = s.key.replace(UID_KEY_PREFIX, "");
    map[folder] = parseInt(s.value, 10) || 1;
  }
  // Also check legacy key for backward compat
  const legacy = await AppSetting.findOne({ key: "imap_last_uid" });
  if (legacy && !map["INBOX"]) {
    map["INBOX"] = parseInt(legacy.value, 10) || 1;
  }
  return map;
}

async function saveFolderUid(folder: string, uid: number): Promise<void> {
  await AppSetting.findOneAndUpdate(
    { key: `${UID_KEY_PREFIX}${folder}` },
    { value: String(uid) },
    { upsert: true },
  );
}

/** Determine direction based on folder and sender */
function resolveDirection(folder: MailFolder, from: string): "INBOUND" | "OUTBOUND" {
  const ourEmail = (process.env.IMAP_USER || "").toLowerCase();
  if (folder === "SENT" || folder === "DRAFTS") return "OUTBOUND";
  if (from.toLowerCase() === ourEmail) return "OUTBOUND";
  return "INBOUND";
}

/** Determine thread folder — prioritize: if thread already has a folder, keep it unless trash/spam overrides */
function resolveThreadFolder(existingFolder: MailFolder | undefined, newFolder: MailFolder): MailFolder {
  // Trash and spam always override
  if (newFolder === "TRASH") return "TRASH";
  if (newFolder === "SPAM") return "SPAM";
  // If thread already has a folder, keep inbox priority
  if (existingFolder === "INBOX") return "INBOX";
  if (existingFolder === "TRASH" && newFolder === "INBOX") return "INBOX"; // restored from trash
  return newFolder === "ALL" ? (existingFolder || "INBOX") : newFolder;
}

export async function syncInbox(): Promise<{ synced: number; errors: number; folders: Record<string, number> }> {
  let synced = 0;
  let errors = 0;
  const folderCounts: Record<string, number> = {};

  try {
    await connectDB();
    const uidMap = await getFolderUidMap();
    const allEmails = await fetchAllFolders(uidMap);

    // Track max UID per folder
    const maxUids: Record<string, number> = { ...uidMap };

    for (const raw of allEmails) {
      try {
        // Dedup by providerMessageId
        if (raw.messageId) {
          const existing = await Email.findOne({ providerMessageId: raw.messageId });
          if (existing) {
            // Update folder/flags if changed
            const updates: Record<string, unknown> = {};
            if (raw.folder === "TRASH" && existing.folder !== "TRASH") updates.folder = "TRASH";
            if (raw.folder === "SPAM" && existing.folder !== "SPAM") updates.folder = "SPAM";
            if (raw.seen !== existing.seen) updates.seen = raw.seen;
            if (raw.flagged !== existing.flagged) updates.flagged = raw.flagged;

            if (Object.keys(updates).length > 0) {
              await Email.findByIdAndUpdate(existing._id, updates);

              // Update thread folder too
              if (updates.folder) {
                const thread = await EmailThread.findById(existing.threadId);
                if (thread) {
                  const newThreadFolder = resolveThreadFolder(thread.folder as MailFolder, updates.folder as MailFolder);
                  await EmailThread.findByIdAndUpdate(thread._id, { folder: newThreadFolder });
                }
              }
              // Update thread unread based on seen flag
              if (updates.seen !== undefined) {
                await EmailThread.findByIdAndUpdate(existing.threadId, { unread: !raw.seen });
              }
            }

            maxUids[raw.folder] = Math.max(maxUids[raw.folder] || 1, raw.uid);
            continue;
          }
        }

        // Determine direction
        const direction = resolveDirection(raw.folder, raw.from);
        const to = raw.to || raw.from;
        const customerEmail = direction === "INBOUND" ? raw.from : to;

        // Find or create thread
        const thread = await matchThread(customerEmail, raw.subject, raw.inReplyTo);

        // Upload attachments to R2
        const attachmentsMeta: Array<{ filename: string; contentType: string; size: number; url: string }> = [];
        for (const att of raw.attachments) {
          try {
            const key = generateAttachmentKey(att.filename);
            const url = await uploadBuffer(key, att.content, att.contentType);
            attachmentsMeta.push({
              filename: att.filename,
              contentType: att.contentType,
              size: att.size,
              url,
            });
          } catch (err) {
            console.warn("[Sync] Failed to upload attachment:", att.filename, err);
          }
        }

        await Email.create({
          threadId: thread._id,
          direction,
          from: raw.from,
          to,
          subject: raw.subject,
          html: raw.html,
          text: raw.text,
          sentAt: raw.date,
          status: direction === "INBOUND" ? "RECEIVED" : "SENT",
          providerMessageId: raw.messageId || undefined,
          attachmentsMeta,
          folder: raw.folder,
          seen: raw.seen,
          flagged: raw.flagged,
        });

        // Update thread
        const threadFolder = resolveThreadFolder(thread.folder as MailFolder | undefined, raw.folder);
        await EmailThread.findByIdAndUpdate(thread._id, {
          lastMessageAt: raw.date,
          $inc: { messageCount: 1 },
          unread: !raw.seen,
          starred: raw.flagged || thread.starred,
          folder: threadFolder,
        });

        maxUids[raw.folder] = Math.max(maxUids[raw.folder] || 1, raw.uid);
        synced++;
        folderCounts[raw.folder] = (folderCounts[raw.folder] || 0) + 1;
      } catch (err) {
        console.error("[Sync] Error processing email:", err);
        errors++;
      }
    }

    // Save max UIDs per folder
    for (const [folder, uid] of Object.entries(maxUids)) {
      await saveFolderUid(folder, uid);
    }
  } catch (error) {
    console.error("[Sync] Full sync failed:", error);
    errors++;
  }

  return { synced, errors, folders: folderCounts };
}
