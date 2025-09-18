import * as React from 'react';

const Footer: React.FC = () => (
  <footer className="h-12 flex items-center justify-between px-4 md:px-8 bg-primary text-white text-xs shadow-inner">
    <span>Status: <span className="text-green-400">Online</span></span>
  <span>© 2025 Tumburu</span>
    <span>Shortcuts: <kbd className="bg-gray-700 px-1 rounded">?</kbd></span>
  </footer>
);
export default Footer;
