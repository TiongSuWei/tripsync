import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GuideRatingPanel({ guide, user }) {
  const [existing, setExisting] = useState(null);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email || !guide?.guide_email) { setLoading(false); return; }
    base44.entities.Rating.filter({ traveler_email: user.email, guide_email: guide.guide_email }, '-created_date', 1)
      .then(res => {
        if (res[0]) { setExisting(res[0]); setSelected(res[0].stars); }
        setLoading(false);
      });
  }, [user?.email, guide?.guide_email]);

  const handleSubmit = async () => {
    if (!selected) return;
    setSaving(true);
    if (existing) {
      await base44.entities.Rating.update(existing.id, { stars: selected });
    } else {
      const created = await base44.entities.Rating.create({
        traveler_email: user.email,
        guide_email: guide.guide_email,
        stars: selected,
      });
      setExisting(created);
    }

    // Recalculate guide's average rating
    const allRatings = await base44.entities.Rating.filter({ guide_email: guide.guide_email });
    const total = allRatings.length;
    const avg = total > 0 ? Math.round((allRatings.reduce((s, r) => s + r.stars, 0) / total) * 10) / 10 : 0;
    await base44.entities.GuideProfile.update(guide.id, { rating: avg, total_reviews: total });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return null;

  const display = hovered || selected;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Rate This Guide</p>
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(n)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                n <= display ? 'fill-foreground text-foreground' : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
        {selected > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">{selected} / 5</span>
        )}
      </div>
      <Button
        size="sm"
        className="rounded-xl"
        disabled={!selected || saving}
        onClick={handleSubmit}
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
        {existing ? 'Update Rating' : 'Submit Rating'}
      </Button>
      {saved && <p className="text-xs text-green-700 mt-2">Rating saved!</p>}
    </div>
  );
}