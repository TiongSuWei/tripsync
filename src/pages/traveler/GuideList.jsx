import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { MapPin, Star, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function GuideList() {
  const { user } = useCurrentUser();
  const [guides, setGuides] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GuideProfile.list('-created_date').then(g => { setGuides(g); setLoading(false); });
  }, []);

  const filtered = guides.filter(g =>
    g.guide_name?.toLowerCase().includes(search.toLowerCase()) ||
    g.location?.toLowerCase().includes(search.toLowerCase()) ||
    g.specialties?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-1">Tour Guides</h1>
          <p className="text-muted-foreground">Connect with local experts around the world.</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, location, or specialty…"
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <p className="font-semibold mb-1">No guides found</p>
            <p className="text-sm text-muted-foreground">Try a different search or check back later.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(guide => (
              <div key={guide.id} className="bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-colors flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold overflow-hidden flex-shrink-0">
                    {guide.photo_url ? <img src={guide.photo_url} alt={guide.guide_name} className="w-full h-full object-cover" /> : guide.guide_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{guide.guide_name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />{guide.location}
                    </div>
                  </div>
                </div>
                {guide.rating > 0 && (
                  <div className="flex items-center gap-1 text-xs mb-2">
                    <Star className="w-3.5 h-3.5 fill-foreground" />
                    <span className="font-medium">{guide.rating}</span>
                    <span className="text-muted-foreground">({guide.total_reviews} reviews)</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{guide.bio}</p>
                {guide.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {guide.specialties.slice(0, 3).map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-secondary rounded-full">{s}</span>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex items-center justify-between">
                  <p className="text-sm font-semibold">${guide.price_per_day}/day</p>
                  <Link to={`/guides/${guide.id}`}>
                    <Button size="sm" className="rounded-xl">View Profile</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}