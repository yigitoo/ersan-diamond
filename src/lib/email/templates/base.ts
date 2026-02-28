export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://ersandiamond.com";
}

const LOGO_URL = "https://pub-2f86ee5ec40043559538f242150ae7b6.r2.dev/logo-horizontal.png";

export function wrapTemplate(content: string): string {
  return emailLayout(content);
}

export function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; background-color: #0A0A0A; color: #FAFAFA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
    .header { text-align: center; padding-bottom: 32px; border-bottom: 1px solid #2A2A2A; margin-bottom: 32px; }
    .header img { height: 50px; }
    .content { line-height: 1.7; color: #E5E5E5; font-size: 15px; }
    .content h2 { color: #FAFAFA; font-size: 20px; margin-bottom: 16px; }
    .highlight { color: #C9A84C; }
    .info-box { background: #151515; border: 1px solid #2A2A2A; border-radius: 4px; padding: 16px; margin: 24px 0; }
    .details-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .details-table td { padding: 12px 0; border-bottom: 1px solid #2A2A2A; font-size: 14px; }
    .details-table td:first-child { color: #8A8A8A; width: 140px; }
    .cta-btn { display: inline-block; background: #FAFAFA; color: #0A0A0A; padding: 14px 32px; text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: 500; margin: 24px 0; }
    .divider { border: none; border-top: 1px solid #2A2A2A; margin: 24px 0; }
    .signature { margin-top: 40px; padding-top: 24px; border-top: 1px solid #2A2A2A; color: #8A8A8A; font-size: 13px; line-height: 1.6; }
    .footer { text-align: center; padding-top: 32px; margin-top: 40px; border-top: 1px solid #2A2A2A; color: #8A8A8A; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="Ersan Diamond" />
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      Ersan Diamond | İstanbul<br/>
      Ersan Diamond | Only Original
    </div>
  </div>
</body>
</html>`;
}

export function signatureBlock(
  salesRepName: string,
  signatureTitle?: string,
  phone?: string
): string {
  const parts = [salesRepName];
  if (signatureTitle) parts.push(signatureTitle);
  if (phone) parts.push(phone);
  parts.push("Ersan Diamond Concierge");

  return `<div class="signature">
    ${parts.join("<br/>")}
  </div>`;
}

export function personalGreeting(salesRepName: string): string {
  return `<p style="font-size: 12px; color: #8A8A8A; margin-bottom: 8px;">from ${salesRepName}</p>`;
}
