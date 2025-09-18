import { useRef, useState, useEffect, useCallback } from 'react';

export interface UseAudioPlayerOptions {
  src: string;
  loop?: boolean;
  playbackRate?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export function useAudioPlayer({ src, loop = false, playbackRate = 1, onPlay, onPause, onEnded }: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = new window.Audio(src);
    audio.loop = loop;
    audio.playbackRate = playbackRate;
    audio.volume = volume;
    audioRef.current = audio;
    const onLoaded = () => setDuration(audio.duration);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onPlayCb = () => { setPlaying(true); onPlay?.(); };
    const onPauseCb = () => { setPlaying(false); onPause?.(); };
    const onEndedCb = () => { setPlaying(false); onEnded?.(); };
    const onError = () => setError('Playback error');
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('play', onPlayCb);
    audio.addEventListener('pause', onPauseCb);
    audio.addEventListener('ended', onEndedCb);
    audio.addEventListener('error', onError);
    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('play', onPlayCb);
      audio.removeEventListener('pause', onPauseCb);
      audio.removeEventListener('ended', onEndedCb);
      audio.removeEventListener('error', onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, loop, playbackRate]);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, []);
  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);
  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);
  const setPlayerVolume = useCallback((v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);
  const setSpeed = useCallback((rate: number) => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  return {
    play,
    pause,
    seek,
    setPlayerVolume,
    setSpeed,
    playing,
    currentTime,
    duration,
    volume,
    error,
    audioRef,
  };
}