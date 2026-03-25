import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return Response.json({ error: 'Code is required' }, { status: 400 });
    }

    // Find matching unused code for this user
    const otps = await base44.asServiceRole.entities.OtpCode.filter({ email: user.email, used: false });

    if (otps.length === 0) {
      return Response.json({ error: 'No active verification code found. Please request a new one.' }, { status: 400 });
    }

    // Get the latest one
    const otp = otps.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

    // Check expiry
    if (new Date() > new Date(otp.expires_at)) {
      await base44.asServiceRole.entities.OtpCode.update(otp.id, { used: true });
      return Response.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // Check code match
    if (otp.code !== String(code).trim()) {
      return Response.json({ error: 'Incorrect verification code. Please try again.' }, { status: 400 });
    }

    // Mark as used
    await base44.asServiceRole.entities.OtpCode.update(otp.id, { used: true });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});