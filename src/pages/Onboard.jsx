import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Runs after OAuth login:
// 1. Applies the selected role
// 2. Sends OTP to user's email
// 3. Redirects to /verify-otp for 2FA
export default function Onboard() {
  useEffect(() => {
    const run = async () => {
      const user = await base44.auth.me();
      if (!user) {
        window.location.href = '/register';
        return;
      }

      const pendingType = localStorage.getItem('tripsync_register_role');
      localStorage.removeItem('tripsync_register_role');

      // Admin users skip role selection entirely
      if (user.role === 'admin' && !pendingType) {
        localStorage.setItem('tripsync_otp_dest', '/admin');
        await base44.functions.invoke('sendOtp', {});
        window.location.href = '/verify-otp';
        return;
      }

      // Determine the role to apply
      const roleToApply = pendingType || user.account_type;

      if (!roleToApply) {
        window.location.href = '/register';
        return;
      }

      // Always apply the pending role if the user explicitly selected one
      if (pendingType) {
        await base44.auth.updateMe({ account_type: pendingType });

        // Auto-create a GuideProfile stub so the guide is instantly visible
        if (pendingType === 'guide') {
          const existing = await base44.entities.GuideProfile.filter({ guide_email: user.email });
          if (existing.length === 0) {
            await base44.entities.GuideProfile.create({
              guide_email: user.email,
              guide_name: user.full_name || user.email,
              status: 'approved',
              verified: true,
            });
          }
        }
      }

      // Store destination so verify-otp page knows where to send the user
      const dest = roleToApply === 'guide' ? '/guide' : '/traveler';
      localStorage.setItem('tripsync_otp_dest', dest);

      // Send OTP email
      await base44.functions.invoke('sendOtp', {});

      // Redirect to 2FA verification page
      window.location.href = '/verify-otp';
    };

    run();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Setting up your account…</p>
      </div>
    </div>
  );
}