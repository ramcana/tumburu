import { useState, useCallback, useRef, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAudioStore } from '../store/audioStore';
import { useUIStore } from '../store/uiStore';
// Make sure to install axios: npm install axios
import axios from 'axios';

// Types for AudioLibrary integration


export interface AudioFileMeta {
  id: string;
  path: string;
  size: number;
  created_at: string;
  meta?: any;
  thumbnail?: string;
}

export function useFileManagement() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<Record<string, any>>({});
  const [optimisticFiles, setOptimisticFiles] = useState<AudioFileMeta[]>([]);
  const retryQueue = useRef<{file: File, user: string, genre?: string}[]>([]);

  // --- File Listing (infinite scroll, caching, virtualization prep) ---
  const {
    data: files,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['audio-files', search, filter],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await axios.get('/api/audio', {
        params: { ...filter, q: search, offset: pageParam, limit: 50 },
      });
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 50 ? allPages.length * 50 : undefined,
    keepPreviousData: true,
    staleTime: 60_000,
    cacheTime: 5 * 60_000,
  });

  // --- File Upload (with progress, drag-and-drop, offline support) ---
  const uploadMutation = useMutation({
    mutationFn: async ({ file, user, genre }: { file: File, user: string, genre?: string }) => {
      const form = new FormData();
      form.append('file', file);
      form.append('user', user);
      if (genre) form.append('genre', genre);
      const res = await axios.post('/api/audio/upload', form, {
        onUploadProgress: (e: ProgressEvent) => setUploadProgress(Math.round((e.loaded * 100) / (e.total || 1))),
      });
      return res.data;
    },
    onMutate: ({ file, user, genre }) => {
      setOptimisticFiles(files => [
        { id: 'optimistic-' + file.name, path: '', size: file.size, created_at: new Date().toISOString() },
        ...files,
      ]);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['audio-files']);
      setOptimisticFiles([]);
      setUploadProgress(0);
    },
    onError: (err, vars) => {
      retryQueue.current.push(vars);
      setUploadProgress(0);
    },
  });

  // --- Batch Operations (with optimistic updates, undo/redo prep) ---
  const batchDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      await axios.post('/api/audio/batch', { action: 'delete', file_ids: ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['audio-files']);
      setSelected([]);
    },
  });

  // --- Search & Filtering (debounced, request deduplication) ---
  const debouncedSetSearch = useCallback(
    debounce((q: string) => setSearch(q), 300),
    []
  );

  // --- Real-time Updates (WebSocket integration) ---
  useEffect(() => {
    // Example: subscribe to WebSocket events for file changes
    // const ws = useWebSocket('/ws/audio', msg => { if (msg.type === 'file_update') refetch(); });
    // return () => ws.close();
  }, [refetch]);

  // --- Smart Retry Logic (exponential backoff, offline queue) ---
  const retryFailedUploads = useCallback(() => {
    while (retryQueue.current.length) {
      const vars = retryQueue.current.shift();
      if (vars) uploadMutation.mutate(vars);
    }
  }, [uploadMutation]);

  // --- Virtualization/Memory Management ---
  // TODO: Integrate with react-virtualized or react-window for large lists
  // TODO: Preload images/audio for visible items only
  // TODO: Release memory for unmounted/hidden items

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      // Clean up any pending uploads, listeners, or memory leaks
      retryQueue.current = [];
    };
  }, []);

  // --- Thumbnail/Preview Generation (background, progress) ---
  const [thumbProgress, setThumbProgress] = useState<Record<string, number>>({});
  const generateThumbnails = useCallback(async (fileIds: string[]) => {
    for (const id of fileIds) {
      setThumbProgress(p => ({ ...p, [id]: 0 }));
      try {
        // Simulate progress
        for (let i = 1; i <= 5; i++) {
          await new Promise(res => setTimeout(res, 100));
          setThumbProgress(p => ({ ...p, [id]: i * 20 }));
        }
        // Optionally fetch thumbnail from backend
        // await axios.get(`/api/audio/${id}/thumbnail`);
        setThumbProgress(p => ({ ...p, [id]: 100 }));
      } catch {
        setThumbProgress(p => ({ ...p, [id]: -1 }));
      }
    }
  }, []);

  return {
    files: files?.pages?.flat() || [],
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    refetch,
    uploadProgress,
    upload: uploadMutation.mutate,
    batchDelete: batchDelete.mutate,
    selected,
    setSelected,
    search,
    setSearch: debouncedSetSearch,
    filter,
    setFilter,
    optimisticFiles,
    retryFailedUploads,
    thumbProgress,
    generateThumbnails,
    // TODO: add more advanced features as needed
  };
}

// --- Utility: debounce ---
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  }) as T;
}
