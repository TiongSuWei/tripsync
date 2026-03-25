import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// This page runs after OAuth login and routes the user to the correct dashboard.
// Flow:
//   1. If a pending role is in localStorage (user just registered), apply it and redirect.
//   2. If user already has a role saved, redirect to the correct dashboard.
//   3. If user has no role at all (e.g. Google login without prior selection), redirect to /register to pick one.
export default function Onboard() {
  useEffect(() => {
    const run = async () => {
      const user = await base44.auth.me();
      if (!user) {
        window.location.href = '/register';
        return;
      }

      const pendingRole = localStorage.getItem('tripsync_register_role');

      if (pendingRole) {
        // Always apply pending role (overwrites whatever was there before)
        await base44.auth.updateMe({ role: pendingRole });
        localStorage.removeItem('tripsync_register_role');
        redirect(pendingRole);
      } else if (user.role && user.role !== 'user') {
        // Already has a meaningful role saved — go directly to the right dashboard
        redirect(user.role);
      } else {
        // New Google login or missing role — send to register to pick a role
        window.location.href = '/register?pick_role=1';
      }
    };

    const redirect = (role) => {
      if (role === 'admin') window.location.href = '/admin';
      else if (role === 'guide') window.location.href = '/guide';
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