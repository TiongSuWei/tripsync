import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Check, X, User } from 'lucide-react';

export default function GuideBookings() {
  const { user } = useCurrentUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      base44.entities.Booking.filter({ guide_email: user.email }, '-created_date').then(b => { setBookings(b); setLoading(false); });
    }
  }, [user]);

  const updateStatus = async (id, status) => {
    await base44.entities.Booking.update(id, { status });
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status } : b));
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-1">Booking Requests</h1>
          <p className="text-muted-foreground">Review and manage your incoming bookings.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'accepted', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-foreground text-background' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">No bookings</p>
            <p className="text-sm text-muted-foreground">Booking requests will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => (
              <div key={b.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold">{b.traveler_name}</p>
                      <p className="text-xs text-muted-foreground">{b.traveler_email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${
                    b.status === 'accepted' ? 'bg-secondary text-foreground' :
                    b.status === 'pending' ? 'bg-secondary text-muted-foreground' :
                    'bg-secondary text-muted-foreground'
                  }`}>{b.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{b.destination}</div>
                  {b.start_date && <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{b.start_date} → {b.end_date}</div>}
                  {b.total_price && <div className="font-semibold text-foreground">${b.total_price.toLocaleString()}</div>}
                </div>

                {b.message && <p className="text-xs text-muted-foreground bg-secondary/50 rounded-xl px-3 py-2 mb-4">{b.message}</p>}

                {b.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button onClick={() => updateStatus(b.id, 'accepted')} size="sm" className="flex-1 rounded-xl gap-1.5">
                      <Check className="w-3.5 h-3.5" />Accept
                    </Button>
                    <Button onClick={() => updateStatus(b.id, 'rejected')} variant="outline" size="sm" className="flex-1 rounded-xl gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                      <X className="w-3.5 h-3.5" />Decline
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}