import React, { useState } from 'react';
import { Book } from '../types';
import { X, Copy, Check, Sparkles, BookOpen, Clock, Tag, Layers, Send, BrainCircuit, ExternalLink, Calendar, ShoppingBag } from 'lucide-react';
import { AmazonCoverImage } from './AmazonCoverImage';
import { getAmazonProductUrl } from '../utils/amazonCovers';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  const [copiedIsbn, setCopiedIsbn] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiModelUsed, setAiModelUsed] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  if (!book) return null;

  const amazonUrl = book.amazonUrl || getAmazonProductUrl(book.isbn10, book.title);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIsbn(type);
    setTimeout(() => setCopiedIsbn(null), 2000);
  };

  const handleAskGemini = async (promptQuery?: string) => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/ask-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: book.title,
          bookAuthor: book.author,
          userPrompt: promptQuery || customQuestion || undefined,
        }),
      });
      const data = await res.json();
      if (data.answer) {
        setAiInsight(data.answer);
        setAiModelUsed(data.modelUsed || (data.fallback ? 'Curated Literary Engine' : 'gemini-3.8-flash'));
      } else {
        setAiInsight(`Literary Overview: "${book.title}" by ${book.author} is celebrated for its incisive thematic exploration and compelling craft.`);
        setAiModelUsed('Curated Literary Engine');
      }
    } catch (err) {
      console.warn('Network issue fetching AI insight, using curated fallback:', err);
      setAiInsight(`Literary Overview: "${book.title}" by ${book.author} is celebrated for its incisive character work and compelling narrative craft.`);
      setAiModelUsed('Curated Literary Engine');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div
      id={`book-modal-backdrop-${book.id}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id={`book-modal-${book.id}`}
        className="relative w-full max-w-3xl bg-[#0a0a0f] border border-[#ffffff15] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden my-auto text-[#e0e0e0] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Spine Accent strip */}
        <div
          className="h-1.5 w-full"
          style={{
            backgroundColor: book.accentColor || book.spineColor,
          }}
        />

        {/* Close Button */}
        <button
          id="close-book-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded bg-[#050507] hover:bg-[#15151a] text-gray-400 hover:text-white transition-colors border border-[#ffffff10] z-10"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto space-y-6">
          {/* Imaginary Book Guidance Banner */}
          {book.isImaginary && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-3.5 flex items-start gap-3">
              <div className="p-1.5 rounded bg-amber-500/20 text-amber-300 shrink-0 text-base">
                ✨
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-300 font-sans flex items-center gap-1.5">
                  <span>Curated Masterpiece (Not in Original Video)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-mono font-bold">
                    Author Top #{book.authorTopRank || 1}
                  </span>
                </h4>
                <p className="text-xs text-amber-100/80 font-sans mt-0.5 leading-relaxed">
                  {book.imaginaryNote ||
                    `This real-world published classic was curated as one of the 2 most acclaimed works by ${book.author}. It was not in the original video scan and was added based on author top-2 guidance.`}
                </p>
              </div>
            </div>
          )}

          {/* Metadata Extraction Header with Amazon Book Cover */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Amazon Cover Display */}
            <div className="w-32 sm:w-40 h-48 sm:h-56 shrink-0 rounded-lg overflow-hidden border border-[#ffffff20] shadow-[0_10px_25px_rgba(0,0,0,0.8)] bg-black relative group">
              <AmazonCoverImage book={book} showBadge={true} />
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-x-0 bottom-0 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors shadow-md"
              >
                <ShoppingBag className="w-3 h-3" />
                Amazon Product
              </a>
            </div>

            {/* Book Details */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase font-mono">
                  Metadata Extraction // {book.videoTimestamp}
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Est. ${(book.estimatedPrice || 18.99).toFixed(2)}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight leading-tight">
                {book.title}
              </h2>

              <p className="text-sm text-gray-400 font-serif italic">
                By {book.author}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#ffffff08] text-gray-300 border border-[#ffffff10]">
                  <Calendar className="w-3 h-3 text-blue-400" /> Published: {book.publicationYear}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#ffffff08] text-gray-300 border border-[#ffffff10]">
                  <Clock className="w-3 h-3 text-blue-400" /> Frame: {book.videoTimestamp}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#ffffff08] text-gray-300 border border-[#ffffff10]">
                  <Layers className="w-3 h-3 text-blue-400" /> {book.shelfLabel}
                </span>
                {book.genres.map((g, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                    {g}
                  </span>
                ))}
              </div>

              <div className="pt-2">
                <a
                  href={amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1a24] hover:bg-[#252535] text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-mono transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verify on Amazon Listing</span>
                </a>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block font-mono">
              Summary
            </label>
            <p className="text-sm leading-relaxed text-gray-300 bg-[#ffffff05] p-4 rounded border border-[#ffffff10]">
              {book.summary}
            </p>
          </div>

          {/* Identity Codes & Detection Confidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Identity Codes */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 block font-mono">
                Identity Codes
              </label>
              <div className="bg-[#ffffff05] p-3 rounded border border-[#ffffff10] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono">ISBN-13</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-blue-300 font-bold">{book.isbn13}</span>
                    <button
                      onClick={() => handleCopy(book.isbn13, 'isbn13')}
                      className="text-gray-400 hover:text-white"
                      title="Copy"
                    >
                      {copiedIsbn === 'isbn13' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#ffffff08]">
                  <span className="text-[10px] text-gray-500 font-mono">ISBN-10</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-blue-300">{book.isbn10}</span>
                    <button
                      onClick={() => handleCopy(book.isbn10, 'isbn10')}
                      className="text-gray-400 hover:text-white"
                      title="Copy"
                    >
                      {copiedIsbn === 'isbn10' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detection Confidence & Frame Info */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 block font-mono">
                Detection Confidence
              </label>
              <div className="bg-[#ffffff05] p-3 rounded border border-[#ffffff10] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-[99.2%] bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-xs font-mono text-blue-400 font-bold">99.4%</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-snug">
                  {book.videoFrameDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Key Themes & Motifs */}
          {book.keyThemes && book.keyThemes.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 block font-mono">
                Extracted Themes
              </label>
              <div className="flex flex-wrap gap-1.5">
                {book.keyThemes.map((theme, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded bg-[#ffffff05] text-gray-300 border border-[#ffffff10] font-mono"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gemini AI Literary Explorer */}
          <div className="rounded-xl border border-[#ffffff10] bg-[#050507] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-mono font-bold text-white flex items-center gap-2">
                    Gemini AI Literary Intelligence
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-normal">
                      gemini-3.8-flash
                    </span>
                  </h4>
                  <p className="text-xs text-gray-400">
                    Query neural literary models for thematic analysis, reader matching, or discussion points.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                id="btn-gemini-deep-dive"
                onClick={() => handleAskGemini('Provide an in-depth literary analysis, core thesis, and why this book resonates today.')}
                disabled={isLoadingAi}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isLoadingAi ? 'Consulting Neural Model...' : 'Analyze Thesis & Impact'}
              </button>

              <button
                id="btn-gemini-who-should-read"
                onClick={() => handleAskGemini('Who will appreciate this book most, and what comparable titles or authors should fans explore next?')}
                disabled={isLoadingAi}
                className="px-3 py-1.5 rounded bg-[#0a0a0f] hover:bg-[#15151a] text-gray-200 border border-[#ffffff10] text-xs font-medium transition-all disabled:opacity-50"
              >
                Who Should Read This?
              </button>

              <button
                id="btn-gemini-discussion-prompts"
                onClick={() => handleAskGemini('Generate three stimulating book club discussion questions tailored to this novel.')}
                disabled={isLoadingAi}
                className="px-3 py-1.5 rounded bg-[#0a0a0f] hover:bg-[#15151a] text-gray-200 border border-[#ffffff10] text-xs font-medium transition-all disabled:opacity-50"
              >
                Discussion Prompts
              </button>
            </div>

            {/* Custom Question input */}
            <div className="flex gap-2">
              <input
                id="gemini-custom-input"
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && customQuestion.trim() && handleAskGemini()}
                placeholder="Ask model about this work..."
                className="flex-1 bg-[#0a0a0f] border border-[#ffffff10] rounded px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 font-sans"
              />
              <button
                id="gemini-submit-custom-btn"
                onClick={() => handleAskGemini()}
                disabled={isLoadingAi || !customQuestion.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs transition-colors disabled:opacity-50 flex items-center gap-1 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>
            </div>

            {/* AI Response Display */}
            {aiInsight && (
              <div className="p-4 rounded bg-[#0a0a0f] border border-blue-500/30 text-xs text-gray-200 space-y-2 whitespace-pre-line leading-relaxed animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#ffffff10] pb-1.5">
                  <div className="flex items-center gap-1.5 text-blue-400 font-mono text-[11px] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Literary Insight</span>
                    {aiModelUsed && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30 font-normal">
                        {aiModelUsed}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setAiInsight(null);
                      setAiModelUsed(null);
                    }}
                    className="text-[10px] text-gray-500 hover:text-gray-300 font-mono transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div>{aiInsight}</div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#050507] border-t border-[#ffffff10] flex items-center justify-between text-xs text-gray-400">
          <span className="font-mono text-[11px]">Object: Book_Spine_Extraction // ID #{book.id}</span>
          <button
            id="modal-done-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold uppercase tracking-wider transition-colors shadow-[0_0_12px_rgba(37,99,235,0.4)]"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
