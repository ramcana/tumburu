

import React, { useState, useRef } from 'react';
import { useGenerationStore } from '../../store/generationStore';
import clsx from 'clsx';

const HistoryPanel: React.FC = () => {
			const history = useGenerationStore((s: any) => s.history);
		const [selected, setSelected] = useState<number[]>([]);
		const [kbDragIdx, setKbDragIdx] = useState<number | null>(null);
		const [ariaMsg, setAriaMsg] = useState('');
		const touchDragIdx = useRef<number | null>(null);
		let touchTimeout: number | null = null;
		const [dragOver, setDragOver] = useState<number | null>(null);

		// Multi-select logic
		const handleSelect = (idx: number, e: React.MouseEvent | React.KeyboardEvent) => {
			if ((e as React.MouseEvent).ctrlKey || (e as React.KeyboardEvent).ctrlKey) {
				setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
			} else if ((e as React.MouseEvent).shiftKey || (e as React.KeyboardEvent).shiftKey) {
				if (selected.length) {
					const last = selected[selected.length - 1];
					const [start, end] = [Math.min(last, idx), Math.max(last, idx)];
					setSelected(sel => Array.from(new Set([...sel, ...Array(end - start + 1).fill(0).map((_, i) => start + i)])));
				} else {
					setSelected([idx]);
				}
			} else {
				setSelected([idx]);
			}
		};

		// Batch drag data
		const getBatchDragData = () => {
			const items = (selected.length ? selected : [kbDragIdx ?? 0]).map(idx => history[idx]);
			return items.map((item, i) => ({
				id: `history-${item.id || i}`,
				src: item.audio_url || '',
				title: item.metadata?.title || `Generation #${item.id}`,
				artist: item.metadata?.artist || '',
			}));
		};

		// Context menu (right-click)
		const handleContextMenu = (idx: number, e: React.MouseEvent) => {
			e.preventDefault();
			setSelected(sel => sel.includes(idx) ? sel : [idx]);
			// Could show a custom menu here
			setAriaMsg('Context menu opened');
		};

		return (
			<section className="mb-4" aria-live="polite">
				<h3 className="font-semibold mb-2">Generation History</h3>
				<ul className="divide-y divide-gray-200 dark:divide-zinc-800">
					{history.length === 0 && <li className="text-gray-400 py-4 text-center">No generations yet</li>}
				{history.map((item: any, idx: number) => {
						const isSelected = selected.includes(idx);
						return (
							<li
								key={item.id || idx}
								className={clsx(
									'py-2 px-2 cursor-grab group transition-all',
									isSelected && 'bg-accent/10 ring-2 ring-accent',
									dragOver === idx && 'ring-2 ring-accent/80 bg-accent/10 scale-[1.01] z-10',
									kbDragIdx === idx && 'ring-2 ring-blue-400',
								)}
								draggable
								tabIndex={0}
								aria-label={`Drag Generation #${item.id}`}
								aria-grabbed={isSelected || kbDragIdx === idx}
								aria-dropeffect={dragOver === idx ? 'move' : undefined}
								onClick={e => handleSelect(idx, e)}
								onKeyDown={e => {
									if (e.key === 'Enter' || e.key === ' ') handleSelect(idx, e);
									// Keyboard drag start
									if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
										setKbDragIdx(idx);
										setAriaMsg(`Drag started for ${item.metadata?.title || `Generation #${item.id}`}`);
									}
									// Keyboard drag move
									if (kbDragIdx === idx && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
										const to = e.key === 'ArrowUp' ? Math.max(0, idx - 1) : Math.min(history.length - 1, idx + 1);
										setKbDragIdx(to);
										setAriaMsg(`Moved to position ${to + 1}`);
									}
									// Keyboard drag end
									if (kbDragIdx === idx && (e.key === 'Escape' || e.key === 'Enter')) {
										setKbDragIdx(null);
										setAriaMsg('Drag ended');
									}
								}}
								onContextMenu={e => handleContextMenu(idx, e)}
								onDragStart={e => {
									const batch = getBatchDragData();
									e.dataTransfer.effectAllowed = 'copy';
									e.dataTransfer.setData('application/json', JSON.stringify(batch.length > 1 ? batch : batch[0]));
									// Ghost image
									const ghost = document.createElement('div');
									ghost.innerHTML = `<div style=\"padding:4px 12px;background:#222;color:#fff;border-radius:4px;font-size:12px;\">${batch.length > 1 ? `${batch.length} tracks` : batch[0].title}</div>`;
									document.body.appendChild(ghost);
									e.dataTransfer.setDragImage(ghost, 0, 0);
									setTimeout(() => document.body.removeChild(ghost), 0);
								}}
								onTouchStart={e => {
									touchTimeout = window.setTimeout(() => {
										touchDragIdx.current = idx;
										setAriaMsg(`Touch drag started for ${item.metadata?.title || `Generation #${item.id}`}`);
									}, 300);
								}}
								onTouchEnd={e => {
									if (touchTimeout) clearTimeout(touchTimeout);
									if (touchDragIdx.current !== null) {
										setAriaMsg('Touch drag ended');
										touchDragIdx.current = null;
									}
								}}
								onDragOver={e => { e.preventDefault(); setDragOver(idx); }}
								onDragLeave={() => setDragOver(null)}
								onDrop={e => { setDragOver(null); }}
							>
								<span className="font-medium">{item.metadata?.title || `Generation #${item.id}`}</span>
								{item.status && <span className="ml-2 text-xs text-gray-500" aria-label={`Status: ${item.status}`}>{item.status}</span>}
							</li>
						);
					})}
				</ul>
				{ariaMsg && <div className="sr-only" aria-live="polite">{ariaMsg}</div>}
			</section>
		);
};

export default HistoryPanel;
