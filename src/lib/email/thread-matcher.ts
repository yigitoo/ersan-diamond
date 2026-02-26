import { EmailThread, Email, Lead, Appointment } from "@/lib/db/models";

/**
 * Match an incoming email to an existing thread, or create a new one.
 * Strategy:
 * 1. In-Reply-To header → find email by providerMessageId → use its threadId
 * 2. Subject token: [ED-APPT-xxxx] or [ED-LEAD-xxxx]
 * 3. Email address → find lead by email → use thread
 * 4. Create new thread
 */
export async function matchThread(
  fromEmail: string,
  subject: string,
  inReplyTo?: string
) {
  // 1. In-Reply-To matching
  if (inReplyTo) {
    const parentEmail = await Email.findOne({ providerMessageId: inReplyTo });
    if (parentEmail) {
      const thread = await EmailThread.findById(parentEmail.threadId);
      if (thread) return thread;
    }
  }

  // 2. Subject token matching
  const apptMatch = subject.match(/\[ED-APPT-([a-f0-9]+)\]/i);
  if (apptMatch) {
    const thread = await EmailThread.findOne({ appointmentId: apptMatch[1] });
    if (thread) return thread;
  }

  const leadMatch = subject.match(/\[ED-LEAD-([a-f0-9]+)\]/i);
  if (leadMatch) {
    const thread = await EmailThread.findOne({ leadId: leadMatch[1] });
    if (thread) return thread;
  }

  // 3. Email address matching
  const normalizedEmail = fromEmail.toLowerCase();
  const existingThread = await EmailThread.findOne({ customerEmail: normalizedEmail })
    .sort({ lastMessageAt: -1 });
  if (existingThread) return existingThread;

  // 4. Try to link to a lead
  const lead = await Lead.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

  // 5. Create new thread
  const newThread = await EmailThread.create({
    customerEmail: normalizedEmail,
    subject,
    leadId: lead?._id,
    lastMessageAt: new Date(),
    messageCount: 0,
  });

  // Update lead with thread reference
  if (lead && !lead.threadId) {
    await Lead.findByIdAndUpdate(lead._id, { threadId: newThread._id });
  }

  return newThread;
}
