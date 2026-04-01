import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Shows Accept / Reject actions for a guide from the traveller's perspective.
 * Creates a Booking record on Accept, or records a rejection decision.
 * Reads existing bookings to show current status.
 */
export default function GuideDecisionPanel({ guide, user }) {
  const [booking, setBooking] = useState(null);   // existing booking with this guide
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  useEffect(() => {
    if (!user?.email || !guide?.guide_email) { setLoading(false); return; }
    base44.entities.Booking
      .filter({ traveler_email: user.email, guide_email: guide.guide_email }, '-created_date', 1)
      .then(res => { setBooking(res[0] || null); setLoading(false); });
  }, [user?.email, guide?.guide_email]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAccept = async () => {
    setActing(true);
    // If a booking already exists, flip its traveler_decision to accepted
    if (booking) {
      const updated = await base44.entities.Booking.update(booking.id, {
        traveler_decision: 'accepted_by_traveler',
      });
      setBooking({ ...booking, traveler_decision: 'accepted_by_traveler' });
      showToast('success', `You've accepted ${guide.guide_name} as your guide!`);
    } else {
      // Create a new booking request
      const created = await base44.entities.Booking.create({
        traveler_email: user.email,
        traveler_name: user.full_name || user.email,
        guide_email: guide.guide_email,
        guide_name: guide.guide_name,
        destination: guide.location || '',
        total_price: guide.price_per_day || 0,
        status: 'pending',
        traveler_decision: 'accepted_by_traveler',
      });
      setBooking(created);
      showToast('success', `Booking request sent to ${guide.guide_name}!`);
    }
    setActing(false);
  };

  const handleReject = async () => {
    setActing(true);
    if (booking) {
      await base44.entities.Booking.update(booking.id, {
        traveler_decision: 'rejected_by_traveler',
      });
      setBooking({ ...booking, traveler_decision: 'rejected_by_traveler' });
    } else {
      const created = await base44.entities.Booking.create({
        traveler_email: user.email,
        traveler_name: user.full_name || user.email,
        guide_email: guide.guide_email,
        guide_name: guide.guide_name,
        destination: guide.location || '',
        total_price: guide.price_per_day || 0,
        status: 'rejected',
        traveler_decision: 'rejected_by_traveler',
      });
      setBooking(created);
    }
    showToast('info', `${guide.guide_name} has been marked as not interested.`);
    setActing(false);
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
    </div>
  );

  const decision = booking?.traveler_decision;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Your Decision</p>

      {/* Toast notification */}
      {toast && (
        <div className={`mb-3 text-xs font-medium px-3 py-2 rounded-xl ${
          toast.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-secondary text-foreground'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Already decided */}
      {decision === 'accepted_by_traveler' && (
        <div className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 px-4 py-3 rounded-xl mb-3">
          <CheckCircle2 className="w-4 h-4" />
          You've accepted this guide
        </div>
      )}
      {decision === 'rejected_by_traveler' && (
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground bg-secondary px-4 py-3 rounded-xl mb-3">
          <XCircle className="w-4 h-4" />
          You've rejected this guide
        </div>
      )}

      {/* Action buttons — always show so traveller can change their mind */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 rounded-xl gap-1.5"
          disabled={acting || decision === 'accepted_by_traveler'}
          onClick={handleAccept}
        >
          {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Accept Guide
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-xl gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          disabled={acting || decision === 'rejected_by_traveler'}
          onClick={handleReject}
        >
          {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          Reject Guide
        </Button>
      </div>
    </div>
  );
}