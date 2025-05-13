import { useEffect, useState } from 'react';

// Generic useLocalStorage hook
function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from localStorage then fallback to initialValue
  const readValue = () => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Update localStorage when value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for changes to localStorage (from other tabs)
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(readValue());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
    // eslint-disable-next-line
  }, [key]);

  return [storedValue, setStoredValue] as const;
}

export default useLocalStorage; 