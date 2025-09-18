import React, { useRef, useEffect, useState, useCallback } from 'react';
import clsx from 'clsx';
import { getWaveformData } from '../../utils/audio';

interface WaveformProps {
  buffer: AudioBuffer;
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
  zoom?: number;
  height?: number;
  color?: string;
  className?: string;
}

const ZOOM_LEVELS = [1, 2, 4, 8, 16];

export const Waveform: React.FC<WaveformProps> = ({
  buffer,
  currentTime,
  duration,
  onSeek,
  zoom = 1,
  height = 80,
  color = '#6366f1',
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [region, setRegion] = useState<{ start: number; end: number } | null>(null);

  // Responsive width
  const [width, setWidth] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth * window.devicePixelRatio);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load waveform data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPeaks(getWaveformData(buffer, Math.floor(width * zoomLevel)));
      setLoading(false);
    }, 0);
  }, [buffer, width, zoomLevel]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, '#0ea5e9'); // bass
    grad.addColorStop(0.5, color); // mids
    grad.addColorStop(1, '#f59e42'); // highs
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2 * window.devicePixelRatio;
    ctx.beginPath();
    for (let i = 0; i < peaks.length; i++) {
      const x = (i / peaks.length) * width;
      const y = height / 2 - peaks[i] * (height / 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Draw region selection
    if (region) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#6366f1';
      const x1 = (region.start / duration) * width;
      const x2 = (region.end / duration) * width;
      ctx.fillRect(Math.min(x1, x2), 0, Math.abs(x2 - x1), height);
      ctx.restore();
    }
    // Draw playback cursor
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2 * window.devicePixelRatio;
    const t = currentTime / duration;
    ctx.beginPath();
    ctx.moveTo(t * width, 0);
    ctx.lineTo(t * width, height);
    ctx.stroke();
    ctx.restore();
    // Draw hover preview
    if (hoverTime !== null) {
      ctx.save();
      ctx.strokeStyle = '#f59e42';
      ctx.setLineDash([4, 4]);
      const ht = hoverTime / duration;
      ctx.beginPath();
      ctx.moveTo(ht * width, 0);
      ctx.lineTo(ht * width, height);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }, [peaks, width, height, color, currentTime, duration, hoverTime, region, loading, zoomLevel]);

  // Click/tap to seek
  const handleSeek = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!onSeek) return;
    let x = 0;
    if ('touches' in e) {
      const rect = e.currentTarget.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      x = e.clientX - rect.left;
    }
    const t = (x / (width / window.devicePixelRatio)) * duration;
    onSeek(Math.max(0, Math.min(duration, t)));
  }, [onSeek, duration, width]);

  // Mouse/touch hover preview
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverTime((x / (width / window.devicePixelRatio)) * duration);
  };
  const handleMouseLeave = () => setHoverTime(null);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!onSeek) return;
    if (e.key === 'ArrowLeft') onSeek(Math.max(0, currentTime - 1));
    if (e.key === 'ArrowRight') onSeek(Math.min(duration, currentTime + 1));
    if (e.key === '+' && zoomLevel < ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) setZoomLevel(z => z * 2);
    if (e.key === '-' && zoomLevel > ZOOM_LEVELS[0]) setZoomLevel(z => z / 2);
  };

  // Touch: pinch to zoom, pan to scroll (basic)
  // (Advanced touch gestures can be added with a gesture library)

  return (
    <div ref={containerRef} className={clsx('w-full relative', className)}>
      {loading ? (
        <div className="animate-pulse h-20 bg-gray-200 dark:bg-zinc-800 rounded" />
      ) : (
        <canvas
          ref={canvasRef}
          width={width}
          height={height * window.devicePixelRatio}
          style={{ width: '100%', height, touchAction: 'none' }}
          className="rounded shadow cursor-pointer select-none bg-gray-100 dark:bg-zinc-800"
          onClick={handleSeek}
          onTouchStart={handleSeek}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label="Waveform"
          role="slider"
          aria-valuenow={currentTime}
          aria-valuemax={duration}
          aria-valuemin={0}
        />
      )}
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button className="px-2 py-1 rounded bg-white/80 dark:bg-zinc-900/80 shadow text-xs" onClick={() => setZoomLevel(z => Math.max(ZOOM_LEVELS[0], z / 2))} aria-label="Zoom out">-</button>
        <button className="px-2 py-1 rounded bg-white/80 dark:bg-zinc-900/80 shadow text-xs" onClick={() => setZoomLevel(z => Math.min(ZOOM_LEVELS[ZOOM_LEVELS.length - 1], z * 2))} aria-label="Zoom in">+</button>
      </div>
    </div>
  );
};

export default Waveform;