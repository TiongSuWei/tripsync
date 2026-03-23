import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Compass, Users, ShieldCheck, Star, ArrowRight } from 'lucide-react';

const features = [
  { icon: Compass, title: 'AI-Powered Itineraries', desc: 'Get personalized day-by-day travel plans built by our intelligent assistant.' },
  { icon: Users, title: 'Expert Tour Guides', desc: 'Connect with verified local guides who know their destination inside out.' },
  { icon: ShieldCheck, title: 'Verified & Trusted', desc: 'Every guide is vetted by our admin team before appearing on the platform.' },
  { icon: Star, title: 'Budget Planning', desc: 'Plan your full trip budget with smart cost breakdowns and recommendations.' },
];

const testimonials = [
  { name: 'Sophie L.', role: 'Traveler', text: 'TripSync planned my Tokyo trip in minutes. The AI itinerary was spot on!', avatar: 'S' },
  { name: 'Marco R.', role: 'Tour Guide', desc: 'My bookings doubled after joining TripSync as a verified guide.', avatar: 'M' },
  { name: 'Aisha K.', role: 'Traveler', text: 'The guide I found through TripSync made our Bali trip unforgettable.', avatar: 'A' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span className="font-playfair font-bold text-xl">TripSync</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="rounded-xl">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 inline-block" />
            AI-Powered Travel Planning Platform
          </div>
          <h1 className="font-playfair text-5xl md:text-7xl font-bold leading-tight mb-6">
            Plan trips that feel<br />
            <span className="italic text-muted-foreground">perfectly yours.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
            TripSync combines AI-generated itineraries with real local expertise. Plan, budget, and book — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register">
              <Button size="lg" className="rounded-xl px-8 gap-2">
                Start Planning Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/guides">
              <Button size="lg" variant="outline" className="rounded-xl px-8">
                Browse Tour Guides
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-playfair text-3xl font-bold text-center mb-12">Everything you need to travel smarter</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-card border-y border-border">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[['10,000+', 'Trips Planned'], ['500+', 'Verified Guides'], ['98%', 'Satisfaction Rate']].map(([num, label]) => (
            <div key={label}>
              <p className="font-playfair text-4xl font-bold mb-1">{num}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-playfair text-3xl font-bold text-center mb-12">Loved by travelers & guides</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-card border border-border rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-4">"{t.text || t.desc}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-playfair text-4xl font-bold mb-4">Ready to explore the world?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of travelers who use TripSync to plan their perfect trips.</p>
          <Link to="/register">
            <Button size="lg" className="rounded-xl px-10 gap-2">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} TripSync. All rights reserved.
      </footer>
    </div>
  );
}