import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const info = await transporter.sendMail({
      from: `"Ersan Diamond" <${process.env.SMTP_FROM}>`,
      replyTo: process.env.SMTP_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      attachments: params.attachments,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[SMTP] Send failed:", error);
    return { success: false, error: error.message };
  }
}

export async function sendTemplatedEmail(
  to: string,
  subject: string,
  htmlTemplate: string,
  variables: Record<string, string>,
  attachments?: SendEmailParams["attachments"]
): Promise<SendEmailResult> {
  let html = htmlTemplate;
  let text = htmlTemplate.replace(/<[^>]*>/g, ""); // strip HTML for text version

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    html = html.replace(regex, value);
    text = text.replace(regex, value);
  });

  return sendEmail({ to, subject, html, text, attachments });
}
