import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Runs after OAuth login and routes the user to the correct dashboard.
// Flow:
//   1. If a pending account_type is in localStorage (user just registered), apply it and redirect.
//   2. If user already has account_type saved, redirect to the correct dashboard.
//   3. If no account_type (new Google login), redirect to /register to pick one.
export default function Onboard() {
  useEffect(() => {
    const run = async () => {
      const user = await base44.auth.me();
      if (!user) {
        window.location.href = '/register';
        return;
      }

      const pendingType = localStorage.getItem('tripsync_register_role');

      if (pendingType && !user.account_type) {
        await base44.auth.updateMe({ account_type: pendingType });
        localStorage.removeItem('tripsync_register_role');

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

        redirect(user.role === 'admin' ? 'admin' : pendingType);
      } else if (user.role === 'admin') {
        redirect('admin');
      } else if (user.account_type) {
        redirect(user.account_type);
      } else {
        window.location.href = '/register?pick_role=1';
      }
    };

    const redirect = (type) => {
      if (type === 'admin') window.location.href = '/admin';
      else if (type === 'guide') window.location.href = '/guide';
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