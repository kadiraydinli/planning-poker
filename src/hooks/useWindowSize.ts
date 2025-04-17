import { useState, useEffect } from 'react';

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

export function useWindowSize(): WindowSize {
  // SSR için başlangıç değerleri undefined
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Window boyutlarını alıp state'e kaydetmek için handler
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Event listener ekle
    window.addEventListener('resize', handleResize);

    // İlk render için hemen çağır
    handleResize();

    // Cleanup: event listener'ı kaldır
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Boş dependency array ile yalnızca bir kez çalışır

  return windowSize;
} 