import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { MapPin, Calendar, DollarSign, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TripDetailModal from '@/components/traveler/TripDetailModal';

export default function AdminTrips() {
  const { user } = useCurrentUser();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.Trip.list('-created_date').then(t => { setTrips(t); setLoading(false); });
  }, []);

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-1">All Trips</h1>
          <p className="text-muted-foreground">{trips.length} trips on the platform.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trip</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">User</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Dates</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {trips.map(trip => (
                  <tr key={trip.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-medium">{trip.title}</p>
                          <p className="text-xs text-muted-foreground">{trip.destination}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{trip.traveler_email}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{trip.start_date || '–'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 bg-secondary rounded-full capitalize">{trip.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => setSelected(trip)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {trips.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">No trips yet.</p>}
          </div>
        )}
      </div>
      {selected && <TripDetailModal trip={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}