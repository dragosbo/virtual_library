import React, { useMemo } from 'react';
import { Search, X, Filter, FileDown, Sparkles, Video, Library, HelpCircle, FileText, Eye } from 'lucide-react';
import { ShelfScope } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  totalFiltered: number;
  onDownloadPdf?: () => void;
  onOpenPdfModal?: (doc?: 'catalog' | 'manual') => void;
  shelfScope: ShelfScope;
  onShelfScopeChange: (scope: ShelfScope) => void;
  selectedAuthor: string;
  onAuthorChange: (author: string) => void;
  authorsList: string[];
  totalVideoBooks: number;
  totalImaginaryBooks: number;
  onOpenHelp?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedGenre,
  onGenreChange,
  totalFiltered,
  onDownloadPdf,
  onOpenPdfModal,
  shelfScope,
  onShelfScopeChange,
  selectedAuthor,
  onAuthorChange,
  authorsList,
  totalVideoBooks,
  totalImaginaryBooks,
  onOpenHelp,
}) => {
  const videoCategories = [
    { id: 'all', label: 'All Shelves' },
    { id: 'shelf-bay-1', label: 'Bay 1: Wire Rack Stand (00:00-00:03)' },
    { id: 'shelf-bay-2', label: 'Bay 2: Showcase Ledge (00:03-00:05)' },
    { id: 'shelf-bay-3', label: 'Bay 3: Prize Fiction (00:05-00:07)' },
    { id: 'shelf-bay-4', label: 'Bay 4: Epic Sagas (00:06-00:08)' },
    { id: 'shelf-bay-5', label: 'Bay 5: Modern Intimacy (00:07-00:09)' },
    { id: 'shelf-bay-6', label: 'Bay 6: Mythic & Classics (00:09-00:11)' },
    { id: 'shelf-bay-7', label: 'Bay 7: Dark Fiction & Murakami (00:11-00:13)' },
    { id: 'shelf-bay-8', label: 'Bay 8: Global Sensations (00:12-00:14)' },
    { id: 'shelf-bay-9', label: 'Bay 9: Postmodern Noir (00:13-00:15)' },
  ];

  const imaginaryCategories = [
    { id: 'all', label: 'All Shelves' },
    { id: 'imaginary-shelf-1', label: '✨ Imaginary 1: Dystopian & Autofiction (Atwood, Cusk, Adichie)' },
    { id: 'imaginary-shelf-2', label: '✨ Imaginary 2: Sagas & Surrealism (Murakami, Rooney, Miller)' },
    { id: 'imaginary-shelf-3', label: '✨ Imaginary 3: Pulitzer Laureates (Morrison, Powers, Follett)' },
    { id: 'imaginary-shelf-4', label: '✨ Imaginary 4: Satire & Labyrinths (Everett, Clarke, Moshfegh)' },
    { id: 'imaginary-shelf-5', label: '✨ Imaginary 5: Nobel & History (Tokarczuk, O\'Farrell, Lynch)' },
    { id: 'imaginary-shelf-6', label: '✨ Imaginary 6: American Greats (McCann, King, Roth)' },
  ];

  const activeCategories =
    shelfScope === 'imaginary'
      ? imaginaryCategories
      : shelfScope === 'video'
      ? videoCategories
      : [...videoCategories, ...imaginaryCategories.slice(1)];

  const genres = [
    'All',
    'Literary Fiction',
    'Contemporary',
    'Classics',
    'Historical Fiction',
    'Dystopian',
    'Mystery',
    'Mythology',
    'Satire',
  ];

  // Detect whether the query is asking to see the PDF catalog or document
  const isPdfSearch = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return false;
    return (
      q === 'pdf' ||
      q === 'catalog' ||
      q === 'document' ||
      q === 'pdf catalog' ||
      q === 'pdf document' ||
      q === 'catalog pdf' ||
      q === 'document pdf' ||
      q === 'pdf file' ||
      q === 'export pdf' ||
      q === 'download pdf' ||
      q.includes('pdf catalog') ||
      q.includes('pdf document') ||
      q.includes('catalog pdf') ||
      q.includes('document pdf')
    );
  }, [searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchQuery.toLowerCase().trim();
      if (
        isPdfSearch ||
        q.includes('pdf') ||
        q.includes('catalog') ||
        q.includes('document')
      ) {
        e.preventDefault();
        onOpenPdfModal?.('catalog');
      }
    }
  };

  return (
    <div className="bg-[#0a0a0f] border border-[#ffffff10] rounded-xl p-4 space-y-3.5 mb-6 shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
      {/* Top Scope Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#ffffff10]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider mr-1 hidden sm:inline">
            Collection View:
          </span>
          <button
            id="scope-all-btn"
            onClick={() => onShelfScopeChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              shelfScope === 'all'
                ? 'bg-blue-600/30 text-blue-200 border border-blue-500/50 shadow-sm'
                : 'bg-[#050507] text-gray-400 hover:text-white border border-[#ffffff10]'
            }`}
          >
            <Library className="w-3.5 h-3.5 text-blue-400" />
            <span>All Shelves ({totalVideoBooks + totalImaginaryBooks})</span>
          </button>

          <button
            id="scope-video-btn"
            onClick={() => onShelfScopeChange('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              shelfScope === 'video'
                ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/50 shadow-sm'
                : 'bg-[#050507] text-gray-400 hover:text-white border border-[#ffffff10]'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span>Video Shelves (9 bays • {totalVideoBooks} books)</span>
          </button>

          <button
            id="scope-imaginary-btn"
            onClick={() => onShelfScopeChange('imaginary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              shelfScope === 'imaginary'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-[#050507] text-amber-400/70 hover:text-amber-300 border border-[#ffffff10]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>✨ Imaginary Shelves (Author Top 2 • {totalImaginaryBooks} books)</span>
          </button>
        </div>

        {/* Curation Signal Legend with Quick Interactive Guidance */}
        <div className="flex items-center gap-2.5 text-[11px] font-mono flex-wrap">
          <button
            type="button"
            onClick={() => onShelfScopeChange('video')}
            className={`px-2 py-0.5 rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
              shelfScope === 'video'
                ? 'bg-blue-600/30 text-blue-200 border-blue-400/60 font-bold'
                : 'bg-blue-950/20 text-blue-300/90 border-blue-500/20 hover:border-blue-400/40'
            }`}
            title="Filter to books detected in the bookstore video scan"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>🎥 Video Scanned (50)</span>
          </button>

          <button
            type="button"
            onClick={() => onShelfScopeChange('imaginary')}
            className={`px-2 py-0.5 rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
              shelfScope === 'imaginary'
                ? 'bg-amber-500/30 text-amber-200 border-amber-400/60 font-bold'
                : 'bg-amber-950/20 text-amber-300/90 border-amber-500/30 hover:border-amber-400/50'
            }`}
            title="Filter to imaginary curated author top 2 books"
          >
            <span>✨</span>
            <span>Imaginary Top 2 (36)</span>
          </button>

          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              className="text-gray-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 ml-1 cursor-pointer transition-colors text-[10.5px]"
            >
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span>How to detect?</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            id="book-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder='Search titles, authors, or type "pdf catalog" / "pdf document"...'
            className="w-full pl-10 pr-24 py-2 bg-[#050507] border border-[#ffffff10] rounded text-xs sm:text-sm text-[#e0e0e0] placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isPdfSearch && onOpenPdfModal && (
              <button
                type="button"
                id="search-inline-open-pdf-btn"
                onClick={() => onOpenPdfModal('catalog')}
                className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/50 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Display catalog in PDF format now"
              >
                <Eye className="w-3 h-3 text-emerald-400" />
                <span>Open PDF</span>
              </button>
            )}

            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 rounded text-gray-500 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Shelf Category & Author Dropdowns / Select & PDF export */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-blue-400 shrink-0 hidden sm:block" />
          <select
            id="shelf-category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-[#050507] border border-[#ffffff10] rounded px-3 py-2 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-blue-500 font-sans max-w-[210px] sm:max-w-[260px] truncate"
          >
            {activeCategories.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0a0a0f] text-gray-200">
                {c.label}
              </option>
            ))}
          </select>

          {/* Optional Author Spotlight Selector */}
          <select
            id="author-spotlight-select"
            value={selectedAuthor}
            onChange={(e) => onAuthorChange(e.target.value)}
            className="bg-[#050507] border border-[#ffffff10] rounded px-3 py-2 text-xs sm:text-sm text-amber-200/90 focus:outline-none focus:border-amber-500 font-sans max-w-[170px] truncate"
          >
            <option value="All" className="bg-[#0a0a0f] text-gray-300">All Authors</option>
            {authorsList.map((author) => (
              <option key={author} value={author} className="bg-[#0a0a0f] text-amber-200">
                {author}
              </option>
            ))}
          </select>

          <span className="text-xs font-mono text-blue-300 px-2.5 py-1.5 rounded bg-[#050507] border border-[#ffffff10] whitespace-nowrap">
            {totalFiltered} {totalFiltered === 1 ? 'title' : 'titles'}
          </span>

          {onDownloadPdf && (
            <button
              id="quick-pdf-export-btn"
              onClick={onDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-xs font-mono transition-colors"
              title="Download filtered books as PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>PDF ({totalFiltered})</span>
            </button>
          )}
        </div>
      </div>

      {/* PDF Search Intent Alert Banner */}
      {isPdfSearch && onOpenPdfModal && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs flex-wrap animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-emerald-300">
            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">PDF Format Match: </span>
              <span className="text-emerald-200/90">
                You typed "{searchQuery}". Full catalog document is formatted and ready for viewing.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="filter-banner-open-catalog-pdf-btn"
              onClick={() => onOpenPdfModal('catalog')}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Display PDF Catalog</span>
            </button>
            <button
              type="button"
              id="filter-banner-open-manual-pdf-btn"
              onClick={() => onOpenPdfModal('manual')}
              className="px-3 py-1.5 rounded bg-[#151522] hover:bg-[#202035] text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
            >
              User Manual PDF
            </button>
          </div>
        </div>
      )}

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-gray-500 uppercase text-[10px] font-mono tracking-widest mr-1 hidden sm:inline">
          Genre:
        </span>
        {genres.map((g) => (
          <button
            key={g}
            id={`genre-filter-${g.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            onClick={() => onGenreChange(g)}
            className={`px-3 py-1 rounded whitespace-nowrap font-medium text-xs transition-all ${
              selectedGenre === g
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-[#050507] text-gray-400 hover:text-gray-200 border border-[#ffffff10] hover:border-[#ffffff20]'
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
};

