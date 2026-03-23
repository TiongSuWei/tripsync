import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Onboard from './pages/Onboard';
import Chat from './pages/Chat.jsx';

// Traveler
import TravelerDashboard from './pages/traveler/TravelerDashboard';
import SearchPlan from './pages/traveler/SearchPlan';
import MyTrips from './pages/traveler/MyTrips';
import GuideList from './pages/traveler/GuideList';
import GuideProfilePage from './pages/traveler/GuideProfile';
import MyBookings from './pages/traveler/MyBookings';

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
    else if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboard" element={<Onboard />} />

      {/* Traveler */}
      <Route path="/traveler" element={<TravelerDashboard />} />
      <Route path="/search" element={<SearchPlan />} />
      <Route path="/trips" element={<MyTrips />} />
      <Route path="/guides" element={<GuideList />} />
      <Route path="/guides/:id" element={<GuideProfilePage />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/chat" element={<Chat />} />

      {/* Guide */}
      <Route path="/guide" element={<GuideDashboard />} />
      <Route path="/guide/profile" element={<GuideProfileEditor />} />
      <Route path="/guide/bookings" element={<GuideBookings />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/verify-guides" element={<VerifyGuides />} />
      <Route path="/admin/trips" element={<AdminTrips />} />
      <Route path="/admin/users" element={<AdminUsers />} />

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