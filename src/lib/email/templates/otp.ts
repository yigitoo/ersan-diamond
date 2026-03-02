import { getAppUrl } from "./base";

const LOGO_URL = "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/logo-horizontal.png";

export function otpEmailTemplate(code: string): string {
  // Split code into individual digits for styled boxes
  const digits = code.split("");
  const digitBoxes = digits
    .map(
      (d) =>
        `<td style="width:44px;height:56px;text-align:center;vertical-align:middle;font-size:28px;font-weight:700;font-family:'Courier New',monospace;color:#FAFAFA;background:#151515;border:2px solid #C9A84C;border-radius:4px;">${d}</td>`
    )
    .join('<td style="width:8px;"></td>');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#0A0A0A;color:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <!-- Header -->
    <div style="text-align:center;padding-bottom:32px;border-bottom:1px solid #2A2A2A;margin-bottom:32px;">
      <img src="${LOGO_URL}" alt="Ersan Diamond" style="height:50px;" />
    </div>

    <!-- Content -->
    <div style="line-height:1.7;color:#E5E5E5;font-size:15px;">

      <h2 style="color:#FAFAFA;font-size:20px;margin-bottom:16px;text-align:center;">
        Doğrulama Kodu
      </h2>

      <p style="text-align:center;color:#8A8A8A;font-size:14px;margin-bottom:8px;">
        Panel girişiniz için doğrulama kodunuz:
      </p>

      <!-- OTP Code Boxes -->
      <div style="text-align:center;margin:32px 0;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            ${digitBoxes}
          </tr>
        </table>
      </div>

      <!-- Expiry notice -->
      <div style="background:#151515;border:1px solid #2A2A2A;border-radius:4px;padding:16px;margin:24px 0;text-align:center;">
        <p style="margin:0;font-size:13px;color:#8A8A8A;">
          Bu kod <strong style="color:#C9A84C;">5 dakika</strong> içinde geçerliliğini yitirecektir.
        </p>
        <p style="margin:4px 0 0;font-size:12px;color:#666;">
          This code will expire in <strong style="color:#C9A84C;">5 minutes</strong>.
        </p>
      </div>

      <!-- Security notice -->
      <p style="font-size:12px;color:#666;margin-top:24px;text-align:center;">
        Bu kodu talep etmediyseniz lütfen dikkate almayın.<br/>
        If you did not request this code, please ignore this email.
      </p>

    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:32px;margin-top:40px;border-top:1px solid #2A2A2A;color:#8A8A8A;font-size:12px;">
      Ersan Diamond | İstanbul<br/>
      Ersan Diamond | Only Original
    </div>
  </div>
</body>
</html>`;
}

export function otpSmsTemplate(code: string): string {
  return `Ersan Diamond doğrulama kodunuz: ${code} (5 dk geçerli)`;
}
