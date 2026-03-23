import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Calendar, MapPin } from 'lucide-react';

const statusStyle = {
  pending: 'bg-secondary text-muted-foreground',
  accepted: 'bg-secondary text-foreground',
  rejected: 'bg-secondary text-muted-foreground',
  completed: 'bg-secondary text-muted-foreground',
};

export default function MyBookings() {
  const { user } = useCurrentUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      base44.entities.Booking.filter({ traveler_email: user.email }, '-created_date').then(b => { setBookings(b); setLoading(false); });
    }
  }, [user]);

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-1">My Bookings</h1>
          <p className="text-muted-foreground">Track all your guide booking requests.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">No bookings yet</p>
            <p className="text-sm text-muted-foreground">Browse guides and send a booking request.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{b.guide_name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3" />{b.destination}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyle[b.status]}`}>
                    {b.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  {b.start_date && <span>{b.start_date} → {b.end_date}</span>}
                  {b.total_price && <span className="font-medium text-foreground">${b.total_price.toLocaleString()} total</span>}
                </div>
                {b.message && <p className="text-xs text-muted-foreground bg-secondary/50 rounded-xl px-3 py-2">{b.message}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}