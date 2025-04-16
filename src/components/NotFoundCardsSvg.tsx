'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function NotFoundCardsSvg() {
  const { theme } = useTheme();
  
  return (
    <svg 
      width="240" 
      height="260" 
      viewBox="0 0 240 260" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${theme === 'dark' ? 'opacity-90' : 'opacity-100'} animate-floating`}
    >
      {/* Kart 1 - Arkadaki kart */}
      <g transform="translate(45, 40) rotate(-15)">
        <rect 
          x="0" 
          y="0" 
          width="110" 
          height="160" 
          rx="10" 
          fill={theme === 'dark' ? '#3730a3' : '#818cf8'} 
          stroke={theme === 'dark' ? '#c7d2fe' : '#4f46e5'} 
          strokeWidth="3"
          filter="drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))"
        />
        <text 
          x="42" 
          y="100" 
          fontFamily="monospace" 
          fontSize="52" 
          fontWeight="bold" 
          fill={theme === 'dark' ? '#e0e7ff' : '#ffffff'}
        >
          ?
        </text>
      </g>
      
      {/* Kart 2 - Öndeki kart */}
      <g transform="translate(90, 40) rotate(15)">
        <rect 
          x="0" 
          y="0" 
          width="110" 
          height="160" 
          rx="10" 
          fill={theme === 'dark' ? '#b91c1c' : '#ef4444'} 
          stroke={theme === 'dark' ? '#fecaca' : '#b91c1c'} 
          strokeWidth="3"
          filter="drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.2))"
        />
        <text 
          x="55" 
          y="100" 
          fontFamily="monospace" 
          fontSize="52" 
          fontWeight="bold" 
          fill={theme === 'dark' ? '#fee2e2' : '#ffffff'}
        >
          !
        </text>
      </g>
      
      {/* Yanıp sönen parlaklık efekti */}
      <circle 
        cx="120" 
        cy="125" 
        r="100" 
        fill="url(#pulse-gradient)" 
        opacity="0.3"
      />
      
      {/* Gradient tanımı */}
      <defs>
        <radialGradient id="pulse-gradient" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={theme === 'dark' ? '#ef4444' : '#f87171'} />
          <stop offset="100%" stopColor={theme === 'dark' ? '#ef444400' : '#f8717100'} />
        </radialGradient>
      </defs>
    </svg>
  );
} 