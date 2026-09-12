import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Compass, ArrowRight, MapPin, Calendar, Wallet, TrendingUp, Sparkles } from 'lucide-react';

export default function TravelerDashboard() {
  const { user, loading } = useCurrentUser();
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (user) {
      base44.entities.Trip.filter({ traveler_email: user.email }, '-created_date', 5).then(setTrips);
      base44.entities.Booking.filter({ traveler_email: user.email }, '-created_date', 50).then(setBookings);
    }
  }, [user]);

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>;

  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const totalBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  const stats = [
    { label: 'My Trips', value: trips.length, sub: `${completedTrips} completed`, icon: BookOpen, path: '/trips' },
    { label: 'Bookings', value: bookings.length, sub: `${pendingBookings} pending`, icon: Calendar, path: '/bookings' },
    { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}`, sub: 'across all trips', icon: Wallet, path: '/trips' },
    { label: 'AI Chats', value: '∞', sub: 'unlimited planning', icon: Compass, path: '/chat' },
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

        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70" />
          <img
            src="https://images.unsplash.com/photo-1488646953012-85cb498fae4c?w=1200&q=80"
            alt="Travel inspiration"
            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
          />
          <div className="relative p-8 sm:p-10">
            <div className="flex items-center gap-2 mb-3 text-background/70">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">AI-Powered Planning</span>
            </div>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-background mb-2 max-w-lg">
              Your next adventure is one conversation away
            </h2>
            <p className="text-background/60 text-sm mb-5 max-w-md">
              Tell our AI where you want to go — get a complete day-by-day itinerary with real hotels, restaurants, and a budget breakdown in seconds.
            </p>
            <Link to="/search">
              <Button className="rounded-xl gap-2">
                <Search className="w-4 h-4" /> Start Planning
              </Button>
            </Link>
          </div>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <Link key={s.label} to={s.path} className="bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-playfair mb-0.5">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{s.sub}</p>
            </Link>
          ))}
        </div>

        {/* Recent trips */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Recent Trips
            </h2>
            <Link to="/trips" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {trips.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm mb-3">No trips yet — start planning!</p>
              <Link to="/search"><Button size="sm" className="rounded-xl">Plan Your First Trip</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trips.map(trip => (
                <Link key={trip.id} to="/trips" className="group flex gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                    {trip.destination_image_url ? (
                      <img src={trip.destination_image_url} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="font-medium text-sm truncate">{trip.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
                      <MapPin className="w-3 h-3" /> {trip.destination}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {trip.start_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(trip.start_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {trip.budget && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Wallet className="w-3 h-3" /> ${trip.budget.toLocaleString()}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        trip.status === 'planned' ? 'bg-foreground/10 text-foreground' :
                        trip.status === 'completed' ? 'bg-secondary text-muted-foreground' :
                        'bg-secondary text-muted-foreground'
                      }`}>{trip.status}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}