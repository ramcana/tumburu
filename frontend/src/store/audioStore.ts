import { create } from 'zustand';
import type { AudioFile } from '../types/audio';

type AudioState = {
  current: AudioFile | null;
  list: AudioFile[];
  isPlaying: boolean;
  setCurrent: (a: AudioFile | null) => void;
  setList: (l: AudioFile[]) => void;
  setIsPlaying: (p: boolean) => void;
};

export const useAudioStore = create<AudioState>((set) => ({
  current: null,
  list: [],
  isPlaying: false,
  setCurrent: (a) => set({ current: a }),
  setList: (l) => set({ list: l }),
  setIsPlaying: (p) => set({ isPlaying: p }),
}));