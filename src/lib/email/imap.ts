import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import type { MailFolder } from "@/types";

function createClient() {
  return new ImapFlow({
    host: process.env.IMAP_HOST!,
    port: parseInt(process.env.IMAP_PORT || "993"),
    secure: true,
    auth: {
      user: process.env.IMAP_USER!,
      pass: process.env.IMAP_PASS!,
    },
    logger: false,
  });
}

/** Gmail IMAP folder → our MailFolder mapping */
export const GMAIL_FOLDER_MAP: Record<string, MailFolder> = {
  "INBOX": "INBOX",
  "[Gmail]/Sent Mail": "SENT",
  "[Gmail]/G\\u00f6nderilmi\\u015f Postalar": "SENT", // Turkish Gmail
  "[Gmail]/Gönderilmiş Postalar": "SENT",
  "[Gmail]/Drafts": "DRAFTS",
  "[Gmail]/Taslaklar": "DRAFTS",
  "[Gmail]/Trash": "TRASH",
  "[Gmail]/Çöp Kutusu": "TRASH",
  "[Gmail]/Spam": "SPAM",
  "[Gmail]/All Mail": "ALL",
  "[Gmail]/Tüm Postalar": "ALL",
};

/** Folders we want to sync — in priority order */
export const SYNC_FOLDERS: Array<{ imapPath: string; folder: MailFolder }> = [
  { imapPath: "INBOX", folder: "INBOX" },
  { imapPath: "[Gmail]/Sent Mail", folder: "SENT" },
  { imapPath: "[Gmail]/Trash", folder: "TRASH" },
  { imapPath: "[Gmail]/Drafts", folder: "DRAFTS" },
  { imapPath: "[Gmail]/Spam", folder: "SPAM" },
];

export interface ParsedAttachment {
  filename: string;
  contentType: string;
  content: Buffer;
  size: number;
}

export interface ParsedEmail {
  uid: number;
  messageId: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  date: Date;
  inReplyTo?: string;
  references?: string[];
  attachments: ParsedAttachment[];
  folder: MailFolder;
  seen: boolean;
  flagged: boolean;
}

/** Fetch new emails from a specific IMAP folder */
export async function fetchNewEmails(sinceUid = 1, imapPath = "INBOX", folder: MailFolder = "INBOX"): Promise<ParsedEmail[]> {
  const client = createClient();
  const emails: ParsedEmail[] = [];

  try {
    await client.connect();

    // Check if folder exists
    let lock;
    try {
      lock = await client.getMailboxLock(imapPath);
    } catch {
      // Folder doesn't exist (e.g. Turkish Gmail labels differ)
      await client.logout();
      return emails;
    }

    try {
      const messages = client.fetch(`${sinceUid}:*`, {
        uid: true,
        envelope: true,
        source: true,
        bodyStructure: true,
        flags: true,
      });

      for await (const msg of messages) {
        if (msg.uid <= sinceUid && sinceUid > 1) continue;

        const envelope = msg.envelope;
        if (!envelope) continue;
        const source = msg.source;
        if (!source) continue;

        // Parse flags
        const flags = msg.flags || new Set();
        const seen = flags.has("\\Seen");
        const flagged = flags.has("\\Flagged");

        // Parse MIME to extract HTML and text bodies
        const parsed = await simpleParser(source);

        // Extract attachments
        const attachments: ParsedAttachment[] = (parsed.attachments || [])
          .filter((att) => att.content && att.size <= 25 * 1024 * 1024)
          .map((att) => ({
            filename: att.filename || `attachment-${Date.now()}`,
            contentType: att.contentType || "application/octet-stream",
            content: att.content,
            size: att.size,
          }));

        emails.push({
          uid: msg.uid,
          messageId: envelope.messageId || "",
          from: envelope.from?.[0]?.address || "",
          to: envelope.to?.[0]?.address
            || (parsed.to && !Array.isArray(parsed.to) ? parsed.to.value?.[0]?.address : undefined)
            || envelope.cc?.[0]?.address
            || process.env.IMAP_USER
            || "unknown",
          subject: envelope.subject || "",
          html: (typeof parsed.html === "string" ? parsed.html : "") || "",
          text: parsed.text || "",
          date: envelope.date ? new Date(envelope.date) : new Date(),
          inReplyTo: envelope.inReplyTo || undefined,
          attachments,
          folder,
          seen,
          flagged,
        });
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (error) {
    console.error(`[IMAP] Fetch error (${imapPath}):`, error);
    try {
      await client.logout();
    } catch {}
  }

  return emails;
}

/** Fetch from all configured Gmail folders */
export async function fetchAllFolders(
  uidMap: Record<string, number>,
): Promise<ParsedEmail[]> {
  const allEmails: ParsedEmail[] = [];

  for (const { imapPath, folder } of SYNC_FOLDERS) {
    const sinceUid = uidMap[folder] || 1;
    try {
      const emails = await fetchNewEmails(sinceUid, imapPath, folder);
      allEmails.push(...emails);
    } catch (err) {
      console.error(`[IMAP] Failed to fetch ${imapPath}:`, err);
    }
  }

  return allEmails;
}
