import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Vote } from '@/types';

// Client tarafında yüklenecek ReactConfetti bileşeni
const ReactConfetti = dynamic(() => import('react-confetti'), {
  ssr: false
});

interface ConfettiCelebrationProps {
  votes: Vote;
  revealed: boolean;
  onConfettiStart?: () => void;
  onConfettiEnd?: () => void;
  duration?: number;
}

export default function ConfettiCelebration({
  votes,
  revealed,
  onConfettiStart,
  onConfettiEnd,
  duration = 10000
}: ConfettiCelebrationProps) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Window boyutlarını takip et
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Oyları kontrol et ve aynı oy verilmişse konfeti göster
  useEffect(() => {
    if (!votes || Object.keys(votes).length < 2 || !revealed) {
      // Hiç oy yok, tek kişi oy vermiş veya oylar gösterilmiyorsa konfeti gösterme
      setShowConfetti(false);
      return;
    }

    const voteValues = Object.values(votes);
    const firstVote = voteValues[0];
    const allSameVote = voteValues.every(vote => vote === firstVote);
    
    // Herkes aynı oya oy vermişse ve birden fazla oy varsa
    if (allSameVote && voteValues.length >= 2) {
      setShowConfetti(true);
      if (onConfettiStart) {
        onConfettiStart();
      }

      // Önceki timer varsa temizle
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Duration sonra konfeti efektini kapat
      timerRef.current = setTimeout(() => {
        setShowConfetti(false);
        if (onConfettiEnd) {
          onConfettiEnd();
        }
        timerRef.current = null;
      }, duration);
    } else {
      setShowConfetti(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [votes, revealed, duration, onConfettiStart, onConfettiEnd]);

  if (!showConfetti) return null;

  return (
    <ReactConfetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      run={showConfetti}
      numberOfPieces={600}
      gravity={0.2}
      initialVelocityY={25}
      tweenDuration={6000}
      colors={['#0066FF', '#FFD700', '#FF1493', '#00BFFF', '#00FF7F', '#FF4500', '#9932CC', '#FF8C00']}
    />
  );
} 