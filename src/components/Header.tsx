'use client';

import ThemeLanguageSwitcher from './ThemeLanguageSwitcher';

export default function Header() {
  return (
    <header className="fixed top-4 right-4 z-50">
      <ThemeLanguageSwitcher />
    </header>
  );
} 