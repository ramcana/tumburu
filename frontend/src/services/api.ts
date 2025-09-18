import axios from 'axios';
import type { GenerationRequest, GenerationResponse } from '../types/generation';
import type { AudioFile } from '../types/audio';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const startGeneration = async (data: GenerationRequest): Promise<GenerationResponse> => {
  const res = await axios.post(`${API_URL}/generate`, data);
  return res.data;
};

export const getGeneration = async (id: number): Promise<GenerationResponse> => {
  const res = await axios.get(`${API_URL}/generate/${id}`);
  return res.data;
};

export const getAudioFile = async (id: number): Promise<AudioFile> => {
  const res = await axios.get(`${API_URL}/audio/${id}`);
  return res.data;
};

export const uploadReferenceAudio = async (file: File): Promise<AudioFile> => {
  const form = new FormData();
  form.append('file', file);
  const res = await axios.post(`${API_URL}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};