'use client';

import { useTheme } from "@/contexts/ThemeContext";

export default function DecorativeElements() {
  const { theme } = useTheme();

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute -top-40 -right-40 w-80 h-80 ${theme === 'dark' ? 'bg-purple-800' : 'bg-purple-300'} rounded-full opacity-20 blur-3xl`}></div>
      <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${theme === 'dark' ? 'bg-indigo-800' : 'bg-indigo-300'} rounded-full opacity-20 blur-3xl`}></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${theme === 'dark' ? 'bg-pink-800' : 'bg-pink-300'} rounded-full opacity-20 blur-3xl`}></div>
    </div>
  );
} 