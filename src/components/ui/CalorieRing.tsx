import React from 'react';
import { motion } from 'motion/react';
import { EASE, cn } from '@/src/lib/utils';

interface CalorieRingProps {
  calories: number;
  goal: number;
  greeting?: string;
  hideHeader?: boolean;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({ 
  calories, 
  goal, 
  greeting = "GOOD MORNING, USER",
  hideHeader = false
}) => {
  const percentage = Math.min(calories / goal, 1.2);
  const strokeColor = percentage < 0.7 ? "var(--moss)" : percentage < 1 ? "var(--forest)" : "#e07a5f";
  
  const size = 320;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - percentage * circumference;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      !hideHeader && "p-12 bg-sage rounded-huge shadow-forest"
    )}>
      {!hideHeader && (
        <div className="text-[10px] font-bold tracking-[0.3em] text-forest/60 mb-8 uppercase">
          {greeting}
        </div>
      )}
      
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--moss)"
            opacity="0.2"
            strokeWidth={12}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: EASE }}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="absolute flex flex-col items-center">
          <span className="font-anton text-[8vw] md:text-8xl text-forest leading-none tracking-[-0.05em]">
            {Math.round(calories)}
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-forest/70 mt-4 uppercase">
            OF {goal} KCAL
          </span>
        </div>
      </div>
    </div>
  );
};
