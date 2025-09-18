import * as React from 'react';
import { useState, useRef } from 'react';
import Progress from '../ui/Progress';

type QueueItem = {
  id: number;
  prompt: string;
  status: string;
  progress: number;
  audioUrl?: string;
};

type GenerationQueueProps = {
  queue: QueueItem[];
};


const GenerationQueue: React.FC<GenerationQueueProps> = ({ queue }) => {
  const [kbDragIdx, setKbDragIdx] = useState<number | null>(null);
  const [ariaMsg, setAriaMsg] = useState('');
  const touchDragIdx = useRef<number | null>(null);
  let touchTimeout: number | null = null;
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // TODO: Add unified drag state and drop preview for cross-panel

  return (
    <div aria-live="polite">
      <h3 className="font-semibold mb-2">Generation Queue</h3>
      <ul>
        {queue.map((item, idx) => (
          <li
            key={item.id}
            className={
              'mb-2 p-2 border rounded cursor-grab group transition-all ' +
              (dragOverIdx === idx ? 'ring-2 ring-accent/80 bg-accent/10 scale-[1.01] z-10 ' : '') +
              (kbDragIdx === idx ? 'ring-2 ring-blue-400 ' : '')
            }
            tabIndex={0}
            aria-label={`Drag ${item.prompt || `Queue item ${idx + 1}`}`}
            aria-grabbed={kbDragIdx === idx}
            aria-dropeffect={dragOverIdx === idx ? 'move' : undefined}
            draggable
            onDragStart={e => {
              const playlistItem = {
                  id: `queue-${item.id}`,
                  src: item.audioUrl || '',
                  title: item.prompt || `Queue item ${idx + 1}`,
                  artist: '',
                };
              e.dataTransfer.effectAllowed = 'copy';
              e.dataTransfer.setData('application/json', JSON.stringify(playlistItem));
              // Ghost image
              const ghost = document.createElement('div');
              ghost.innerHTML = `<div style=\"padding:4px 12px;background:#222;color:#fff;border-radius:4px;font-size:12px;\">${item.prompt || `Queue item ${idx + 1}`}</div>`;
              document.body.appendChild(ghost);
              e.dataTransfer.setDragImage(ghost, 0, 0);
              setTimeout(() => document.body.removeChild(ghost), 0);
            }}
            onTouchStart={e => {
              touchTimeout = window.setTimeout(() => {
                touchDragIdx.current = idx;
                setAriaMsg(`Touch drag started for ${item.prompt || `Queue item ${idx + 1}`}`);
              }, 300);
            }}
            onTouchEnd={e => {
              if (touchTimeout) clearTimeout(touchTimeout);
              if (touchDragIdx.current !== null) {
                setAriaMsg('Touch drag ended');
                touchDragIdx.current = null;
              }
            }}
            onKeyDown={e => {
              // Keyboard drag start
              if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                setKbDragIdx(idx);
                setAriaMsg(`Drag started for ${item.prompt || `Queue item ${idx + 1}`}`);
              }
              // Keyboard drag move
              if (kbDragIdx === idx && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                const to = e.key === 'ArrowUp' ? Math.max(0, idx - 1) : Math.min(queue.length - 1, idx + 1);
                // TODO: handleReorder(idx, to) if reordering within queue is supported
                setKbDragIdx(to);
                setAriaMsg(`Moved to position ${to + 1}`);
              }
              // Keyboard drag end
              if (kbDragIdx === idx && (e.key === 'Escape' || e.key === 'Enter')) {
                setKbDragIdx(null);
                setAriaMsg('Drag ended');
              }
            }}
            onDragOver={e => { e.preventDefault(); setDragOverIdx(idx); }}
            onDragLeave={() => setDragOverIdx(null)}
            onDrop={e => { setDragOverIdx(null); }}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{item.prompt || `Queue item ${idx + 1}`}</span>
              <span className="text-xs text-gray-500">{item.status}</span>
            </div>
            <Progress value={item.progress} max={100} />
          </li>
        ))}
      </ul>
      {ariaMsg && <div className="sr-only" aria-live="polite">{ariaMsg}</div>}
    </div>
  );
};

export default GenerationQueue;