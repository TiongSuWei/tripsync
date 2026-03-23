import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// This page runs after login/register and routes the user to the correct dashboard
export default function Onboard() {
  useEffect(() => {
    const run = async () => {
      const user = await base44.auth.me();
      if (!user) {
        window.location.href = '/';
        return;
      }

      // If registering for the first time, apply role from localStorage
      const pendingRole = localStorage.getItem('tripsync_register_role');
      if (pendingRole && !user.role) {
        await base44.auth.updateMe({ role: pendingRole });
        localStorage.removeItem('tripsync_register_role');
        const updated = await base44.auth.me();
        route(updated);
      } else {
        if (pendingRole) {
          localStorage.removeItem('tripsync_register_role');
        }
        route(user);
      }
    };

    const route = (user) => {
      if (user.role === 'admin') window.location.href = '/admin';
      else if (user.role === 'guide') window.location.href = '/guide';
      else window.location.href = '/traveler';
    };

    run();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" />
    </div>
  );
}