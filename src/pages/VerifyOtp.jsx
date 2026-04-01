import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function VerifyOtp() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleInput = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await base44.functions.invoke('verifyOtp', { code: fullCode });
      if (response.data?.success) {
        setSuccess(true);
        // Mark this browser session as OTP-verified so returning users skip OTP
        sessionStorage.setItem('tripsync_otp_verified', '1');
        const dest = localStorage.getItem('tripsync_otp_dest') || '/traveler';
        localStorage.removeItem('tripsync_otp_dest');
        setTimeout(() => { window.location.href = dest; }, 800);
      } else {
        setError(response.data?.error || 'Verification failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Verification failed. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setCode(['', '', '', '', '', '']);
    setCountdown(600);

    try {
      await base44.functions.invoke('sendOtp', {});
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to resend code.');
    }
    setResending(false);
    inputRefs.current[0]?.focus();
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
            One step away<br />from your adventure.
          </h2>
          <p className="text-background/60 text-lg">
            We sent a verification code to your email to keep your account secure.
          </p>
        </div>
        <p className="text-background/30 text-sm">© {new Date().getFullYear()} TripSync</p>
      </div>

      {/* Right verification panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <MapPin className="w-5 h-5" />
            <span className="font-playfair font-bold text-xl">TripSync</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-playfair text-2xl font-bold">Verify your email</h1>
              <p className="text-sm text-muted-foreground">Two-factor authentication</p>
            </div>
          </div>

          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            We sent a 6-digit verification code to your registered email address. Enter it below to continue.
          </p>

          {/* OTP inputs */}
          <div className="flex gap-3 mb-6 justify-center" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInput(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-card outline-none transition-all
                  ${digit ? 'border-foreground' : 'border-border'}
                  ${error ? 'border-destructive' : ''}
                  focus:border-foreground`}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center mb-4">
            <span className={`text-sm ${countdown < 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
              Code expires in {formatTime(countdown)}
            </span>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-destructive/10 text-destructive text-sm rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-4 py-3 bg-green-50 text-green-700 text-sm rounded-xl">
              ✓ Verified! Redirecting you now…
            </div>
          )}

          <Button
            onClick={handleVerify}
            disabled={loading || success || code.join('').length < 6}
            className="w-full rounded-xl h-11 text-sm font-medium mb-4"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying…</>
            ) : (
              'Verify & Continue'
            )}
          </Button>

          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            {resending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending…</>
            ) : (
              <><RefreshCw className="w-3.5 h-3.5" />Resend code</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}