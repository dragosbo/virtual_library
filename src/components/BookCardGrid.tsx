import React from 'react';
import { Book } from '../types';
import { User, Hash, Clock, BookOpen, Calendar, Tag } from 'lucide-react';
import { AmazonCoverImage } from './AmazonCoverImage';

interface BookCardGridProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onHoverStart: (book: Book, e: React.MouseEvent) => void;
  onHoverEnd: () => void;
}

export const BookCardGrid: React.FC<BookCardGridProps> = ({
  books,
  onSelectBook,
  onHoverStart,
  onHoverEnd,
}) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-20 bg-[#0a0a0f] rounded-xl border border-[#ffffff10] p-8">
        <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h4 className="text-lg font-serif text-white">No items found</h4>
        <p className="text-xs text-gray-500 mt-1">Try clearing your search query or switching shelf categories.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {books.map((book) => (
        <div
          key={book.id}
          id={`grid-card-${book.id}`}
          onClick={() => onSelectBook(book)}
          onMouseEnter={(e) => onHoverStart(book, e)}
          onMouseLeave={onHoverEnd}
          className={`group relative bg-[#0a0a0f] hover:bg-[#15151a] rounded-xl border p-4 transition-all duration-200 cursor-pointer shadow-[0_10px_25px_rgba(0,0,0,0.6)] hover:-translate-y-1 flex flex-col justify-between ${
            book.isImaginary
              ? 'border-amber-500/30 hover:border-amber-400/70 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              : 'border-[#ffffff10] hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]'
          }`}
        >
          {/* Top Spine accent strip */}
          <div
            className="h-1 w-full rounded-full mb-3"
            style={{ backgroundColor: book.isImaginary ? '#f59e0b' : (book.accentColor || book.spineColor) }}
          />

          <div className="space-y-3">
            {/* Header badges */}
            <div className="flex items-center justify-between text-[10px] font-mono">
              {book.isImaginary ? (
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1 font-bold">
                  <span>✨</span> CURATED • TOP #{book.authorTopRank || 1}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 font-bold">
                  <Clock className="w-3 h-3" /> {book.videoTimestamp}
                </span>
              )}
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ${(book.estimatedPrice || 18.99).toFixed(2)}
              </span>
            </div>

            {/* Book Cover and Title Layout */}
            <div className="flex gap-3 items-start">
              <div className="w-16 h-24 shrink-0 rounded overflow-hidden shadow-md border border-[#ffffff15] bg-black relative">
                <AmazonCoverImage book={book} showBadge={true} badgeSize="xs" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-sm sm:text-base text-white group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                  {book.title}
                </h4>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-1">
                  <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{book.author}</span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1.5 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {book.publicationYear}
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-[80px]">{book.genres[0]}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed pt-1">
              {book.summary}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#ffffff10] flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-1 text-gray-400">
              <Hash className="w-3 h-3 text-blue-400" />
              <span className="text-blue-300 font-bold">{book.isbn13}</span>
            </div>
            <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-sans text-xs">
              Inspect &rarr;
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
