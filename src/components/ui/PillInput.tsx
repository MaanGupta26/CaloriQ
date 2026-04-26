import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface PillInputProps {
  placeholder: string;
  onSubmit: (val: string) => void;
  loading?: boolean;
}

export const PillInput: React.FC<PillInputProps> = ({ placeholder, onSubmit, loading }) => {
  const [value, setValue] = React.useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (value.trim() && !loading) {
      onSubmit(value);
      setValue('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center bg-cream border border-moss rounded-full p-2 pr-4 shadow-forest transition-all duration-300",
        "focus-within:border-forest focus-within:ring-1 focus-within:ring-forest/10"
      )}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={loading}
        className="flex-1 bg-transparent border-none outline-none px-6 py-3 text-sm text-forest placeholder:text-forest/30 font-medium disabled:opacity-50"
      />
      <button 
        type="submit"
        disabled={!value.trim() || loading}
        className="w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
      </button>
    </form>
  );
};
