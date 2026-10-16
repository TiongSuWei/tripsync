import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const SERVICE_OPTIONS = [
  { value: 'fully_accompanied', label: 'Fully accompanied' },
  { value: 'guiding_only', label: 'Guiding only' },
];

const daysBetweenInclusive = (start, end) =>
  Math.floor((new Date(end) - new Date(start)) / 86400000) + 1;

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Shows the booking request form for a guide from the traveller's perspective.
 * Creates a Booking record (status: pending) on submit, or records a rejection.
 * Reads existing bookings to show current status.
 */
export default function GuideDecisionPanel({ guide, user }) {
  const [booking, setBooking] = useState(null);   // existing booking with this guide
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const [form, setForm] = useState({ start_date: '', end_date: '', trip_id: '', service_type: '', message: '' });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!user?.email || !guide?.guide_email) { setLoading(false); return; }
    Promise.all([
      base44.entities.Booking
        .filter({ traveler_email: user.email, guide_email: guide.guide_email }, '-created_date', 1),
      base44.entities.Trip.filter({ traveler_email: user.email }, '-created_date'),
    ]).then(([bookingRes, tripRes]) => {
      setBooking(bookingRes[0] || null);
      setTrips(tripRes);
      setLoading(false);
    });
  }, [user?.email, guide?.guide_email]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleTripSelect = (tripId) => {
    setForm(f => {
      const trip = trips.find(t => t.id === tripId);
      return {
        ...f,
        trip_id: tripId,
        ...(trip ? { start_date: trip.start_date || f.start_date, end_date: trip.end_date || f.end_date } : {}),
      };
    });
    setErrors([]);
  };

  const validate = () => {
    const errs = [];
    if (!form.start_date) errs.push('Start date is required.');
    if (!form.end_date) errs.push('End date is required.');
    if (form.start_date && form.start_date < todayStr()) errs.push('Start date cannot be in the past.');
    if (form.start_date && form.end_date && form.end_date < form.start_date) errs.push('End date must be on or after the start date.');
    return errs;
  };

  const handleSendRequest = async () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;
    setActing(true);
    const days = daysBetweenInclusive(form.start_date, form.end_date);
    const serviceType = guide.service_type === 'both' ? form.service_type : (guide.service_type || '');
    const created = await base44.entities.Booking.create({
      traveler_email: user.email,
      traveler_name: user.full_name || user.email,
      guide_email: guide.guide_email,
      guide_name: guide.guide_name,
      destination: guide.location || '',
      start_date: form.start_date,
      end_date: form.end_date,
      message: form.message,
      trip_id: form.trip_id || '',
      service_type: serviceType,
      total_price: (guide.price_per_day || 0) * days,
      status: 'pending',
      traveler_decision: 'pending_traveler',
    });
    setBooking(created);
    showToast('success', `Booking request sent to ${guide.guide_name}!`);
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
        total_price: 0,
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
  const hasDecided = decision === 'accepted_by_traveler' || decision === 'rejected_by_traveler';
  const days = form.start_date && form.end_date && form.end_date >= form.start_date
    ? daysBetweenInclusive(form.start_date, form.end_date)
    : 0;

  const inputClass = "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30";

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

      {/* Booking request form — hidden once the traveller has decided */}
      {!hasDecided && (
        <div className="space-y-3">
          {booking && (
            <p className="text-xs text-muted-foreground px-3 py-2 bg-secondary/50 rounded-xl">
              Request sent — awaiting the guide's response.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Start Date *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => { setForm(f => ({ ...f, start_date: e.target.value })); setErrors([]); }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">End Date *</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => { setForm(f => ({ ...f, end_date: e.target.value })); setErrors([]); }}
                className={inputClass}
              />
            </div>
          </div>

          {trips.length > 0 && (
            <div>
              <label className="text-xs font-medium mb-1.5 block">Link a saved trip (optional)</label>
              <select
                value={form.trip_id}
                onChange={e => handleTripSelect(e.target.value)}
                className={inputClass}
              >
                <option value="">No saved trip</option>
                {trips.map(t => <option key={t.id} value={t.id}>{t.title || t.destination}</option>)}
              </select>
            </div>
          )}

          {guide.service_type === 'both' && (
            <div>
              <label className="text-xs font-medium mb-1.5 block">Service type *</label>
              <select
                value={form.service_type}
                onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                className={inputClass}
              >
                <option value="">Choose a service…</option>
                {SERVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-medium mb-1.5 block">Message</label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={2}
              placeholder={`Tell ${guide.guide_name || 'the guide'} about your plans…`}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="px-3 py-2 bg-red-50 text-red-700 text-xs rounded-xl space-y-1">
              {errors.map((err, i) => <p key={i}>{err}</p>)}
            </div>
          )}

          {days > 0 && guide.price_per_day > 0 && (
            <p className="text-xs text-muted-foreground">
              Estimated total: <span className="font-medium text-foreground">${((guide.price_per_day) * days).toLocaleString()}</span> ({days} day{days > 1 ? 's' : ''} × ${guide.price_per_day})
            </p>
          )}

          <Button size="sm" className="w-full rounded-xl gap-1.5" disabled={acting} onClick={handleSendRequest}>
            {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Send Booking Request
          </Button>
        </div>
      )}

      {/* Reject — always available so traveller can change their mind */}
      {decision !== 'rejected_by_traveler' && (
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-2 rounded-xl gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          disabled={acting}
          onClick={handleReject}
        >
          {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          Reject Guide
        </Button>
      )}
    </div>
  );
}