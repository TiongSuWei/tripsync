import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Star, Calendar, ArrowRight, CheckCircle } from 'lucide-react';

export default function GuideDashboard() {
  const { user } = useCurrentUser();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (user) {
      base44.entities.GuideProfile.filter({ guide_email: user.email }).then(r => setProfile(r[0] || null));
      base44.entities.Booking.filter({ guide_email: user.email }, '-created_date', 5).then(setBookings);
    }
  }, [user]);

  const pending = bookings.filter(b => b.status === 'pending').length;
  const accepted = bookings.filter(b => b.status === 'accepted').length;

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-1">Guide Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile and bookings.</p>
        </div>

        {/* Profile status */}
        {!profile ? (
          <div className="bg-foreground text-background rounded-2xl p-6 mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">Complete your guide profile</p>
              <p className="text-sm opacity-60">Set up your bio, pricing, and specialties to start receiving bookings.</p>
            </div>
            <Link to="/guide/profile">
              <Button variant="secondary" className="rounded-xl whitespace-nowrap">Set Up Profile</Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl p-4 mb-6 flex items-center gap-3 border bg-card border-border">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Profile Active</p>
              <p className="text-xs text-muted-foreground">Your profile is live and accepting bookings.</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-3xl font-bold font-playfair mb-1">{pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-3xl font-bold font-playfair mb-1">{accepted}</p>
            <p className="text-sm text-muted-foreground">Accepted</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-3xl font-bold font-playfair mb-1">{profile?.rating || '–'}</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Link to="/guide/profile" className="bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5" />
              <div>
                <p className="font-medium text-sm">My Profile</p>
                <p className="text-xs text-muted-foreground">Edit bio, pricing, availability</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link to="/guide/bookings" className="bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="font-medium text-sm">Booking Requests</p>
                <p className="text-xs text-muted-foreground">{pending} pending review</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>

        {/* Recent bookings */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Bookings</h2>
            <Link to="/guide/bookings" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{b.traveler_name}</p>
                    <p className="text-xs text-muted-foreground">{b.destination} · {b.start_date}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                    b.status === 'accepted' ? 'bg-secondary text-foreground' : 'bg-secondary text-muted-foreground'
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