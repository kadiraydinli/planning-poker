import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import SpinnerIcon from '@/assets/icons/SpinnerIcon';

interface NameModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  showCancelButton?: boolean;
  submitButtonText?: string;
  loadingText?: string;
}

export default function NameModal({
  isOpen,
  isLoading,
  onClose,
  onSubmit,
  showCancelButton = true,
  submitButtonText,
  loadingText
}: NameModalProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [value, setValue] = useState('');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`${theme === 'dark'
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-purple-100'
              } border rounded-2xl p-6 w-full max-w-md shadow-xl`}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3
            }}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-slate-200">
              {t.room.enterYourName}
            </h2>
            <p className="mb-4 text-gray-700 dark:text-slate-300">
              {t.room.beforeJoining}
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (value.trim()) {
                onSubmit(value);
              }
            }}>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t.room.yourName}
                className={`w-full h-12 px-4 rounded-lg border-2 focus:ring focus:ring-opacity-50 placeholder-gray-400 shadow-sm mb-4 ${theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 text-slate-200'
                  : 'bg-white border-purple-100 focus:border-purple-300 focus:ring-purple-200 text-gray-900'
                  }`}
              />

              <div className="flex gap-3 justify-end">
                {showCancelButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-4 py-2 rounded-lg font-medium ${theme === 'dark'
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                  >
                    {t.common.cancel}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !value?.trim()}
                  className={`px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 ${theme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <SpinnerIcon />
                      {loadingText || t.room.joining}
                    </span>
                  ) : (submitButtonText || t.room.joinRoom)}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 