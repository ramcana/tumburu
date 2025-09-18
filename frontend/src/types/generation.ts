export type GenerationRequest = {
  prompt: string;
  genre?: string;
  instruments?: string[];
  bpm?: number;
  duration?: number;
  timeSignature?: string;
  referenceAudioId?: number;
};

export type GenerationResponse = {
  id: number;
  status: string;
  audio_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
};