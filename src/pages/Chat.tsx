import React from 'react';
import { motion } from 'motion/react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { PillInput } from '../components/ui/PillInput';
import { REVEAL_VARIANTS } from '../lib/utils';
import { db, handleFirestoreError, OperationType, MealLog } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import { getCoachResponse } from '../lib/ai';

export const Chat = ({ user }: { user: any }) => {
  const [messages, setMessages] = React.useState<any[]>([
    { role: 'assistant', content: `Hey ${user.name}! I've been looking at your logs. How are you feeling today?` }
  ]);
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // 1. Get Today's Logs
      const today = format(new Date(), 'yyyy-MM-dd');
      const logsRef = collection(db, 'meal_logs');
      const q = query(
        logsRef,
        where('user_id', '==', user.id),
        where('log_date', '==', today)
      );

      let todayLogs: MealLog[] = [];
      try {
        const snapshot = await getDocs(q);
        todayLogs = snapshot.docs.map(doc => doc.data() as MealLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'meal_logs');
      }

      // 2. Build Context
      const context = `
CONTEXT — User Nutrition Data:
- Goal: ${user.daily_calorie_goal} kcal/day | Protein: ${user.protein_goal_g}g | Carbs: ${user.carbs_goal_g}g | Fat: ${user.fat_goal_g}g
- Today's intake: ${todayLogs.reduce((sum, l) => sum + l.calories, 0)} kcal.
- User profile: ${user.age}y/o, ${user.weight_kg}kg, Goal: ${user.goal}
`;

      const result = await getCoachResponse(
        newMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        context
      );

      if (result.message) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: result.message,
          logTriggered: !!result.logItem,
          logSlot: result.logItem?.meal_slot
        }]);

        if (result.logItem) {
          try {
            await addDoc(collection(db, 'meal_logs'), {
              user_id: user.id,
              log_date: today,
              input_method: 'chat',
              ai_confidence: 'high',
              ...result.logItem,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'meal_logs');
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      variants={REVEAL_VARIANTS}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-[calc(100vh-12rem)]"
    >
      <div className="bg-sage/40 h-16 shrink-0 rounded-t-[2.5rem] flex items-center justify-center border-b border-forest/10">
        <h2 className="font-anton text-2xl text-forest tracking-tighter uppercase">YOUR NUTRITION COACH</h2>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 scroll-smooth"
      >
        {messages.map((m, i) => (
          <ChatBubble key={i} {...m} />
        ))}
        {loading && (
          <div className="flex gap-1 p-4">
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-forest" />
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-forest" />
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-forest" />
          </div>
        )}
      </div>

      <div className="p-6 shrink-0">
        <PillInput placeholder="Ask me anything or log a meal..." onSubmit={handleSend} loading={loading} />
      </div>
    </motion.div>
  );
};

