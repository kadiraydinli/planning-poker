import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';

export function useUserId(): string {
  const USER_ID_KEY = 'planningPokerUserId';

  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let id = localStorage.getItem(USER_ID_KEY);

    if (!id) {
      id = nanoid(16);
      localStorage.setItem(USER_ID_KEY, id);
    }

    setUserId(id);
  }, []);

  return userId;
} 