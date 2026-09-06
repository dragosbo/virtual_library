import React from 'react';
import { ViewMode } from '../types';
import { Layers, LayoutGrid, Video, ExternalLink, FileDown, TreePine, HelpCircle } from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenVideoInspector: () => void;
  onDownloadPdf: () => void;
  onOpenHelp: () => void;
  originalVideoUrl?: string;
  totalBooks: number;
  shelfTheme: 'walnut' | 'oak' | 'mahogany' | 'pine';
  onShelfThemeChange: (theme: 'walnut' | 'oak' | 'mahogany' | 'pine') => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  onOpenVideoInspector,
  onDownloadPdf,
  onOpenHelp,
  originalVideoUrl = 'https://www.youtube.com/watch?v=0k2xQvE2b58',
  totalBooks,
  shelfTheme,
  onShelfThemeChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0f] border-b border-[#ffffff10] px-4 sm:px-8 py-3 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Glowing Live Analysis Feed Indicator & Original Video Link */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse shrink-0" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-white truncate">
              Video Analysis Live: Library_Alpha_04
            </span>
          </div>
          <span className="hidden lg:inline-block w-px h-4 bg-[#ffffff15]" />
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-gray-400">
            <span className="text-blue-400 font-medium">BOOKSHELF AI</span>
            <span>•</span>
            <span>Spine Detection Engine</span>
          </div>

          {/* Original Video Link Button in Header */}
          <div className="flex items-center">
            <a
              id="watch-original-video-header-link"
              href={originalVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-l bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-500/40 text-[11px] font-mono font-medium transition-all shadow-xs"
              title="Watch original bookstore video footage (opens in new tab)"
            >
              <Video className="w-3.5 h-3.5 text-red-400" />
              <span>Original Video</span>
              <ExternalLink className="w-3 h-3 text-red-400/80" />
            </a>
            <button
              id="change-video-source-header-btn"
              onClick={onOpenVideoInspector}
              className="px-2 py-1 rounded-r bg-red-600/30 hover:bg-red-600/40 text-red-200 border-y border-r border-red-500/40 text-[11px] font-mono transition-colors"
              title="Open video player & change video source URL"
            >
              Stream / Edit
            </button>
          </div>
        </div>

        {/* Center / Right: Telemetry, Wood Finish Selector & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-wrap">
          {/* Wooden Shelf Finish Selector */}
          <div className="flex items-center gap-1.5 bg-[#050507] border border-[#ffffff10] rounded px-2 py-1 text-xs">
            <TreePine className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">Wood:</span>
            <select
              value={shelfTheme}
              onChange={(e) => onShelfThemeChange(e.target.value as any)}
              className="bg-transparent text-amber-300 text-[11px] font-mono focus:outline-none cursor-pointer"
            >
              <option value="walnut" className="bg-[#0a0a0f] text-gray-200">Walnut</option>
              <option value="oak" className="bg-[#0a0a0f] text-gray-200">Oak</option>
              <option value="mahogany" className="bg-[#0a0a0f] text-gray-200">Mahogany</option>
              <option value="pine" className="bg-[#0a0a0f] text-gray-200">Pine</option>
            </select>
          </div>

          {/* PDF Catalog Download & Preview Button */}
          <button
            id="download-catalog-pdf-btn"
            onClick={onDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            title="Preview PDF catalog with author, orientative price, and publication year, and email or download"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>PDF Catalog</span>
          </button>

          {/* User Guide & Prompt History Help Button */}
          <button
            id="open-app-help-btn"
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
            title="App creation history, user guide & downloadable manual"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Help & Guide</span>
          </button>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#050507] border border-[#ffffff10] rounded p-0.5 text-xs">
              <button
                id="view-mode-shelves-btn"
                onClick={() => onViewModeChange('shelves')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'shelves'
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Shelves</span>
              </button>
              <button
                id="view-mode-grid-btn"
                onClick={() => onViewModeChange('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>

            {/* Video Audit Button */}
            <button
              id="open-video-inspector-btn"
              onClick={onOpenVideoInspector}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#050507] hover:bg-[#15151a] text-blue-300 hover:text-blue-200 border border-[#ffffff10] hover:border-blue-500/40 text-[11px] font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            >
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>Inspection HUD</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
