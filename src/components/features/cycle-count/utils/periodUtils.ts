/**
 * Utility functions for calculating cycle count periods
 */

/**
 * Calculates the period based on count type and date
 * - Annual: Returns the year (e.g., "2026")
 * - Biannual: Returns "1-YYYY" for first half (Jan-Jun) or "2-YYYY" for second half (Jul-Dec)
 * 
 * @param countType - The type of cycle count ('Annual', 'Biannual', 'Spot Check')
 * @param dateString - The date string (YYYY-MM-DD format or any parseable date)
 * @returns The calculated period string
 */
export function calculatePeriod(countType: 'Annual' | 'Biannual' | 'Spot Check', dateString: string): string {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    
    if (countType === 'Annual') {
      return year.toString();
    } else if (countType === 'Biannual') {
      // First half: January-June (months 1-6) = semester 1
      // Second half: July-December (months 7-12) = semester 2
      const semester = month <= 6 ? 1 : 2;
      return `${semester}-${year}`;
    } else {
      // Spot Check - no period needed, return empty string
      return '';
    }
  } catch (error) {
    console.error('Error calculating period:', error);
    return '';
  }
}
