import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalorieRing } from '../components/ui/CalorieRing';
import { MacroBar } from '../components/ui/MacroBar';
import { MealSlotCard } from '../components/ui/MealSlotCard';
import { PillInput } from '../components/ui/PillInput';
import { NutritionResultCard } from '../components/ui/NutritionResultCard';
import { REVEAL_VARIANTS, cn } from '../lib/utils';
import { db, MealLog, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { parseMealText, analyzeMealPhoto } from '../lib/ai';
import { Camera, Image as ImageIcon, Upload } from 'lucide-react';

export const Dashboard = ({ user }: { user: any }) => {
  const [logs, setLogs] = React.useState<MealLog[]>([]);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [tempResult, setTempResult] = React.useState<any>(null);
  const [activeSlot, setActiveSlot] = React.useState<string>('snack');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!user?.id) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const logsRef = collection(db, 'meal_logs');
    const q = query(
      logsRef,
      where('user_id', '==', user.id),
      where('log_date', '==', today)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MealLog[];
      setLogs(fetchedLogs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'meal_logs');
    });

    return () => unsubscribe();
  }, [user.id]);

  const consumed = logs.reduce((sum, l) => sum + l.calories, 0);
  const protein = logs.reduce((sum, l) => sum + l.protein_g, 0);
  const carbs = logs.reduce((sum, l) => sum + l.carbs_g, 0);
  const fat = logs.reduce((sum, l) => sum + l.fat_g, 0);

  const handleTextLog = async (text: string) => {
    setAnalyzing(true);
    try {
      const data = await parseMealText(text);
      if (data && !data.clarification_needed) {
        setTempResult(data);
        setActiveSlot('snack');
      } else if (data.clarification_needed) {
        alert(data.question);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await analyzeMealPhoto(base64);
        setTempResult(data);
        setActiveSlot('lunch'); // Default for photo for now
        setAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setAnalyzing(false);
    }
  };

  const confirmLog = async (slot: string) => {
    if (!tempResult) return;
    
    const logData = {
      user_id: user.id,
      log_date: format(new Date(), 'yyyy-MM-dd'),
      meal_slot: slot,
      meal_name: tempResult.meal_name,
      input_method: 'text',
      ai_confidence: tempResult.confidence || 'high',
      calories: tempResult.totals.calories,
      protein_g: tempResult.totals.protein_g,
      carbs_g: tempResult.totals.carbs_g,
      fat_g: tempResult.totals.fat_g,
      fiber_g: tempResult.totals.fiber_g || 0,
      items_json: JSON.stringify(tempResult.items),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'meal_logs'), logData);
      setTempResult(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'meal_logs');
    }
  };

  const remaining = user.daily_calorie_goal - consumed;
  const bannerColor = remaining > 300 ? "bg-forest" : remaining > 0 ? "bg-amber-600" : "bg-rose-600";


  return (
    <motion.div 
      variants={REVEAL_VARIANTS}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto pb-64 min-h-screen"
    >
      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Left: Ring & Macros (Col 7) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <div className="bg-sage rounded-huge p-12 flex flex-col justify-center items-center relative shadow-forest min-h-[600px] border border-forest/5">
            <div className="uppercase text-[10px] tracking-[0.4em] font-bold opacity-60 mb-6">
              GOOD MORNING, {user.name}
            </div>
            
            <CalorieRing calories={consumed} goal={user.daily_calorie_goal} hideHeader />

            {/* Macro Bars */}
            <div className="w-full max-w-md mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <MacroBar label="PROTEIN" current={protein} goal={user.protein_goal_g} />
              <MacroBar label="CARBS" current={carbs} goal={user.carbs_goal_g} />
              <MacroBar label="FAT" current={fat} goal={user.fat_goal_g} />
            </div>
          </div>
        </div>

        {/* Right: Meal Logs (Col 5) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 bg-sage rounded-card border-2 border-dashed border-forest/20 flex flex-col items-center justify-center gap-2 hover:bg-sage/80 transition-all mb-4"
          >
            <Camera size={24} className="text-forest" />
            <span className="text-[10px] font-bold tracking-widest text-forest uppercase">SNAP A PHOTO TO LOG</span>
          </button>

          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(slot => (
            <MealSlotCard 
              key={slot} 
              slot={slot} 
              items={logs.filter(l => l.meal_slot === slot)} 
              onAddLog={() => {}} 
            />
          ))}

          <div className="mt-auto">
            <button className="w-full p-6 bg-forest text-cream font-bold tracking-[0.3em] rounded-full hover:scale-[0.98] transition-transform shadow-2xl text-[10px] uppercase">
              + ADD NEW MEAL
            </button>
          </div>
        </div>
      </div>

      {/* Floating Pill Input */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-40">
        <PillInput 
          placeholder="Tell me what you ate..." 
          onSubmit={handleTextLog}
          loading={analyzing}
        />
      </div>

      {/* Sticky Bottom Status Banner */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center pb-0 z-50">
        <div className={cn(
          "px-12 py-3 rounded-t-[2.5rem] flex gap-8 items-center transition-colors duration-500 shadow-2xl min-w-[320px] justify-center",
          bannerColor
        )}>
          <span className="text-cream text-[10px] font-bold tracking-[0.3em] uppercase">
            {remaining > 0 ? `${Math.round(remaining)} KCAL REMAINING` : `${Math.round(Math.abs(remaining))} KCAL OVER`}
          </span>
          <div className="w-1.5 h-1.5 bg-cream/30 rounded-full" />
          <span className="text-cream text-[10px] font-bold tracking-[0.3em] uppercase">
            CALORIQ • v1.0
          </span>
        </div>
      </div>

      {/* Temp Result Dialog */}
      <AnimatePresence>
        {tempResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-forest/20 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-cream rounded-card p-8 shadow-huge border border-forest/10"
            >
              <h3 className="font-anton text-3xl mb-6 text-forest">CONFIRM LOG?</h3>
              <NutritionResultCard item={tempResult.totals as any} confidence={tempResult.confidence} />
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => setTempResult(null)}
                  className="flex-1 py-4 rounded-2xl border-2 border-forest text-forest text-[10px] font-bold tracking-widest uppercase"
                >
                  CANCEL
                </button>
                <button 
                  onClick={() => confirmLog(activeSlot)}
                  className="flex-1 py-4 rounded-2xl bg-forest text-cream text-[10px] font-bold tracking-widest uppercase"
                >
                  CONFIRM & LOG
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
