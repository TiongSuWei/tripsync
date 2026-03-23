import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Globe, DollarSign, Calendar } from 'lucide-react';

export default function GuideProfilePage() {
  const { id } = useParams();
  const { user } = useCurrentUser();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GuideProfile.filter({ id }).then(r => { setGuide(r[0]); setLoading(false); });
  }, [id]);

  if (loading) return <AppShell user={user}><div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div></AppShell>;
  if (!guide) return <AppShell user={user}><div className="p-6 text-center text-muted-foreground">Guide not found.</div></AppShell>;

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="md:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-6">
              <div className="text-center mb-5">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold mx-auto mb-3 overflow-hidden">
                  {guide.photo_url ? <img src={guide.photo_url} alt={guide.guide_name} className="w-full h-full object-cover" /> : guide.guide_name?.[0]}
                </div>
                <h2 className="font-playfair font-bold text-xl">{guide.guide_name}</h2>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" />{guide.location}
                </div>
                {guide.rating > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-foreground" />
                    <span className="font-semibold">{guide.rating}</span>
                    <span className="text-xs text-muted-foreground">({guide.total_reviews})</span>
                  </div>
                )}
              </div>
              <div className="space-y-3 text-sm border-t border-border pt-4">
                {guide.price_per_day && <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground" /><span className="font-semibold">${guide.price_per_day}</span> / day</div>}
                {guide.languages?.length > 0 && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" />{guide.languages.join(', ')}</div>}
                {guide.availability && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" />{guide.availability}</div>}
              </div>
            </div>
          </div>

          {/* Details + booking */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-3">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{guide.bio || 'No bio provided.'}</p>
              {guide.specialties?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {guide.specialties.map(s => <span key={s} className="text-xs px-3 py-1 bg-secondary rounded-full">{s}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* Booking form */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Book {guide.guide_name}</h3>
              {booked ? (
                <div className="text-center py-6">
                  <p className="text-2xl mb-2">✓</p>
                  <p className="font-semibold mb-1">Booking request sent!</p>
                  <p className="text-sm text-muted-foreground">The guide will review and respond shortly.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input value={booking.destination} onChange={e => setBooking(b => ({ ...b, destination: e.target.value }))}
                    placeholder="Destination / location" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={booking.startDate} onChange={e => setBooking(b => ({ ...b, startDate: e.target.value }))}
                      className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30" />
                    <input type="date" value={booking.endDate} onChange={e => setBooking(b => ({ ...b, endDate: e.target.value }))}
                      className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30" />
                  </div>
                  <textarea value={booking.message} onChange={e => setBooking(b => ({ ...b, message: e.target.value }))}
                    placeholder="Tell the guide about your trip…" rows={3}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none" />
                  <Button onClick={handleBook} disabled={submitting} className="w-full rounded-xl gap-2">
                    <Send className="w-4 h-4" />{submitting ? 'Sending…' : 'Send Booking Request'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}