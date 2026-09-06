import React from 'react';
import { Book } from '../types';
import { Hash, User, Sparkles, Tag, Calendar } from 'lucide-react';
import { AmazonCoverImage } from './AmazonCoverImage';

interface QuickHoverCardProps {
  book: Book;
  position: { x: number; y: number } | null;
}

export const QuickHoverCard: React.FC<QuickHoverCardProps> = ({ book, position }) => {
  if (!position) return null;

  // Ensure tooltip stays on screen
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const isRightSide = position.x > screenWidth - 380;
  const left = isRightSide ? Math.max(16, position.x - 360) : Math.min(screenWidth - 360, position.x + 20);
  const top = Math.max(80, position.y - 130);

  return (
    <div
      id={`hover-card-${book.id}`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
      className="fixed z-50 w-88 pointer-events-none transition-opacity duration-150 animate-in fade-in zoom-in-95 bg-[#0a0a0f]/95 backdrop-blur-md text-[#e0e0e0] p-4 rounded-lg border border-[#ffffff15] shadow-[0_10px_30px_rgba(0,0,0,0.85)]"
    >
      <div className="flex gap-3 border-b border-[#ffffff10] pb-3 mb-2.5">
        {/* Amazon Book Cover Preview */}
        <div className="w-16 h-24 shrink-0 rounded overflow-hidden shadow border border-[#ffffff15] bg-black relative">
          <AmazonCoverImage book={book} showBadge={true} badgeSize="xs" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            {book.isImaginary ? (
              <span className="text-[8.5px] font-sans font-bold tracking-wide px-2 py-0.5 rounded bg-amber-400 text-stone-950 border border-amber-300 inline-flex items-center gap-1 shadow-sm">
                <span>✨</span> NOT IN VIDEO • TOP #{book.authorTopRank || 1}
              </span>
            ) : (
              <span className="text-[8.5px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block">
                {book.videoTimestamp}
              </span>
            )}
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              ${(book.estimatedPrice || 18.99).toFixed(2)}
            </span>
          </div>

          <h4 className="font-serif text-sm font-bold text-white leading-snug line-clamp-2">
            {book.title}
          </h4>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <User className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="truncate">{book.author}</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              {book.publicationYear}
            </span>
            <span>•</span>
            <span className="truncate">{book.genres[0]}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono bg-[#050507] px-2.5 py-1.5 rounded border border-[#ffffff10] text-gray-300">
          <div className="flex items-center gap-1.5">
            <Hash className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="text-gray-500 text-[10px] uppercase">ISBN-13:</span>
            <span className="font-semibold text-blue-300 select-all text-[10px]">{book.isbn13}</span>
          </div>
          <span className="text-[10px] text-amber-400 font-sans">Amazon Match</span>
        </div>

        <div>
          <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
            {book.summary}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#ffffff10] text-[10px] text-gray-500">
          <span className="flex items-center gap-1 text-blue-400">
            <Sparkles className="w-3 h-3" /> Click to inspect dossier & AI
          </span>
          <span className="text-emerald-400 font-mono">Est. ${(book.estimatedPrice || 18.99).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
