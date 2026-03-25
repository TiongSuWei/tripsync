import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { MapPin, User, Compass, Loader2 } from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('traveler');
  const [loading, setLoading] = useState(false);
  const [isPickingRole, setIsPickingRole] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If redirected here after Google login with no role, show role picker directly
    const params = new URLSearchParams(window.location.search);
    if (params.get('pick_role') === '1') {
      setIsPickingRole(true);
    }
  }, []);

  // Called when user is already logged in but needs to pick a role (e.g. Google sign-in)
  const handleSaveRole = async () => {
    setSavingRole(true);
    setError('');
    try {
      await base44.auth.updateMe({ account_type: role });
      if (role === 'guide') window.location.href = '/guide';
      else window.location.href = '/traveler';
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setSavingRole(false);
    }
  };

  // Called for new sign-up: stores role then triggers OAuth
  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      localStorage.setItem('tripsync_register_role', role);
      base44.auth.redirectToLogin('/onboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const RoleCards = () => (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <button
        onClick={() => setRole('traveler')}
        className={`p-5 rounded-2xl border-2 text-left transition-all ${
          role === 'traveler'
            ? 'border-foreground bg-secondary'
            : 'border-border hover:border-foreground/30'
        }`}
      >
        <User className="w-6 h-6 mb-3" />
        <p className="font-semibold text-sm mb-1">Traveler</p>
        <p className="text-xs text-muted-foreground">Plan trips, discover guides, manage budgets</p>
      </button>
      <button
        onClick={() => setRole('guide')}
        className={`p-5 rounded-2xl border-2 text-left transition-all ${
          role === 'guide'
            ? 'border-foreground bg-secondary'
            : 'border-border hover:border-foreground/30'
        }`}
      >
        <Compass className="w-6 h-6 mb-3" />
        <p className="font-semibold text-sm mb-1">Tour Guide</p>
        <p className="text-xs text-muted-foreground">Create your profile, receive bookings</p>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-foreground text-background p-12">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          <span className="font-playfair font-bold text-xl">TripSync</span>
        </div>
        <div>
          <h2 className="font-playfair text-5xl font-bold leading-tight mb-6">
            Your next great<br />adventure starts here.
          </h2>
          <p className="text-background/60 text-lg">
            AI-powered itineraries, verified local guides, and smart budget planning — all in one place.
          </p>
        </div>
        <p className="text-background/30 text-sm">© {new Date().getFullYear()} TripSync</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <MapPin className="w-5 h-5" />
            <span className="font-playfair font-bold text-xl">TripSync</span>
          </div>



          <h1 className="font-playfair text-3xl font-bold mb-2">
            {isPickingRole ? 'How will you use TripSync?' : 'Create your account'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isPickingRole
              ? 'Choose your account type to get started.'
              : 'Choose how you\'ll use TripSync.'}
          </p>

          <RoleCards />

          <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-sm text-muted-foreground">
            {role === 'traveler'
              ? '✓ Search destinations, AI itineraries, browse guides, track your trips.'
              : '✓ Build your guide profile, set pricing, manage booking requests. Requires admin approval.'}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-destructive/10 text-destructive text-sm rounded-xl">
              {error}
            </div>
          )}

          {isPickingRole ? (
            <Button
              onClick={handleSaveRole}
              disabled={savingRole}
              className="w-full rounded-xl h-11 text-sm font-medium"
            >
              {savingRole ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
              ) : (
                `Continue as ${role === 'traveler' ? 'Traveler' : 'Tour Guide'}`
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleRegister}
                disabled={loading}
                className="w-full rounded-xl h-11 text-sm font-medium"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Redirecting…</>
                ) : (
                  `Continue as ${role === 'traveler' ? 'Traveler' : 'Tour Guide'}`
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => base44.auth.redirectToLogin('/onboard')}
                  className="text-foreground font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}