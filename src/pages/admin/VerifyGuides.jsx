import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { MapPin, Check, X, Globe, Star } from 'lucide-react';

export default function VerifyGuides() {
  const { user } = useCurrentUser();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.entities.GuideProfile.list('-created_date').then(g => { setGuides(g); setLoading(false); });
  }, []);

  const updateStatus = async (id, status) => {
    await base44.entities.GuideProfile.update(id, { status, verified: status === 'approved' });
    setGuides(gs => gs.map(g => g.id === id ? { ...g, status, verified: status === 'approved' } : g));
  };

  const filtered = filter === 'all' ? guides : guides.filter(g => g.status === filter);

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-1">Manage Tour Guides</h1>
          <p className="text-muted-foreground">View and manage all registered tour guides.</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-foreground text-background' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
              {f} {f !== 'all' && `(${guides.filter(g => g.status === f).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-muted-foreground">No guides with this status.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(g => (
              <div key={g.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold overflow-hidden flex-shrink-0">
                      {g.photo_url ? <img src={g.photo_url} alt={g.guide_name} className="w-full h-full object-cover" /> : g.guide_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{g.guide_name}</p>
                      <p className="text-xs text-muted-foreground">{g.guide_email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${
                    g.status === 'approved' ? 'bg-secondary text-foreground' :
                    g.status === 'pending' ? 'bg-secondary text-muted-foreground' :
                    'bg-secondary text-muted-foreground'
                  }`}>{g.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-3">
                  {g.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{g.location}</span>}
                  {g.price_per_day && <span className="flex items-center gap-1"><Star className="w-3 h-3" />${g.price_per_day}/day</span>}
                  {g.languages?.length > 0 && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{g.languages.join(', ')}</span>}
                </div>

                {g.bio && <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{g.bio}</p>}

                {g.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {g.specialties.map(s => <span key={s} className="text-xs px-2 py-0.5 bg-secondary rounded-full">{s}</span>)}
                  </div>
                )}

                {g.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button onClick={() => updateStatus(g.id, 'approved')} size="sm" className="flex-1 rounded-xl gap-1.5">
                      <Check className="w-3.5 h-3.5" />Approve
                    </Button>
                    <Button onClick={() => updateStatus(g.id, 'rejected')} variant="outline" size="sm" className="flex-1 rounded-xl gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                      <X className="w-3.5 h-3.5" />Reject
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