import { create } from 'zustand';

type UIState = {
  theme: 'light' | 'dark';
  modal: string | null;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  setTheme: (t: 'light' | 'dark') => void;
  setModal: (m: string | null) => void;
  setNotification: (n: UIState['notification']) => void;
};

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  modal: null,
  notification: null,
  setTheme: (t) => set({ theme: t }),
  setModal: (m) => set({ modal: m }),
  setNotification: (n) => set({ notification: n }),
}));