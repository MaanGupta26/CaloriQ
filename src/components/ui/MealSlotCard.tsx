import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { MealLog } from '@/src/lib/firebase';

interface MealSlotCardProps {
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealLog[];
  onAddLog: (slot: string) => void;
}


export const MealSlotCard: React.FC<MealSlotCardProps> = ({ slot, items, onAddLog }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const totalKcal = items.reduce((sum, item) => sum + item.calories, 0);

  return (
    <div className="bg-cream rounded-card shadow-forest overflow-hidden mb-6 border border-forest/5">
      <div 
        className="p-6 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col">
          <h3 className="font-anton text-3xl text-forest uppercase tracking-tight">
            {slot}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-forest text-cream px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest">
              {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="font-anton text-2xl text-forest">{Math.round(totalKcal)}</div>
            <div className="text-[8px] font-bold tracking-widest text-forest/40 uppercase">KCAL</div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-forest/40"
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-forest/5">
              {items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between group">
                      <div>
                        <div className="text-xs font-bold text-forest uppercase tracking-wider">{item.meal_name}</div>
                        <div className="text-[10px] text-forest/50 uppercase tracking-tighter">
                          {JSON.parse(item.items_json)?.[0]?.portion_description || 'Standard portion'}
                        </div>
                      </div>
                      <div className="bg-sage/30 text-forest px-3 py-1 rounded-full text-[10px] font-anton">
                        {Math.round(item.calories)} KCAL
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-[10px] font-bold tracking-widest text-forest/30 uppercase">
                  Nothing logged yet
                </div>
              )}
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddLog(slot);
                }}
                className="w-full mt-6 py-3 border-2 border-dashed border-forest/20 rounded-2xl flex items-center justify-center gap-2 text-forest/40 hover:emerald-20 transition-colors"
              >
                <Plus size={14} />
                <span className="text-[10px] font-bold tracking-widest">LOG {slot.toUpperCase()}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
