/**
 * Unified ranking utility for combined search results
 * Implements: has_award DESC → year DESC → title ASC (case-insensitive)
 */

export type CombinedItem = {
  title?: string;
  year?: number | string;
  published_year?: number | string;
  published_at?: string;
  date?: string;
  has_award?: boolean;
  awards_count?: number;
  award?: number | string;
  awards?: Array<any>;
  // ...other fields
  [key: string]: any;
};

/**
 * Normalize award information from various field formats
 */
function normalizeAward(item: CombinedItem): number {
  // Check has_award boolean first
  if (typeof item.has_award === 'boolean') {
    return item.has_award ? 1 : 0;
  }
  
  // Check awards_count number
  if (typeof item.awards_count === 'number') {
    return item.awards_count > 0 ? 1 : 0;
  }
  
  // Check award field (from ActionDb model)
  if (item.award != null) {
    const awardValue = Number(item.award);
    return !isNaN(awardValue) && awardValue > 0 ? 1 : 0;
  }
  
  // Check awards array
  if (Array.isArray(item.awards)) {
    return item.awards.length > 0 ? 1 : 0;
  }
  
  // Default: no award
  return 0;
}

/**
 * Normalize year information from various field formats
 */
function normalizeYear(item: CombinedItem): number {
  // Check year field first
  const year = item.year ?? item.published_year;
  if (year != null && year !== '') {
    const yearNum = Number(year);
    return !isNaN(yearNum) ? yearNum : 0;
  }
  
  // Check date fields and extract year
  const dateStr = item.published_at ?? item.date;
  if (dateStr) {
    const yearFromDate = Number(String(dateStr).slice(0, 4));
    return !isNaN(yearFromDate) ? yearFromDate : 0;
  }
  
  // Default: no year
  return 0;
}

/**
 * Normalize title for case-insensitive sorting
 */
function normalizeTitle(item: CombinedItem): string {
  return (item.title ?? '').trim();
}

/**
 * Sort combined search results using unified ranking
 * Priority: has_award DESC → year DESC → title ASC
 */
export function sortCombined(items: CombinedItem[]): CombinedItem[] {
  return [...items].sort((a, b) => {
    // 1. has_award DESC (awarded items first)
    const aAward = normalizeAward(a);
    const bAward = normalizeAward(b);
    if (aAward !== bAward) {
      return bAward - aAward; // desc: 1 before 0
    }

    // 2. year DESC (newer first)
    const aYear = normalizeYear(a);
    const bYear = normalizeYear(b);
    if (aYear !== bYear) {
      return bYear - aYear; // desc: 2024 before 2019
    }

    // 3. title ASC (case-insensitive alphabetical)
    const aTitle = normalizeTitle(a);
    const bTitle = normalizeTitle(b);
    return aTitle.localeCompare(bTitle, 'en', { 
      sensitivity: 'base',  // case-insensitive
      numeric: true         // handle numbers in titles correctly
    });
  });
}

/**
 * Merge and sort results from multiple sources
 * Useful when combining results from different APIs
 */
export function mergeAndSortResults(...resultArrays: CombinedItem[][]): CombinedItem[] {
  const merged = resultArrays.flat();
  return sortCombined(merged);
}

/**
 * Check if an item has an award (utility function)
 */
export function hasAward(item: CombinedItem): boolean {
  return normalizeAward(item) > 0;
}

/**
 * Get the year of an item (utility function)
 */
export function getYear(item: CombinedItem): number {
  return normalizeYear(item);
}
