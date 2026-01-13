import type { Transaction } from './transactionTypes';

/**
 * Format date as "Oct 22, 2025 / 11:44 AM"
 */
export function formatTransactionDate(dateString: string): {
  line1: string;
  line2: string;
  fullDate: string;
} {
  const date = new Date(dateString);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  const line1 = `${month} ${day}, ${year}`;
  const line2 = `${hours}:${minutes} ${ampm}`;
  const fullDate = date.toLocaleString();

  return { line1, line2, fullDate };
}

/**
 * Format number with thousands separator and sign
 */
export function formatQuantityChange(quantity: number): {
  formatted: string;
  isPositive: boolean;
  displayText: string;
} {
  const isPositive = quantity >= 0;
  const absValue = Math.abs(quantity);
  const formatted = absValue.toLocaleString();
  const sign = isPositive ? '+' : '-';
  const displayText = `${sign}${formatted}`;

  return { formatted, isPositive, displayText };
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string | null, maxLength: number = 50): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Export transactions to CSV
 */
export function exportToCSV(transactions: Transaction[], filename: string = 'transactions.csv'): void {
  const headers = ['Date', 'Type', 'SubType', 'Item Name', 'SKU', 'Quantity', 'From', 'To', 'Notes'];

  const rows = transactions.map((t) => {
    const { line1, line2 } = formatTransactionDate(t.createdAt);
    const dateStr = `${line1} ${line2}`;
    const { displayText } = formatQuantityChange(t.quantityChange);

    return [
      dateStr,
      t.transactionType,
      t.subType,
      t.itemName,
      t.itemSku,
      displayText,
      t.fromBin || '-',
      t.toBin || '-',
      t.notes || '-',
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Sort transactions by date (newest first by default)
 */
export function sortTransactionsByDate(
  transactions: Transaction[],
  ascending: boolean = false
): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}
