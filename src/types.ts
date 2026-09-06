export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  isbn13: string;
  isbn10: string;
  summary: string;
  genres: string[];
  publicationYear: number;
  estimatedPrice: number; // Orientative retail list price (USD)
  customCoverUrl?: string;
  amazonCoverUrl?: string;
  amazonUrl?: string;
  openLibraryCoverUrl?: string;
  pageCount?: number;
  shelfCategory: string;
  shelfLabel: string;
  videoTimestamp: string;
  videoFrameDescription: string;
  spineColor: string;
  spineTextColor: string;
  accentColor: string;
  heightPx: number; // For realistic shelf height variance (e.g. 190 to 240px)
  widthPx: number;  // For realistic spine thickness (e.g. 26 to 52px)
  fontStyle?: 'serif' | 'sans' | 'display' | 'mono';
  coverDescription?: string;
  isFaceOut?: boolean; // Face-out book on display ledge or rack (with full front cover)
  coverBg?: string;
  quotesOrHighlights?: string[];
  keyThemes?: string[];
  isImaginary?: boolean; // Signal: exists in real world, but not in original video (curated author top 2)
  imaginaryNote?: string;
  authorTopRank?: 1 | 2;
}

export interface ShelfInfo {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  videoTimestampRange: string;
  description: string;
  books: Book[];
  isImaginaryShelf?: boolean;
  authorGroup?: string[];
  shelfTheme?: 'walnut' | 'oak' | 'mahogany' | 'pine';
}

export type ViewMode = 'shelves' | 'grid' | 'timeline';
export type ShelfScope = 'all' | 'video' | 'imaginary';
