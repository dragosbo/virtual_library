import React, { useState } from 'react';
import { X, FileDown, BookOpen, Sparkles, Video, HelpCircle, CheckCircle2, ChevronRight, Layers, LayoutGrid, Search, ExternalLink, Library, ShieldCheck, Compass, Eye } from 'lucide-react';
import { exportHelpManualToPdf } from '../utils/exportHelpPdf';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideoScope?: () => void;
  onSelectImaginaryScope?: () => void;
  onOpenPdfManual?: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onSelectVideoScope,
  onSelectImaginaryScope,
  onOpenPdfManual,
}) => {
  const [activeTab, setActiveTab] = useState<'creation' | 'distinguish' | 'capabilities'>('creation');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      exportHelpManualToPdf();
    } catch (e) {
      console.error('Failed to export help manual PDF', e);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0c0c14] border border-[#ffffff18] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden text-gray-200 font-sans">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#ffffff10] bg-[#08080d] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
                  BookShelf AI — Complete User Manual & Blueprint
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  v3.2 Guide
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Step-by-step construction history, book distinction guide, and comprehensive operation manual
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPdfManual && (
              <button
                id="view-help-manual-pdf-format-btn"
                onClick={() => {
                  onClose();
                  onOpenPdfManual();
                }}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(37,99,235,0.3)] flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Display manual in authentic PDF format on screen"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">View in PDF Format</span>
                <span className="sm:hidden">View PDF</span>
              </button>
            )}

            {/* Download PDF Button */}
            <button
              id="download-help-manual-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-lg bg-[#151522] hover:bg-[#202035] text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
              title="Download this complete guide as a high-resolution PDF document"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{isExporting ? 'Generating...' : 'Save .PDF'}</span>
              <span className="sm:hidden">Save</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#ffffff10] bg-[#07070b] px-6 gap-2 overflow-x-auto">
          <button
            id="tab-how-app-was-created"
            onClick={() => setActiveTab('creation')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'creation'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>1. How This App Was Created</span>
          </button>

          <button
            id="tab-how-to-distinguish"
            onClick={() => setActiveTab('distinguish')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'distinguish'
                ? 'border-blue-400 text-blue-300 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>2. Video vs. Imaginary Distinction</span>
          </button>

          <button
            id="tab-capabilities-guide"
            onClick={() => setActiveTab('capabilities')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'capabilities'
                ? 'border-emerald-400 text-emerald-300 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>3. Navigation & All Capabilities</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* TAB 1: HOW THIS APP WAS CREATED */}
          {activeTab === 'creation' && (
            <div className="space-y-6">
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 sm:p-5">
                <h3 className="text-base font-serif font-bold text-amber-200 flex items-center gap-2">
                  <span>✨</span> Architectural Evolution & Step-by-Step Prompt Execution
                </h3>
                <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                  Every feature, shelf restructuring, and data model in this application was developed iteratively in response to your explicit user instructions. Here is the chronological implementation roadmap:
                </p>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#11111a] border border-[#ffffff10] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                      STAGE 1: VIDEO SCAN DETECTION
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">Foundational Prompt</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Physical Bookstore Video Analysis</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    The user requested an interactive application that detects, catalogs, and displays every book visible in physical bookstore footage. We extracted 50 distinct titles across initial shelves, retrieving high-resolution cover art, exact author names, ISBN-10, ISBN-13, and orientative market prices.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#11111a] border border-[#ffffff10] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                      STAGE 2: VIDEO URL CORRECTION
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">User Correction</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Eliminating the Despacito Music Link</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    The user noted: <em className="text-amber-300">"The link to video points to despacito song. If I post the video on YouTube in one of my channels and give you the address will you be able to link it properly."</em>
                    We built an automated YouTube parsing engine supporting YouTube Shorts, standard video links, and embed IDs, enabling seamless playback and live updates stored in local storage.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#11111a] border border-[#ffffff10] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                      STAGE 3: 5–6 BOOKS PER SHELF WITH FRONT COVERS
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">Layout Refinement</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Expanding to 9 Spacious Video Bays</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    The user instructed: <em className="text-amber-300">"Make more shelves and display maximum 5 or 6 books per shelve with the front cover so that we can recognize the books. For example the top 2 shelves are perfect. Do similar arrangement for the rest."</em>
                    We converted all 50 books to face-out front covers (<code className="text-blue-300">isFaceOut: true</code>) and re-partitioned the collection into 9 distinct shelf bays (Bays 1 through 9) with 5 to 6 books per shelf, ensuring clear visual recognition.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#11111a] border border-[#ffffff10] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      STAGE 4: CURATED IMAGINARY SHELVES
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">Author Top-2 Curation</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Adding Author Top 2 Real-World Classics with ✨ Emoji</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    The user requested: <em className="text-amber-300">"Also create a list of imaginary shelves which for each author has his or her most popular 2 books. Signal with an nice emoji that these books exist but were not in the original video and they were added based on the guidance above."</em>
                    We synthesized 36 acclaimed real-world books for 18 featured authors across 6 new imaginary shelves, each marked with the ✨ emoji and explicit "NOT IN VIDEO" labels.
                  </p>
                </div>

                {/* Step 5 */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#11111a] border border-[#ffffff10] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      STAGE 5: USER'S LIVE FOOTAGE INTEGRATION
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">Video Link Fulfillment</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Integration of User YouTube Short</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    The user provided the official video link: <code className="text-red-300">https://youtube.com/shorts/uY5M9m1UB5k</code>.
                    This URL was integrated as the default source for the header link, the bottom Live HUD bar, and the interactive Video Inspector modal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DISTINGUISHING VIDEO VS. IMAGINARY BOOKS */}
          {activeTab === 'distinguish' && (
            <div className="space-y-6">
              <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4 sm:p-5">
                <h3 className="text-base font-serif font-bold text-blue-200 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  Instant Visual Distinction: How to Tell Books Apart at a Glance
                </h3>
                <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                  Every book in the library clearly discloses whether it was detected in your physical video footage or added as a curated imaginary author classic.
                </p>
              </div>

              {/* Side-by-side Visual Card Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Video Book Card Guide */}
                <div className="p-5 rounded-xl bg-[#0e121e] border border-blue-500/40 space-y-3 shadow-lg relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-blue-600/30 text-blue-300 border border-blue-400/40 text-[10px] font-mono font-bold flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-blue-400" />
                      ORIGINAL VIDEO BOOK
                    </span>
                    <span className="text-xs font-mono text-gray-400">50 Total Titles</span>
                  </div>

                  <h4 className="text-sm font-bold text-white">Books Detected in Physical Footage</h4>
                  <ul className="text-xs text-gray-300 space-y-2 list-disc pl-4">
                    <li>
                      <strong className="text-blue-300">Cover Badge:</strong> Displays a dark blue/black pill showing <code className="text-blue-300 font-mono">00:04 SCAN</code> (exact timestamp in video).
                    </li>
                    <li>
                      <strong className="text-blue-300">Shelf Placement:</strong> Grouped on shelves titled <em>"Shelf Bay 1"</em> through <em>"Shelf Bay 9"</em>.
                    </li>
                    <li>
                      <strong className="text-blue-300">Side Dossier:</strong> Status reads <span className="text-blue-300">"FRAME 00:04 • ORIGINAL SCAN"</span>.
                    </li>
                    <li>
                      <strong className="text-blue-300">Border Highlight:</strong> Framed by cool slate and blue accent highlights.
                    </li>
                  </ul>

                  {onSelectVideoScope && (
                    <button
                      onClick={() => {
                        onSelectVideoScope();
                        onClose();
                      }}
                      className="w-full mt-2 py-2 px-3 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5 text-blue-400" />
                      <span>View Video Books Only (50 titles)</span>
                    </button>
                  )}
                </div>

                {/* Imaginary Book Card Guide */}
                <div className="p-5 rounded-xl bg-[#1a140d] border border-amber-500/50 space-y-3 shadow-lg relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-amber-400 text-stone-950 font-sans text-[10px] font-bold flex items-center gap-1.5 shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
                      <span>✨</span>
                      NOT IN VIDEO
                    </span>
                    <span className="text-xs font-mono text-amber-300">36 Curated Classics</span>
                  </div>

                  <h4 className="text-sm font-bold text-white">Curated Author Top-2 Books</h4>
                  <ul className="text-xs text-gray-300 space-y-2 list-disc pl-4">
                    <li>
                      <strong className="text-amber-300">Gold Top Badge:</strong> Every cover displays a prominent golden pill marked <code className="text-amber-300 font-mono">✨ NOT IN VIDEO</code>.
                    </li>
                    <li>
                      <strong className="text-amber-300">Author Rank Tag:</strong> Displays <code className="text-purple-300 font-mono">Top #1</code> or <code className="text-purple-300 font-mono">Top #2</code> on the upper-right corner.
                    </li>
                    <li>
                      <strong className="text-amber-300">Shelf Placement:</strong> Grouped on shelves titled <em>"✨ Imaginary Shelf 1"</em> through <em>"✨ Imaginary Shelf 6"</em>.
                    </li>
                    <li>
                      <strong className="text-amber-300">Side Dossier Banner:</strong> Contains an alert box explaining: <em>"Curated as one of the 2 most popular books by [Author]. Added based on user guidance."</em>
                    </li>
                  </ul>

                  {onSelectImaginaryScope && (
                    <button
                      onClick={() => {
                        onSelectImaginaryScope();
                        onClose();
                      }}
                      className="w-full mt-2 py-2 px-3 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Imaginary Shelves Only (36 titles)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Summary Matrix */}
              <div className="overflow-x-auto rounded-xl border border-[#ffffff10]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#12121c] text-gray-300 font-mono uppercase text-[10px] border-b border-[#ffffff10]">
                    <tr>
                      <th className="py-2.5 px-3">Indicator</th>
                      <th className="py-2.5 px-3 text-blue-300">Video Scanned Book</th>
                      <th className="py-2.5 px-3 text-amber-300">Imaginary Curated Book</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ffffff08] bg-[#08080e] text-gray-300">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Cover Badge</td>
                      <td className="py-2.5 px-3 font-mono text-blue-300">00:04 SCAN (blue)</td>
                      <td className="py-2.5 px-3 font-mono text-amber-300">✨ NOT IN VIDEO (gold)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Author Ranking</td>
                      <td className="py-2.5 px-3 text-gray-500">— (Video footage scan)</td>
                      <td className="py-2.5 px-3 text-purple-300 font-mono">Top #1 or Top #2 badge</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Existed in Video?</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">YES (Visible in footage)</td>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">NO (Curated real classic)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Filter Bar Pill</td>
                      <td className="py-2.5 px-3">"Video Shelves" toggle</td>
                      <td className="py-2.5 px-3">"✨ Imaginary Shelves" toggle</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NAVIGATION, CAPABILITIES & USE CASES */}
          {activeTab === 'capabilities' && (
            <div className="space-y-6">
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 sm:p-5">
                <h3 className="text-base font-serif font-bold text-emerald-200 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  Navigation, Operational Use Cases & All Capabilities
                </h3>
                <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                  The application is packed with professional exploration tools, real-time video synchronization, AI book dossiers, and multi-format document exporting.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Feature 1 */}
                <div className="p-4 rounded-xl bg-[#111118] border border-[#ffffff10] space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider font-mono">
                    <Layers className="w-4 h-4" />
                    <span>1. Shelves vs. Grid Modes</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Toggle between the architectural 3D wooden bookshelf view and the high-density grid catalog using the buttons in the upper right header.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-4 rounded-xl bg-[#111118] border border-[#ffffff10] space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono">
                    <Library className="w-4 h-4" />
                    <span>2. Collection Scopes</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Switch between <strong>All Shelves (86 books)</strong>, <strong>Video Shelves (50 books)</strong>, and <strong>✨ Imaginary Shelves (36 books)</strong> at the top of the filter bar.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-4 rounded-xl bg-[#111118] border border-[#ffffff10] space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">
                    <Search className="w-4 h-4" />
                    <span>3. Search & Author Spotlight</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Filter by author name (e.g. Haruki Murakami, Margaret Atwood) or search by title, author, ISBN-10, ISBN-13, and summary text simultaneously.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-4 rounded-xl bg-[#111118] border border-[#ffffff10] space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                    <FileDown className="w-4 h-4" />
                    <span>4. PDF Catalog Generation</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Click <strong>"PDF Catalog"</strong> to view and download a comprehensive table of all books with estimated prices, publication years, ISBNs, and portfolio summaries.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="p-4 rounded-xl bg-[#111118] border border-[#ffffff10] space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider font-mono">
                    <Video className="w-4 h-4" />
                    <span>5. Live Video HUD & Editing</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Watch the bookstore footage directly inside the app, or change the URL anytime (e.g. YouTube shorts, videos, or channel links) with automatic persistence.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="p-4 rounded-xl bg-[#111118] border border-[#ffffff10] space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider font-mono">
                    <ExternalLink className="w-4 h-4" />
                    <span>6. Amazon Lookup & Pricing</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Every book has verified Amazon identifiers and direct links so you can inspect prices, user reviews, and product specifications.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#ffffff10] bg-[#07070b] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2">
            <span>Official AI Studio Documentation</span>
            <span>•</span>
            <span className="text-amber-400">86 Total Books (50 Video + 36 Imaginary)</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating PDF...' : 'Download Help Manual (PDF)'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#15151e] hover:bg-[#20202a] text-gray-300 hover:text-white text-xs font-mono uppercase tracking-wider border border-[#ffffff10] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
