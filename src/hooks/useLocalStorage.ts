import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      // String değerler için JSON.parse hatasından kaçınalım
      try {
        return JSON.parse(item);
      } catch {
        // Eğer JSON parse edilemezse, muhtemelen doğrudan bir string
        // Bu durumda direkt string değeri dönelim (T string ise)
        return item as unknown as T;
      }
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Eğer değer string ise direkt kaydedelim, değilse JSON.stringify kullanalım
        const valueToStore =
          typeof storedValue === 'string'
            ? storedValue
            : JSON.stringify(storedValue);

        window.localStorage.setItem(key, valueToStore);
      } catch (error) {
        console.error(error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
} 