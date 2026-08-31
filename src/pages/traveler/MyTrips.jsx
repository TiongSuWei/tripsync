import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MapPin, Trash2, Eye, Plus, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import TripDetailModal from '@/components/traveler/TripDetailModal';

export default function MyTrips() {
  const { user } = useCurrentUser();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [tripToDelete, setTripToDelete] = useState(null);

  useEffect(() => {
    if (user) {
      base44.entities.Trip.filter({ traveler_email: user.email }, '-created_date').then(t => { setTrips(t); setLoading(false); });
    }
  }, [user]);

  const confirmDelete = async () => {
    if (!tripToDelete) return;
    await base44.entities.Trip.delete(tripToDelete.id);
    setTrips(t => t.filter(x => x.id !== tripToDelete.id));
    setTripToDelete(null);
  };

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-bold mb-1">My Trips</h1>
            <p className="text-muted-foreground">All your saved travel plans.</p>
          </div>
          <Link to="/search">
            <Button className="rounded-xl gap-2"><Plus className="w-4 h-4" />New Trip</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">No trips yet</p>
            <p className="text-sm text-muted-foreground mb-4">Start by generating your first AI itinerary.</p>
            <Link to="/search"><Button className="rounded-xl">Plan a Trip</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {trips.map(trip => (
              <div key={trip.id} className="bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold mb-0.5">{trip.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {trip.destination}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    trip.status === 'planned' ? 'bg-secondary text-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>{trip.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  {trip.start_date && (
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{trip.start_date}</span>
                  )}
                  {trip.budget && (
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${trip.budget.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-1.5" onClick={() => setSelected(trip)}>
                    <Eye className="w-3.5 h-3.5" />View
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-destructive hover:bg-destructive/10 hover:border-destructive/30" onClick={() => setTripToDelete(trip)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && <TripDetailModal trip={selected} onClose={() => setSelected(null)} />}

      <AlertDialog open={!!tripToDelete} onOpenChange={(open) => !open && setTripToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              {tripToDelete ? `"${tripToDelete.title}" in ${tripToDelete.destination}` : 'This trip'} will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}