export async function sendResetEmail(to: string, token: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Linkmint <noreply@linkmint.io>",
          to,
          subject: "Reset your Linkmint password",
          html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Expires in 1 hour.</p>`,
        }),
      });
      return;
    } catch (err) {
      console.error("[email] Resend send failed", err);
    }
  }
  console.info(`[email] password reset for ${to} — URL: ${resetUrl}`);
}
