import { connectDB } from "@/lib/db/connection";
import { EmailThread, Email } from "@/lib/db/models";
import { fetchNewEmails } from "./imap";
import { matchThread } from "./thread-matcher";

// Store last sync UID in-memory (in production, use a DB setting)
let lastSyncUid = 1;

export async function syncInbox(): Promise<{ synced: number; errors: number }> {
  let synced = 0;
  let errors = 0;

  try {
    await connectDB();
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
        });

        lastSyncUid = Math.max(lastSyncUid, raw.uid);
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
