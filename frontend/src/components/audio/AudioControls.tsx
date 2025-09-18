import * as React from 'react';

type AudioControlsProps = {
  playing: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (t: number) => void;
};

const format = (t: number) => `${Math.floor(t / 60)}:${('0' + Math.floor(t % 60)).slice(-2)}`;

const AudioControls: React.FC<AudioControlsProps> = ({ playing, currentTime, duration, onPlayPause, onSeek }) => (
  <div className="flex items-center gap-2">
    <button onClick={onPlayPause} className="px-2 py-1 bg-accent text-white rounded">
      {playing ? 'Pause' : 'Play'}
    </button>
    <input
      type="range"
      min={0}
      max={duration || 1}
      value={currentTime}
      onChange={e => onSeek(Number(e.target.value))}
      className="flex-1 accent-accent"
    />
    <span className="text-xs">{format(currentTime)} / {format(duration)}</span>
  </div>
);
export default AudioControls;