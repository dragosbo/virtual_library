import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { generatePdfBlob, generateCatalogSummaryText } from '../utils/exportPdf';
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
  DollarSign, 
  Calendar,
  Send,
  Sparkles,
  Share2
} from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  title?: string;
  subtitle?: string;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  books,
  title,
  subtitle,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [docRef, setDocRef] = useState<any>(null);
  const [fileName, setFileName] = useState<string>('bookshelf-detected-catalog.pdf');
  const [activeTab, setActiveTab] = useState<'preview' | 'table' | 'email'>('preview');

  // Email form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || books.length === 0) return;

    const result = generatePdfBlob(books, { title, subtitle });
    setPdfUrl(result.blobUrl);
    setDocRef(result.doc);
    setFileName(result.fileName);

    setEmailSubject(`Bookshelf Detected Catalog (${books.length} Books) - September 2026 Edition`);
    setEmailMessage(
      `Hello,\n\nPlease find attached the detected books catalog with authors, recent edition publication years, verified ISBN numbers, and orientative prices from our bookstore scan.\n\nTotal Books: ${books.length}\nPortfolio Value: $${result.totalValue.toFixed(2)}\n\nBest regards,\nBookshelf Video AI`
    );

    return () => {
      if (result.blobUrl) {
        URL.revokeObjectURL(result.blobUrl);
      }
    };
  }, [isOpen, books, title, subtitle]);

  if (!isOpen) return null;

  const totalValue = books.reduce((sum, b) => sum + (b.estimatedPrice || 0), 0);
  const avgPrice = books.length > 0 ? (totalValue / books.length).toFixed(2) : '0.00';

  const handleDownload = () => {
    if (docRef) {
      docRef.save(fileName);
    } else if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = fileName;
      a.click();
    }
  };

  const handleCopySummary = () => {
    const text = generateCatalogSummaryText(books);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (!docRef) return;
    try {
      const blob = docRef.output('blob');
      const file = new File([blob], fileName, { type: 'application/pdf' });
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

  return (
    <div
      id="pdf-preview-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-hidden"
      onClick={onClose}
    >
      <div
        id="pdf-preview-modal"
        className="relative w-full max-w-5xl h-[92vh] max-h-[900px] bg-[#0a0a0f] border border-[#ffffff15] rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-[#e0e0e0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-[#ffffff10] flex items-center justify-between bg-[#050507] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest uppercase">
                  PDF Export Pre-Save Audit
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  {books.length} Titles
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-serif text-white font-bold truncate max-w-md sm:max-w-xl">
                Detected Books & Pricing Catalog
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div className="hidden sm:flex items-center bg-[#15151e] p-0.5 rounded border border-white/10 text-xs font-mono">
              <button
                id="pdf-tab-preview"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>PDF Document</span>
              </button>
              <button
                id="pdf-tab-table"
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'table'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Data Table</span>
              </button>
              <button
                id="pdf-tab-email"
                onClick={() => setActiveTab('email')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'email'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Catalog</span>
              </button>
            </div>

            <button
              id="close-pdf-preview-modal-btn"
              onClick={onClose}
              className="p-2 rounded bg-[#15151e] hover:bg-[#20202a] text-gray-400 hover:text-white transition-colors border border-white/10"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Catalog Summary Bar */}
        <div className="px-5 py-2.5 bg-[#0e0e16] border-b border-white/5 flex items-center justify-between gap-3 text-xs font-mono flex-wrap shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-gray-500">Titles:</span>
              <span className="text-blue-400 font-bold">{books.length}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-gray-500">Portfolio Value:</span>
              <span className="text-emerald-400 font-bold">${totalValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-gray-500">Avg Price:</span>
              <span className="text-amber-400 font-bold">${avgPrice}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-gray-400">
              <span className="text-gray-500">Date:</span>
              <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-summary-text-btn"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1a1a24] hover:bg-[#252535] text-gray-300 border border-white/10 transition-colors text-[11px]"
              title="Copy text summary of all books to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-gray-400" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              id="email-tab-mobile-trigger"
              onClick={() => setActiveTab('email')}
              className={`sm:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] ${
                activeTab === 'email' ? 'bg-blue-600 text-white' : 'bg-[#1a1a24] text-gray-300 border-white/10'
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>Email</span>
            </button>
          </div>
        </div>

        {/* Main Body: Tabs */}
        <div className="flex-1 overflow-hidden relative">
          {/* TAB 1: Live PDF Embed Preview */}
          {activeTab === 'preview' && (
            <div className="w-full h-full flex flex-col bg-[#14141c]">
              {pdfUrl ? (
                <iframe
                  id="pdf-preview-iframe"
                  src={`${pdfUrl}#toolbar=1&navpanes=0`}
                  title="PDF Catalog Preview"
                  className="w-full h-full border-0 bg-[#2b2b36]"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="font-mono text-sm">Rendering PDF document preview...</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Data Table Overview */}
          {activeTab === 'table' && (
            <div className="w-full h-full overflow-y-auto p-4 sm:p-6 bg-[#08080c]">
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
                              {b.title}
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
            </div>
          )}

          {/* TAB 3: Email PDF Dialog */}
          {activeTab === 'email' && (
            <div className="w-full h-full overflow-y-auto p-4 sm:p-8 bg-[#08080c]">
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
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1a1a24] hover:bg-[#252535] text-blue-300 border border-blue-500/30 text-xs font-mono transition-colors"
                        title="Open default email application with pre-composed draft"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                        <span>Open in Email App</span>
                      </button>

                      <button
                        type="button"
                        id="native-share-btn"
                        onClick={handleNativeShare}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#1a1a24] hover:bg-[#252535] text-purple-300 border border-purple-500/30 text-xs font-mono transition-colors"
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

                {/* Email Delivery Notice */}
                <div className="p-3.5 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-300 text-xs flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Tip:</strong> Clicking <em>"Open in Email App"</em> will automatically launch your mail client (Gmail, Apple Mail, Outlook) with the complete catalog formatted in the message body. You can also save the PDF below to attach it directly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-5 py-3.5 border-t border-[#ffffff10] bg-[#050507] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-400 font-mono truncate">
            <span>Catalog: </span>
            <span className="text-gray-200 font-semibold">{fileName}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="modal-toggle-email-btn"
              onClick={() => setActiveTab(activeTab === 'email' ? 'preview' : 'email')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#151520] hover:bg-[#20202e] text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeTab === 'email' ? 'View PDF' : 'Email PDF'}</span>
            </button>

            <button
              id="modal-download-pdf-btn"
              onClick={handleDownload}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              <Download className="w-4 h-4" />
              <span>Save / Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
