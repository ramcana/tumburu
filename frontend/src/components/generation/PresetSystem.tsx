import React, { useState } from 'react';
import clsx from 'clsx';

export interface Preset {
  name: string;
  genre: string | null;
  instruments: string[];
  bpm: number;
  keySignature: string;
  timeSignature: string;
  prompt: string;
}

interface PresetSystemProps {
  value: Preset;
  onChange: (preset: Preset) => void;
  communityPresets?: Preset[];
  className?: string;
}

const LOCAL_KEY = 'tumburu_presets';

function loadPresets(): Preset[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}
function savePresets(presets: Preset[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(presets));
}

export const PresetSystem: React.FC<PresetSystemProps> = ({ value, onChange, communityPresets = [], className }) => {
  const [presets, setPresets] = useState<Preset[]>(() => loadPresets());
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);

  function handleSave() {
    if (!name.trim()) return;
    const newPreset = { ...value, name: name.trim() };
    const updated = [newPreset, ...presets.filter(p => p.name !== newPreset.name)].slice(0, 20);
    setPresets(updated);
    savePresets(updated);
    setName('');
    setShow(false);
  }
  function handleLoad(preset: Preset) {
    onChange(preset);
    setShow(false);
  }
  function handleDelete(preset: Preset) {
    const updated = presets.filter(p => p.name !== preset.name);
    setPresets(updated);
    savePresets(updated);
  }

  return (
    <div className={clsx('w-full max-w-md bg-white dark:bg-zinc-900 rounded shadow p-4', className)}>
      <div className="flex items-center mb-2">
        <span className="font-bold text-base flex-1">Presets</span>
        <button className="ml-2 px-2 py-1 rounded bg-accent text-white text-xs" onClick={() => setShow(v => !v)} type="button">
          {show ? 'Close' : 'Show'}
        </button>
      </div>
      {show && (
        <div className="space-y-2">
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 rounded border px-2 py-1 bg-gray-50 dark:bg-zinc-800"
              placeholder="Preset name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <button className="px-2 py-1 rounded bg-accent text-white text-xs" onClick={handleSave} type="button">Save</button>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Your Presets:</div>
            <ul className="space-y-1">
              {presets.map(p => (
                <li key={p.name} className="flex items-center gap-2">
                  <button className="flex-1 text-left px-2 py-1 rounded hover:bg-accent/10 focus:bg-accent/20" onClick={() => handleLoad(p)}>{p.name}</button>
                  <button className="text-xs text-red-500" onClick={() => handleDelete(p)} title="Delete">✕</button>
                </li>
              ))}
              {presets.length === 0 && <li className="text-xs text-gray-400">No presets saved.</li>}
            </ul>
          </div>
          {communityPresets.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Community Presets:</div>
              <ul className="space-y-1">
                {communityPresets.map(p => (
                  <li key={p.name}>
                    <button className="w-full text-left px-2 py-1 rounded hover:bg-accent/10 focus:bg-accent/20" onClick={() => handleLoad(p)}>{p.name}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PresetSystem;
