import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startGeneration, getGeneration } from '../services/api';
import type { GenerationRequest, GenerationResponse } from '../types/generation';

export const useAudioGeneration = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<GenerationResponse, Error, GenerationRequest>({
    mutationFn: startGeneration,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['generation', data.id]);
    },
  });
  const getStatus = (id: number) => useQuery(['generation', id], () => getGeneration(id));
  return { ...mutation, getStatus };
};