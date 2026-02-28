const HTTPSMS_URL = "https://api.httpsms.com/v1/messages/send";

interface SendSmsResult {
  success: boolean;
  error?: string;
}

export async function sendSms(params: {
  to: string;
  content: string;
}): Promise<SendSmsResult> {
  const apiKey = process.env.HTTPSMS_API_KEY;
  const from = process.env.HTTPSMS_FROM || "+905523548503";

  if (!apiKey) {
    console.warn("[SMS] HTTPSMS_API_KEY not set, skipping SMS");
    return { success: false, error: "HTTPSMS_API_KEY not configured" };
  }

  // Normalize: strip spaces/dashes, ensure +90 prefix
  const phone = params.to.replace(/[\s\-()]/g, "");
  if (phone.length < 10 || !/^\+?\d+$/.test(phone)) {
    console.warn("[SMS] Invalid phone number:", params.to);
    return { success: false, error: "Invalid phone number" };
  }

  const to = phone.startsWith("+") ? phone : `+90${phone}`;

  try {
    const res = await fetch(HTTPSMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ from, to, content: params.content }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[SMS] httpSMS error:", res.status, text);
      return { success: false, error: `httpSMS ${res.status}: ${text}` };
    }

    console.log("[SMS] Sent to", to);
    return { success: true };
  } catch (err) {
    console.error("[SMS] Failed:", err);
    return { success: false, error: String(err) };
  }
}
