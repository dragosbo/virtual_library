import React, { useRef } from 'react';
import { ShelfInfo, Book } from '../types';
import { BookSpine } from './BookSpine';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';

interface BookShelfProps {
  shelf: ShelfInfo;
  onSelectBook: (book: Book) => void;
  onHoverStart: (book: Book, e: React.MouseEvent) => void;
  onHoverEnd: () => void;
  selectedBookId?: string;
  shelfTheme?: 'walnut' | 'oak' | 'mahogany' | 'pine';
}

const woodThemes = {
  walnut: {
    name: 'Rich Walnut',
    plankTop: 'from-[#3a2012] via-[#2a160b] to-[#1e0e06]',
    topLipBevel: 'border-[#6e3e1e]/80',
    woodGrainPattern: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 8px)',
    frontFascia: 'from-[#2a160b] via-[#1e0e06] to-[#120703]',
    fasciaBorder: 'border-[#4e2a14]/60',
    routerLine: 'border-[#381c0c]',
    bookend: 'from-[#3a2012] via-[#2a160b] to-[#1a0c05]',
    bookendBorder: 'border-[#5c3217]/50',
    brassAccent: 'border-amber-600/40 bg-amber-500/10',
  },
  oak: {
    name: 'Classic Oak',
    plankTop: 'from-[#633a17] via-[#4d2c10] to-[#381e09]',
    topLipBevel: 'border-[#995b28]/80',
    woodGrainPattern: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 7px)',
    frontFascia: 'from-[#4d2c10] via-[#381e09] to-[#241204]',
    fasciaBorder: 'border-[#75431b]/60',
    routerLine: 'border-[#542f11]',
    bookend: 'from-[#633a17] via-[#4d2c10] to-[#2b1605]',
    bookendBorder: 'border-[#854c1e]/50',
    brassAccent: 'border-amber-500/50 bg-amber-500/15',
  },
  mahogany: {
    name: 'Deep Mahogany',
    plankTop: 'from-[#481612] via-[#350d0a] to-[#220705]',
    topLipBevel: 'border-[#7a2822]/80',
    woodGrainPattern: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 9px)',
    frontFascia: 'from-[#350d0a] via-[#220705] to-[#130302]',
    fasciaBorder: 'border-[#571914]/60',
    routerLine: 'border-[#3b0e0a]',
    bookend: 'from-[#481612] via-[#350d0a] to-[#180403]',
    bookendBorder: 'border-[#69201a]/50',
    brassAccent: 'border-rose-600/40 bg-rose-500/10',
  },
  pine: {
    name: 'Natural Pine',
    plankTop: 'from-[#544433] via-[#3f3224] to-[#2c2217]',
    topLipBevel: 'border-[#826a51]/80',
    woodGrainPattern: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 6px)',
    frontFascia: 'from-[#3f3224] via-[#2c2217] to-[#1a140d]',
    fasciaBorder: 'border-[#61503c]/60',
    routerLine: 'border-[#423627]',
    bookend: 'from-[#544433] via-[#3f3224] to-[#1f1810]',
    bookendBorder: 'border-[#705b45]/50',
    brassAccent: 'border-stone-500/40 bg-stone-400/10',
  },
};

export const BookShelf: React.FC<BookShelfProps> = ({
  shelf,
  onSelectBook,
  onHoverStart,
  onHoverEnd,
  selectedBookId,
  shelfTheme = 'walnut',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const theme = woodThemes[shelf.shelfTheme || shelfTheme] || woodThemes.walnut;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const isWireRack = shelf.category === 'front-rack' || shelf.category === 'shelf-bay-1';

  return (
    <div
      id={`shelf-container-${shelf.id}`}
      className="relative mb-12 last:mb-6 rounded-xl bg-[#09090e]/90 p-4 sm:p-6 border border-[#ffffff12] shadow-[0_20px_40px_rgba(0,0,0,0.7)] backdrop-blur-sm"
    >
      {/* Shelf Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#ffffff10]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Telemetry / Imaginary Badge */}
            {shelf.isImaginaryShelf ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wide uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm">
                <span>✨</span> IMAGINARY SHELF • AUTHOR TOP 2
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
                <Video className="w-3 h-3 text-blue-400" />
                Scan Segment: {shelf.videoTimestampRange}
              </span>
            )}

            <span className="text-[11px] text-amber-400/90 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {theme.name} Hardwood
            </span>
            <span className="text-[11px] text-gray-500 font-mono">
              • {shelf.books.length} {shelf.books.length === 1 ? 'title' : 'titles'} (Front Cover Display)
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif text-white mt-1.5 tracking-tight flex items-center gap-2">
            {shelf.title}
          </h3>
          <p className="text-xs text-gray-400 font-sans mt-0.5 max-w-3xl">
            {shelf.description}
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            id={`scroll-left-${shelf.id}`}
            onClick={() => scroll('left')}
            className="p-2 rounded bg-[#050507] hover:bg-[#15151a] text-gray-400 hover:text-white border border-[#ffffff10] transition-colors shadow-sm"
            title="Scroll left"
            aria-label="Scroll shelf left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id={`scroll-right-${shelf.id}`}
            onClick={() => scroll('right')}
            className="p-2 rounded bg-[#050507] hover:bg-[#15151a] text-gray-400 hover:text-white border border-[#ffffff10] transition-colors shadow-sm"
            title="Scroll right"
            aria-label="Scroll shelf right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bookshelf Display Stage */}
      <div className="relative pt-6 px-1 sm:px-2">
        {/* Books Row Horizontal Container - Spaciously displays 5-6 face-out covers */}
        <div
          ref={scrollContainerRef}
          id={`books-row-${shelf.id}`}
          className="flex items-end justify-start lg:justify-center gap-3 sm:gap-4 md:gap-5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent scroll-smooth select-none min-h-[250px] px-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* Left Carved Wooden Bookend with Brass bracket */}
          <div
            className={`flex-shrink-0 w-3.5 sm:w-4 h-36 rounded-r bg-gradient-to-r ${theme.bookend} border-r ${theme.bookendBorder} shadow-lg mr-1 relative`}
          >
            <div className="absolute bottom-1 right-0.5 w-2 h-3 border-r-2 border-b-2 border-amber-600/60 rounded-br-xs" />
            <div className="absolute top-2 right-0.5 w-1 h-1 rounded-full bg-amber-500/40" />
          </div>

          {shelf.books.map((book) => (
            <BookSpine
              key={book.id}
              book={book}
              onSelect={onSelectBook}
              onHoverStart={onHoverStart}
              onHoverEnd={onHoverEnd}
              isSelected={selectedBookId === book.id}
            />
          ))}

          {/* Right Carved Wooden Bookend with Brass bracket */}
          <div
            className={`flex-shrink-0 w-3.5 sm:w-4 h-36 rounded-l bg-gradient-to-r ${theme.bookend} border-l ${theme.bookendBorder} shadow-lg ml-1 relative`}
          >
            <div className="absolute bottom-1 left-0.5 w-2 h-3 border-l-2 border-b-2 border-amber-600/60 rounded-bl-xs" />
            <div className="absolute top-2 left-0.5 w-1 h-1 rounded-full bg-amber-500/40" />
          </div>
        </div>

        {/* Realistic Wooden Shelf Carpentry Architecture */}
        <div className="relative mt-0 z-10 select-none">
          {/* Top Surface of Wooden Shelf Plank (where books sit) */}
          <div
            className={`h-4.5 sm:h-5 w-full bg-gradient-to-b ${theme.plankTop} border-t-2 ${theme.topLipBevel} rounded-t-xs shadow-[0_10px_25px_rgba(0,0,0,0.85)] flex items-center justify-between px-3 relative overflow-hidden`}
            style={{
              backgroundImage: `${theme.woodGrainPattern}, linear-gradient(180deg, var(--tw-gradient-stops))`,
            }}
          >
            {/* Subtle wood sheen highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

            {/* Left Brass Corner Trim */}
            <div className="flex items-center gap-1.5 z-10 opacity-70">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 border border-amber-400/40" />
              <div className="w-6 h-0.5 bg-amber-600/30 rounded-full" />
            </div>

            {/* Center Wood Inlay line */}
            <div className="w-1/3 h-px bg-amber-400/10 rounded-full" />

            {/* Right Brass Corner Trim */}
            <div className="flex items-center gap-1.5 z-10 opacity-70">
              <div className="w-6 h-0.5 bg-amber-600/30 rounded-full" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 border border-amber-400/40" />
            </div>
          </div>

          {/* Front Fascia / Ledge Face of the Solid Wooden Shelf */}
          <div
            className={`h-6 sm:h-7 w-full bg-gradient-to-b ${theme.frontFascia} border-t ${theme.fasciaBorder} shadow-[0_16px_32px_rgba(0,0,0,0.95)] flex items-center justify-between px-4 sm:px-6 relative`}
          >
            {/* Routered Bevel Accent Line along the wood rim */}
            <div className="absolute top-1 left-2 right-2 h-px bg-white/5 pointer-events-none" />

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-xs border border-amber-500/30 bg-amber-600/20 rotate-45" />
              <span className="text-[9px] font-mono tracking-widest uppercase text-amber-200/50">
                {isWireRack ? 'Handcrafted Wooden Rack Base' : 'Solid Timber Shelf Plank'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-amber-200/40">
                Bay #{shelf.id.toUpperCase()}
              </span>
              <div className="w-2 h-2 rounded-xs border border-amber-500/30 bg-amber-600/20 rotate-45" />
            </div>
          </div>

          {/* Shadow dropped by the wooden shelf onto the back wall */}
          <div className="w-full h-8 sm:h-10 bg-gradient-to-b from-black/95 via-black/50 to-transparent pointer-events-none -mt-0.5" />
        </div>
      </div>
    </div>
  );
};
