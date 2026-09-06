import React, { useState, useMemo } from 'react';
import { DETECTED_BOOKS, SHELVES } from './data/detectedBooks';
import { IMAGINARY_BOOKS, IMAGINARY_SHELVES, IMAGINARY_AUTHORS_CATALOG } from './data/imaginaryShelves';
import { Book, ViewMode, ShelfScope } from './types';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { BookShelf } from './components/BookShelf';
import { BookCardGrid } from './components/BookCardGrid';
import { BookDetailModal } from './components/BookDetailModal';
import { QuickHoverCard } from './components/QuickHoverCard';
import { VideoInspectorModal } from './components/VideoInspectorModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { HelpModal } from './components/HelpModal';
import { AmazonCoverImage } from './components/AmazonCoverImage';
import { exportBooksToPdf } from './utils/exportPdf';
import { Video, BookOpen, Download, ExternalLink, Sparkles, FileDown, ShoppingBag, Library } from 'lucide-react';

const DEFAULT_VIDEO_URL = 'https://youtube.com/shorts/uY5M9m1UB5k?is=zri1s1z9dZ2lIe0U';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('shelves');
  const [shelfTheme, setShelfTheme] = useState<'walnut' | 'oak' | 'mahogany' | 'pine'>('walnut');
  const [shelfScope, setShelfScope] = useState<ShelfScope>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState('All');

  // Video URL state with persistence
  const [originalVideoUrl, setOriginalVideoUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('BOOKSHELF_ORIGINAL_VIDEO_URL');
      if (saved && !saved.includes('kJQP7kiw5Fk') && !saved.includes('CHFif_y2TyM')) {
        return saved;
      }
      localStorage.setItem('BOOKSHELF_ORIGINAL_VIDEO_URL', DEFAULT_VIDEO_URL);
      return DEFAULT_VIDEO_URL;
    } catch {
      return DEFAULT_VIDEO_URL;
    }
  });

  const handleUpdateVideoUrl = (newUrl: string) => {
    setOriginalVideoUrl(newUrl);
    try {
      localStorage.setItem('BOOKSHELF_ORIGINAL_VIDEO_URL', newUrl);
    } catch {}
  };

  // Combined pools
  const allBooks = useMemo(() => [...DETECTED_BOOKS, ...IMAGINARY_BOOKS], []);
  const allShelves = useMemo(() => [...SHELVES, ...IMAGINARY_SHELVES], []);

  // Sorted list of unique authors for quick filter
  const authorsList = useMemo(() => {
    const set = new Set<string>();
    allBooks.forEach((b) => {
      if (b.author) set.add(b.author);
    });
    return Array.from(set).sort();
  }, [allBooks]);

  // Scoped base books & shelves
  const scopedBooks = useMemo(() => {
    if (shelfScope === 'video') return DETECTED_BOOKS;
    if (shelfScope === 'imaginary') return IMAGINARY_BOOKS;
    return allBooks;
  }, [shelfScope, allBooks]);

  const scopedShelves = useMemo(() => {
    if (shelfScope === 'video') return SHELVES;
    if (shelfScope === 'imaginary') return IMAGINARY_SHELVES;
    return allShelves;
  }, [shelfScope, allShelves]);

  // Currently focused book for the Immersive UI side panel (defaults to Ulysses)
  const [inspectedBook, setInspectedBook] = useState<Book>(
    DETECTED_BOOKS.find((b) => b.title.toLowerCase().includes('ulysses')) || DETECTED_BOOKS[0]
  );

  // Selected Book for Detailed Modal (on Click or "Expand Dossier")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Hovered Book for Instant Tooltip
  const [hoveredBook, setHoveredBook] = useState<Book | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // Video Inspection Modal state
  const [isVideoInspectorOpen, setIsVideoInspectorOpen] = useState(false);

  // PDF Preview & Email Modal state
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);

  // Complete User Manual & Prompt History Help Modal state
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Helper for normalizing smart quotes, accents, and casing in search
  const normalizeText = (text: string) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[‘’´`]/g, "'")
      .replace(/[“”]/g, '"')
      .trim();

  // Filter books
  const filteredBooks = useMemo(() => {
    const q = normalizeText(searchQuery);

    return scopedBooks.filter((book) => {
      // Category filter
      if (selectedCategory !== 'all' && book.shelfCategory !== selectedCategory) {
        return false;
      }

      // Author filter
      if (selectedAuthor !== 'All' && book.author !== selectedAuthor) {
        return false;
      }

      // Genre filter
      if (selectedGenre !== 'All' && !book.genres.some((g) => g.toLowerCase().includes(selectedGenre.toLowerCase()))) {
        return false;
      }

      // Search query filter (matches title, author, summary, or ISBN with smart quote normalization)
      if (q) {
        const matchTitle = normalizeText(book.title).includes(q);
        const matchAuthor = normalizeText(book.author).includes(q);
        const matchIsbn = normalizeText(book.isbn13).includes(q) || normalizeText(book.isbn10).includes(q);
        const matchSummary = normalizeText(book.summary).includes(q);
        const matchGenre = book.genres.some((g) => normalizeText(g).includes(q));
        if (!matchTitle && !matchAuthor && !matchIsbn && !matchSummary && !matchGenre) {
          return false;
        }
      }

      return true;
    });
  }, [scopedBooks, searchQuery, selectedCategory, selectedGenre, selectedAuthor]);

  // Group filtered books by shelves for the shelf view
  const shelvesWithFilteredBooks = useMemo(() => {
    return scopedShelves.map((shelf) => {
      const booksOnThisShelf = filteredBooks.filter((b) => b.shelfCategory === shelf.category);
      return {
        ...shelf,
        books: booksOnThisShelf,
      };
    }).filter((shelf) => {
      if (selectedCategory !== 'all') {
        return shelf.category === selectedCategory && shelf.books.length > 0;
      }
      return shelf.books.length > 0;
    });
  }, [scopedShelves, filteredBooks, selectedCategory]);

  const handleHoverStart = (book: Book, e: React.MouseEvent) => {
    setHoveredBook(book);
    setHoverPosition({ x: e.clientX, y: e.clientY });
  };

  const handleHoverEnd = () => {
    setHoveredBook(null);
    setHoverPosition(null);
  };

  const handleSelectBook = (book: Book) => {
    setInspectedBook(book);
    setSelectedBook(book);
  };

  const handleDownloadPdf = () => {
    setIsPdfPreviewOpen(true);
  };

  const handleExportDataset = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allBooks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "book-shelves-ai-detection-dataset.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050507] text-[#e0e0e0] font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* App Header adhering to Immersive UI */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenVideoInspector={() => setIsVideoInspectorOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        onOpenHelp={() => setIsHelpOpen(true)}
        originalVideoUrl={originalVideoUrl}
        totalBooks={allBooks.length}
        shelfTheme={shelfTheme}
        onShelfThemeChange={setShelfTheme}
      />

      {/* Main Layout containing Shelf Canvas and Right Metadata Inspection Panel */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left / Center Shelf Stage */}
        <main className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 justify-between bg-[radial-gradient(circle_at_50%_0%,#1a1a2e_0%,#050507_100%)] overflow-y-auto">
          <div className="max-w-6xl w-full mx-auto">
            {/* Filter and Search Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedGenre={selectedGenre}
              onGenreChange={setSelectedGenre}
              totalFiltered={filteredBooks.length}
              onDownloadPdf={handleDownloadPdf}
              shelfScope={shelfScope}
              onShelfScopeChange={setShelfScope}
              selectedAuthor={selectedAuthor}
              onAuthorChange={setSelectedAuthor}
              authorsList={authorsList}
              totalVideoBooks={DETECTED_BOOKS.length}
              totalImaginaryBooks={IMAGINARY_BOOKS.length}
              onOpenHelp={() => setIsHelpOpen(true)}
            />

            {/* Shelves View vs Grid View */}
            {viewMode === 'shelves' ? (
              <div>
                {shelvesWithFilteredBooks.length === 0 ? (
                  <div className="text-center py-24 bg-[#0a0a0f] rounded-xl border border-[#ffffff10] p-8">
                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-lg font-serif text-white">No items match your criteria</h4>
                    <p className="text-xs text-gray-500 mt-1">Try resetting your search query, selecting another category, or switching to 'All Shelves'.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedGenre('All');
                        setSelectedAuthor('All');
                        setShelfScope('all');
                      }}
                      className="mt-4 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  shelvesWithFilteredBooks.map((shelf) => (
                    <BookShelf
                      key={shelf.id}
                      shelf={shelf}
                      onSelectBook={handleSelectBook}
                      onHoverStart={handleHoverStart}
                      onHoverEnd={handleHoverEnd}
                      selectedBookId={inspectedBook?.id}
                      shelfTheme={shelfTheme}
                    />
                  ))
                )}
              </div>
            ) : (
              <BookCardGrid
                books={filteredBooks}
                onSelectBook={handleSelectBook}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
              />
            )}

            {/* Live Scanning HUD Bar from Immersive UI with Video Link and Imaginary Stats */}
            <div className="mt-10 bg-[#00000040] rounded-xl border border-[#ffffff10] p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shadow-lg backdrop-blur-xs">
              <div
                onClick={() => setIsVideoInspectorOpen(true)}
                className="w-full sm:w-48 h-28 sm:h-24 bg-black rounded-lg border border-red-900/40 flex items-center justify-center overflow-hidden relative cursor-pointer group shrink-0"
                title="Click to open video analysis log and link custom YouTube footage"
              >
                <div className='absolute inset-0 bg-[url("https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300")] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform'></div>
                <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-red-600/80 transition-colors shadow-md">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-0.5"></div>
                </div>
                <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-gray-300 flex items-center gap-1">
                  <Video className="w-2.5 h-2.5 text-red-400" />
                  Source Video HUD
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <div className="text-[10px] text-red-500 font-bold tracking-widest flex items-center gap-2 font-mono">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    SOURCE FOOTAGE & CURATED IMAGINARY SHELVES
                  </div>

                  {/* Direct Link to Original Video */}
                  <a
                    id="watch-original-video-hud-link"
                    href={originalVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
                  >
                    <span>Watch Connected Video Stream</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden my-1">
                  <div className="h-full w-full bg-gradient-to-r from-red-500 via-amber-500 to-blue-500"></div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between mt-1 text-[10px] text-gray-400 font-mono gap-1">
                  <span>9 Video Bays ({DETECTED_BOOKS.length} books) • 6 Imaginary Shelves ({IMAGINARY_BOOKS.length} author top 2 books)</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <span>✨</span> Max 5-6 Books/Shelf • High-Recognition Front Covers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Aside Metadata Extraction Panel */}
        <aside className="w-[340px] bg-[#0a0a0f] border-l border-[#ffffff10] flex-col hidden lg:flex shrink-0">
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {/* Amazon Cover & Title Hero */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase block font-mono">
                  Selected Book Dossier
                </span>
                {inspectedBook.isImaginary ? (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-bold flex items-center gap-1">
                    <span>✨</span> NOT IN VIDEO
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    FRAME {inspectedBook.videoTimestamp}
                  </span>
                )}
              </div>

              {/* Cover Image & Quick Pricing Box */}
              <div className="flex gap-4 items-start">
                <div className="w-24 h-36 shrink-0 rounded overflow-hidden border border-[#ffffff15] shadow-lg relative bg-[#050507]">
                  <AmazonCoverImage book={inspectedBook} showBadge={false} badgeSize="md" />
                </div>

                <div className="flex-1 space-y-1.5">
                  <h2 className="text-lg font-serif text-white font-bold leading-snug">
                    {inspectedBook.title}
                  </h2>
                  <p className="text-xs text-gray-400">
                    by <strong className="text-gray-200 font-semibold">{inspectedBook.author}</strong>
                  </p>
                  {inspectedBook.publicationYear && (
                    <p className="text-[11px] text-gray-500 font-mono">
                      Published: {inspectedBook.publicationYear}
                    </p>
                  )}
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      ${(inspectedBook.estimatedPrice || 18.99).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      Orientative
                    </span>
                  </div>
                </div>
              </div>

              {inspectedBook.isImaginary && (
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-2.5 text-xs text-amber-200/90 font-sans leading-relaxed flex items-start gap-2">
                  <span className="text-sm">✨</span>
                  <div>
                    <strong className="block text-amber-300 font-semibold text-[11px]">
                      Author Top #{inspectedBook.authorTopRank || 1} Work
                    </strong>
                    <span>
                      {inspectedBook.imaginaryNote || `Curated as one of the 2 most popular books by ${inspectedBook.author}. Added based on author guidance.`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {/* Summary */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1.5 font-mono">
                  Synopsis & Subject
                </label>
                <p className="text-xs leading-relaxed text-gray-300 bg-[#ffffff05] p-3 rounded border border-[#ffffff10]">
                  {inspectedBook.summary}
                </p>
              </div>

              {/* ISBN Identifiers & Shelf Location */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1.5 font-mono">
                  Catalog Identifiers
                </label>
                <div className="bg-[#ffffff05] p-3 rounded border border-[#ffffff10] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-gray-500 font-mono">ISBN-13</span>
                    <span className="text-[10px] font-mono text-blue-300 font-bold">{inspectedBook.isbn13}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-gray-500 font-mono">ISBN-10</span>
                    <span className="text-[10px] font-mono text-blue-300">{inspectedBook.isbn10}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-gray-500 font-mono">Video Timestamp</span>
                    <span className="text-[10px] font-mono text-amber-300">{inspectedBook.videoTimestamp}</span>
                  </div>
                </div>
              </div>

              {/* Actions: View on Amazon & Full Modal */}
              <div className="space-y-2 pt-1">
                {inspectedBook.amazonUrl && (
                  <a
                    href={inspectedBook.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded bg-amber-500/10 hover:bg-amber-500/20 text-xs font-mono text-amber-300 border border-amber-500/40 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <span>View on Amazon (${(inspectedBook.estimatedPrice || 18.99).toFixed(2)})</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>
                )}

                <button
                  onClick={() => setSelectedBook(inspectedBook)}
                  className="w-full py-2.5 px-3 rounded bg-[#15151a] hover:bg-[#202028] text-xs font-mono text-blue-300 border border-blue-500/30 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Full Dossier & AI Chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Aside Footer with PDF & JSON Export */}
          <div className="p-5 border-t border-[#ffffff10] bg-[#050507] space-y-2.5">
            <button
              id="sidebar-download-pdf-btn"
              onClick={handleDownloadPdf}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-[0.15em] rounded transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Catalog (PDF)</span>
            </button>

            <button
              onClick={handleExportDataset}
              className="w-full py-2 bg-[#121218] hover:bg-[#1a1a24] text-gray-300 hover:text-white text-[10px] font-mono uppercase tracking-wider rounded border border-[#ffffff10] transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3 h-3 text-gray-400" />
              <span>Export Raw JSON</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Floating Hover Card for Instant Tooltip on Hover */}
      {hoveredBook && (
        <QuickHoverCard
          book={hoveredBook}
          position={hoverPosition}
        />
      )}

      {/* Detailed Modal on Click */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />

      {/* Video Breakdown Audit Modal */}
      <VideoInspectorModal
        isOpen={isVideoInspectorOpen}
        onClose={() => setIsVideoInspectorOpen(false)}
        onSelectBook={handleSelectBook}
        originalVideoUrl={originalVideoUrl}
        onUpdateVideoUrl={handleUpdateVideoUrl}
        onOpenPdfPreview={() => setIsPdfPreviewOpen(true)}
      />

      {/* PDF Document Preview & Email Modal */}
      <PdfPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        books={filteredBooks.length > 0 ? filteredBooks : allBooks}
        title="BOOKSHELF AI — COMPLETE CATALOG & CURATED SHELVES"
        subtitle={
          shelfScope !== 'all' || selectedCategory !== 'all' || selectedAuthor !== 'All' || selectedGenre !== 'All' || searchQuery.trim().length > 0
            ? `Filtered subset of ${filteredBooks.length} books (${shelfScope === 'imaginary' ? 'Curated Imaginary' : shelfScope === 'video' ? 'Video Scanned' : 'Combined'})`
            : `Complete inventory of ${allBooks.length} books across 15 shelves (9 video bays + 6 curated imaginary shelves)`
        }
      />

      {/* Complete User Manual, Prompt Construction History & Downloadable Guide Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onSelectVideoScope={() => setShelfScope('video')}
        onSelectImaginaryScope={() => setShelfScope('imaginary')}
      />
    </div>
  );
}
