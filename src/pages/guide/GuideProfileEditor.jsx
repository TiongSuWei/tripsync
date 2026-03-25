import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/layout/AppShell';
import useCurrentUser from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Upload } from 'lucide-react';

const SPECIALTIES_OPTIONS = ['City Tours', 'Nature & Hiking', 'Food & Culinary', 'History & Culture', 'Adventure Sports', 'Photography', 'Family Tours', 'Luxury Travel', 'Budget Travel'];
const LANGUAGES_OPTIONS = ['English', 'Spanish', 'French', 'German', 'Italian', 'Japanese', 'Mandarin', 'Arabic', 'Portuguese'];

export default function GuideProfileEditor() {
  const { user } = useCurrentUser();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ guide_name: '', bio: '', location: '', price_per_day: '', availability: '', photo_url: '', languages: [], specialties: [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    setForm(f => ({ ...f, guide_name: user.full_name || '' }));
    base44.entities.GuideProfile.filter({ guide_email: user.email }).then(r => {
      if (r[0]) {
        setProfile(r[0]);
        setForm({ ...r[0], price_per_day: r[0].price_per_day || '', languages: r[0].languages || [], specialties: r[0].specialties || [] });
      }
    });
  }, [user?.email]);

  const toggleArr = (key, val) => setForm(f => ({
    ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
  }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo_url: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.guide_name?.trim()) {
      alert('Please enter your full name.');
      return;
    }
    setSaving(true);
    const data = {
      ...form,
      guide_email: user.email,
      price_per_day: parseFloat(form.price_per_day) || 0,
      status: 'approved',
      verified: true,
    };
    if (profile) {
      await base44.entities.GuideProfile.update(profile.id, data);
    } else {
      const created = await base44.entities.GuideProfile.create(data);
      setProfile(created);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30";

  return (
    <AppShell user={user}>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-1">My Guide Profile</h1>
          <p className="text-muted-foreground">Complete your profile to attract travelers.</p>
        </div>

        {profile && (
          <div className="bg-secondary/50 border border-border rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-foreground" />
            Profile is <span className="font-medium">active</span> — visible to travelers
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          {/* Photo */}
          <div>
            <label className="text-sm font-medium mb-2 block">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xl font-bold flex-shrink-0">
                {form.photo_url ? <img src={form.photo_url} alt="Profile" className="w-full h-full object-cover" /> : (form.guide_name?.[0] || '?')}
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <Button variant="outline" size="sm" className="rounded-xl gap-2" asChild>
                  <span>{uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading…</> : <><Upload className="w-3.5 h-3.5" />Upload Photo</>}</span>
                </Button>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
            <input value={form.guide_name} onChange={e => setForm(f => ({ ...f, guide_name: e.target.value }))} className={inputClass} placeholder="Your display name" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Location *</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={inputClass} placeholder="e.g. Tokyo, Japan" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Bio</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} className={`${inputClass} resize-none`} placeholder="Tell travelers about yourself, your experience, and what makes you unique…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Price per Day (USD)</label>
              <input type="number" value={form.price_per_day} onChange={e => setForm(f => ({ ...f, price_per_day: e.target.value }))} className={inputClass} placeholder="e.g. 150" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Availability</label>
              <input value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))} className={inputClass} placeholder="e.g. Weekends, Mon–Fri" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Languages</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES_OPTIONS.map(l => (
                <button key={l} onClick={() => toggleArr('languages', l)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.languages.includes(l) ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground/30'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Specialties</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES_OPTIONS.map(s => (
                <button key={s} onClick={() => toggleArr('specialties', s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.specialties.includes(s) ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground/30'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />{saved ? 'Saved!' : profile ? 'Update Profile' : 'Create Profile'}</>}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}