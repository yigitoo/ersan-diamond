import { ImapFlow } from "imapflow";

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
}

export async function fetchNewEmails(sinceUid = 1): Promise<ParsedEmail[]> {
  const client = createClient();
  const emails: ParsedEmail[] = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const messages = client.fetch(`${sinceUid}:*`, {
        uid: true,
        envelope: true,
        source: true,
        bodyStructure: true,
      });

      for await (const msg of messages) {
        if (msg.uid <= sinceUid && sinceUid > 1) continue;

        const envelope = msg.envelope;
        if (!envelope) continue;
        const source = msg.source?.toString() || "";

        emails.push({
          uid: msg.uid,
          messageId: envelope.messageId || "",
          from: envelope.from?.[0]?.address || "",
          to: envelope.to?.[0]?.address || "",
          subject: envelope.subject || "",
          html: "", // Would need proper MIME parsing
          text: source,
          date: envelope.date ? new Date(envelope.date) : new Date(),
          inReplyTo: envelope.inReplyTo || undefined,
        });
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (error) {
    console.error("[IMAP] Fetch error:", error);
    try {
      await client.logout();
    } catch {}
  }

  return emails;
}
