import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportHelpManualToPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Helper for footer on every page
  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `BookShelf Video AI — User Manual & Architecture Blueprint  |  Page ${pageNum} of ${totalPages}`,
      margin,
      pageHeight - 8
    );
  };

  // --- PAGE 1: COVER & OVERVIEW ---
  // Top Header Banner
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Decorative Accent
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 42, pageWidth, 2, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('BOOKSHELF VIDEO AI — USER MANUAL & BLUEPRINT', margin, 18);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text('Complete Architectural History, Prompt Evolution & Operational Guide', margin, 26);

  doc.setFontSize(8.5);
  doc.setTextColor(245, 158, 11);
  doc.text(`Official Documentation  •  Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 34);

  // Executive Summary Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, 52, pageWidth - margin * 2, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 52, pageWidth - margin * 2, 28, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE OVERVIEW', margin + 4, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const summaryText =
    'BookShelf Video AI transforms physical bookstore video footage into a high-precision, interactive virtual library. ' +
    'The system catalogs books recognized in the video, enriches each title with cover art, ISBNs, and pricing, and expands ' +
    'into curated imaginary shelves spotlighting the 2 most celebrated works for each author.';
  doc.text(doc.splitTextToSize(summaryText, pageWidth - margin * 2 - 8), margin + 4, 67);

  // SECTION 1: HOW THIS APP WAS CREATED
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('1. HOW THIS APP WAS CREATED (STEP-BY-STEP EVOLUTION)', margin, 90);

  const creationSteps = [
    [
      'Step 1',
      'Video Scan & Detection Initial Prototype',
      'In response to the original bookstore scan request, an AI-assisted detection pipeline cataloged 50 physical books across 4 initial shelves, capturing titles, authors, ISBNs, estimated market pricing, and video timestamps.'
    ],
    [
      'Step 2',
      'Spine Recognition & Immersive UI',
      'Engineered realistic wooden bookshelf rendering (Walnut, Oak, Mahogany, Pine) with book spines, hover dossiers, and Amazon cover image resolution.'
    ],
    [
      'Step 3',
      'Resolving the Video Stream (Despacito Replacement)',
      'The user noted the link pointed to Despacito. We architected a dynamic YouTube integration with URL validation (supporting regular URLs, shorts, and embed IDs), allowing the user to connect their own footage.'
    ],
    [
      'Step 4',
      'Front Cover Layout & Density (5-6 Books/Shelf)',
      'The user requested: "Make more shelves and display maximum 5 or 6 books per shelve with the front cover so that we can recognize the books. For example the top 2 shelves are perfect." Re-partitioned into 9 spacious video bays, setting all 50 books to face-out.'
    ],
    [
      'Step 5',
      'Imaginary Shelves Creation (Top 2 Books per Author)',
      'Per user prompt: "Create a list of imaginary shelves which for each author has his or her most popular 2 books. Signal with a nice emoji that these books exist but were not in the original video." Curated 36 real published classics across 6 shelves with ✨ emoji badges.'
    ],
    [
      'Step 6',
      'Personal Video Stream Integration',
      'Integrated the user’s YouTube short (https://youtube.com/shorts/uY5M9m1UB5k) as the primary footage source, synchronizing playback and HUD telemetry.'
    ],
  ];

  autoTable(doc, {
    startY: 96,
    head: [['Stage', 'Milestone', 'Implementation Details Based on User Guidance']],
    body: creationSteps,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8.5 },
    bodyStyles: { fontSize: 7.8, cellPadding: 2.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 46, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
  });

  // --- PAGE 2: DISTINGUISHING BOOKS & DETAILED USER GUIDE ---
  doc.addPage();

  // Top Header Banner Page 2
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 24, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('2. HOW TO DISTINGUISH ORIGINAL VIDEO BOOKS VS. IMAGINARY BOOKS', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Visual markers, color codes, and catalog tags designed for immediate detection', margin, 20);

  // Distinction Table
  const distinctionData = [
    [
      'Visual Marker',
      'Original Video Book (50 Titles)',
      'Curated Imaginary Book (36 Titles)'
    ],
    [
      'Top Cover Badge',
      'Blue Pill: "VIDEO SCAN [00:04]" with video camera icon',
      'Gold / Amber Pill: "✨ NOT IN VIDEO"'
    ],
    [
      'Author Rank Tag',
      'None (Detected directly from shelf footage)',
      'Purple Pill: "Top #1" or "Top #2" of author works'
    ],
    [
      'Shelf Assignment',
      'Shelves titled "Shelf Bay 1" to "Shelf Bay 9"',
      'Shelves titled "✨ Imaginary Shelf 1" to "✨ Imaginary Shelf 6"'
    ],
    [
      'Cover Border Rim',
      'Cool Slate / Blue rim border',
      'Warm Gold / Amber rim border with glowing accent'
    ],
    [
      'Side Dossier Status',
      'Timestamp: Frame timestamp (e.g. 00:04)',
      'Curation Banner: "✨ Not in Video • Author Top 2 Selection"'
    ],
    [
      'Scope Filter',
      'Visible under "All Shelves" or "Video Shelves"',
      'Visible under "All Shelves" or "✨ Imaginary Shelves"'
    ],
  ];

  autoTable(doc, {
    startY: 32,
    head: [distinctionData[0]],
    body: distinctionData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8.5 },
    bodyStyles: { fontSize: 8, cellPadding: 2.8, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 36, fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 'auto' },
    },
  });

  // SECTION 3: NAVIGATION, CAPABILITIES & USE CASES
  let currentY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('3. NAVIGATION, CAPABILITIES & USE CASES', margin, currentY);

  const capabilities = [
    [
      '1. Scope Switching',
      'Collection View Toggle',
      'Toggle between "All Shelves (86 books)", "Video Shelves (9 bays • 50 books)", and "✨ Imaginary Shelves (6 shelves • 36 books)" with a single click in the top filter bar.'
    ],
    [
      '2. Author Spotlight',
      'Instant Author Filtering',
      'Select any author from the dropdown (e.g., Haruki Murakami, Margaret Atwood, James Joyce) to immediately display their top works side-by-side.'
    ],
    [
      '3. Search & Keywords',
      'Multi-field Search Bar',
      'Type any keyword to search across book titles, author names, ISBN-10, ISBN-13, and synopsis summaries in real time.'
    ],
    [
      '4. Shelf Wood Finishes',
      'Architectural Customizer',
      'Switch between Rich Walnut, Classic Oak, Deep Mahogany, and Natural Pine textures to customize the bookshelf appearance.'
    ],
    [
      '5. Book Dossier & AI Chat',
      'In-Depth Literary Analysis',
      'Click any book or click "Full Dossier & AI Chat" to open detailed synopsis, key themes, publication details, and an interactive literary assistant.'
    ],
    [
      '6. Video Sync & Editing',
      'Custom YouTube Support',
      'Click the video HUD or "Stream / Edit" in the header to change the YouTube link at any time (shorts, full videos, or IDs).'
    ],
    [
      '7. Multi-Format Export',
      'PDF & JSON Data Portability',
      'Download formal PDF catalogs of all books (with prices, ISBNs, and years), export raw JSON datasets, or download this complete User Manual PDF.'
    ],
  ];

  autoTable(doc, {
    startY: currentY + 5,
    head: [['#', 'Feature / Module', 'How to Use & Capability Description']],
    body: capabilities,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8.5 },
    bodyStyles: { fontSize: 7.8, cellPadding: 2.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 46, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
  });

  // Footer for pages
  addFooter(1, 2);
  doc.setPage(2);
  addFooter(2, 2);

  // Save / download
  doc.save('BookShelf-AI-User-Manual-and-Blueprint.pdf');
}
