import React, { useEffect, useState } from 'react';
import Waveform from './Waveform';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { fetchAudioBuffer } from '../../utils/audio';
import clsx from 'clsx';

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, className }) => {
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const {
    play, pause, seek, setPlayerVolume, setSpeed,
    playing, currentTime, duration, volume, audioRef
  } = useAudioPlayer({ src });

  useEffect(() => {
    let ctx: AudioContext | null = null;
    setLoading(true);
    fetchAudioBuffer((ctx = new window.AudioContext()), src)
      .then(buf => { setBuffer(buf); setLoading(false); })
      .catch(e => { setError('Failed to load audio'); setLoading(false); })
      .finally(() => ctx && ctx.close());
  }, [src]);

  const handleSeek = (t: number) => {
    seek(t);
  };

  return (
    <div className={clsx('w-full max-w-2xl bg-white dark:bg-zinc-900 rounded shadow p-4', className)}>
      {title && <div className="font-semibold mb-2">{title}</div>}
      {loading || !buffer ? (
        <div className="animate-pulse h-20 bg-gray-200 dark:bg-zinc-800 rounded mb-2" />
      ) : (
        <Waveform
          buffer={buffer}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          zoom={zoom}
        />
      )}
      <div className="flex items-center gap-2 mt-2">
        <button onClick={playing ? pause : play} className="px-3 py-1 rounded bg-accent text-white">
          {playing ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.01}
          value={currentTime}
          onChange={e => seek(Number(e.target.value))}
          className="flex-1 accent-accent"
        />
        <span className="text-xs w-16 text-right">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <label className="text-xs">Vol</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => setPlayerVolume(Number(e.target.value))}
          className="accent-accent"
        />
        <label className="text-xs ml-4">Speed</label>
        <select value={1} onChange={e => setSpeed(Number(e.target.value))} className="rounded px-1 py-0.5">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => <option key={s} value={s}>{s}x</option>)}
        </select>
        <button className="ml-auto px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-xs" onClick={() => seek(0)}>⏮</button>
        <button className="px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-xs" onClick={() => seek(duration)}>⏭</button>
      </div>
      {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
      <audio ref={audioRef} src={src} hidden />
    </div>
  );
};

function formatTime(t: number) {
  if (!t || isNaN(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default AudioPlayer;