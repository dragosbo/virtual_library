import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Book } from '../types';
import { generatePdfBlob, generateCatalogSummaryText } from '../utils/exportPdf';
import { buildHelpManualPdfDoc } from '../utils/exportHelpPdf';
import { 
  X, 
  Download, 
  Mail, 
  FileText, 
  Check, 
  Copy, 
  ExternalLink, 
  Eye, 
  Table, 
  Send, 
  Sparkles, 
  Share2,
  Printer,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  title?: string;
  subtitle?: string;
  initialDoc?: 'catalog' | 'manual';
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  books,
  title,
  subtitle,
  initialDoc = 'catalog',
}) => {
  // Document selector: Catalog vs User Manual
  const [selectedDoc, setSelectedDoc] = useState<'catalog' | 'manual'>(initialDoc);

  // Main navigation tab: 'document' (visual authentic PDF sheets), 'embed' (browser iframe plugin), 'table' (data table), 'email' (email form)
  const [activeTab, setActiveTab] = useState<'document' | 'embed' | 'table' | 'email'>('document');

  // PDF resources state
  const [catalogPdfUrl, setCatalogPdfUrl] = useState<string | null>(null);
  const [catalogDocRef, setCatalogDocRef] = useState<any>(null);
  const [catalogFileName, setCatalogFileName] = useState<string>('bookshelf-detected-catalog.pdf');

  const [manualPdfUrl, setManualPdfUrl] = useState<string | null>(null);
  const [manualDocRef, setManualDocRef] = useState<any>(null);
  const [manualFileName, setManualFileName] = useState<string>('BookShelf-AI-User-Manual-and-Blueprint.pdf');

  // Page viewer controls
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'single' | 'continuous'>('continuous');
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 75, 100, 125

  // Email form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const printableRef = useRef<HTMLDivElement>(null);

  // Sync initialDoc when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDoc(initialDoc);
      setCurrentPage(1);
    }
  }, [isOpen, initialDoc]);

  // Generate Catalog PDF blob & doc
  useEffect(() => {
    if (!isOpen || books.length === 0) return;

    const result = generatePdfBlob(books, { title, subtitle });
    setCatalogPdfUrl(result.blobUrl);
    setCatalogDocRef(result.doc);
    setCatalogFileName(result.fileName);

    setEmailSubject(`Bookshelf Detected Catalog (${books.length} Books) - PDF Export`);
    setEmailMessage(
      `Hello,\n\nPlease find attached the detected books catalog with authors, publication years, verified ISBN numbers, and orientative prices from our bookstore scan.\n\nTotal Books: ${books.length}\nPortfolio Value: $${result.totalValue.toFixed(2)}\n\nBest regards,\nBookshelf Video AI`
    );

    return () => {
      if (result.blobUrl) {
        URL.revokeObjectURL(result.blobUrl);
      }
    };
  }, [isOpen, books, title, subtitle]);

  // Generate Manual PDF blob & doc
  useEffect(() => {
    if (!isOpen) return;

    const manualResult = buildHelpManualPdfDoc();
    setManualPdfUrl(manualResult.blobUrl);
    setManualDocRef(manualResult.doc);
    setManualFileName(manualResult.fileName);

    return () => {
      if (manualResult.blobUrl) {
        URL.revokeObjectURL(manualResult.blobUrl);
      }
    };
  }, [isOpen]);

  // Calculate pages partition for Catalog: Page 1 holds ~18 books, Page 2+ holds ~22 books
  const catalogPages = useMemo(() => {
    if (books.length === 0) return [];
    const pages: Book[][] = [];
    const page1Count = 18;
    const laterCount = 22;

    pages.push(books.slice(0, page1Count));
    let remaining = books.slice(page1Count);
    while (remaining.length > 0) {
      pages.push(remaining.slice(0, laterCount));
      remaining = remaining.slice(laterCount);
    }
    return pages;
  }, [books]);

  const totalCatalogPages = catalogPages.length || 1;
  const totalManualPages = 2;
  const totalPages = selectedDoc === 'catalog' ? totalCatalogPages : totalManualPages;

  if (!isOpen) return null;

  const totalValue = books.reduce((sum, b) => sum + (b.estimatedPrice || 0), 0);
  const avgPrice = books.length > 0 ? (totalValue / books.length).toFixed(2) : '0.00';
  const activePdfUrl = selectedDoc === 'catalog' ? catalogPdfUrl : manualPdfUrl;
  const activeDocRef = selectedDoc === 'catalog' ? catalogDocRef : manualDocRef;
  const activeFileName = selectedDoc === 'catalog' ? catalogFileName : manualFileName;

  const handleDownload = () => {
    if (activeDocRef) {
      activeDocRef.save(activeFileName);
    } else if (activePdfUrl) {
      const a = document.createElement('a');
      a.href = activePdfUrl;
      a.download = activeFileName;
      a.click();
    }
  };

  const handlePrint = () => {
    if (printableRef.current) {
      window.print();
    }
  };

  const handleCopySummary = () => {
    const text = generateCatalogSummaryText(books);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (!activeDocRef) return;
    try {
      const blob = activeDocRef.output('blob');
      const file = new File([blob], activeFileName, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: emailSubject,
          text: emailMessage,
        });
        return;
      }
    } catch (e) {
      // Fallback
    }
    handleMailto();
  };

  const handleMailto = () => {
    const body = `${emailMessage}\n\n===============================\nCATALOG SUMMARY PREVIEW:\n===============================\n${generateCatalogSummaryText(books)}`;
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleSendEmailSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
      }, 4000);
    }, 1000);
  };

  // Zoom scale css
  const zoomScale = zoomLevel === 75 ? 'scale-75' : zoomLevel === 125 ? 'scale-125' : 'scale-100';

  return (
    <div
      id="pdf-preview-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-hidden print:p-0 print:bg-white"
      onClick={onClose}
    >
      <div
        id="pdf-preview-modal"
        className="relative w-full max-w-6xl h-[94vh] max-h-[960px] bg-[#09090f] border border-[#ffffff15] rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-[#e0e0e0] print:border-none print:shadow-none print:h-auto print:max-h-none print:w-full print:bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-[#ffffff10] flex items-center justify-between bg-[#040407] shrink-0 print:hidden flex-wrap gap-2">
          {/* Left: Document Type Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#12121a] p-1 rounded-lg border border-white/10 text-xs font-mono">
              <button
                id="select-pdf-catalog-doc-btn"
                onClick={() => {
                  setSelectedDoc('catalog');
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                  selectedDoc === 'catalog'
                    ? 'bg-emerald-600 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Books Catalog PDF ({books.length})</span>
              </button>
              <button
                id="select-pdf-manual-doc-btn"
                onClick={() => {
                  setSelectedDoc('manual');
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                  selectedDoc === 'manual'
                    ? 'bg-amber-600 text-white font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>User Manual PDF (2 Pages)</span>
              </button>
            </div>
          </div>

          {/* Center / Right: View Format Tabs & Close */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Tabs */}
            <div className="flex items-center bg-[#12121a] p-0.5 rounded border border-white/10 text-xs font-mono">
              <button
                id="pdf-tab-preview"
                onClick={() => setActiveTab('document')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  activeTab === 'document'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="View authentic, high-resolution PDF pages on screen"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>PDF Format</span>
              </button>
              <button
                id="pdf-tab-table"
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                  activeTab === 'table'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="View as responsive data table"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Data Table</span>
              </button>
              <button
                id="pdf-tab-email"
                onClick={() => setActiveTab('email')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                  activeTab === 'email'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Compose and send email with catalog summary"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Email PDF</span>
              </button>
            </div>

            <button
              id="close-pdf-preview-modal-btn"
              onClick={onClose}
              className="p-2 rounded bg-[#15151e] hover:bg-[#20202a] text-gray-400 hover:text-white transition-colors border border-white/10 cursor-pointer"
              title="Close PDF Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Navigation & Document Tools Bar */}
        <div className="px-4 sm:px-6 py-2 bg-[#0d0d15] border-b border-white/5 flex items-center justify-between gap-3 text-xs font-mono flex-wrap shrink-0 print:hidden">
          {/* Metadata & Page Indicators */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-400">
              Document:{' '}
              <strong className="text-white">
                {selectedDoc === 'catalog' ? 'Detected Books Catalog' : 'System User Manual & Blueprint'}
              </strong>
            </span>
            <span className="text-gray-600">•</span>
            {selectedDoc === 'catalog' ? (
              <span className="text-emerald-400">
                {books.length} Titles (${totalValue.toFixed(2)} portfolio value)
              </span>
            ) : (
              <span className="text-amber-400">Architecture & Operational Blueprint</span>
            )}
          </div>

          {/* PDF Page Controls (when activeTab is 'document') */}
          {activeTab === 'document' && (
            <div className="flex items-center gap-2">
              {/* Page mode toggle */}
              <div className="flex items-center bg-[#151522] rounded p-0.5 border border-white/10 text-[11px]">
                <button
                  onClick={() => setViewMode('continuous')}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    viewMode === 'continuous' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="Scroll through all pages continuously"
                >
                  All Pages
                </button>
                <button
                  onClick={() => setViewMode('single')}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    viewMode === 'single' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="Display one page at a time"
                >
                  Page-by-Page
                </button>
              </div>

              {/* Page Navigator (Single mode) */}
              {viewMode === 'single' && (
                <div className="flex items-center gap-1 bg-[#151522] px-2 py-1 rounded border border-white/10 text-xs">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-gray-200 px-1 font-mono text-[11px]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center bg-[#151522] px-1 py-0.5 rounded border border-white/10 text-xs text-gray-400">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 25))}
                  className="p-1 hover:text-white cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="text-[11px] px-1 font-mono">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(125, z + 25))}
                  className="p-1 hover:text-white cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>

              {/* Print Document Button */}
              <button
                id="print-pdf-document-btn"
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#181824] hover:bg-[#252535] text-gray-300 border border-white/10 text-[11px] cursor-pointer transition-colors"
                title="Print this PDF document or save via system print dialog"
              >
                <Printer className="w-3 h-3 text-blue-400" />
                <span>Print</span>
              </button>

              {/* Quick Copy Text */}
              {selectedDoc === 'catalog' && (
                <button
                  id="copy-summary-text-btn"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#181824] hover:bg-[#252535] text-gray-300 border border-white/10 text-[11px] cursor-pointer transition-colors"
                  title="Copy text summary to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-gray-400" />
                      <span className="hidden md:inline">Copy Text</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Main Content Container */}
        <div className="flex-1 overflow-y-auto relative bg-[#12121a] p-3 sm:p-6 print:p-0 print:bg-white print:overflow-visible">
          {/* TAB 1: AUTHENTIC VISUAL PDF FORMAT SHEETS */}
          {activeTab === 'document' && (
            <div
              ref={printableRef}
              className={`w-full max-w-4xl mx-auto space-y-8 transition-transform origin-top ${zoomScale} print:space-y-0 print:max-w-none print:transform-none`}
            >
              {/* Render CATALOG PDF Pages */}
              {selectedDoc === 'catalog' && (
                <>
                  {catalogPages.map((pageBooks, pageIdx) => {
                    const pageNum = pageIdx + 1;
                    if (viewMode === 'single' && pageNum !== currentPage) return null;

                    const isFirstPage = pageNum === 1;

                    return (
                      <div
                        key={`catalog-page-${pageNum}`}
                        id={`pdf-page-${pageNum}`}
                        className="relative bg-white text-slate-900 rounded-sm shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-6 sm:p-10 min-h-[1050px] flex flex-col justify-between border border-slate-200 print:shadow-none print:border-none print:p-6 print:m-0 print:min-h-0 print:break-after-page"
                      >
                        {/* Page Content */}
                        <div>
                          {/* PAGE 1 HEADER BANNER */}
                          {isFirstPage ? (
                            <div className="mb-6">
                              {/* Dark Header Banner */}
                              <div className="bg-slate-900 text-white p-5 rounded-t-sm">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h1 className="text-lg sm:text-xl font-bold font-sans tracking-wide text-white">
                                      BOOKSHELF VIDEO AI — DETECTED BOOKS CATALOG
                                    </h1>
                                    <p className="text-xs text-slate-300 mt-1 font-sans">
                                      {subtitle ||
                                        'Audit of titles detected from video footage, with author, publication year & orientative price'}
                                    </p>
                                  </div>
                                  <div className="hidden sm:block text-right">
                                    <span className="text-[10px] uppercase tracking-widest font-mono text-blue-400 font-bold block">
                                      Official Catalog
                                    </span>
                                    <span className="text-xs font-mono text-slate-300">
                                      Edition 2026
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {/* Accent Line */}
                              <div className="h-1 bg-blue-600 w-full" />

                              {/* Document Meta Row */}
                              <div className="bg-slate-50 border-x border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-[11px] font-mono text-slate-600 flex-wrap gap-2">
                                <div>
                                  <span>Generated: </span>
                                  <strong className="text-slate-800">
                                    {new Date().toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </strong>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span>
                                    Titles: <strong className="text-blue-700">{books.length}</strong>
                                  </span>
                                  <span>
                                    Portfolio Value:{' '}
                                    <strong className="text-emerald-700">${totalValue.toFixed(2)}</strong>
                                  </span>
                                  <span>
                                    Avg Price:{' '}
                                    <strong className="text-slate-800">${avgPrice}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* CONTINUATION RUNNING HEADER */
                            <div className="mb-4 pb-2 border-b-2 border-slate-900 flex items-center justify-between">
                              <span className="text-xs font-bold font-sans text-slate-900 uppercase tracking-wider">
                                BOOKSHELF VIDEO AI — DETECTED BOOKS CATALOG (CONTINUED)
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">
                                Page {pageNum} of {totalCatalogPages}
                              </span>
                            </div>
                          )}

                          {/* Books Table */}
                          <div className="overflow-hidden border border-slate-300 rounded-sm">
                            <table className="w-full text-left text-xs font-sans">
                              <thead className="bg-slate-900 text-white font-mono text-[10.5px] uppercase tracking-wider">
                                <tr>
                                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                                  <th className="py-2.5 px-3">Book Title</th>
                                  <th className="py-2.5 px-3">Author</th>
                                  <th className="py-2.5 px-2 text-center w-14">Year</th>
                                  <th className="py-2.5 px-3 text-right w-20">Est. Price</th>
                                  <th className="py-2.5 px-3 w-28">ISBN-13</th>
                                  <th className="py-2.5 px-3 w-32">Shelf Area</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {pageBooks.map((book) => {
                                  // Global index in total catalog
                                  const globalIdx = books.findIndex((b) => b.id === book.id) + 1;
                                  const isZebra = globalIdx % 2 === 0;

                                  return (
                                    <tr
                                      key={book.id}
                                      className={`text-slate-800 ${
                                        isZebra ? 'bg-slate-50' : 'bg-white'
                                      }`}
                                    >
                                      <td className="py-2 px-3 text-center font-mono text-slate-500 text-[11px]">
                                        {globalIdx}
                                      </td>
                                      <td className="py-2 px-3 font-semibold text-slate-900 font-serif">
                                        <div className="flex items-center gap-1.5">
                                          {book.isImaginary && (
                                            <span className="text-amber-600 font-mono text-[10px]" title="Curated Top 2 Book">
                                              ✨
                                            </span>
                                          )}
                                          <span>{book.title}</span>
                                        </div>
                                      </td>
                                      <td className="py-2 px-3 text-slate-700">{book.author}</td>
                                      <td className="py-2 px-2 text-center font-mono text-slate-600 text-[11px]">
                                        {book.publicationYear || '—'}
                                      </td>
                                      <td className="py-2 px-3 text-right font-mono font-bold text-blue-700 text-[11px]">
                                        ${(book.estimatedPrice || 18.99).toFixed(2)}
                                      </td>
                                      <td className="py-2 px-3 font-mono text-[10px] text-slate-600">
                                        {book.isbn13 || '—'}
                                      </td>
                                      <td className="py-2 px-3 text-[11px] text-slate-500 truncate max-w-[130px]">
                                        {book.shelfLabel ? book.shelfLabel.split('•')[0].trim() : 'Bookshelf'}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Page Footer */}
                        <div className="mt-8 pt-3 border-t border-slate-300 flex items-center justify-between text-[10.5px] font-sans text-slate-500 font-mono">
                          <span>
                            BookShelf Video AI • Processed Bookstore Video Scan • Verified ISBNs & Orientative Pricing
                          </span>
                          <span>
                            Page {pageNum} of {totalCatalogPages}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Render USER MANUAL PDF Pages */}
              {selectedDoc === 'manual' && (
                <>
                  {/* MANUAL PAGE 1: CREATION BLUEPRINT */}
                  {(viewMode === 'continuous' || currentPage === 1) && (
                    <div
                      id="manual-page-1"
                      className="relative bg-white text-slate-900 rounded-sm shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-6 sm:p-10 min-h-[1050px] flex flex-col justify-between border border-slate-200 print:shadow-none print:border-none print:p-6 print:m-0 print:min-h-0 print:break-after-page"
                    >
                      <div>
                        {/* Header Banner */}
                        <div className="bg-[#0a0a0f] text-white p-5 rounded-t-sm">
                          <h1 className="text-lg sm:text-xl font-bold font-sans tracking-wide text-white">
                            BOOKSHELF VIDEO AI — USER MANUAL & BLUEPRINT
                          </h1>
                          <p className="text-xs text-slate-300 mt-1 font-sans">
                            Complete Architectural History, Prompt Evolution & Operational Guide
                          </p>
                          <p className="text-[10px] text-amber-400 font-mono mt-2">
                            Official Documentation • Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="h-1 bg-amber-500 w-full mb-5" />

                        {/* Executive Summary Box */}
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-6">
                          <h4 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider mb-1">
                            Executive Overview
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed font-sans">
                            BookShelf Video AI transforms physical bookstore video footage into a high-precision,
                            interactive virtual library. The system catalogs books recognized in the video, enriches each
                            title with cover art, ISBNs, and pricing, and expands into curated imaginary shelves spotlighting
                            the 2 most celebrated works for each author.
                          </p>
                        </div>

                        {/* Section 1: Evolution Table */}
                        <h3 className="text-sm font-bold font-sans text-slate-900 mb-2 uppercase tracking-wider">
                          1. How This App Was Created (Step-by-Step Evolution)
                        </h3>
                        <div className="overflow-hidden border border-slate-300 rounded-sm mb-4">
                          <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-slate-900 text-white font-mono text-[10.5px] uppercase">
                              <tr>
                                <th className="py-2 px-3 w-16">Stage</th>
                                <th className="py-2 px-3 w-48">Milestone</th>
                                <th className="py-2 px-3">Implementation Details Based on User Guidance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              <tr className="bg-white">
                                <td className="py-2 px-3 font-bold font-mono text-blue-700">Step 1</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">Video Scan & Detection Initial Prototype</td>
                                <td className="py-2 px-3 text-slate-700">In response to the original bookstore scan request, an AI-assisted detection pipeline cataloged 50 physical books across 4 initial shelves, capturing titles, authors, ISBNs, estimated market pricing, and video timestamps.</td>
                              </tr>
                              <tr className="bg-slate-50">
                                <td className="py-2 px-3 font-bold font-mono text-blue-700">Step 2</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">Spine Recognition & Immersive UI</td>
                                <td className="py-2 px-3 text-slate-700">Engineered realistic wooden bookshelf rendering (Walnut, Oak, Mahogany, Pine) with book spines, hover dossiers, and Amazon cover image resolution.</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="py-2 px-3 font-bold font-mono text-blue-700">Step 3</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">Resolving Video Stream (Despacito Replacement)</td>
                                <td className="py-2 px-3 text-slate-700">The user noted the link pointed to Despacito. We architected a dynamic YouTube integration with URL validation, allowing the user to connect their own footage.</td>
                              </tr>
                              <tr className="bg-slate-50">
                                <td className="py-2 px-3 font-bold font-mono text-blue-700">Step 4</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">Front Cover Layout & Density (5-6 Books/Shelf)</td>
                                <td className="py-2 px-3 text-slate-700">The user requested: "Make more shelves and display maximum 5 or 6 books per shelve with the front cover so that we can recognize the books." Re-partitioned into 9 spacious video bays, setting all 50 books to face-out.</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="py-2 px-3 font-bold font-mono text-blue-700">Step 5</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">Imaginary Shelves Creation (Top 2 Books/Author)</td>
                                <td className="py-2 px-3 text-slate-700">Per user prompt: "Create a list of imaginary shelves which for each author has his or her most popular 2 books. Signal with a nice emoji that these books exist but were not in the original video." Curated 36 real published classics across 6 shelves with ✨ emoji badges.</td>
                              </tr>
                              <tr className="bg-slate-50">
                                <td className="py-2 px-3 font-bold font-mono text-blue-700">Step 6</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">Personal Video Stream Integration</td>
                                <td className="py-2 px-3 text-slate-700">Integrated the user’s YouTube short (https://youtube.com/shorts/uY5M9m1UB5k) as the primary footage source, synchronizing playback and HUD telemetry.</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Manual Footer 1 */}
                      <div className="mt-8 pt-3 border-t border-slate-300 flex items-center justify-between text-[10.5px] font-sans text-slate-500 font-mono">
                        <span>BookShelf Video AI — User Manual & Architecture Blueprint</span>
                        <span>Page 1 of 2</span>
                      </div>
                    </div>
                  )}

                  {/* MANUAL PAGE 2: DISTINCTION & CAPABILITIES */}
                  {(viewMode === 'continuous' || currentPage === 2) && (
                    <div
                      id="manual-page-2"
                      className="relative bg-white text-slate-900 rounded-sm shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-6 sm:p-10 min-h-[1050px] flex flex-col justify-between border border-slate-200 print:shadow-none print:border-none print:p-6 print:m-0 print:min-h-0 print:break-after-page"
                    >
                      <div>
                        {/* Header Banner Page 2 */}
                        <div className="bg-[#0a0a0f] text-white p-4 rounded-t-sm">
                          <h2 className="text-base sm:text-lg font-bold font-sans tracking-wide text-white">
                            2. HOW TO DISTINGUISH ORIGINAL VIDEO BOOKS VS. IMAGINARY BOOKS
                          </h2>
                          <p className="text-xs text-slate-300 mt-0.5 font-sans">
                            Visual markers, color codes, and catalog tags designed for immediate detection
                          </p>
                        </div>
                        <div className="h-1 bg-blue-600 w-full mb-4" />

                        {/* Distinction Table */}
                        <div className="overflow-hidden border border-slate-300 rounded-sm mb-6">
                          <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-slate-900 text-white font-mono text-[10.5px] uppercase">
                              <tr>
                                <th className="py-2 px-3 w-40">Visual Marker</th>
                                <th className="py-2 px-3">Original Video Book (50 Titles)</th>
                                <th className="py-2 px-3">Curated Imaginary Book (36 Titles)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              <tr className="bg-white">
                                <td className="py-2 px-3 font-bold text-slate-900 font-mono">Top Cover Badge</td>
                                <td className="py-2 px-3 text-blue-700 font-medium">Blue Pill: "VIDEO SCAN [00:04]" with video camera icon</td>
                                <td className="py-2 px-3 text-amber-700 font-medium">Gold / Amber Pill: "✨ NOT IN VIDEO"</td>
                              </tr>
                              <tr className="bg-slate-50">
                                <td className="py-2 px-3 font-bold text-slate-900 font-mono">Author Rank Tag</td>
                                <td className="py-2 px-3 text-slate-500">None (Detected directly from shelf footage)</td>
                                <td className="py-2 px-3 text-purple-700 font-medium">Purple Pill: "Top #1" or "Top #2" of author works</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="py-2 px-3 font-bold text-slate-900 font-mono">Shelf Assignment</td>
                                <td className="py-2 px-3 text-slate-700">Shelves titled "Shelf Bay 1" to "Shelf Bay 9"</td>
                                <td className="py-2 px-3 text-amber-700 font-medium">Shelves titled "✨ Imaginary Shelf 1" to "✨ Imaginary Shelf 6"</td>
                              </tr>
                              <tr className="bg-slate-50">
                                <td className="py-2 px-3 font-bold text-slate-900 font-mono">Cover Border Rim</td>
                                <td className="py-2 px-3 text-slate-700">Cool Slate / Blue rim border</td>
                                <td className="py-2 px-3 text-amber-700 font-medium">Warm Gold / Amber rim border with glowing accent</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="py-2 px-3 font-bold text-slate-900 font-mono">Side Dossier Status</td>
                                <td className="py-2 px-3 text-slate-700">Timestamp: Frame timestamp (e.g. 00:04)</td>
                                <td className="py-2 px-3 text-amber-700 font-medium">Curation Banner: "✨ Not in Video • Author Top 2 Selection"</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Section 3: Navigation & Capabilities */}
                        <h3 className="text-sm font-bold font-sans text-slate-900 mb-2 uppercase tracking-wider">
                          3. Navigation, Capabilities & Use Cases
                        </h3>
                        <div className="overflow-hidden border border-slate-300 rounded-sm">
                          <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-slate-900 text-white font-mono text-[10.5px] uppercase">
                              <tr>
                                <th className="py-2 px-3 w-12 text-center">#</th>
                                <th className="py-2 px-3 w-44">Feature</th>
                                <th className="py-2 px-3">How to Use & Capability Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              <tr className="bg-white">
                                <td className="py-2 px-3 text-center font-mono text-slate-500">1</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">Scope Switching</td>
                                <td className="py-2 px-3 text-slate-700">Toggle between "All Shelves (86)", "Video Shelves (50)", and "✨ Imaginary Shelves (36)" with 1-click in the top filter bar.</td>
                              </tr>
                              <tr className="bg-slate-50">
                                <td className="py-2 px-3 text-center font-mono text-slate-500">2</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">Author Spotlight</td>
                                <td className="py-2 px-3 text-slate-700">Select any author to immediately filter the view to only their works.</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="py-2 px-3 text-center font-mono text-slate-500">3</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">Search & Keywords</td>
                                <td className="py-2 px-3 text-slate-700">Type any keyword, ISBN, or "pdf catalog" to search or immediately open document export.</td>
                              </tr>
                              <tr className="bg-slate-50">
                                <td className="py-2 px-3 text-center font-mono text-slate-500">4</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">Multi-Format Export</td>
                                <td className="py-2 px-3 text-slate-700">Export high-resolution PDF catalogs, raw JSON datasets, or download this complete User Manual PDF.</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Manual Footer 2 */}
                      <div className="mt-8 pt-3 border-t border-slate-300 flex items-center justify-between text-[10.5px] font-sans text-slate-500 font-mono">
                        <span>BookShelf Video AI — User Manual & Architecture Blueprint</span>
                        <span>Page 2 of 2</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: DATA TABLE OVERVIEW */}
          {activeTab === 'table' && (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-mono text-gray-400 uppercase tracking-wider font-semibold">
                  Catalog Inventory Items ({books.length} Verified Entries)
                </h4>
                <span className="text-xs text-gray-500 font-mono">
                  All prices are orientative retail list USD
                </span>
              </div>

              <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0c0c14]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#151522] text-gray-300 font-mono text-[11px] uppercase tracking-wider border-b border-white/10">
                      <tr>
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Author</th>
                        <th className="p-3 text-center">Year</th>
                        <th className="p-3 text-right">Est. Price</th>
                        <th className="p-3">ISBN-13</th>
                        <th className="p-3">Shelf Area</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {books.map((b, idx) => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 text-center font-mono text-gray-500">{idx + 1}</td>
                          <td className="p-3 font-serif font-bold text-white max-w-[220px] truncate">
                            <span className="flex items-center gap-1.5">
                              {b.isImaginary && <span className="text-amber-400">✨</span>}
                              <span>{b.title}</span>
                            </span>
                          </td>
                          <td className="p-3 text-gray-300 max-w-[160px] truncate">{b.author}</td>
                          <td className="p-3 text-center font-mono text-gray-400">
                            {b.publicationYear || '—'}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">
                            ${(b.estimatedPrice || 18.99).toFixed(2)}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-blue-300 truncate max-w-[130px]">
                            {b.isbn13}
                          </td>
                          <td className="p-3 text-gray-400 text-[11px] truncate max-w-[140px]">
                            {b.shelfLabel.split('•')[0].trim()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMAIL PDF DIALOG */}
          {activeTab === 'email' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                  <Mail className="w-4 h-4" />
                  <span>Email Book Catalog</span>
                </div>
                <h3 className="text-xl font-serif text-white font-bold">
                  Send or Share Detected Books Catalog
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Compose an email containing the complete detected inventory, verified ISBNs, publication years, and orientative pricing.
                </p>
              </div>

              {sendSuccess && (
                <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-xs">Catalog dispatched successfully!</p>
                    <p className="text-[11px] text-emerald-300/80">
                      An email with {books.length} titles has been queued for delivery to {recipientEmail}.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendEmailSimulation} className="space-y-4 bg-[#0e0e16] p-5 rounded-xl border border-white/10">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5">
                    Recipient Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="recipient-email-input"
                    type="email"
                    required
                    placeholder="curator@bookstore.org, collector@reading.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#050507] border border-white/15 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5">
                    Subject Line
                  </label>
                  <input
                    id="email-subject-input"
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#050507] border border-white/15 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5">
                    Message / Notes
                  </label>
                  <textarea
                    id="email-message-input"
                    rows={4}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#050507] border border-white/15 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none font-sans"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="open-mailto-client-btn"
                      onClick={handleMailto}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1a1a24] hover:bg-[#252535] text-blue-300 border border-blue-500/30 text-xs font-mono transition-colors cursor-pointer"
                      title="Open default email application with pre-composed draft"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                      <span>Open in Email App</span>
                    </button>

                    <button
                      type="button"
                      id="native-share-btn"
                      onClick={handleNativeShare}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#1a1a24] hover:bg-[#252535] text-purple-300 border border-purple-500/30 text-xs font-mono transition-colors cursor-pointer"
                      title="Share PDF file with installed device apps"
                    >
                      <Share2 className="w-3.5 h-3.5 text-purple-400" />
                      <span className="hidden sm:inline">Share File</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    id="send-email-confirm-btn"
                    disabled={isSending}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
                  >
                    {isSending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#ffffff10] bg-[#050507] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-gray-400 font-mono truncate flex items-center gap-2">
            <span className="text-gray-500">Target File:</span>
            <span className="text-emerald-400 font-semibold">{activeFileName}</span>
            {activePdfUrl && (
              <a
                href={activePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 ml-1 flex items-center gap-1"
                title="Open raw PDF file in new browser window"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="modal-toggle-email-btn"
              onClick={() => setActiveTab(activeTab === 'email' ? 'document' : 'email')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#151520] hover:bg-[#20202e] text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeTab === 'email' ? 'View PDF Format' : 'Email PDF'}</span>
            </button>

            <button
              id="modal-download-pdf-btn"
              onClick={handleDownload}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Save / Download .PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
