import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Navigate } from 'react-router-dom';

const typeDashboard = {
  admin: '/admin',
  guide: '/guide',
  traveler: '/traveler',
};

// Returns the effective role: admins use platform role, others use account_type
function getEffectiveRole(user) {
  if (!user) return null;
  if (user.role === 'admin') return 'admin';
  return user.account_type || null;
}

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

  if (!user) return <Navigate to="/register" replace />;

  const effectiveRole = getEffectiveRole(user);

  if (!effectiveRole) return <Navigate to="/register?pick_role=1" replace />;

  if (!allowedRoles.includes(effectiveRole)) {
    const dest = typeDashboard[effectiveRole] || '/register';
    return <Navigate to={dest} replace />;
  }

  return children;
}