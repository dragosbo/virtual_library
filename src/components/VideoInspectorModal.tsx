import React, { useState } from 'react';
import { DETECTED_BOOKS } from '../data/detectedBooks';
import { Book } from '../types';
import { 
  X, 
  Video, 
  Clock, 
  BookOpen, 
  ExternalLink, 
  Play, 
  FileText, 
  Edit3, 
  Check, 
  RotateCcw,
  Film,
  Sparkles
} from 'lucide-react';

interface VideoInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (book: Book) => void;
  originalVideoUrl: string;
  onUpdateVideoUrl: (newUrl: string) => void;
  onOpenPdfPreview: () => void;
}

export const VideoInspectorModal: React.FC<VideoInspectorModalProps> = ({
  isOpen,
  onClose,
  onSelectBook,
  originalVideoUrl,
  onUpdateVideoUrl,
  onOpenPdfPreview,
}) => {
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(originalVideoUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'timeline'>('player');

  if (!isOpen) return null;

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onUpdateVideoUrl(urlInput.trim());
    setIsEditingUrl(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaultUrl = () => {
    const defaultUrl = 'https://youtube.com/shorts/uY5M9m1UB5k?is=zri1s1z9dZ2lIe0U';
    setUrlInput(defaultUrl);
    onUpdateVideoUrl(defaultUrl);
    setIsEditingUrl(false);
  };

  // Check if URL is a YouTube video to render embed
  const getYouTubeEmbedUrl = (url: string): string | null => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtube.com')) {
        if (parsed.pathname.includes('/shorts/')) {
          const shortId = parsed.pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0];
          return shortId ? `https://www.youtube-nocookie.com/embed/${shortId}?autoplay=0&rel=0` : null;
        }
        const v = parsed.searchParams.get('v');
        if (v) return `https://www.youtube-nocookie.com/embed/${v}?autoplay=0&rel=0`;
      }
      if (parsed.hostname.includes('youtu.be')) {
        const v = parsed.pathname.replace('/', '').split('?')[0];
        return v ? `https://www.youtube-nocookie.com/embed/${v}?autoplay=0&rel=0` : null;
      }
    } catch (e) {}
    return null;
  };

  const ytEmbedUrl = getYouTubeEmbedUrl(originalVideoUrl);
  const isDirectVideoFile = /\.(mp4|webm|mov|ogg)($|\?)/i.test(originalVideoUrl);

  const timelineSegments = [
    {
      time: '00:00 - 00:03',
      name: 'Entrance Rotating Wire Rack',
      description: 'Camera focuses closely on the front rotating wire rack featuring prominent new releases, translations, and investigative works.',
      detectedCount: DETECTED_BOOKS.filter(b => b.shelfCategory === 'front-rack').length,
      sampleBooks: DETECTED_BOOKS.filter(b => b.shelfCategory === 'front-rack'),
      color: 'border-blue-500/30 bg-[#050507]',
    },
    {
      time: '00:03 - 00:08',
      name: 'Bottom Showcase Display Ledge',
      description: 'Camera sweeps downward along the floor ledge of the bookshelves displaying face-out covers of contemporary masterworks.',
      detectedCount: DETECTED_BOOKS.filter(b => b.shelfCategory === 'feature-ledge').length,
      sampleBooks: DETECTED_BOOKS.filter(b => b.shelfCategory === 'feature-ledge'),
      color: 'border-blue-500/30 bg-[#050507]',
    },
    {
      time: '00:05 - 00:10',
      name: 'Main Bookshelf: Award-Winning Fiction',
      description: 'Camera pans across the dense middle shelf showing author clusters: Maggie O’Farrell, Percival Everett, Paul Lynch, Susanna Clarke, and Ken Follett.',
      detectedCount: DETECTED_BOOKS.filter(b => b.shelfCategory === 'award-fiction').length,
      sampleBooks: DETECTED_BOOKS.filter(b => b.shelfCategory === 'award-fiction'),
      color: 'border-blue-500/30 bg-[#050507]',
    },
    {
      time: '00:10 - 00:15',
      name: 'Upper & Adjacent Bay: Modern Classics & Murakami',
      description: 'Camera pans upward and right across the upper tiers: Haruki Murakami collections, Sayaka Murata, Toni Morrison, Coco Mellors, and Sally Rooney.',
      detectedCount: DETECTED_BOOKS.filter(b => b.shelfCategory === 'international-classics').length,
      sampleBooks: DETECTED_BOOKS.filter(b => b.shelfCategory === 'international-classics'),
      color: 'border-blue-500/30 bg-[#050507]',
    },
  ];

  return (
    <div
      id="video-inspector-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="video-inspector-modal"
        className="relative w-full max-w-4xl bg-[#0a0a0f] border border-[#ffffff15] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden my-auto text-[#e0e0e0] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#ffffff10] flex items-center justify-between bg-[#050507] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-red-400 font-mono font-bold tracking-widest uppercase block">
                Source Video Footage & Spine Detection
              </span>
              <h3 className="text-base sm:text-lg font-serif text-white font-bold mt-0.5">
                Bookstore Video AI Analysis
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="video-tab-player-btn"
              onClick={() => setActiveTab('player')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                activeTab === 'player'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-[#15151e] text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              Video Stream
            </button>
            <button
              id="video-tab-timeline-btn"
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-[#15151e] text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              Telemetry Timeline
            </button>
            <button
              id="close-video-inspector-modal-btn"
              onClick={onClose}
              className="p-2 rounded bg-[#0a0a0f] hover:bg-[#15151a] text-gray-400 hover:text-white transition-colors border border-[#ffffff10]"
              title="Close Video HUD"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Source Video Banner & URL Linker */}
          <div className="bg-gradient-to-r from-red-950/40 via-[#0e0e16] to-blue-950/30 border border-red-500/30 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Film className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-red-400">
                      CURRENT VIDEO SOURCE
                    </span>
                    {savedSuccess && (
                      <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Updated!
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-gray-300 truncate max-w-xs sm:max-w-md">
                    {originalVideoUrl}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-center flex-wrap">
                <a
                  id="open-video-source-external-link"
                  href={originalVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open Video</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  id="toggle-edit-video-url-btn"
                  onClick={() => setIsEditingUrl(!isEditingUrl)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#1a1a24] hover:bg-[#252535] text-blue-300 border border-blue-500/30 text-xs font-mono transition-colors"
                  title="Configure or paste your own custom video URL"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isEditingUrl ? 'Cancel Edit' : 'Edit URL'}</span>
                </button>

                <button
                  id="video-inspector-pdf-btn"
                  onClick={onOpenPdfPreview}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono transition-colors"
                  title="Preview and download detected books PDF"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">PDF Catalog</span>
                </button>
              </div>
            </div>

            {/* Editable Video URL Input Drawer */}
            {isEditingUrl && (
              <form onSubmit={handleSaveUrl} className="pt-3 border-t border-white/10 space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="custom-video-url-input"
                    type="url"
                    required
                    placeholder="Paste YouTube video, Vimeo, or direct MP4/WebM video link..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-[#050507] border border-white/20 text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-red-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      id="save-video-url-btn"
                      className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-colors cursor-pointer"
                    >
                      Save Link
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDefaultUrl}
                      className="p-2 rounded bg-[#15151e] hover:bg-[#202028] text-gray-400 hover:text-white border border-white/10 text-xs transition-colors"
                      title="Reset to default bookstore video"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 font-mono">
                  You can paste any YouTube URL, Vimeo, cloud video file (MP4/WebM), or Google Drive link used as the source video.
                </p>
              </form>
            )}
          </div>

          {/* TAB 1: Embedded Video Player & Simulated Vision Stream */}
          {activeTab === 'player' && (
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/15 relative shadow-xl flex items-center justify-center">
                {ytEmbedUrl ? (
                  <iframe
                    src={ytEmbedUrl}
                    title="Bookstore Source Footage"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isDirectVideoFile ? (
                  <video
                    controls
                    src={originalVideoUrl}
                    className="w-full h-full object-contain bg-black"
                  >
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <div className="p-6 text-center space-y-3 max-w-md">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                    <div>
                      <h4 className="text-white font-serif font-bold text-base">
                        Bookstore Source Video Stream
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        External video link configured: <span className="font-mono text-gray-300">{originalVideoUrl}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <a
                        href={originalVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        <span>Watch on External Host</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Vision Model Telemetry Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#050507] p-3.5 rounded-lg border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Detection Count</span>
                  <p className="text-sm font-mono font-bold text-blue-400">50 English Titles</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Vision Grounding</span>
                  <p className="text-sm font-mono font-bold text-emerald-400">Amazon & OL Verified</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Temporal Sweep</span>
                  <p className="text-sm font-mono font-bold text-gray-200">00:00 → 00:15 (4 Bays)</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Edition Year Reference</span>
                  <p className="text-sm font-mono font-bold text-amber-400">Up to Sept 2026</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Telemetry Timeline Breakdown */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Sequential Camera Scan Breakdown
              </h4>

              <div className="space-y-3">
                {timelineSegments.map((seg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${seg.color} transition-all`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          {seg.time}
                        </span>
                        <h5 className="font-serif text-white text-sm font-bold">
                          {seg.name}
                        </h5>
                      </div>
                      <span className="text-xs font-mono text-gray-400">
                        {seg.detectedCount} titles identified
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                      {seg.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {seg.sampleBooks.map((book) => (
                        <button
                          key={book.id}
                          onClick={() => {
                            onSelectBook(book);
                            onClose();
                          }}
                          className="text-left text-xs px-2.5 py-1.5 rounded bg-[#0a0a0f] hover:bg-[#15151a] text-gray-300 hover:text-white border border-[#ffffff10] hover:border-blue-500/50 transition-all flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3 h-3 text-blue-400 shrink-0" />
                          <span className="font-medium truncate max-w-[160px]">{book.title}</span>
                          <span className="text-emerald-400 text-[10px] font-mono">${(book.estimatedPrice || 18.99).toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#050507] border-t border-[#ffffff10] flex items-center justify-between shrink-0">
          <a
            href={originalVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Open in New Tab</span>
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_12px_rgba(37,99,235,0.4)]"
          >
            Close Telemetry HUD
          </button>
        </div>
      </div>
    </div>
  );
};
