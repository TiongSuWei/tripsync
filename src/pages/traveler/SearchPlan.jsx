import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Save, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SearchPlan() {
  const { user } = useCurrentUser();
  const [form, setForm] = useState({ destination: '', startDate: '', endDate: '', budget: '', travelers: '1', preferences: '' });
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!form.destination) return;
    setLoading(true);
    setItinerary('');
    setSaved(false);
    const prompt = `You are TripSync AI. Generate a complete, detailed travel plan for:
- Destination: ${form.destination}
- Dates: ${form.startDate || 'flexible'} to ${form.endDate || 'flexible'}
- Budget: $${form.budget || 'moderate'}
- Travelers: ${form.travelers}
- Preferences: ${form.preferences || 'general sightseeing'}

Include REAL hotels with booking links, real restaurants with links, real attractions with links.
Format using markdown with: ## ✈️ Trip Summary, ## 🏨 Accommodation (real hotels with [Name](URL)), ## 🍽️ Food & Restaurants, ## 🎭 Attractions, ## 💰 Budget Breakdown, ## 📅 Day-by-Day Itinerary (every place hyperlinked).`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setItinerary(typeof result === 'string' ? result : JSON.stringify(result));
    setLoading(false);
  };

  const handleSave = async () => {
    if (!itinerary || !user) return;
    setSaving(true);
    await base44.entities.Trip.create({
      title: `Trip to ${form.destination}`,
      destination: form.destination,
      start_date: form.startDate || null,
      end_date: form.endDate || null,
      budget: form.budget ? parseFloat(form.budget) : null,
      travelers_count: parseInt(form.travelers),
      preferences: form.preferences,
      itinerary,
      status: 'planned',
      traveler_email: user.email,
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-1">Plan Your Trip</h1>
          <p className="text-muted-foreground">Tell us where you want to go and we'll build your perfect itinerary.</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">Destination *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={form.destination}
                  onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                  placeholder="e.g. Tokyo, Japan"
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Budget (USD)</label>
              <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                placeholder="e.g. 3000"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Number of Travelers</label>
              <input type="number" min="1" value={form.travelers} onChange={e => setForm(f => ({ ...f, travelers: e.target.value }))}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">Preferences & Interests</label>
              <textarea value={form.preferences} onChange={e => setForm(f => ({ ...f, preferences: e.target.value }))}
                placeholder="e.g. culture, food, adventure, luxury, family-friendly..."
                rows={2}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none" />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={loading || !form.destination} className="w-full rounded-xl gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating your plan…</> : <><Search className="w-4 h-4" />Generate Itinerary</>}
          </Button>
        </div>

        {/* Results */}
        {itinerary && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Your Travel Plan</h2>
              <Button onClick={handleSave} disabled={saving || saved} variant="outline" size="sm" className="rounded-xl gap-2">
                <Save className="w-3.5 h-3.5" />
                {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Trip'}
              </Button>
            </div>
            <ReactMarkdown
              className="prose prose-sm max-w-none text-foreground"
              components={{
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2 hover:opacity-70">{children}</a>,
                h1: ({ children }) => <h1 className="font-playfair text-xl font-bold mt-5 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="font-semibold text-base mt-4 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="font-medium text-sm mt-3 mb-1">{children}</h3>,
                p: ({ children }) => <p className="text-sm text-muted-foreground my-1.5">{children}</p>,
                li: ({ children }) => <li className="text-sm text-muted-foreground">{children}</li>,
                ul: ({ children }) => <ul className="list-disc ml-4 space-y-1 my-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-4 space-y-1 my-2">{children}</ol>,
                strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
              }}
            >
              {itinerary}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </AppShell>
  );
}