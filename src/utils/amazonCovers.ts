/**
 * Amazon Book Cover and Product Utilities
 */

export function getAmazonCoverUrl(isbn10: string): string {
  const cleanIsbn10 = isbn10.replace(/[^0-9X]/gi, '');
  return `https://images-na.ssl-images-amazon.com/images/P/${cleanIsbn10}.01._SX400_.jpg`;
}

export function getOpenLibraryCoverUrl(isbn13: string): string {
  const cleanIsbn13 = isbn13.replace(/[^0-9]/g, '');
  return `https://covers.openlibrary.org/b/isbn/${cleanIsbn13}-M.jpg`;
}

export function getAmazonProductUrl(isbn10: string, title?: string): string {
  const cleanIsbn10 = isbn10.replace(/[^0-9X]/gi, '');
  if (cleanIsbn10) {
    return `https://www.amazon.com/dp/${cleanIsbn10}`;
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(title || '')}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}
