import * as React from 'react';
import type { AudioFile } from '../../types/audio';

type AudioListProps = {
  files: AudioFile[];
  onSelect: (file: AudioFile) => void;
};

const AudioList: React.FC<AudioListProps> = ({ files, onSelect }) => (
  <ul className="divide-y border rounded">
    {files.map(f => (
      <li key={f.id} className="p-2 hover:bg-accent hover:text-white cursor-pointer" onClick={() => onSelect(f)}>
        <div className="font-medium">{f.filename}</div>
        <div className="text-xs text-gray-500">{f.format} • {f.size} bytes</div>
      </li>
    ))}
  </ul>
);
export default AudioList;