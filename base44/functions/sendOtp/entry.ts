import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Invalidate any existing unused codes for this email
    const existing = await base44.asServiceRole.entities.OtpCode.filter({ email: user.email, used: false });
    for (const otp of existing) {
      await base44.asServiceRole.entities.OtpCode.update(otp.id, { used: true });
    }

    // Store new code
    await base44.asServiceRole.entities.OtpCode.create({
      email: user.email,
      code,
      expires_at: expiresAt,
      used: false,
    });

    // Send email with the code
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: 'Your TripSync verification code',
      body: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">TripSync</h2>
          <p style="color: #555; margin-bottom: 24px;">Here is your one-time verification code:</p>
          <div style="background: #f4f4f4; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #111;">${code}</span>
          </div>
          <p style="color: #555; font-size: 14px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color: #999; font-size: 12px; margin-top: 16px;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});