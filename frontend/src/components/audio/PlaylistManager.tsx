import React, { useState, useRef } from 'react';
import AudioPlayer from './AudioPlayer';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import clsx from 'clsx';

export interface PlaylistItem {
  id: string;
  src: string;
  title?: string;
  artist?: string;
  duration?: number;
}

interface PlaylistManagerProps {
  initialPlaylist?: PlaylistItem[];
  className?: string;
}

const PlaylistManager: React.FC<PlaylistManagerProps> = ({ initialPlaylist = [], className }) => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(initialPlaylist);
  const [current, setCurrent] = useState<number>(0);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const undoStack = useRef<PlaylistItem[][]>([]);
  const redoStack = useRef<PlaylistItem[][]>([]);

  const handleSelect = (idx: number) => setCurrent(idx);
  const handleRemove = (idx: number) => {
    setPlaylist(pl => pl.filter((_, i) => i !== idx));
    if (current >= idx && current > 0) setCurrent(c => c - 1);
  };
  const handleReorder = (from: number, to: number) => {
    if (from === to) return;
    undoStack.current.push([...playlist]);
    setPlaylist(pl => {
      const updated = [...pl];
      const [item] = updated.splice(from, 1);
      updated.splice(to, 0, item);
      return updated;
    });
    if (current === from) setCurrent(to);
    else if (from < current && to >= current) setCurrent(c => c - 1);
    else if (from > current && to <= current) setCurrent(c => c + 1);
    setDragOverIdx(null);
  };

  // Accept drop from external sources (history, queue, files)
  const handleDrop = (e: React.DragEvent<HTMLUListElement>) => {
    e.preventDefault();
    setDropZoneActive(false);
    setDragOverIdx(null);
    const data = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    if (!data) return;
    try {
      const item = JSON.parse(data);
      if (item && item.src) {
        undoStack.current.push([...playlist]);
        setPlaylist(pl => [...pl, item]);
      }
    } catch {
      // Fallback: handle file drop
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const url = URL.createObjectURL(file);
        undoStack.current.push([...playlist]);
        setPlaylist(pl => [...pl, { id: url, src: url, title: file.name }]);
      }
    }
  };

  // Undo/redo
  const handleUndo = () => {
    if (undoStack.current.length) {
      redoStack.current.push([...playlist]);
      setPlaylist(undoStack.current.pop()!);
    }
  };
  const handleRedo = () => {
    if (redoStack.current.length) {
      undoStack.current.push([...playlist]);
      setPlaylist(redoStack.current.pop()!);
    }
  };
  const handleNext = () => setCurrent(c => (c + 1) % playlist.length);
  const handlePrev = () => setCurrent(c => (c - 1 + playlist.length) % playlist.length);

  // Export playlist as JSON
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(playlist, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playlist.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Repeat/loop logic (simple toggle for now)
  const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('off');

  // Touch drag state
  const touchDragIdx = useRef<number | null>(null);
  let touchTimeout: number | null = null;

  // Keyboard drag state
  const [kbDragIdx, setKbDragIdx] = useState<number | null>(null);

  // ARIA live feedback
  const [ariaMsg, setAriaMsg] = useState('');

  return (
    <div className={clsx('w-full max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded shadow p-4', className)} aria-live="polite">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-lg">Playlist</div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-2 py-1 rounded bg-accent text-white text-xs">Export</button>
          <button onClick={() => setRepeat(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')} className="px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-xs">
            Repeat: {repeat === 'off' ? 'Off' : repeat === 'all' ? 'All' : 'One'}
          </button>
        </div>
      </div>
      <ul
        className={clsx(
          'divide-y divide-gray-200 dark:divide-zinc-800 mb-4 min-h-[64px] transition-all',
          dropZoneActive && 'ring-2 ring-accent/60 bg-accent/5',
        )}
        onDragOver={e => { e.preventDefault(); setDropZoneActive(true); }}
        onDragLeave={() => { setDropZoneActive(false); setDragOverIdx(null); }}
        onDrop={handleDrop}
        tabIndex={0}
        aria-label="Playlist drop zone"
      >
        {playlist.map((item, idx) => (
          <li
            key={item.id}
            className={clsx(
              'flex items-center gap-2 py-2 cursor-pointer group transition-all',
              idx === current && 'bg-accent/10 dark:bg-accent/20',
              dragOverIdx === idx && 'ring-2 ring-accent/80 bg-accent/10 scale-[1.01] z-10',
              kbDragIdx === idx && 'ring-2 ring-blue-400',
            )}
            tabIndex={0}
            aria-selected={idx === current}
            aria-grabbed={kbDragIdx === idx}
            aria-dropeffect={dragOverIdx === idx ? 'move' : undefined}
            onClick={() => handleSelect(idx)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') handleSelect(idx);
              // Keyboard drag start
              if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                setKbDragIdx(idx);
                setAriaMsg(`Drag started for ${item.title || `Track ${idx + 1}`}`);
              }
              // Keyboard drag move
              if (kbDragIdx === idx && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                const to = e.key === 'ArrowUp' ? Math.max(0, idx - 1) : Math.min(playlist.length - 1, idx + 1);
                handleReorder(idx, to);
                setKbDragIdx(to);
                setAriaMsg(`Moved to position ${to + 1}`);
              }
              // Keyboard drag end
              if (kbDragIdx === idx && (e.key === 'Escape' || e.key === 'Enter')) {
                setKbDragIdx(null);
                setAriaMsg('Drag ended');
              }
            }}
            draggable
            onDragStart={e => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('application/json', JSON.stringify(item));
              // Ghost image
              const ghost = document.createElement('div');
              ghost.innerHTML = `<div style=\"padding:4px 12px;background:#222;color:#fff;border-radius:4px;font-size:12px;\">${item.title || 'Track'}</div>`;
              document.body.appendChild(ghost);
              e.dataTransfer.setDragImage(ghost, 0, 0);
              setTimeout(() => document.body.removeChild(ghost), 0);
            }}
            onTouchStart={e => {
              touchTimeout = setTimeout(() => {
                touchDragIdx.current = idx;
                setAriaMsg(`Touch drag started for ${item.title || `Track ${idx + 1}`}`);
              }, 300);
            }}
            onTouchEnd={e => {
              if (touchTimeout) clearTimeout(touchTimeout);
              if (touchDragIdx.current !== null) {
                setAriaMsg('Touch drag ended');
                touchDragIdx.current = null;
              }
            }}
            onDrop={e => {
              e.preventDefault();
              const fromIdx = Number(e.dataTransfer.getData('text/plain'));
              if (!isNaN(fromIdx)) handleReorder(fromIdx, idx);
              setDragOverIdx(null);
            }}
            onDragOver={e => { e.preventDefault(); setDragOverIdx(idx); }}
            onDragLeave={() => setDragOverIdx(null)}
          >
            <span className="w-6 text-xs text-gray-400">{idx + 1}</span>
            <span className="flex-1 truncate">{item.title || `Track ${idx + 1}`}</span>
            <span className="text-xs text-gray-500">{item.artist}</span>
            <button
              className="ml-2 px-1 py-0.5 rounded bg-red-100 dark:bg-red-900 text-red-600 text-xs opacity-0 group-hover:opacity-100 focus:opacity-100"
              onClick={e => { e.stopPropagation(); handleRemove(idx); }}
              aria-label="Remove from playlist"
            >✕</button>
          </li>
        ))}
        {playlist.length === 0 && (
          <li className="text-center text-gray-400 py-8 select-none">Drop tracks here</li>
        )}
      </ul>
      {ariaMsg && <div className="sr-only" aria-live="polite">{ariaMsg}</div>}
      {playlist.length > 0 && (
        <div>
          <AudioPlayer
            key={playlist[current]?.id}
            src={playlist[current]?.src}
            title={playlist[current]?.title}
          />
          <div className="flex items-center gap-2 mt-2">
            <button onClick={handlePrev} className="px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-xs">Prev</button>
            <button onClick={handleNext} className="px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-xs">Next</button>
            <span className="ml-auto text-xs text-gray-500">{current + 1} / {playlist.length}</span>
            <button onClick={handleUndo} className="ml-4 px-2 py-1 rounded bg-gray-200 dark:bg-zinc-700 text-xs">Undo</button>
            <button onClick={handleRedo} className="px-2 py-1 rounded bg-gray-200 dark:bg-zinc-700 text-xs">Redo</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistManager;
