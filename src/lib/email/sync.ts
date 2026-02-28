import { connectDB } from "@/lib/db/connection";
import { EmailThread, Email, AppSetting } from "@/lib/db/models";
import { fetchNewEmails } from "./imap";
import { matchThread } from "./thread-matcher";

const LAST_UID_KEY = "imap_last_uid";

async function getLastSyncUid(): Promise<number> {
  const setting = await AppSetting.findOne({ key: LAST_UID_KEY });
  return setting ? parseInt(setting.value, 10) : 1;
}

async function saveLastSyncUid(uid: number): Promise<void> {
  await AppSetting.findOneAndUpdate(
    { key: LAST_UID_KEY },
    { value: String(uid) },
    { upsert: true }
  );
}

export async function syncInbox(): Promise<{ synced: number; errors: number }> {
  let synced = 0;
  let errors = 0;

  try {
    await connectDB();
    let lastSyncUid = await getLastSyncUid();
    const newEmails = await fetchNewEmails(lastSyncUid);

    for (const raw of newEmails) {
      try {
        // Dedup by providerMessageId
        const existing = await Email.findOne({ providerMessageId: raw.messageId });
        if (existing) continue;

        // Find or create thread
        const thread = await matchThread(raw.from, raw.subject, raw.inReplyTo);

        await Email.create({
          threadId: thread._id,
          direction: "INBOUND",
          from: raw.from,
          to: raw.to,
          subject: raw.subject,
          html: raw.html,
          text: raw.text,
          sentAt: raw.date,
          status: "RECEIVED",
          providerMessageId: raw.messageId,
          attachmentsMeta: [],
        });

        await EmailThread.findByIdAndUpdate(thread._id, {
          lastMessageAt: raw.date,
          $inc: { messageCount: 1 },
          unread: true,
        });

        lastSyncUid = Math.max(lastSyncUid, raw.uid);
        await saveLastSyncUid(lastSyncUid);
        synced++;
      } catch (err) {
        console.error("[Sync] Error processing email:", err);
        errors++;
      }
    }
  } catch (error) {
    console.error("[Sync] Inbox sync failed:", error);
    errors++;
  }

  return { synced, errors };
}
