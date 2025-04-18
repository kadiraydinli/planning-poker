'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon, LanguageIcon } from '@heroicons/react/24/outline';

export default function ThemeLanguageSwitcher() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleTheme}
        className={`group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 shadow-lg backdrop-blur-sm ${theme === 'dark'
          ? 'bg-slate-800/40 text-yellow-300 hover:bg-slate-700/50 hover:text-yellow-200 shadow-slate-900/30'
          : 'bg-white/30 text-yellow-500 hover:bg-white/40 hover:text-yellow-600 shadow-purple-500/10'
          }`}
        aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? (
          <SunIcon className="w-5 h-5 drop-shadow" />
        ) : (
          <MoonIcon className="w-5 h-5 drop-shadow" />
        )}
      </button>

      <button
        onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
        className={`group flex items-center justify-center gap-2 px-4 h-10 rounded-xl transition-all duration-200 shadow-lg backdrop-blur-sm ${theme === 'dark'
          ? 'bg-slate-800/40 text-slate-200 hover:bg-slate-700/50 hover:text-white shadow-slate-900/30'
          : 'bg-white/30 text-gray-600 hover:bg-white/40 hover:text-gray-800 shadow-purple-500/10'
          }`}
        aria-label={language === 'tr' ? t.common.switchToEnglish : t.common.switchToTurkish}
      >
        <span className="text-sm font-medium tracking-wide">{language === 'tr' ? t.common.langCodeEn : t.common.langCodeTr}</span>
        <LanguageIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
      </button>
    </div>
  );
} 