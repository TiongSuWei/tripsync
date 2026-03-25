import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Compass, ArrowRight, MapPin } from 'lucide-react';

export default function TravelerDashboard() {
  const { user, loading } = useCurrentUser();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    if (user) {
      base44.entities.Trip.filter({ traveler_email: user.email }, '-created_date', 5).then(setTrips);
    }
  }, [user]);

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>;

  const stats = [
    { label: 'My Trips', value: trips.length, icon: BookOpen, path: '/trips' },
    { label: 'Bookings', value: bookings.length, icon: Calendar, path: '/my-bookings' },
    { label: 'AI Chats', value: '∞', icon: Compass, path: '/chat' },
  ];

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-1">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-muted-foreground">Where are you headed next?</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link to="/search" className="group bg-foreground text-background rounded-2xl p-6 hover:opacity-90 transition-opacity">
            <Search className="w-6 h-6 mb-3" />
            <p className="font-semibold mb-1">Plan New Trip</p>
            <p className="text-sm opacity-60">AI-powered itinerary</p>
          </Link>
          <Link to="/guides" className="group bg-card border border-border rounded-2xl p-6 hover:border-foreground/30 transition-colors">
            <MapPin className="w-6 h-6 mb-3" />
            <p className="font-semibold mb-1">Find a Guide</p>
            <p className="text-sm text-muted-foreground">Browse local experts</p>
          </Link>
          <Link to="/chat" className="group bg-card border border-border rounded-2xl p-6 hover:border-foreground/30 transition-colors">
            <Compass className="w-6 h-6 mb-3" />
            <p className="font-semibold mb-1">AI Assistant</p>
            <p className="text-sm text-muted-foreground">Chat & get ideas</p>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map(s => (
            <Link key={s.label} to={s.path} className="bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-colors">
              <p className="text-3xl font-bold font-playfair mb-1">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Recent trips */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Trips</h2>
            <Link to="/trips" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {trips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-3">No trips yet — start planning!</p>
              <Link to="/search"><Button size="sm" className="rounded-xl">Plan Your First Trip</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map(trip => (
                <div key={trip.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{trip.title}</p>
                      <p className="text-xs text-muted-foreground">{trip.destination}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    trip.status === 'planned' ? 'bg-secondary text-foreground' :
                    trip.status === 'completed' ? 'bg-secondary text-muted-foreground' :
                    'bg-secondary text-muted-foreground'
                  }`}>{trip.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Bookings</h2>
            <Link to="/my-bookings" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{b.guide_name}</p>
                    <p className="text-xs text-muted-foreground">{b.destination}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    b.status === 'accepted' ? 'bg-secondary text-foreground' :
                    b.status === 'pending' ? 'bg-secondary text-muted-foreground' :
                    'bg-secondary text-muted-foreground'
                  }`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}