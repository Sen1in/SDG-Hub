/**
 * Unit tests for unified ranking sorting utility
 */

import { sortCombined, hasAward, getYear, mergeAndSortResults } from '../sort';

describe('Unified Ranking Sort', () => {
  const testItems = [
    {
      id: 'action-1',
      title: 'B Action with Award',
      award: 1,
      year: 2020,
      type: 'action'
    },
    {
      id: 'education-1', 
      title: 'A Education Resource',
      year: 2024,
      type: 'education'
    },
    {
      id: 'action-2',
      title: 'C Action No Award',
      award: 0,
      year: 2023,
      type: 'action'
    },
    {
      id: 'action-3',
      title: 'A Action with Award',
      award: 1,
      year: 2023,
      type: 'action'
    }
  ];

  describe('sortCombined', () => {
    it('should sort by has_award DESC → year DESC → title ASC', () => {
      const sorted = sortCombined(testItems);
      
      // Expected order:
      // 1. A Action with Award (award=1, year=2023) - title A comes first
      // 2. B Action with Award (award=1, year=2020) - title B comes second  
      // 3. A Education Resource (award=0, year=2024) - newer year first among non-awards
      // 4. C Action No Award (award=0, year=2023) - older year last
      
      expect(sorted[0].id).toBe('action-3'); // A Action with Award
      expect(sorted[1].id).toBe('action-1'); // B Action with Award  
      expect(sorted[2].id).toBe('education-1'); // A Education Resource
      expect(sorted[3].id).toBe('action-2'); // C Action No Award
    });

    it('should handle missing fields gracefully', () => {
      const itemsWithMissingFields = [
        { title: 'Z Item' }, // no award, no year
        { title: 'A Item', has_award: true }, // has award, no year
        { title: 'M Item', year: 2022 } // no award, has year
      ];

      const sorted = sortCombined(itemsWithMissingFields);
      
      expect(sorted[0].title).toBe('A Item'); // has award first
      expect(sorted[1].title).toBe('M Item'); // has year second  
      expect(sorted[2].title).toBe('Z Item'); // neither award nor year last
    });

    it('should handle different award field formats', () => {
      const itemsWithDifferentAwardFormats = [
        { title: 'A', has_award: true },
        { title: 'B', awards_count: 2 },
        { title: 'C', award: 1 },
        { title: 'D', awards: ['award1', 'award2'] },
        { title: 'E' } // no award
      ];

      const sorted = sortCombined(itemsWithDifferentAwardFormats);
      
      // All awarded items should come before non-awarded
      expect(hasAward(sorted[0])).toBe(true);
      expect(hasAward(sorted[1])).toBe(true);
      expect(hasAward(sorted[2])).toBe(true);
      expect(hasAward(sorted[3])).toBe(true);
      expect(hasAward(sorted[4])).toBe(false);
    });

    it('should sort titles case-insensitively', () => {
      const itemsWithCaseDifferences = [
        { title: 'zebra item' },
        { title: 'Apple item' },
        { title: 'Banana item' }
      ];

      const sorted = sortCombined(itemsWithCaseDifferences);
      
      expect(sorted[0].title).toBe('Apple item');
      expect(sorted[1].title).toBe('Banana item');
      expect(sorted[2].title).toBe('zebra item');
    });
  });

  describe('hasAward', () => {
    it('should detect awards from has_award boolean', () => {
      expect(hasAward({ has_award: true })).toBe(true);
      expect(hasAward({ has_award: false })).toBe(false);
    });

    it('should detect awards from awards_count number', () => {
      expect(hasAward({ awards_count: 1 })).toBe(true);
      expect(hasAward({ awards_count: 0 })).toBe(false);
    });

    it('should detect awards from award field', () => {
      expect(hasAward({ award: 1 })).toBe(true);
      expect(hasAward({ award: 0 })).toBe(false);
      expect(hasAward({ award: '1' })).toBe(true);
    });

    it('should detect awards from awards array', () => {
      expect(hasAward({ awards: ['award1'] })).toBe(true);
      expect(hasAward({ awards: [] })).toBe(false);
    });
  });

  describe('getYear', () => {
    it('should extract year from year field', () => {
      expect(getYear({ year: 2024 })).toBe(2024);
      expect(getYear({ year: '2023' })).toBe(2023);
    });

    it('should extract year from published_year field', () => {
      expect(getYear({ published_year: 2022 })).toBe(2022);
    });

    it('should extract year from date fields', () => {
      expect(getYear({ published_at: '2024-01-15' })).toBe(2024);
      expect(getYear({ date: '2023-12-31T23:59:59Z' })).toBe(2023);
    });

    it('should return 0 for invalid or missing year', () => {
      expect(getYear({})).toBe(0);
      expect(getYear({ year: 'invalid' })).toBe(0);
      expect(getYear({ date: 'not-a-date' })).toBe(0);
    });
  });

  describe('mergeAndSortResults', () => {
    it('should merge multiple result arrays and sort them', () => {
      const results1 = [
        { title: 'Z Item', year: 2020 }
      ];
      const results2 = [
        { title: 'A Item', award: 1, year: 2019 },
        { title: 'B Item', year: 2024 }
      ];

      const merged = mergeAndSortResults(results1, results2);
      
      expect(merged).toHaveLength(3);
      expect(merged[0].title).toBe('A Item'); // has award
      expect(merged[1].title).toBe('B Item'); // newer year
      expect(merged[2].title).toBe('Z Item'); // older year
    });
  });
});
