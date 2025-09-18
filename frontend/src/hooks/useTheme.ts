import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';

export const useTheme = () => {
  const theme = useUIStore(s => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return theme;
};