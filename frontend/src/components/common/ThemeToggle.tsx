import * as React from 'react';
import { useUIStore } from '../../store/uiStore';

const ThemeToggle: React.FC = () => {
  const theme = useUIStore(s => s.theme);
  const setTheme = useUIStore(s => s.setTheme);
  return (
    <button
      className="rounded-full w-8 h-8 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent bg-gray-800 text-white"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <span className="material-icons">dark_mode</span> : <span className="material-icons">light_mode</span>}
    </button>
  );
};
export default ThemeToggle;