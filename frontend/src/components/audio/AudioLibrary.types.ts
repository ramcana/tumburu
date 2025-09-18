export interface AudioFileMeta {
  id: string;
  title?: string;
  bpm?: number;
  key?: string;
  duration?: number;
  genre?: string;
  date?: string;
  size?: number;
  popularity?: number;
  [key: string]: any;
}

export interface AudioLibraryViewState {
  view: 'grid' | 'list';
  sort: 'name' | 'date' | 'size' | 'duration' | 'popularity';
  sidebarOpen: boolean;
  selected: string[];
  search: string;
  filter: Record<string, string>;
  breadcrumb: string[];
}
