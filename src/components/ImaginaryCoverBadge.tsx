import React from 'react';
import { Sparkles } from 'lucide-react';

export interface ImaginaryCoverBadgeProps {
  rank?: 1 | 2;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const ImaginaryCoverBadge: React.FC<ImaginaryCoverBadgeProps> = ({
  rank,
  size = 'sm',
  className = '',
}) => {
  if (size === 'xs') {
    return (
      <div
        className={`pointer-events-none select-none ${className}`}
        title="Curated Imaginary Shelf — Real author classic added to complete catalog"
      >
        <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded shadow-[0_2px_6px_rgba(245,158,11,0.55)] bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-stone-950 text-[7px] font-black uppercase tracking-wider border border-yellow-100">
          <Sparkles className="w-2 h-2 fill-stone-950 text-stone-950 shrink-0" />
          <span>Curated</span>
          {rank && <span className="opacity-90 font-mono font-bold">#{rank}</span>}
        </div>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div
        className={`pointer-events-none select-none flex flex-col gap-0.5 items-start ${className}`}
        title="Curated Imaginary Shelf — Real author classic added to complete catalog"
      >
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md shadow-[0_2px_8px_rgba(245,158,11,0.55)] bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-stone-950 text-[8px] font-black uppercase tracking-wider border border-yellow-100">
          <Sparkles className="w-2.5 h-2.5 fill-stone-950 text-stone-950 shrink-0" />
          <span>Curated Imaginary</span>
        </div>
        <div className="inline-flex items-center gap-1 px-1 py-0.2 rounded text-[6.5px] font-mono font-bold bg-black/85 text-amber-300 border border-amber-400/40 shadow backdrop-blur-xs">
          <span>Not in Video</span>
          {rank && <span>• Top #{rank}</span>}
        </div>
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div
        className={`pointer-events-none select-none flex flex-col gap-0.5 items-start ${className}`}
        title="Curated Imaginary Shelf — Real author classic added to complete catalog"
      >
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md shadow-[0_3px_10px_rgba(245,158,11,0.6)] bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-stone-950 text-[9px] font-black uppercase tracking-wider border border-yellow-100">
          <Sparkles className="w-3 h-3 fill-stone-950 text-stone-950 shrink-0" />
          <span>Curated Imaginary Edition</span>
        </div>
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[7.5px] font-mono font-bold bg-black/90 text-amber-300 border border-amber-400/50 shadow backdrop-blur-xs">
          <span>✨ Not in Bookstore Video</span>
          {rank && <span>• Author Top #{rank}</span>}
        </div>
      </div>
    );
  }

  // size === 'lg' (e.g. for BookDetailModal large 3D book cover)
  return (
    <div
      className={`pointer-events-none select-none flex flex-col gap-1 items-start ${className}`}
      title="Curated Imaginary Shelf — Real author classic added based on user guidance"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md shadow-[0_4px_16px_rgba(245,158,11,0.65)] bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-stone-950 text-[10.5px] font-black uppercase tracking-widest border border-yellow-100">
        <Sparkles className="w-3.5 h-3.5 fill-stone-950 text-stone-950 shrink-0" />
        <span>Curated Imaginary Classic</span>
      </div>
      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-black/90 text-amber-300 border border-amber-400/50 shadow-md backdrop-blur-sm">
        <span>✨ Real Author Masterpiece</span>
        <span>•</span>
        <span>Not in Bookstore Video Scan</span>
        {rank && (
          <>
            <span>•</span>
            <span className="text-amber-200">Author Top #{rank}</span>
          </>
        )}
      </div>
    </div>
  );
};
