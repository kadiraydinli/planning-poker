'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon, UserPlusIcon, LanguageIcon } from '@heroicons/react/24/outline';

export default function ThemeLanguageSwitcher() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const params = useParams();
  const [showInviteTooltip, setShowInviteTooltip] = useState(false);
  const inviteTooltipRef = useRef<HTMLDivElement>(null);

  // Sadece room sayfasında olup olmadığımızı kontrol edelim
  const isRoomPage = params?.id ? true : false;
  const roomUrl = typeof window !== 'undefined' && isRoomPage ? `${window.location.origin}/room/${params.id}` : '';

  const copyToClipboard = async () => {
    if (!roomUrl) return;

    try {
      await navigator.clipboard.writeText(roomUrl);
      toast.success(t.common.linkCopied);
    } catch {
      toast.error(t.common.copyFailed);
    }
  };

  // Event listener to close tooltip when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inviteTooltipRef.current && !inviteTooltipRef.current.contains(event.target as Node)) {
        setShowInviteTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      {isRoomPage && (
        <div className="relative">
          <button
            onClick={() => setShowInviteTooltip(!showInviteTooltip)}
            className={`group flex items-center justify-center gap-1 px-4 h-10 rounded-xl transition-all duration-200 shadow-lg backdrop-blur-sm ${theme === 'dark'
              ? 'bg-slate-800/40 text-slate-200 hover:bg-slate-700/50 hover:text-white shadow-slate-900/30'
              : 'bg-white/30 text-gray-600 hover:bg-white/40 hover:text-gray-800 shadow-purple-500/10'
              }`}
          >
            <UserPlusIcon className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">{t.common.invite}</span>
          </button>

          <AnimatePresence>
            {showInviteTooltip && (
              <motion.div
                ref={inviteTooltipRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.2
                }}
                className={`
                  absolute 
                  right-0 
                  top-full 
                  mt-2 
                  rounded-xl 
                  shadow-lg 
                  overflow-hidden 
                  z-10 
                  w-80 
                  ${theme === 'dark'
                    ? 'bg-gradient-to-br from-slate-800 to-indigo-950/90 border border-indigo-900/40 backdrop-blur-md'
                    : 'bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-md border border-purple-100/50'
                  }
                  p-4 
                `}
              >
                <div className="flex flex-col gap-4">
                  <motion.div
                    className="text-center mb-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <div className={`
                      inline-block
                      mx-auto
                      mb-2
                      p-2
                      rounded-xl
                      bg-white
                      shadow-[0_0_12px_rgba(124,58,237,0.12)]
                      dark:bg-white/95
                      dark:shadow-[0_0_20px_rgba(79,70,229,0.3)]
                    `}>
                      <QRCodeSVG
                        value={roomUrl}
                        size={160}
                        bgColor={'#ffffff'}
                        fgColor={theme === 'dark' ? '#6d28d9' : '#6d28d9'}
                        level="H"
                        className="mx-auto"
                      />
                    </div>
                    <p className="text-sm font-medium text-purple-800 dark:text-indigo-300">
                      {t.common.scanToJoin}
                    </p>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-2 mt-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                  >
                    <input
                      type="text"
                      value={roomUrl}
                      readOnly
                      className={`flex-1 px-3 py-2 rounded-lg text-sm ${theme === 'dark'
                        ? 'bg-slate-800 border border-indigo-900/70 text-slate-200'
                        : 'bg-white/90 border border-purple-200 text-purple-900'
                        } focus:ring focus:ring-indigo-300`}
                    />
                    <button
                      onClick={copyToClipboard}
                      className={`p-2 rounded-lg ${theme === 'dark'
                        ? 'bg-indigo-900/60 hover:bg-indigo-800/70 text-indigo-300'
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                        }`}
                      title={t.common.copyLink}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                      </svg>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
        <LanguageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </button>
    </div>
  );
} 