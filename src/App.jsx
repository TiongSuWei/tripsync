import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import RoleGuard from '@/components/layout/RoleGuard';

// Pages
import Register from './pages/Register';
import Onboard from './pages/Onboard';
import Chat from './pages/Chat';

// Traveler
import TravelerDashboard from './pages/traveler/TravelerDashboard';
import SearchPlan from './pages/traveler/SearchPlan';
import MyTrips from './pages/traveler/MyTrips';
import GuideList from './pages/traveler/GuideList';
import GuideProfilePage from './pages/traveler/GuideProfile';

// Guide
import GuideDashboard from './pages/guide/GuideDashboard';
import GuideProfileEditor from './pages/guide/GuideProfileEditor';
import GuideBookings from './pages/guide/GuideBookings';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import VerifyGuides from './pages/admin/VerifyGuides';
import AdminTrips from './pages/admin/AdminTrips';
import AdminUsers from './pages/admin/AdminUsers';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    else if (authError.type === 'auth_required') { window.location.href = '/register'; return null; }
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboard" element={<Onboard />} />

      {/* Traveler */}
      <Route path="/traveler" element={<RoleGuard allowedRoles={['traveler']}><TravelerDashboard /></RoleGuard>} />
      <Route path="/search" element={<RoleGuard allowedRoles={['traveler']}><SearchPlan /></RoleGuard>} />
      <Route path="/trips" element={<RoleGuard allowedRoles={['traveler']}><MyTrips /></RoleGuard>} />
      <Route path="/guides" element={<RoleGuard allowedRoles={['traveler']}><GuideList /></RoleGuard>} />
      <Route path="/guides/:id" element={<RoleGuard allowedRoles={['traveler']}><GuideProfilePage /></RoleGuard>} />

      <Route path="/chat" element={<RoleGuard allowedRoles={['traveler', 'admin']}><Chat /></RoleGuard>} />

      {/* Guide */}
      <Route path="/guide" element={<RoleGuard allowedRoles={['guide']}><GuideDashboard /></RoleGuard>} />
      <Route path="/guide/profile" element={<RoleGuard allowedRoles={['guide']}><GuideProfileEditor /></RoleGuard>} />
      <Route path="/guide/bookings" element={<RoleGuard allowedRoles={['guide']}><GuideBookings /></RoleGuard>} />

      {/* Admin */}
      <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard>} />
      <Route path="/admin/verify-guides" element={<RoleGuard allowedRoles={['admin']}><VerifyGuides /></RoleGuard>} />
      <Route path="/admin/trips" element={<RoleGuard allowedRoles={['admin']}><AdminTrips /></RoleGuard>} />
      <Route path="/admin/users" element={<RoleGuard allowedRoles={['admin']}><AdminUsers /></RoleGuard>} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App