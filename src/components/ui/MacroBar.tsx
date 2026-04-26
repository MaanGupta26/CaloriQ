import React from 'react';
import { motion } from 'motion/react';
import { EASE } from '@/src/lib/utils';

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
}

export const MacroBar: React.FC<MacroBarProps> = ({ label, current, goal }) => {
  const percentage = Math.min(current / goal, 1);
  
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between items-end px-1">
        <span className="text-[10px] font-bold tracking-[0.3em] text-forest/70">{label}</span>
        <span className="text-[10px] font-bold text-forest">
          {Math.round(current)}g <span className="text-forest/40">/ {goal}g</span>
        </span>
      </div>
      <div className="h-2 w-full bg-forest/10 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-forest"
          initial={{ width: 0 }}
          animate={{ width: `${percentage * 100}%` }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
        />
      </div>
    </div>
  );
};
