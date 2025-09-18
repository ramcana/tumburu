import React, { useState, useMemo, useRef, useEffect } from 'react';
import { instrumentCategories, InstrumentCategory } from '../../data/instruments';
import clsx from 'clsx';

interface InstrumentPickerProps {
  value: string[];
  onChange: (instruments: string[]) => void;
  className?: string;
}

const InstrumentPicker: React.FC<InstrumentPickerProps> = ({ value, onChange, className }) => {
  const [search, setSearch] = useState('');
  const [recent, setRecent] = useState<string[]>(() => JSON.parse(localStorage.getItem('recentInstruments') || '[]'));
  const [dragged, setDragged] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('recentInstruments', JSON.stringify(recent));
  }, [recent]);

  const filteredCategories = useMemo(() =>
    instrumentCategories.map(cat => ({
      ...cat,
      instruments: cat.instruments.filter(inst =>
        inst.name.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter(cat => cat.instruments.length > 0),
    [search]
  );

  function handleToggle(inst: string) {
    if (value.includes(inst)) {
      onChange(value.filter(i => i !== inst));
    } else {
      onChange([...value, inst]);
      setRecent(prev => [inst, ...prev.filter(i => i !== inst)].slice(0, 8));
    }
  }

  function handleDragStart(inst: string) {
    setDragged(inst);
  }
  function handleDrop(target: string) {
    if (dragged && dragged !== target) {
      const idxFrom = value.indexOf(dragged);
      const idxTo = value.indexOf(target);
      if (idxFrom !== -1 && idxTo !== -1) {
        const newOrder = [...value];
        newOrder.splice(idxFrom, 1);
        newOrder.splice(idxTo, 0, dragged);
        onChange(newOrder);
      }
    }
    setDragged(null);
  }

  return (
    <div className={clsx('w-full max-w-md bg-white dark:bg-zinc-900 rounded shadow p-4', className)}>
      <div className="flex items-center mb-2">
        <span className="w-4 h-4 mr-2 text-gray-400">🔍</span>
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none"
          placeholder="Search instruments..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search instruments"
        />
      </div>
      {recent.length > 0 && (
        <div className="mb-2 text-xs text-gray-500">
          Recently used: {recent.map(val => {
            for (const cat of instrumentCategories) {
              const inst = cat.instruments.find(i => i.value === val);
              if (inst) return inst.name;
            }
            return null;
          }).filter(Boolean).join(', ')}
        </div>
      )}
      <div className="overflow-y-auto max-h-64" role="listbox" aria-multiselectable="true">
        {filteredCategories.map(cat => (
          <div key={cat.value} className="mb-2">
            <div className="font-semibold text-sm mb-1 flex items-center gap-2">
              <span>{cat.icon}</span>
              {cat.name}
            </div>
            <ul className="flex flex-wrap gap-2">
              {cat.instruments.map(inst => {
                const selected = value.includes(inst.value);
                return (
                  <li
                    key={inst.value}
                    className={clsx(
                      'flex items-center gap-1 px-2 py-1 rounded border cursor-pointer transition-all',
                      selected ? 'bg-accent text-white border-accent shadow' : 'bg-gray-100 dark:bg-zinc-800 border-gray-300',
                      'hover:scale-105 active:scale-95',
                      dragged === inst.value && 'ring-2 ring-accent'
                    )}
                    tabIndex={0}
                    aria-selected={selected}
                    draggable
                    onDragStart={() => handleDragStart(inst.value)}
                    onDragEnd={() => setDragged(null)}
                    onDrop={() => handleDrop(inst.value)}
                    onClick={() => handleToggle(inst.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') handleToggle(inst.value);
                    }}
                  >
                    <span className="text-lg">{inst.icon}</span>
                    <span>{inst.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstrumentPicker;