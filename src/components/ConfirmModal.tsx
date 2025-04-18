import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import SpinnerIcon from '@/assets/icons/SpinnerIcon';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText,
  cancelButtonText,
  isLoading = false
}: ConfirmModalProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();

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
            <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
              {title}
            </h2>
            <p className={`mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
              {message}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg font-medium ${theme === 'dark'
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
              >
                {cancelButtonText || t.common.cancel}
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 ${theme === 'dark'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <SpinnerIcon />
                    {t.common.processing}
                  </span>
                ) : (confirmButtonText || t.common.confirm)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 