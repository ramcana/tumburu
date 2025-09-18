import React, { useState, useRef, useCallback } from 'react';
import { useFileManagement } from '../../hooks/useFileManagement';
import clsx from 'clsx';
// import { FixedSizeList as List } from 'react-window'; // For virtualization

const SIDEBAR_FILTERS = [
  { label: 'Genre', key: 'genre' },
  { label: 'Date', key: 'date' },
  { label: 'Duration', key: 'duration' },
  { label: 'BPM', key: 'bpm' },
  { label: 'Key', key: 'key' },
];

interface AudioLibraryProps {
  onFileClick?: (file: any) => void;
}

export const AudioLibrary: React.FC<AudioLibraryProps> = ({ onFileClick }) => {
  const {
    files, isLoading, isError, fetchNextPage, hasNextPage, refetch,
    upload, uploadProgress, batchDelete, selected, setSelected,
    search, setSearch, filter, setFilter, thumbProgress, generateThumbnails,
  } = useFileManagement();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<'name' | 'date' | 'size' | 'duration' | 'popularity'>('date');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, id: string} | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Infinite scroll (basic, can be replaced with react-window)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop < el.clientHeight * 2 && hasNextPage && !isLoading) {
      fetchNextPage();
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        setSelected(files.map(f => f.id));
        e.preventDefault();
      }
      if (e.key === 'Delete' && selected.length) {
        batchDelete(selected);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [files, selected, setSelected, batchDelete]);

  // Search debounce
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setSearch(e.target.value);
  }, [setSearch]);

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, id });
  };

  // File card click/selection
  const handleSelect = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    if ((e as React.MouseEvent).ctrlKey || (e as React.KeyboardEvent).ctrlKey) {
      setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
    } else if ((e as React.MouseEvent).shiftKey || (e as React.KeyboardEvent).shiftKey) {
      // Range select logic (not implemented for brevity)
      setSelected([id]);
    } else {
      setSelected([id]);
    }
  };

  // Breadcrumb navigation
  const handleBreadcrumb = (idx: number) => {
    setBreadcrumb(breadcrumb.slice(0, idx + 1));
    // setFilter({ ...filter, path: ... })
  };

  // Render file card/list row
  const renderFile = (file: any) => (
    <div
      key={file.id}
      className={clsx(
        'relative group rounded border p-2 flex flex-col items-center justify-between transition-all',
        view === 'grid' ? 'w-48 h-48 m-2' : 'w-full flex-row h-20',
        selected.includes(file.id) && 'ring-2 ring-accent',
      )}
      tabIndex={0}
      onClick={e => { handleSelect(file.id, e); if (onFileClick) onFileClick(file); }}
      onContextMenu={e => handleContextMenu(e, file.id)}
      draggable
      // onDragStart, onDrop, etc. for playlist/queue integration
    >
      {/* Waveform thumbnail */}
      <div className="w-full h-16 bg-gray-200 dark:bg-zinc-800 rounded mb-2 flex items-center justify-center">
        {/* TODO: Render waveform or image */}
        {thumbProgress[file.id] !== undefined ? (
          <div className="w-full h-2 bg-accent/20 rounded">
            <div className="h-2 bg-accent rounded" style={{ width: thumbProgress[file.id] + '%' }} />
          </div>
        ) : (
          <span className="text-xs text-gray-400">No preview</span>
        )}
      </div>
      {/* Metadata overlay */}
      <div className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
        {file.meta?.bpm && <span>BPM: {file.meta.bpm} </span>}
        {file.meta?.key && <span>Key: {file.meta.key} </span>}
        {file.meta?.duration && <span>{Math.round(file.meta.duration)}s </span>}
        {file.size && <span>{(file.size / 1024 / 1024).toFixed(1)}MB</span>}
      </div>
      {/* File name */}
      <div className="truncate w-full text-center font-medium mt-auto">{file.meta?.title || file.id}</div>
      {/* Drag handle */}
      <div className="absolute left-2 top-2 cursor-move opacity-60 group-hover:opacity-100">≡</div>
      {/* Playback preview on hover (not implemented) */}
    </div>
  );

  return (
    <div className="flex h-full w-full bg-white dark:bg-zinc-900">
      {/* Sidebar filters */}
      {sidebarOpen && (
        <aside className="w-56 border-r p-4 flex flex-col gap-4 bg-gray-50 dark:bg-zinc-900">
          <button className="mb-2 text-xs text-accent" onClick={() => setSidebarOpen(false)}>Hide Filters</button>
          {SIDEBAR_FILTERS.map(f => (
            <div key={f.key} className="mb-2">
              <label className="block text-xs mb-1">{f.label}</label>
              <input
                className="w-full rounded border px-2 py-1 text-xs"
                value={filter[f.key] || ''}
                onChange={e => setFilter({ ...filter, [f.key]: e.target.value })}
                placeholder={`Filter by ${f.label.toLowerCase()}`}
              />
            </div>
          ))}
        </aside>
      )}
      {/* Main content */}
      <main className="flex-1 flex flex-col h-full">
        {/* Top bar: search, view toggle, breadcrumbs */}
        <div className="flex items-center gap-4 p-4 border-b bg-white dark:bg-zinc-900">
          <button className="text-xs text-accent" onClick={() => setSidebarOpen(v => !v)}>{sidebarOpen ? 'Hide' : 'Show'} Filters</button>
          <div className="flex-1">
            <input
              ref={searchRef}
              className="w-full rounded border px-2 py-1 text-sm"
              value={searchInput}
              onChange={handleSearch}
              placeholder="Search audio files..."
            />
          </div>
          <div className="flex gap-2">
            <button className={clsx('px-2 py-1 rounded', view === 'grid' && 'bg-accent text-white')} onClick={() => setView('grid')}>Grid</button>
            <button className={clsx('px-2 py-1 rounded', view === 'list' && 'bg-accent text-white')} onClick={() => setView('list')}>List</button>
          </div>
          {/* Breadcrumbs */}
          <nav className="ml-4 flex gap-1 text-xs">
            <span className="text-gray-400 cursor-pointer" onClick={() => setBreadcrumb([])}>Root</span>
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex gap-1 items-center">
                <span>/</span>
                <span className="cursor-pointer" onClick={() => handleBreadcrumb(i)}>{b}</span>
              </span>
            ))}
          </nav>
        </div>
        {/* File list/grid */}
        <div className={clsx('flex-1 overflow-auto p-4', view === 'grid' ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2')} onScroll={handleScroll}>
          {isLoading ? (
            <div className="w-full text-center text-gray-400">Loading...</div>
          ) : isError ? (
            <div className="w-full text-center text-red-500">Error loading files</div>
          ) : files.length === 0 ? (
            <div className="w-full text-center text-gray-400">No files found</div>
          ) : (
            files.map(renderFile)
          )}
          {/* Infinite scroll loading skeleton */}
          {isLoading && <div className="w-full text-center text-gray-400">Loading more...</div>}
        </div>
        {/* Context menu */}
        {contextMenu && (
          <div
            className="fixed z-50 bg-white dark:bg-zinc-800 border rounded shadow-lg p-2"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onMouseLeave={() => setContextMenu(null)}
          >
            <button className="block w-full text-left px-2 py-1 hover:bg-accent/10" onClick={() => { batchDelete([contextMenu.id]); setContextMenu(null); }}>Delete</button>
            <button className="block w-full text-left px-2 py-1 hover:bg-accent/10">Download</button>
            <button className="block w-full text-left px-2 py-1 hover:bg-accent/10">Show in Folder</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AudioLibrary;
