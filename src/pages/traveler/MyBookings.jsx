import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Check, X } from 'lucide-react';

// Derive the single final status badge to show the traveller
const getFinalStatusBadge = (b) => {
  if (b.status === 'rejected' || b.traveler_decision === 'rejected_by_traveler') {
    return { label: 'Rejected', cls: 'bg-red-100 text-red-700' };
  }
  if (b.traveler_decision === 'accepted_by_traveler') {
    return { label: 'Confirmed', cls: 'bg-green-100 text-green-800' };
  }
  if (b.status === 'accepted') {
    return { label: 'Guide accepted — awaiting your decision', cls: 'bg-green-50 text-green-700' };
  }
  if (b.status === 'completed') {
    return { label: 'Completed', cls: 'bg-secondary text-foreground' };
  }
  return { label: 'Awaiting guide response', cls: 'bg-amber-50 text-amber-700' };
};

export default function MyBookings() {
  const { user } = useCurrentUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null); // id of booking being acted on

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Booking.filter({ traveler_email: user.email }, '-created_date')
      .then(b => { setBookings(b); setLoading(false); });
  }, [user?.email]);

  const handleDecision = async (bookingId, decision) => {
    setActing(bookingId);
    const updates = { traveler_decision: decision };
    // If traveller rejects, also mark the booking status as rejected so the guide sees it
    if (decision === 'rejected_by_traveler') updates.status = 'rejected';
    await base44.entities.Booking.update(bookingId, updates);
    setBookings(bs => bs.map(b => b.id === bookingId ? { ...b, ...updates } : b));
    setActing(null);
  };

  // A booking needs traveller action when: guide accepted AND no traveller decision yet
  const needsAction = (b) =>
    b.status === 'accepted' &&
    (!b.traveler_decision || b.traveler_decision === 'pending_traveler');

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-1">My Bookings</h1>
          <p className="text-muted-foreground">Track all your guide booking requests.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">No bookings yet</p>
            <p className="text-sm text-muted-foreground">Browse guides and send a booking request.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => {
              const isActing = acting === b.id;

              const badge = getFinalStatusBadge(b);
              return (
                <div key={b.id} className={`bg-card border rounded-2xl p-5 transition-all ${needsAction(b) ? 'border-foreground/30 shadow-sm' : 'border-border'}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{b.guide_name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3" />{b.destination}
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Dates & price */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    {b.start_date && <span>{b.start_date} → {b.end_date}</span>}
                    {b.total_price && <span className="font-medium text-foreground">${b.total_price.toLocaleString()} total</span>}
                  </div>

                  {b.message && (
                    <p className="text-xs text-muted-foreground bg-secondary/50 rounded-xl px-3 py-2 mb-4">
                      {b.message}
                    </p>
                  )}

                  {/* Traveller action required — guide has accepted, awaiting traveller */}
                  {needsAction(b) && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium mb-2.5">The guide has accepted your request. Do you want to confirm this guide?</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 rounded-xl gap-1.5"
                          disabled={isActing}
                          onClick={() => handleDecision(b.id, 'accepted_by_traveler')}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept Tour Guide
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-xl gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                          disabled={isActing}
                          onClick={() => handleDecision(b.id, 'rejected_by_traveler')}
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject Tour Guide
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}