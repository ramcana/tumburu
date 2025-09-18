import React from 'react';
import clsx from 'clsx';

interface TechnicalControlsProps {
  bpm: number;
  keySignature: string;
  timeSignature: string;
  onBpmChange: (bpm: number) => void;
  onKeyChange: (key: string) => void;
  onTimeChange: (time: string) => void;
  className?: string;
}

const keys = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm',
];
const times = ['4/4', '3/4', '6/8', '5/4', '7/8'];

export const TechnicalControls: React.FC<TechnicalControlsProps> = ({
  bpm, keySignature, timeSignature, onBpmChange, onKeyChange, onTimeChange, className
}) => {
  return (
    <div className={clsx('w-full max-w-md bg-white dark:bg-zinc-900 rounded shadow p-4 flex flex-col gap-4', className)}>
      <div>
        <label className="block text-xs mb-1 font-medium">BPM</label>
        <input
          type="range"
          min={60}
          max={200}
          value={bpm}
          onChange={e => onBpmChange(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="text-xs text-right mt-1">{bpm} BPM</div>
      </div>
      <div>
        <label className="block text-xs mb-1 font-medium">Key</label>
        <select
          value={keySignature}
          onChange={e => onKeyChange(e.target.value)}
          className="w-full rounded border px-2 py-1 bg-gray-50 dark:bg-zinc-800"
        >
          {keys.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs mb-1 font-medium">Time Signature</label>
        <select
          value={timeSignature}
          onChange={e => onTimeChange(e.target.value)}
          className="w-full rounded border px-2 py-1 bg-gray-50 dark:bg-zinc-800"
        >
          {times.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  );
};

export default TechnicalControls;
