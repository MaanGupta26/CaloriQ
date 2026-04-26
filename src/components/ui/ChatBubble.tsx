import React from 'react';
import { cn } from '@/src/lib/utils';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  logTriggered?: boolean;
  logSlot?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content, logTriggered, logSlot }) => {
  const isUser = role === 'user';
  
  return (
    <div className={cn("flex flex-col mb-6", isUser ? "items-end" : "items-start")}>
      <div className={cn(
        "max-w-[85%] p-6 shadow-sm",
        isUser 
          ? "bg-forest text-cream rounded-[2.5rem_2.5rem_0.5rem_2.5rem]" 
          : "bg-cream text-forest border border-forest/5 rounded-[2.5rem_2.5rem_2.5rem_0.5rem]"
      )}>
        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
      
      {logTriggered && (
        <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-moss/20 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
          <span className="text-[8px] font-bold tracking-widest text-forest uppercase">✓ LOGGED TO {logSlot}</span>
        </div>
      )}
    </div>
  );
};
