import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { Home, ClipboardList, MessageSquare, Settings } from 'lucide-react';

export const PillNav = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between",
      isScrolled ? "bg-cream/80 backdrop-blur-md" : "bg-transparent"
    )}>
      <div className="font-anton text-2xl tracking-tighter text-forest">
        — CALORIQ
      </div>

      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl px-2 py-1.5 rounded-full border border-moss/20 shadow-lg">
        <NavItem to="/dashboard" icon={<Home size={18} />} label="DASHBOARD" />
        <NavItem to="/history" icon={<ClipboardList size={18} />} label="HISTORY" />
        <NavItem to="/chat" icon={<MessageSquare size={18} />} label="CHAT" />
        <NavItem to="/settings" icon={<Settings size={18} />} label="SETTINGS" />
      </div>

      <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-forest font-bold text-xs ring-2 ring-white/30 shadow-md">
        JD
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => cn(
      "flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300",
      "text-[10px] font-bold tracking-[0.3em] whitespace-nowrap",
      isActive ? "bg-forest text-cream opacity-100" : "text-forest opacity-40 hover:opacity-100 hover:bg-white/10"
    )}
  >
    {icon}
    <span className="hidden md:inline">{label}</span>
  </NavLink>
);
