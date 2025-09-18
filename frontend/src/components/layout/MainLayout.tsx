import * as React from 'react';

import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Toast from '../ui/Toast';
import { useUIStore } from '../../store/uiStore';
import ErrorBoundary from '../common/ErrorBoundary';
import { AudioLibrary } from '../audio/AudioLibrary';
import AudioPlayer from '../audio/AudioPlayer';
import HistoryPanel from '../panels/HistoryPanel';


const MainLayout: React.FC<{ children?: React.ReactNode }> = () => {
  const notification = useUIStore(s => s.notification);
  const setNotification = useUIStore(s => s.setNotification);
  const [view, setView] = React.useState<'library' | 'history'>('library');
  const [selectedFile, setSelectedFile] = React.useState<any | null>(null);

  // Sidebar navigation integration
  const handleNav = (v: 'library' | 'history') => {
    setView(v);
    setSelectedFile(null);
  };

  // AudioLibrary file click handler
  const handleFileClick = (file: any) => {
    setSelectedFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-primary font-sans transition-colors duration-300">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onNavigate={handleNav} activeView={view} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
          <ErrorBoundary>
            <React.Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 rounded" aria-busy="true" aria-label="Loading content" />}> 
              {view === 'library' ? (
                <AudioLibrary onFileClick={handleFileClick} />
              ) : (
                <HistoryPanel />
              )}
            </React.Suspense>
          </ErrorBoundary>
          {/* Docked AudioPlayer */}
          {selectedFile && (
            <div className="fixed left-0 right-0 bottom-0 z-40 flex justify-center pointer-events-none">
              <div className="pointer-events-auto w-full max-w-2xl mx-auto mb-4">
                <AudioPlayer src={selectedFile.url || selectedFile.audio_url} title={selectedFile.meta?.title || selectedFile.id} />
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
      {notification && (
        <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </div>
  );
};
export default MainLayout;
