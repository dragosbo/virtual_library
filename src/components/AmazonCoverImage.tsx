import React, { useState } from 'react';
import { Book } from '../types';
import { getAmazonCoverUrl, getOpenLibraryCoverUrl } from '../utils/amazonCovers';
import { BookOpen } from 'lucide-react';
import { ImaginaryCoverBadge } from './ImaginaryCoverBadge';

interface AmazonCoverImageProps {
  book: Book;
  className?: string;
  alt?: string;
  showBadge?: boolean;
  showImaginaryBadge?: boolean;
  badgeSize?: 'xs' | 'sm' | 'md' | 'lg';
}

export const AmazonCoverImage: React.FC<AmazonCoverImageProps> = ({
  book,
  className = 'w-full h-full object-cover',
  alt,
  showBadge = false,
  showImaginaryBadge = true,
  badgeSize = 'sm',
}) => {
  // Build ordered list of candidate cover image sources
  const candidateSources = React.useMemo(() => {
    const list: { url: string; source: 'custom' | 'amazon' | 'openlibrary' }[] = [];
    if (book.customCoverUrl) {
      list.push({ url: book.customCoverUrl, source: 'custom' });
    }
    const amz = book.amazonCoverUrl || getAmazonCoverUrl(book.isbn10);
    if (amz) {
      list.push({ url: amz, source: 'amazon' });
    }
    const ol13 = getOpenLibraryCoverUrl(book.isbn13);
    if (ol13) {
      list.push({ url: ol13, source: 'openlibrary' });
    }
    if (book.openLibraryCoverUrl) {
      list.push({ url: book.openLibraryCoverUrl, source: 'openlibrary' });
    }
    return list;
  }, [book]);

  const [sourceIndex, setSourceIndex] = useState<number>(0);
  const [isAmazonSuccess, setIsAmazonSuccess] = useState<boolean>(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    // Amazon and other CDNs return 1x1 or tiny transparent GIFs if not found
    if (img.naturalWidth <= 15 || img.naturalHeight <= 15) {
      setSourceIndex((prev) => prev + 1);
    } else {
      const current = candidateSources[sourceIndex];
      if (current?.source === 'amazon') {
        setIsAmazonSuccess(true);
      }
    }
  };

  const handleImageError = () => {
    setSourceIndex((prev) => prev + 1);
  };

  if (sourceIndex >= candidateSources.length) {
    // Stylized Typography Book Cover Fallback
    return (
      <div
        className={`relative flex flex-col justify-between p-3 rounded shadow-md overflow-hidden bg-gradient-to-br ${
          book.coverBg || 'from-stone-800 to-stone-900 text-stone-100'
        } ${book.isImaginary ? 'ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]' : ''} ${className}`}
        style={{
          borderLeft: `4px solid ${book.accentColor || (book.isImaginary ? '#f59e0b' : '#3b82f6')}`,
        }}
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full pointer-events-none" />
        
        {/* Imaginary Badge on Typography Fallback Cover */}
        {showImaginaryBadge && book.isImaginary && (
          <div className="absolute top-1.5 left-1.5 z-20">
            <ImaginaryCoverBadge size={badgeSize} rank={book.authorTopRank} />
          </div>
        )}

        <div className="space-y-1 z-10">
          <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
            {book.publicationYear} • {book.shelfCategory.replace('-', ' ')}
          </span>
          <h4 className="font-serif font-bold text-xs sm:text-sm line-clamp-3 leading-snug">
            {book.title}
          </h4>
        </div>
        <div className="z-10 pt-2 border-t border-white/10 flex items-center justify-between">
          <p className="text-[10px] opacity-90 truncate max-w-[120px]">{book.author}</p>
          <BookOpen className="w-3 h-3 opacity-60" />
        </div>
      </div>
    );
  }

  const currentSource = candidateSources[sourceIndex];

  return (
    <div className={`relative w-full h-full overflow-hidden rounded group bg-[#0a0a0f] ${book.isImaginary ? 'ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]' : ''}`}>
      <img
        src={currentSource.url}
        alt={alt || `${book.title} cover`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`${className} transition-transform duration-300 group-hover:scale-105`}
      />

      {/* Bespoke Imaginary Book Badge directly on cover image */}
      {showImaginaryBadge && book.isImaginary && (
        <div className="absolute top-1.5 left-1.5 z-20">
          <ImaginaryCoverBadge size={badgeSize} rank={book.authorTopRank} />
        </div>
      )}

      {showBadge && isAmazonSuccess && (
        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-black/80 text-amber-300 border border-amber-500/30 backdrop-blur-xs">
          Amazon
        </span>
      )}
    </div>
  );
};
