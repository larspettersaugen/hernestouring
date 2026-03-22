export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, error: 'Email not configured (RESEND_API_KEY)' };
  }
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Tour Me Like It's Hot";
  try {
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Reset your ${appName} password`,
        html: `
          <p>We received a request to reset the password for your account.</p>
          <p><a href="${resetUrl}" style="color: #6366f1; text-decoration: underline;">Choose a new password</a></p>
          <p>Or copy this link (expires in one hour): ${resetUrl}</p>
          <p>If you did not request this, you can ignore this email. Your password will not change.</p>
        `,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { sent: false, error: (data as { message?: string }).message || res.statusText };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : 'Failed to send' };
  }
}
