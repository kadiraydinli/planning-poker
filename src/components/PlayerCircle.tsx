'use client';

import { useMemo } from 'react';
import { BsQuestion } from 'react-icons/bs';
import { motion } from 'framer-motion';

import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckIcon } from '@heroicons/react/24/solid';

interface User {
  name: string;
  isAdmin: boolean;
  joinedAt: string;
  sessionId?: string;
}

interface PlayerCircleProps {
  users: { [key: string]: User };
  votes: { [key: string]: string };
  revealed: boolean;
  onReveal: () => void;
  onReset: () => void;
  currentUserName: string;
}

export default function PlayerCircle({ users, votes, revealed, onReveal, onReset, currentUserName }: PlayerCircleProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  // Kullanıcıları joinedAt zamanına göre sıralıyoruz, böylece sıralama sabit kalır
  const userList = useMemo(() => {
    return Object.entries(users)
      .filter(([, user]) => user && user.name) // Geçersiz kullanıcıları filtrele
      .map(([key, user]) => ({
        key,
        ...user,
        hasVoted: votes[user.name] ? true : false,
        vote: votes[user.name] || null,
      }))
      .sort((a, b) => {
        // Giriş zamanına göre sırala (eskiden yeniye)
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      });
  }, [users, votes]);
  
  // En az bir oyun verilmiş mi?
  const hasAnyVotes = Object.keys(votes).length > 0;

  return (
    <motion.div 
      className={`w-full max-w-4xl mx-auto flex flex-col items-center justify-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'} h-[60vh]`}
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Kullanıcı Listesi */}
      <motion.div 
        className="flex items-center justify-center"
        layout="position"
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: 1,
          width: revealed ? '50%' : '100%',
        }}
        style={{ 
          position: revealed ? 'absolute' : 'relative',
          left: revealed ? '5%' : 'auto',
          top: revealed ? '50%' : 'auto',
          transform: revealed ? 'translateY(-50%)' : 'none',
          width: revealed ? '35%' : '100%'
        }}
        transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 25 }}
      >
        <div className={`flex flex-wrap ${revealed ? 'justify-center' : 'justify-evenly'} w-full`}>
          {userList.map((user) => {
            // Her kullanıcı için kartın görünümünü belirle
            const isCurrentUser = user.name === currentUserName;
            const hasVoted = user.hasVoted;
            
            return (
              <motion.div 
                key={`player-${user.key}`} 
                className="flex flex-col items-center mb-10 mx-4 md:mx-6"
                layout="position"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "tween", stiffness: 400, damping: 10 }}
              >
                <div className={`
                  ${revealed ? 'w-20 h-20 md:w-24 md:h-24' : 'w-24 h-24 md:w-28 md:h-28'} mb-2 md:mb-3 flex items-center justify-center rounded-full shadow-lg
                  ${hasVoted 
                    ? theme === 'dark' ? 'bg-green-600' : 'bg-green-500' 
                    : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-600'
                  }
                  ${isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}
                  transition-all duration-300
                `}>
                  {revealed && hasVoted ? (
                    <div className={`font-bold ${revealed ? 'text-xl' : 'text-2xl'} text-white`}>{user.vote}</div>
                  ) : hasVoted ? (
                    <CheckIcon className={`${revealed ? 'w-10 h-10' : 'w-14 h-14'} text-white`} />
                  ) : (
                    <BsQuestion className={`${revealed ? 'w-12 h-12' : 'w-16 h-16'} text-white`} />
                  )}
                </div>
                <span className={`text-sm md:text-base font-medium px-3 md:px-4 py-1 md:py-1.5 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-white text-gray-800'
                } shadow-sm mt-1`}>
                  {user.name}
                </span>
                {user.isAdmin && (
                  <span className="mt-1 md:mt-2 text-2xs md:text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">{t.room.admin || "kurucu"}</span>
                )}
                {isCurrentUser && !user.isAdmin && (
                  <span className="mt-1 md:mt-2 text-2xs md:text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">{t.room.you || "sen"}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      
      {/* Oyları Göster/Sıfırla Butonu - Alt kısımda ama kartlardan yukarıda */}
      <div className="mt-auto fixed bottom-28 left-0 right-0 flex justify-center z-10">
        <motion.button
          onClick={revealed ? onReset : onReveal}
          disabled={!hasAnyVotes && !revealed}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            backgroundColor: revealed 
              ? theme === 'dark' ? 'rgb(5, 150, 105)' : 'rgb(16, 185, 129)'
              : theme === 'dark' ? 'rgb(37, 99, 235)' : 'rgb(59, 130, 246)'
          }}
          className={`
            px-8 py-3 rounded-lg font-medium text-white
            transition-all duration-300 shadow-md hover:shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {revealed ? t.room.nextVoting || 'Sonraki Oylama' : t.common.showVotes || 'Oyları Göster'}
        </motion.button>
      </div>
    </motion.div>
  );
} 