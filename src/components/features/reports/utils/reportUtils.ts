/**
 * Utility functions for Reports module
 * Following Single Responsibility Principle - Utilities separated from components
 */

import { TabType } from '../types';

/**
 * Export report functionality
 * @param reportType - The type of report to export
 */
export const exportReport = (reportType: TabType): void => {
  console.log(`Exporting ${reportType} report...`);
  alert(`${reportType} report exported successfully!`);
};

/**
 * Format currency
 * @param value - The value to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format date
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString('en-US');
  }
  return date.toLocaleDateString('en-US');
};

/**
 * Check if a date is overdue
 * @param date - The date to check
 * @returns Whether the date is overdue
 */
export const isOverdue = (date: string): boolean => {
  return new Date(date) < new Date();
};

/**
 * Get badge variant based on frequency
 * @param frequency - The frequency value
 * @returns Badge variant
 */
export const getFrequencyBadgeVariant = (frequency: string): 'default' | 'destructive' | 'secondary' => {
  switch (frequency) {
    case 'Daily':
      return 'destructive';
    case 'Weekly':
      return 'default';
    case 'Monthly':
      return 'secondary';
    default:
      return 'default';
  }
};

/**
 * Get status badge variant
 * @param status - The status value
 * @returns Badge variant
 */
export const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'outline' => {
  switch (status) {
    case 'active':
      return 'default';
    case 'completed':
      return 'secondary';
    default:
      return 'outline';
  }
};

/**
 * Calculate percentage
 * @param value - The value
 * @param total - The total
 * @returns Percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Truncate text
 * @param text - The text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
