import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Eye, EyeOff } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const role = localStorage.getItem('tripsync_register_role') || 'traveler';
  const roleLabel = role === 'guide' ? 'Tour Guide' : 'Traveller';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await base44.auth.loginViaEmailPassword(email.trim(), password);
      // Credentials verified — proceed to onboard (applies role + sends OTP)
      window.location.href = '/onboard';
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Incorrect email or password. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    base44.auth.loginWithProvider('google', '/onboard');
  };

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
            Welcome back<br />to TripSync.
          </h2>
          <p className="text-background/60 text-lg">
            Sign in to continue as a {roleLabel}.
          </p>
        </div>
        <p className="text-background/30 text-sm">© {new Date().getFullYear()} TripSync</p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <MapPin className="w-5 h-5" />
            <span className="font-playfair font-bold text-xl">TripSync</span>
          </div>

          <h1 className="font-playfair text-3xl font-bold mb-2">Sign in</h1>
          <p className="text-muted-foreground mb-8">
            Continuing as <span className="font-medium text-foreground">{roleLabel}</span>
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-11 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-destructive/10 text-destructive text-sm rounded-xl">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl h-11 text-sm font-medium"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in…</>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full rounded-xl h-11 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center mt-6">
            <button
              type="button"
              onClick={() => window.location.href = '/register'}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to role selection
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}