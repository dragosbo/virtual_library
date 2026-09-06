import React from 'react';
import { Book } from '../types';
import { AmazonCoverImage } from './AmazonCoverImage';
import { Video } from 'lucide-react';

interface BookSpineProps {
  book: Book;
  onSelect: (book: Book) => void;
  onHoverStart: (book: Book, e: React.MouseEvent) => void;
  onHoverEnd: () => void;
  isSelected?: boolean;
}

export const BookSpine: React.FC<BookSpineProps> = ({
  book,
  onSelect,
  onHoverStart,
  onHoverEnd,
  isSelected,
}) => {
  // If the book is set as a face-out display (like on the wire rack or the bottom showcase ledge)
  if (book.isFaceOut) {
    return (
      <div
        id={`faceout-book-${book.id}`}
        onClick={() => onSelect(book)}
        onMouseEnter={(e) => onHoverStart(book, e)}
        onMouseLeave={onHoverEnd}
        className={`group relative cursor-pointer flex-shrink-0 transition-all duration-200 hover:-translate-y-2 z-10 hover:z-20 ${
          isSelected ? 'z-20' : ''
        }`}
        style={{ width: '142px', height: '215px' }}
      >
        {/* Book Cover Face with Amazon Cover */}
        <div
          className={`w-full h-full rounded border-l-2 overflow-hidden relative select-none transition-all shadow-lg ${
            isSelected
              ? 'ring-2 ring-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)]'
              : book.isImaginary
              ? 'border-2 border-amber-400/60 shadow-[0_5px_20px_rgba(245,158,11,0.25)] hover:border-amber-300'
              : 'border border-blue-500/30 shadow-[5px_5px_15px_rgba(0,0,0,0.8)] hover:border-blue-400/60'
          }`}
          style={{
            borderLeftColor: book.accentColor || (book.isImaginary ? '#f59e0b' : '#3b82f6'),
            backgroundColor: '#0a0a0f',
          }}
        >
          {/* Real Amazon Cover Image with bespoke ImaginaryCoverBadge */}
          <AmazonCoverImage book={book} showBadge={true} badgeSize="sm" />

          {/* Book Spine fold highlight */}
          <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/70 via-white/15 to-transparent pointer-events-none" />

          {/* Top telemetry timestamp badge for Video scanned books */}
          {!book.isImaginary && (
            <div className="absolute top-1.5 left-1.5 z-10">
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold tracking-wider uppercase bg-blue-950/90 text-blue-200 border border-blue-400/50 backdrop-blur-xs shadow-sm flex items-center gap-1">
                <Video className="w-2.5 h-2.5 text-blue-400" />
                <span>VIDEO SCAN [{book.videoTimestamp}]</span>
              </span>
            </div>
          )}

          {/* Bottom Price Badge */}
          <div className="absolute bottom-1.5 left-1.5 z-10">
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold bg-black/85 text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
              ${(book.estimatedPrice || 18.99).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Standard upright book spine standing on shelf matching the Immersive UI design
  const height = book.heightPx || 220;
  const width = Math.max(30, book.widthPx || 38);

  return (
    <div
      id={`spine-book-${book.id}`}
      onClick={() => onSelect(book)}
      onMouseEnter={(e) => onHoverStart(book, e)}
      onMouseLeave={onHoverEnd}
      className={`group relative cursor-pointer flex-shrink-0 transition-transform duration-200 hover:-translate-y-1.5 origin-bottom ${
        isSelected ? 'z-20' : 'hover:z-10'
      }`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* Book Spine Body adhering to Immersive UI specifications */}
      <div
        className={`w-full h-full border-l border-[#ffffff20] flex flex-col items-center justify-between py-2.5 px-1 relative select-none transition-all ${
          isSelected
            ? 'ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
            : 'shadow-[5px_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
        }`}
        style={{
          backgroundColor: book.spineColor,
          color: book.spineTextColor || '#ffffff',
        }}
      >
        {/* Top Tag Timestamp or Imaginary Rank */}
        <div className="flex flex-col items-center justify-center opacity-90 pt-0.5">
          {book.isImaginary ? (
            <span className="text-[7.5px] font-sans font-black tracking-tighter uppercase text-amber-300 flex items-center justify-center">
              ✨#{book.authorTopRank || 1}
            </span>
          ) : (
            <span className="text-[7px] font-mono tracking-tighter uppercase font-bold transform -rotate-90 origin-center block text-blue-200">
              {book.videoTimestamp}
            </span>
          )}
        </div>

        {/* Spine Title - formatted matching [writing-mode:vertical-rl] rotate-180 text-[10px] font-bold uppercase tracking-tighter */}
        <div className="flex-1 flex items-center justify-center my-1 overflow-hidden px-0.5">
          <span
            className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis block text-center"
            style={{
              maxHeight: `${height - 75}px`,
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {book.title}
          </span>
        </div>

        {/* Bottom Author mark */}
        <div className="flex flex-col items-center justify-center pb-0.5 opacity-75 border-t border-black/30 w-full pt-1">
          <span
            className="[writing-mode:vertical-rl] rotate-180 text-[8px] font-mono uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis block"
            style={{
              maxHeight: '44px',
            }}
          >
            {book.author.split(' ').pop()}
          </span>
        </div>
      </div>
    </div>
  );
};
