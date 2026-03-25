import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Navigate } from 'react-router-dom';

// Maps a role to its default dashboard path
const roleDashboard = {
  admin: '/admin',
  guide: '/guide',
  traveler: '/traveler',
};

export default function RoleGuard({ allowedRoles, children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" />
    </div>
  );

  // Not logged in → go to register
  if (!user) return <Navigate to="/register" replace />;

  // No role set yet → go pick one
  if (!user.role || user.role === 'user') return <Navigate to="/register?pick_role=1" replace />;

  // Wrong role → redirect to their correct dashboard
  if (!allowedRoles.includes(user.role)) {
    const dest = roleDashboard[user.role] || '/register';
    return <Navigate to={dest} replace />;
  }

  return children;
}