import React from 'react';
import { Check, Edit2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface NutritionResultCardProps {
  item: {
    name: string;
    portion_description: string;
    quantity_grams: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  onEdit?: (newItem: any) => void;
  confidence: 'high' | 'medium' | 'low';
}

export const NutritionResultCard: React.FC<NutritionResultCardProps> = ({ item, onEdit, confidence }) => {
  const confidenceColors = {
    high: 'bg-emerald-500',
    medium: 'bg-amber-500',
    low: 'bg-rose-500'
  };

  return (
    <div className="bg-white rounded-card shadow-forest p-6 border border-forest/5 flex flex-col gap-4 relative overflow-hidden">
      <div className={cn("absolute top-0 right-0 px-4 py-1 text-[8px] font-bold tracking-widest text-white uppercase", confidenceColors[confidence])}>
        {confidence} CONFIDENCE
      </div>

      <div className="flex justify-between items-start pt-2">
        <div>
          <h4 className="font-anton text-2xl text-forest uppercase tracking-tight leading-none mb-1">{item.name}</h4>
          <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{item.portion_description}</p>
        </div>
        <div className="bg-forest text-cream px-4 py-2 rounded-2xl font-anton text-xl leading-none">
          {Math.round(item.calories)} <span className="text-[8px] font-inter">KCAL</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MacroChip label="PRO" value={item.protein_g} unit="g" />
        <MacroChip label="CAR" value={item.carbs_g} unit="g" />
        <MacroChip label="FAT" value={item.fat_g} unit="g" />
      </div>
    </div>
  );
};

const MacroChip = ({ label, value, unit }: { label: string, value: number, unit: string }) => (
  <div className="bg-olive/40 rounded-xl p-3 flex flex-col items-center">
    <span className="text-[8px] font-bold tracking-widest text-forest/40 uppercase">{label}</span>
    <span className="font-anton text-lg text-forest">{Math.round(value)}{unit}</span>
  </div>
);
