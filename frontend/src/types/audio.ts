export type AudioFile = {
  id: number;
  filename: string;
  size?: number;
  duration?: number;
  format?: string;
  url: string;
  created_at: string;
};