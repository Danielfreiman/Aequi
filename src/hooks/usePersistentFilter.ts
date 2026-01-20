import { useEffect, useState } from 'react';

export function usePersistentFilter<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore persistence errors */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
