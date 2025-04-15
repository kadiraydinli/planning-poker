'use client';

import { useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { BsQuestion } from 'react-icons/bs';

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
  roomId: string;
}

export default function PlayerCircle({ users, votes, revealed, onReveal, onReset, currentUserName, roomId }: PlayerCircleProps) {
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

  // Eğer kullanıcı sayısı 1 veya 0 ise yalnız hissetme mesajını göster
  const showLonelyMessage = userList.length <= 1;
  
  // En az bir oyun verilmiş mi?
  const hasAnyVotes = Object.keys(votes).length > 0;

  // Oyuncuları davet et
  const handleInvite = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success(t.common.linkCopied);
      })
      .catch(() => {
        toast.error(t.common.copyFailed);
      });
  };

  return (
    <div className={`w-full max-w-xl mx-auto flex flex-col items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Yalnız hissetme mesajı */}
      {showLonelyMessage && (
        <div className="mb-8 text-center">
          <p className="text-lg mb-2">{t.room.feelingLonely} 😢</p>
          <button 
            onClick={handleInvite}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
          >
            {t.room.invitePlayers}
          </button>
        </div>
      )}

      {/* Kullanıcı Listesi - Ortada */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-items-center">
        {userList.map((user) => {
          // Her kullanıcı için kartın görünümünü belirle
          const isCurrentUser = user.name === currentUserName;
          const cardColor = user.hasVoted 
            ? theme === 'dark' ? 'bg-green-600' : 'bg-green-500' 
            : theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200';
          
          return (
            <div key={user.key} className="flex flex-col items-center">
              <div className={`
                w-20 h-20 mb-2 flex items-center justify-center rounded-full shadow-lg
                ${cardColor}
                ${isCurrentUser ? 'outline outline-offset-2 outline-blue-500' : ''}
                ${user.isAdmin ? 'outline outline-offset-2 outline-amber-500' : ''}
              `}>
                {revealed && user.hasVoted ? (
                  <div className="font-bold text-2xl text-white">{user.vote}</div>
                ) : user.hasVoted ? (
                  <CheckIcon className="w-10 h-10 text-white" />
                ) : (
                  <BsQuestion className="w-10 h-10 text-white" />
                )}
              </div>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'} shadow-sm mt-2`}>
                {user.name}
              </span>
              {isCurrentUser && (
                <span className="mt-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">{t.room.you}</span>
              )}
              {user.isAdmin && !isCurrentUser && (
                <span className="mt-1 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">{t.room.admin}</span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Oyları Göster/Sıfırla Butonu - Alt kısımda ama kartlardan yukarıda */}
      <div className="fixed bottom-28 left-0 right-0 flex justify-center z-10">
        <button
          onClick={revealed ? onReset : onReveal}
          disabled={!hasAnyVotes && !revealed}
          className={`
            px-6 py-2 rounded-lg font-medium text-white
            transition-all duration-300 shadow-md hover:shadow-lg
            ${revealed 
              ? `${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-emerald-500 hover:bg-emerald-400'}`
              : `${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-400'}`
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {revealed ? t.room.nextVoting || 'Sonraki Oylama' : t.common.showVotes}
        </button>
      </div>
    </div>
  );
} 