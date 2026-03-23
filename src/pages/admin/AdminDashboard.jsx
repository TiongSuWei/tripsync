import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { ShieldCheck, Globe, Users, ArrowRight, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useCurrentUser();
  const [stats, setStats] = useState({ pendingGuides: 0, totalTrips: 0, totalUsers: 0, totalBookings: 0 });

  useEffect(() => {
    Promise.all([
      base44.entities.GuideProfile.filter({ status: 'pending' }),
      base44.entities.Trip.list(),
      base44.entities.User.list(),
      base44.entities.Booking.list(),
    ]).then(([pending, trips, users, bookings]) => {
      setStats({ pendingGuides: pending.length, totalTrips: trips.length, totalUsers: users.length, totalBookings: bookings.length });
    });
  }, []);

  const cards = [
    { label: 'Pending Verifications', value: stats.pendingGuides, icon: Clock, path: '/admin/verify-guides', urgent: stats.pendingGuides > 0 },
    { label: 'Total Trips', value: stats.totalTrips, icon: Globe, path: '/admin/trips' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, path: '/admin/users' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: ShieldCheck, path: '/admin/verify-guides' },
  ];

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(c => (
            <Link key={c.label} to={c.path} className={`bg-card rounded-2xl p-5 border hover:border-foreground/20 transition-colors ${c.urgent ? 'border-foreground/40' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-3">
                <c.icon className="w-5 h-5 text-muted-foreground" />
                {c.urgent && <span className="w-2 h-2 rounded-full bg-foreground" />}
              </div>
              <p className="text-3xl font-bold font-playfair mb-1">{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/admin/verify-guides" className="bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-colors flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">Verify Guides</p>
              <p className="text-xs text-muted-foreground">Review pending applications</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link to="/admin/trips" className="bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-colors flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">Manage Trips</p>
              <p className="text-xs text-muted-foreground">View all user trips</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link to="/admin/users" className="bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-colors flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">User Management</p>
              <p className="text-xs text-muted-foreground">View all registered users</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}