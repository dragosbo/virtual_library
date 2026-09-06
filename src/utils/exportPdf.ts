import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Book } from '../types';

export interface PdfBuildResult {
  doc: jsPDF;
  totalValue: number;
  avgPrice: string;
  fileName: string;
}

export function buildPdfDocument(
  books: Book[],
  options?: { title?: string; subtitle?: string }
): PdfBuildResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Banner Background
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Decorative Accent Line
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 38, pageWidth, 1.5, 'F');

  // App / Brand Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('BOOKSHELF VIDEO AI — DETECTED BOOKS CATALOG', 14, 15);

  // Subtitle / Scope
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  const subtitleText = options?.subtitle || 'Audit of titles detected from video footage, with author, publication year & orientative price';
  doc.text(subtitleText, 14, 22);

  // Date and Meta info
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalValue = books.reduce((sum, b) => sum + (b.estimatedPrice || 0), 0);
  const avgPrice = books.length > 0 ? (totalValue / books.length).toFixed(2) : '0.00';

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated: ${dateStr}  |  Titles: ${books.length}  |  Est. Portfolio Value: $${totalValue.toFixed(2)}  |  Avg: $${avgPrice}`,
    14,
    30
  );

  // Prepare table data
  const tableData = books.map((book, index) => [
    (index + 1).toString(),
    book.title,
    book.author,
    book.publicationYear ? book.publicationYear.toString() : '—',
    `$${(book.estimatedPrice || 18.99).toFixed(2)}`,
    book.isbn13 || '—',
    book.shelfLabel ? book.shelfLabel.split('•')[0].trim() : 'Bookshelf',
  ]);

  // Generate Table using autoTable
  autoTable(doc, {
    startY: 45,
    head: [['#', 'Book Title', 'Author', 'Year', 'Est. Price', 'ISBN-13', 'Shelf Area']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 42 },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 20, halign: 'right', fontStyle: 'bold', textColor: [37, 99, 235] },
      5: { cellWidth: 28, font: 'courier', fontSize: 7.5 },
      6: { cellWidth: 24, fontSize: 7.5, textColor: [100, 116, 139] },
    },
    margin: { left: 14, right: 14, bottom: 20 },
    didDrawPage: (data) => {
      // Page Number Footer
      const totalPages = typeof (doc as any).getNumberOfPages === 'function'
        ? (doc as any).getNumberOfPages()
        : (doc as any).internal?.pages?.length || 1;
      const currentPage = data.pageNumber;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);

      // Line above footer
      doc.setDrawColor(226, 232, 240);
      doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

      doc.text(
        'BookShelf Video AI • Processed Bookstore Video Scan • Verified ISBNs & Orientative Pricing',
        14,
        pageHeight - 7
      );

      const pageStr = `Page ${currentPage}`;
      doc.text(pageStr, pageWidth - 14 - doc.getTextWidth(pageStr), pageHeight - 7);
    },
  });

  const fileName = `bookshelf-detected-catalog-${books.length}-titles.pdf`;
  return { doc, totalValue, avgPrice, fileName };
}

export function generatePdfBlob(
  books: Book[],
  options?: { title?: string; subtitle?: string }
): { blob: Blob; blobUrl: string; fileName: string; doc: jsPDF; totalValue: number; avgPrice: string } {
  const result = buildPdfDocument(books, options);
  const blob = result.doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  return {
    blob,
    blobUrl,
    fileName: result.fileName,
    doc: result.doc,
    totalValue: result.totalValue,
    avgPrice: result.avgPrice,
  };
}

export function exportBooksToPdf(books: Book[], options?: { title?: string; subtitle?: string }) {
  const { doc, fileName } = buildPdfDocument(books, options);
  doc.save(fileName);
}

export function generateCatalogSummaryText(books: Book[]): string {
  const totalPrice = books.reduce((sum, b) => sum + (b.estimatedPrice || 0), 0);
  const avgPrice = books.length > 0 ? (totalPrice / books.length).toFixed(2) : '0.00';
  
  let text = `BOOKSHELF AI — DETECTED BOOKS CATALOG\n`;
  text += `==============================================\n`;
  text += `Total Titles Detected: ${books.length}\n`;
  text += `Estimated Portfolio Value: $${totalPrice.toFixed(2)} (Avg: $${avgPrice} / book)\n`;
  text += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  text += `BOOK LIST:\n`;
  text += `----------------------------------------------\n`;

  books.forEach((b, i) => {
    text += `${i + 1}. "${b.title}" by ${b.author}\n`;
    text += `   • Year: ${b.publicationYear || 'N/A'} | Orientative Price: $${(b.estimatedPrice || 18.99).toFixed(2)}\n`;
    text += `   • ISBN-13: ${b.isbn13} | ISBN-10: ${b.isbn10}\n`;
    text += `   • Location: ${b.shelfLabel}\n`;
    if (b.amazonUrl) text += `   • Amazon: ${b.amazonUrl}\n`;
    text += `\n`;
  });

  return text;
}
