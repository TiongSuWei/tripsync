import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  MapPin, LayoutDashboard, Search, BookOpen, Users, Calendar,
  Settings, LogOut, Menu, X, Star, ShieldCheck, Globe, Compass
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = {
  traveler: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/traveler' },
    { label: 'Search & Plan', icon: Search, path: '/search' },
    { label: 'My Trips', icon: BookOpen, path: '/trips' },
    { label: 'AI Assistant', icon: Compass, path: '/chat' },
    { label: 'Tour Guides', icon: Users, path: '/guides' },

  ],
  guide: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/guide' },
    { label: 'My Profile', icon: Star, path: '/guide/profile' },
    { label: 'Booking Requests', icon: Calendar, path: '/guide/bookings' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Verify Guides', icon: ShieldCheck, path: '/admin/verify-guides' },
    { label: 'Manage Trips', icon: Globe, path: '/admin/trips' },
    { label: 'All Users', icon: Users, path: '/admin/users' },
  ],
};

export default function AppShell({ user, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role || 'traveler';
  const items = navItems[role] || navItems.traveler;

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-sidebar-primary" />
          </div>
          <span className="font-playfair font-bold text-lg text-sidebar-foreground">TripSync</span>
        </div>
        <div className="mt-4 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-semibold text-sidebar-accent-foreground">
            {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.full_name || user?.email}</p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">{role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items.map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
              location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-60 flex-shrink-0 border-r border-border">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="font-playfair font-bold">TripSync</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}