import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Runs after OAuth login and routes the user to the correct dashboard.
// The pending role from localStorage is always applied (set by Register page before OAuth).
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

      // Always apply the selected role from the register page
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

        redirect(pendingType);
      } else if (user.account_type) {
        // Fallback: user somehow landed here without going through register
        redirect(user.account_type);
      } else {
        window.location.href = '/register';
      }
    };

    const redirect = (type) => {
      if (type === 'guide') window.location.href = '/guide';
      else window.location.href = '/traveler';
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