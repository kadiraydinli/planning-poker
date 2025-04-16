import React, { useState } from 'react';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`${
        theme === 'dark'
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-purple-100'
      } border rounded-2xl p-6 w-full max-w-md shadow-xl`}>
        <h2 className={`text-xl font-bold mb-4 ${
          theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
        }`}>
          {t.room.enterYourName || 'Enter Your Name'}
        </h2>
        <p className={`mb-4 ${
          theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
        }`}>
          {t.room.beforeJoining || 'Before joining, please enter your name:'}
        </p>
        
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t.room.yourName || 'Your Name'}
          className={`w-full h-12 px-4 rounded-lg border-2 focus:ring focus:ring-opacity-50 placeholder-gray-400 shadow-sm mb-4 ${
            theme === 'dark'
              ? 'bg-slate-700 border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 text-slate-200'
              : 'bg-white border-purple-100 focus:border-purple-300 focus:ring-purple-200 text-gray-900'
          }`}
        />
        
        <div className="flex gap-3 justify-end">
          {showCancelButton && (
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium ${
                theme === 'dark'
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {t.common.cancel || 'Cancel'}
            </button>
          )}
          
          <button
            onClick={() => onSubmit(value)}
            disabled={isLoading || !value?.trim()}
            className={`px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {loadingText || t.room.joining || 'Joining...'}
              </span>
            ) : (
              submitButtonText || t.room.joinRoom || 'Join Room'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 