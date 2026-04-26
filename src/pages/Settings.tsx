import React from 'react';
import { motion } from 'motion/react';
import { REVEAL_VARIANTS } from '../lib/utils';
import { LogOut, User, Target, Bell } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export const Settings = ({ user }: { user: any }) => {
  const logout = async () => {
    localStorage.removeItem('caloriq_user');
    await signOut(auth);
  };

  return (
    <motion.div 
      variants={REVEAL_VARIANTS}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      <h1 className="font-anton text-[15vw] md:text-8xl text-forest">SETTINGS</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SettingCard icon={<User size={24} />} title="PROFILE" subtitle={`${user.name}, ${user.age} Y/O`} />
        <SettingCard icon={<Target size={24} />} title="GOALS" subtitle={`${user.daily_calorie_goal} KCAL — ${user.goal.toUpperCase()}`} />
        <SettingCard icon={<Bell size={24} />} title="NOTIFICATIONS" subtitle="DAILY REMINDERS ACTIVE" />
      </div>

      <button 
        onClick={logout}
        className="w-full py-6 rounded-card bg-rose-100 text-rose-600 flex items-center justify-center gap-3 font-bold text-[10px] tracking-widest transition-all hover:bg-rose-200"
      >
        <LogOut size={18} />
        SIGN OUT
      </button>

      <div className="pt-24 pb-12 text-center">
        <div className="font-anton text-forest/10 text-9xl tracking-tighter leading-none">CALORIQ</div>
        <div className="text-[8px] font-bold tracking-[0.5em] text-forest/20 mt-4">VERSION 1.0.4 — DESIGNED FOR WINNERS</div>
      </div>
    </motion.div>
  );
};

const SettingCard = ({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) => (
  <div className="bg-cream rounded-card p-8 border border-forest/5 shadow-sm hover:shadow-forest transition-all cursor-pointer group">
    <div className="w-12 h-12 rounded-2xl bg-sage flex items-center justify-center text-forest mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="font-anton text-3xl text-forest tracking-tight uppercase leading-none">{title}</div>
    <div className="text-[10px] font-bold text-forest/40 tracking-widest mt-2 uppercase">{subtitle}</div>
  </div>
);
