import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Star, Calendar, ArrowRight, CheckCircle, Clock, CheckCheck, DollarSign, MapPin, TrendingUp, Sparkles, User } from 'lucide-react';

export default function GuideDashboard() {
  const { user } = useCurrentUser();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.GuideProfile.filter({ guide_email: user.email }).then(r => setProfile(r[0] || null));
    base44.entities.Booking.filter({ guide_email: user.email }, '-created_date', 50).then(setBookings);
    base44.entities.Rating.filter({ guide_email: user.email }).then(setRatings);
  }, [user?.email]);

  const pending = bookings.filter(b => b.status === 'pending').length;
  const accepted = bookings.filter(b => b.status === 'accepted').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const totalEarnings = bookings.filter(b => b.status === 'accepted' || b.status === 'completed').reduce((sum, b) => sum + (b.total_price || 0), 0);
  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + (r.stars || 0), 0) / ratings.length).toFixed(1) : (profile?.rating || '–');

  const stats = [
    { label: 'Pending', value: pending, sub: 'awaiting review', icon: Clock, color: 'text-amber-500' },
    { label: 'Accepted', value: accepted, sub: 'upcoming tours', icon: CheckCheck, color: 'text-emerald-500' },
    { label: 'Completed', value: completed, sub: 'tours done', icon: CheckCircle, color: 'text-sky-500' },
    { label: 'Earnings', value: `$${totalEarnings.toLocaleString()}`, sub: 'from bookings', icon: DollarSign, color: 'text-foreground' },
  ];

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-1">Guide Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile and bookings.</p>
        </div>

        {/* Profile status / hero */}
        {!profile ? (
          <div className="relative overflow-hidden rounded-2xl mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70" />
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80"
              alt="Guide"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="relative p-8 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-3 text-background/70">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Get Started</span>
                </div>
                <p className="font-playfair text-2xl font-bold text-background mb-1">Complete your guide profile</p>
                <p className="text-sm text-background/60 max-w-md">Set up your bio, pricing, and specialties to start receiving bookings from travellers worldwide.</p>
              </div>
              <Link to="/guide/profile">
                <Button variant="secondary" className="rounded-xl whitespace-nowrap">Set Up Profile</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70" />
            <img
              src={profile.photo_url || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80"}
              alt="Guide"
              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-30 transition-opacity duration-500"
            />
            <div className="relative p-6 flex items-center gap-4 flex-wrap">
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-background/10 border border-background/20">
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={profile.guide_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-background"><User className="w-6 h-6" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-background/60">Profile Active</span>
                </div>
                <p className="font-playfair text-xl font-bold text-background truncate">{profile.guide_name}</p>
                <p className="text-sm text-background/60 truncate">{profile.location} · ${profile.price_per_day}/day</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/10 border border-background/20">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-background">{avgRating}</span>
                <span className="text-xs text-background/50">({ratings.length || profile?.total_reviews || 0} reviews)</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold font-playfair mb-0.5">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Link to="/guide/profile" className="group bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-sm">My Profile</p>
                <p className="text-xs text-muted-foreground">Edit bio, pricing, availability</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/guide/bookings" className="group bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-foreground/10 transition-colors relative">
                <Calendar className="w-4 h-4" />
                {pending > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">{pending}</span>
                )}
              </div>
              <div>
                <p className="font-medium text-sm">Booking Requests</p>
                <p className="text-xs text-muted-foreground">{pending} pending review</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Recent bookings */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Recent Bookings
            </h2>
            <Link to="/guide/bookings" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {bookings.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No bookings yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookings.slice(0, 4).map(b => (
                <div key={b.id} className="flex gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{b.traveler_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" /> {b.destination}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {b.start_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(b.start_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {b.total_price && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> ${b.total_price.toLocaleString()}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        b.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600' :
                        b.status === 'completed' ? 'bg-sky-500/10 text-sky-600' :
                        b.status === 'rejected' ? 'bg-secondary text-muted-foreground' :
                        'bg-amber-500/10 text-amber-600'
                      }`}>{b.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}