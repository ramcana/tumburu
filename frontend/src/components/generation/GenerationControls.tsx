import * as React from 'react';
import Slider from '../ui/Slider';
import Select from '../ui/Select';

type GenerationControlsProps = {
  bpm: number;
  duration: number;
  timeSignature: string;
  onChange: (field: string, value: any) => void;
};

const timeSignatures = ['4/4', '3/4', '6/8', '5/4'];

const GenerationControls: React.FC<GenerationControlsProps> = ({ bpm, duration, timeSignature, onChange }) => (
  <div className="flex gap-4 items-end">
    <div className="flex-1">
      <Slider label="BPM" min={40} max={300} value={bpm} onChange={e => onChange('bpm', Number(e.target.value))} />
      <span className="text-xs">{bpm} BPM</span>
    </div>
    <div className="flex-1">
      <Slider label="Duration (s)" min={1} max={600} value={duration} onChange={e => onChange('duration', Number(e.target.value))} />
      <span className="text-xs">{duration} sec</span>
    </div>
    <div className="flex-1">
      <Select label="Time Signature" value={timeSignature} onChange={e => onChange('timeSignature', e.target.value)}>
        {timeSignatures.map(ts => <option key={ts} value={ts}>{ts}</option>)}
      </Select>
    </div>
  </div>
);
export default GenerationControls;