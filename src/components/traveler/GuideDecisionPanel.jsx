import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
import { todayStr } from '@/lib/booking';

const SERVICE_OPTIONS = [
  { value: 'fully_accompanied', label: 'Fully accompanied' },
  { value: 'guiding_only', label: 'Guiding only' },
];

const daysBetweenInclusive = (start, end) =>
  Math.floor((new Date(end) - new Date(start)) / 86400000) + 1;

/**
 * Shows the booking request form for a guide from the traveller's perspective.
 * Creates a Booking record (status: pending) on submit, or records a rejection.
 * Finished bookings (rejected / cancelled / completed / ended) never block a new
 * request — the traveller can "Hire again", which creates a NEW booking record.
 */
export default function GuideDecisionPanel({ guide, user }) {
  const [bookings, setBookings] = useState([]);   // all bookings with this guide (newest first)
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const [form, setForm] = useState({ start_date: '', end_date: '', trip_id: '', service_type: '', message: '' });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!user?.email || !guide?.guide_email) { setLoading(false); return; }
    Promise.all([
      base44.entities.Booking.filter({ traveler_email: user.email, guide_email: guide.guide_email }, '-created_date'),
      base44.entities.Trip.filter({ traveler_email: user.email }, '-created_date'),
    ]).then(([bookingRes, tripRes]) => {
      setBookings(bookingRes);
      setTrips(tripRes);
      setLoading(false);
    });
  }, [user?.email, guide?.guide_email]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Derived booking state (newest first)
  const active = bookings.find(b =>
    b.status === 'pending' ||
    (b.status === 'accepted' && b.traveler_decision !== 'rejected_by_traveler' && (!b.end_date || b.end_date >= todayStr()))
  );
  const latest = bookings[0] || null;
  const latestFinished = !active && latest && (
    ['rejected', 'cancelled', 'completed'].includes(latest.status) ||
    latest.traveler_decision === 'rejected_by_traveler' ||
    (latest.status === 'accepted' && latest.end_date && latest.end_date < todayStr())
  );

  const historyNote = (b) => {
    if (b.status === 'rejected') return 'This guide declined your last request.';
    if (b.traveler_decision === 'rejected_by_traveler') return 'You previously rejected this guide.';
    if (b.status === 'cancelled') return b.cancelled_by === 'guide' ? 'Your last booking was cancelled by the guide.' : 'Your last booking was cancelled by you.';
    if (b.status === 'completed') return 'Your last booking with this guide is complete.';
    return 'Your last booking with this guide has ended.';
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
    setBookings(bs => [created, ...bs]);
    setShowForm(false);
    showToast('success', `Booking request sent to ${guide.guide_name}!`);
    setActing(false);
  };

  const handleReject = async () => {
    setActing(true);
    if (active) {
      await base44.entities.Booking.update(active.id, {
        traveler_decision: 'rejected_by_traveler',
      });
      setBookings(bs => bs.map(b => b.id === active.id ? { ...b, traveler_decision: 'rejected_by_traveler' } : b));
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
      setBookings(bs => [created, ...bs]);
    }
    showToast('info', `${guide.guide_name} has been marked as not interested.`);
    setActing(false);
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
    </div>
  );

  const decision = active?.traveler_decision;
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

      {/* Active booking status */}
      {active && (
        <>
          {decision === 'accepted_by_traveler' && (
            <div className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 px-4 py-3 rounded-xl mb-3">
              <CheckCircle2 className="w-4 h-4" />
              You've accepted this guide
            </div>
          )}
          {decision !== 'accepted_by_traveler' && (
            <p className="text-xs text-muted-foreground px-3 py-2 bg-secondary/50 rounded-xl mb-3">
              Request sent — awaiting the guide's response.
            </p>
          )}
        </>
      )}

      {/* Finished history — offer to hire again */}
      {!active && latestFinished && !showForm && (
        <div className="text-sm text-muted-foreground bg-secondary/50 rounded-xl px-4 py-3 mb-3 flex items-center justify-between gap-3 flex-wrap">
          <p>{historyNote(latest)}</p>
          <Button size="sm" className="rounded-xl gap-1.5 whitespace-nowrap" onClick={() => setShowForm(true)}>
            <RotateCcw className="w-3.5 h-3.5" />
            Hire again
          </Button>
        </div>
      )}

      {/* Booking request form — new bookings, or hire-again after a finished one */}
      {!active && (!latest || showForm) && (
        <div className="space-y-3">
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

      {/* Reject — only while there's no finished history (a new or active booking) */}
      {(active ? decision !== 'rejected_by_traveler' : !latest) && (
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