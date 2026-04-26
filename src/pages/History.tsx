import React from 'react';
import { motion } from 'motion/react';
import { REVEAL_VARIANTS } from '../lib/utils';
import { db, handleFirestoreError, OperationType, MealLog } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import { MealSlotCard } from '../components/ui/MealSlotCard';

export const History = ({ user }: { user: any }) => {
  const [selectedDate, setSelectedDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [logs, setLogs] = React.useState<MealLog[]>([]);

  const fetchLogs = async (date: string) => {
    try {
      const logsRef = collection(db, 'meal_logs');
      const q = query(
        logsRef,
        where('user_id', '==', user.id),
        where('log_date', '==', date)
      );
      const snapshot = await getDocs(q);
      const fetchedLogs = snapshot.docs.map(doc => doc.data() as MealLog);
      setLogs(fetchedLogs);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'meal_logs');
    }
  };

  React.useEffect(() => {
    fetchLogs(selectedDate);
  }, [selectedDate, user.id]);

  const dates = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i));

  return (
    <motion.div 
      variants={REVEAL_VARIANTS}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      <div className="flex justify-between items-end">
        <h1 className="font-anton text-[15vw] md:text-8xl text-forest">HISTORY</h1>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
        {dates.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isSelected = selectedDate === dateStr;
          return (
            <button 
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`shrink-0 w-24 h-24 rounded-card flex flex-col items-center justify-center transition-all ${
                isSelected ? 'bg-forest text-cream scale-110 shadow-lg' : 'bg-sage/40 text-forest'
              }`}
            >
              <span className="text-[8px] font-bold tracking-widest uppercase">{format(date, 'EEE')}</span>
              <span className="font-anton text-3xl">{format(date, 'd')}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {logs.length > 0 ? (
          (['breakfast', 'lunch', 'dinner', 'snack'] as const).map(slot => (
            <MealSlotCard 
              key={slot} 
              slot={slot} 
              items={logs.filter(l => l.meal_slot === slot)} 
              onAddLog={() => {}} 
            />
          ))
        ) : (
          <div className="h-64 rounded-huge bg-olive/20 flex flex-col items-center justify-center text-forest/40">
            <span className="font-anton text-4xl opacity-20">EMPTY PLATE</span>
            <span className="text-[10px] font-bold tracking-widest mt-2">NO LOGS FOR THIS DAY</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

