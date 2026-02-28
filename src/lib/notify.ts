import { sendEmail } from "@/lib/email/smtp";
import { sendSms } from "@/lib/sms/httpsms";

interface NotifyParams {
  to: { email?: string; phone?: string };
  email?: { subject: string; html: string };
  sms?: string;
}

export async function notify(params: NotifyParams): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (params.email && params.to.email) {
    tasks.push(
      sendEmail({
        to: params.to.email,
        subject: params.email.subject,
        html: params.email.html,
      }).catch((err) => console.error("[notify] email failed:", err))
    );
  }

  if (params.sms && params.to.phone) {
    tasks.push(
      sendSms({ to: params.to.phone, content: params.sms }).catch((err) =>
        console.error("[notify] sms failed:", err)
      )
    );
  }

  await Promise.allSettled(tasks);
}
