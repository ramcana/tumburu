import * as React from 'react';
import { useState } from 'react';

interface SidebarProps {
  onNavigate?: (view: 'library' | 'history') => void;
  activeView?: 'library' | 'history';
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeView }) => {
  const [open, setOpen] = useState(false);
  return (
    <aside className={`bg-primary text-white w-64 flex-shrink-0 h-full transition-transform duration-300 z-10
      ${open ? 'translate-x-0' : '-translate-x-64'} md:translate-x-0 fixed md:static top-16 left-0 md:top-0 md:left-0`}
      aria-label="Sidebar navigation"
      tabIndex={-1}
    >
      <button
        className="md:hidden absolute top-2 right-2 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent"
        onClick={() => setOpen(false)}
        aria-label="Close sidebar"
      >×</button>
      <nav className="flex flex-col gap-2 p-4 mt-8 md:mt-0">
        <button
          className={`py-2 px-3 rounded text-left hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent ${activeView === 'library' ? 'bg-accent/30' : ''}`}
          onClick={() => onNavigate?.('library')}
        >Library</button>
        <button
          className={`py-2 px-3 rounded text-left hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent ${activeView === 'history' ? 'bg-accent/30' : ''}`}
          onClick={() => onNavigate?.('history')}
        >History</button>
        <a href="#" className="py-2 px-3 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent">Presets</a>
      </nav>
    </aside>
  );
};
export default Sidebar;
