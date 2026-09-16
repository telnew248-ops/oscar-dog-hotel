/**
 * Dynamic Date Utilities for Oscar Dog Hotel
 * All date calculations derive from the actual live system/device date (never hardcoded).
 */

/**
 * Returns today's date in 'YYYY-MM-DD' format using device local time.
 * Avoids UTC timezone day-shifting errors.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add or subtract days from a YYYY-MM-DD date string.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setDate(target.getDate() + days);

  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Compare two 'YYYY-MM-DD' date strings.
 * Returns < 0 if d1 < d2 (d1 is in the past relative to d2)
 * Returns 0 if d1 == d2
 * Returns > 0 if d1 > d2 (d1 is in the future relative to d2)
 */
export function compareDateStrings(d1: string, d2: string): number {
  if (d1 === d2) return 0;
  return d1 < d2 ? -1 : 1;
}

/**
 * Format a YYYY-MM-DD date string into a friendly display title.
 * e.g. "Today, Sep 16, 2026" or "Tomorrow, Sep 17, 2026" or "Sep 18, 2026".
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = getTodayDateString();
  const tomorrowStr = addDaysToDateString(todayStr, 1);
  const yesterdayStr = addDaysToDateString(todayStr, -1);

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  if (isNaN(dateObj.getTime())) return dateStr;

  const formattedMonthDayYear = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (dateStr === todayStr) {
    return `Today, ${formattedMonthDayYear}`;
  }
  if (dateStr === tomorrowStr) {
    return `Tomorrow, ${formattedMonthDayYear}`;
  }
  if (dateStr === yesterdayStr) {
    return `Yesterday, ${formattedMonthDayYear}`;
  }

  return formattedMonthDayYear;
}

/**
 * Extracts standard YYYY-MM-DD string from an ISO string, Date object, or date string.
 */
export function toDateString(input?: string | Date | null): string {
  if (!input) return getTodayDateString();
  if (input instanceof Date) {
    const year = input.getFullYear();
    const month = String(input.getMonth() + 1).padStart(2, '0');
    const day = String(input.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof input === 'string') {
    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return input;
    }
    // If in ISO format (YYYY-MM-DDTHH:mm:ss...)
    if (input.includes('T')) {
      return input.split('T')[0];
    }
    // Try parsing Date
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  return getTodayDateString();
}
