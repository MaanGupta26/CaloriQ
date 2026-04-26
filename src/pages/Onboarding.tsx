import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { REVEAL_VARIANTS, cn } from '../lib/utils';
import { calculateGoals, ActivityLevel, Goal } from '../lib/nutrition';

interface OnboardingProps {
  onComplete: (user: any) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    name: '',
    age: 25,
    sex: 'male' as const,
    weight_kg: 70,
    height_cm: 170,
    activity_level: 'moderate' as ActivityLevel,
    goal: 'maintain' as Goal
  });

  const next = () => setStep(s => s + 1);

  const finish = () => {
    const goals = calculateGoals(formData);
    onComplete({
      ...formData,
      daily_calorie_goal: goals.calorieGoal,
      protein_goal_g: goals.proteinGoal,
      carbs_goal_g: goals.carbsGoal,
      fat_goal_g: goals.fatGoal
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        variants={REVEAL_VARIANTS}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl bg-sage rounded-huge p-12 shadow-forest"
      >
        <div className="mb-12">
          <h1 className="font-anton text-[10vw] md:text-8xl text-forest leading-[0.85] tracking-tighter">
            LET'S SET<br />YOUR GOALS
          </h1>
          <div className="flex gap-2 mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-forest" : "bg-forest/10")} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <InputGroup label="WHAT'S YOUR NAME?">
                <input 
                  className="w-full bg-cream rounded-2xl p-4 text-forest font-bold border-none ring-2 ring-forest/10 focus:ring-forest" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="NAME"
                />
              </InputGroup>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="AGE">
                  <input type="number" className="w-full bg-cream rounded-2xl p-4 text-forest font-bold" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
                </InputGroup>
                <InputGroup label="SEX">
                  <select className="w-full bg-cream rounded-2xl p-4 text-forest font-bold" value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value as any})}>
                    <option value="male">MALE</option>
                    <option value="female">FEMALE</option>
                  </select>
                </InputGroup>
              </div>
              <button onClick={next} disabled={!formData.name} className="w-full py-6 bg-forest text-cream rounded-card text-[10px] font-bold tracking-widest mt-8 disabled:opacity-50">CONTINUE</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                <InputGroup label="WEIGHT (KG)">
                  <input type="number" className="w-full bg-cream rounded-2xl p-4 text-forest font-bold" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: Number(e.target.value)})} />
                </InputGroup>
                <InputGroup label="HEIGHT (CM)">
                  <input type="number" className="w-full bg-cream rounded-2xl p-4 text-forest font-bold" value={formData.height_cm} onChange={e => setFormData({...formData, height_cm: Number(e.target.value)})} />
                </InputGroup>
              </div>
              <InputGroup label="ACTIVITY LEVEL">
                <select className="w-full bg-cream rounded-2xl p-4 text-forest font-bold" value={formData.activity_level} onChange={e => setFormData({...formData, activity_level: e.target.value as any})}>
                  <option value="sedentary">SEDENTARY (OFFICE JOB)</option>
                  <option value="light">LIGHT (1-2 DAYS/WEEK)</option>
                  <option value="moderate">MODERATE (3-5 DAYS/WEEK)</option>
                  <option value="active">ACTIVE (6-7 DAYS/WEEK)</option>
                  <option value="very_active">VERY ACTIVE (PRO ATHLETE)</option>
                </select>
              </InputGroup>
              <button onClick={next} className="w-full py-6 bg-forest text-cream rounded-card text-[10px] font-bold tracking-widest mt-8">CONTINUE</button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {(['cut', 'maintain', 'bulk'] as const).map(g => (
                  <button 
                    key={g}
                    onClick={() => setFormData({...formData, goal: g})}
                    className={cn(
                      "p-6 rounded-card text-left transition-all",
                      formData.goal === g ? "bg-forest text-cream scale-[1.02]" : "bg-cream text-forest hover:bg-forest/5"
                    )}
                  >
                    <div className="font-anton text-4xl uppercase tracking-tight">{g}</div>
                    <div className="text-[8px] font-bold tracking-widest mt-1 opacity-60">
                      {g === 'cut' ? 'LOSE FAT & GET LEAN' : g === 'maintain' ? 'STAY CONSISTENT' : 'GAIN MUSCLE & STRENGTH'}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={finish} className="w-full py-6 bg-forest text-cream rounded-card text-[10px] font-bold tracking-widest mt-8 uppercase">START MY JOURNEY</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold tracking-widest text-forest/40">{label}</label>
    {children}
  </div>
);
