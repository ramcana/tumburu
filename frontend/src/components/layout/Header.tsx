import * as React from 'react';
import ThemeToggle from '../common/ThemeToggle';

const Header: React.FC = () => (
  <header className="flex items-center justify-between px-4 md:px-8 h-16 bg-primary text-white shadow z-20">
    <div className="flex items-center gap-4">
  <span className="font-bold text-xl tracking-tight">Tumburu</span>
      <nav aria-label="Main navigation" className="hidden md:flex gap-4">
        <a href="#" className="hover:underline focus:outline-none focus:ring-2 focus:ring-accent">Generate</a>
        <a href="#" className="hover:underline focus:outline-none focus:ring-2 focus:ring-accent">Library</a>
      </nav>
    </div>
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <button className="rounded-full w-8 h-8 bg-accent flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent" aria-label="User menu">
        <span className="material-icons">person</span>
      </button>
    </div>
  </header>
);
export default Header;
