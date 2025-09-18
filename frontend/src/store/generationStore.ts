import { create } from 'zustand';
import type { GenerationRequest, GenerationResponse } from '../types/generation';

type GenerationQueueItem = GenerationRequest & { id: number; audioUrl?: string };
type GenerationState = {
  current: GenerationRequest;
  history: GenerationResponse[];
  queue: GenerationQueueItem[];
  setCurrent: (g: Partial<GenerationRequest>) => void;
  addToHistory: (g: GenerationResponse) => void;
  addToQueue: (g: GenerationQueueItem) => void;
  removeFromQueue: (id: number) => void;
};

export const useGenerationStore = create<GenerationState>((set) => ({
  current: {
    prompt: '',
    genre: '',
    instruments: [],
    bpm: 120,
    duration: 30,
    timeSignature: '4/4',
    referenceAudioId: undefined,
  },
  history: [],
  queue: [],
  setCurrent: (g) => set((state) => ({ current: { ...state.current, ...g } })),
  addToHistory: (g) => set((state) => ({ history: [g, ...state.history] })),
  addToQueue: (g) => set((state) => ({ queue: [...state.queue, g] })),
  removeFromQueue: (id) => set((state) => ({ queue: state.queue.filter(q => q.id !== id) })),
}));