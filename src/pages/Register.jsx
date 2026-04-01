import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { MapPin, User, Compass, Loader2 } from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('traveler');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [checking, setChecking] = useState(true);

  // On mount: if user is already authenticated with a role AND has passed OTP, skip to their dashboard
  useEffect(() => {
    const check = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) { setChecking(false); return; }
        const me = await base44.auth.me();
        // Admin always goes to admin dashboard
        if (me?.role === 'admin' && !me?.account_type) {
          window.location.href = '/admin';
          return;
        }
        // Has a role and has already verified OTP in this session → go straight to dashboard
        const otpVerified = sessionStorage.getItem('tripsync_otp_verified');
        if (me?.account_type && otpVerified) {
          const dest = me.account_type === 'guide' ? '/guide' : '/traveler';
          window.location.href = dest;
          return;
        }
        // Has a role but no OTP session yet → send through OTP (returning user, new browser session)
        if (me?.account_type) {
          const dest = me.account_type === 'guide' ? '/guide' : '/traveler';
          localStorage.setItem('tripsync_otp_dest', dest);
          await base44.functions.invoke('sendOtp', {});
          window.location.href = '/verify-otp';
          return;
        }
      } catch (_) {}
      setChecking(false);
    };
    check();
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    // Always store the chosen role so Onboard applies it
    localStorage.setItem('tripsync_register_role', role);
    // Clear any previous OTP verification so the new role gets a fresh OTP pass
    sessionStorage.removeItem('tripsync_otp_verified');
    const isLoggedIn = await base44.auth.isAuthenticated();
    if (isLoggedIn) {
      window.location.href = '/onboard';
      return;
    }
    base44.auth.redirectToLogin('/onboard');
  };

  if (checking) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" />
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

          <h1 className="font-playfair text-3xl font-bold mb-2">How will you use TripSync?</h1>
          <p className="text-muted-foreground mb-8">Choose your account type to continue.</p>

          {/* Role cards */}
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
              <p className="font-semibold text-sm mb-1">Traveller</p>
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

          <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-sm text-muted-foreground">
            {role === 'traveler'
              ? '✓ Search destinations, AI itineraries, browse guides, track your trips.'
              : '✓ Build your guide profile, set pricing, manage booking requests.'}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-destructive/10 text-destructive text-sm rounded-xl">
              {error}
            </div>
          )}

          <Button
            onClick={handleContinue}
            disabled={loading}
            className="w-full rounded-xl h-11 text-sm font-medium"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Redirecting…</>
            ) : (
              `Continue as ${role === 'traveler' ? 'Traveller' : 'Tour Guide'}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}