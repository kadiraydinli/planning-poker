'use client';

import { useRouter } from 'next/navigation';

import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import NotFoundCardsSvg from '@/assets/icons/NotFoundCardsSvg';

export default function RoomNotFound() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <main className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'} p-4 flex flex-col items-center justify-center`}>
      <Header />
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-10 mt-4">
          <NotFoundCardsSvg />
        </div>
        <h2 className="text-3xl font-bold mb-5 text-gray-900 dark:text-white">
          {t.room.roomNotFound}
        </h2>
        <p className="mb-10 text-lg text-gray-600 dark:text-gray-300">
          {t.room.roomMayBeClosed}
        </p>
        <button
          onClick={() => router.push('/')}
          className={`px-8 py-4 text-lg rounded-lg font-medium ${theme === 'dark'
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            } transition-colors duration-300`}
        >
          {t.common.backToHome}
        </button>
      </div>
    </main>
  );
} 