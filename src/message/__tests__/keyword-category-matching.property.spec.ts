import * as fc from 'fast-check';
import { CategoryDetectorService } from '../services/category-detector.service';

/**
 * **Feature: whatsapp-lead-management, Property 5: Keyword Category Matching**
 * **Validates: Requirements 2.3**
 *
 * For any message containing category keywords, the system SHALL detect
 * and return the correct category based on keyword matching.
 */
describe('Property 5: Keyword Category Matching', () => {
  let categoryDetectorService: CategoryDetectorService;

  beforeEach(() => {
    // Create service with mock repository (we'll test the matchKeywords method directly)
    categoryDetectorService = new CategoryDetectorService(null as any);
  });

  // Arbitrary for valid keywords (alphanumeric words)
  const keywordArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{2,15}$/);

  // Arbitrary for keyword arrays
  const keywordsArb = fc.array(keywordArb, { minLength: 1, maxLength: 5 });

  it('should return positive score when content contains exact keyword match', () => {
    fc.assert(
      fc.property(
        keywordsArb,
        fc.string({ minLength: 0, maxLength: 50 }),
        (keywords, prefix) => {
          // Pick a random keyword to include in content
          const keyword = keywords[0];
          const content = `${prefix} ${keyword} some other text`.toLowerCase();

          const result = categoryDetectorService.matchKeywords(
            content,
            keywords,
          );

          // Should have positive score since keyword is in content
          expect(result.score).toBeGreaterThan(0);
          expect(result.matchedKeywords).toContain(keyword);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return zero score when content contains no keywords', () => {
    fc.assert(
      fc.property(keywordsArb, (keywords) => {
        // Create content that definitely doesn't contain any keywords
        const content = 'xyz123 abc456 def789';

        const result = categoryDetectorService.matchKeywords(content, keywords);

        // Should have zero score since no keywords match
        // Note: This might fail if generated keywords happen to match, so we filter
        const hasMatch = keywords.some((k) =>
          content.toLowerCase().includes(k.toLowerCase()),
        );

        if (!hasMatch) {
          expect(result.score).toBe(0);
          expect(result.matchedKeywords).toHaveLength(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('should give higher score for exact word boundary matches', () => {
    fc.assert(
      fc.property(keywordArb, (keyword) => {
        // Exact word match (with word boundaries)
        const exactContent = `hello ${keyword} world`.toLowerCase();
        // Partial match (keyword embedded in another word)
        const partialContent = `hello${keyword}world`.toLowerCase();

        const exactResult = categoryDetectorService.matchKeywords(
          exactContent,
          [keyword],
        );
        const partialResult = categoryDetectorService.matchKeywords(
          partialContent,
          [keyword],
        );

        // Exact match should have higher or equal score
        expect(exactResult.score).toBeGreaterThanOrEqual(partialResult.score);
      }),
      { numRuns: 100 },
    );
  });

  it('should accumulate score for multiple keyword matches', () => {
    fc.assert(
      fc.property(
        fc.array(keywordArb, { minLength: 2, maxLength: 5 }),
        (keywords) => {
          // Ensure unique keywords
          const uniqueKeywords = [...new Set(keywords)];
          if (uniqueKeywords.length < 2) return; // Skip if not enough unique keywords

          // Content with first keyword only
          const singleContent =
            `text ${uniqueKeywords[0]} more text`.toLowerCase();
          // Content with all keywords
          const allContent = uniqueKeywords
            .map((k) => `${k}`)
            .join(' ')
            .toLowerCase();

          const singleResult = categoryDetectorService.matchKeywords(
            singleContent,
            uniqueKeywords,
          );
          const allResult = categoryDetectorService.matchKeywords(
            allContent,
            uniqueKeywords,
          );

          // More matches should result in higher score
          expect(allResult.score).toBeGreaterThanOrEqual(singleResult.score);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should be case insensitive when matching keywords', () => {
    fc.assert(
      fc.property(keywordArb, (keyword) => {
        const lowerContent = `hello ${keyword.toLowerCase()} world`;
        const upperContent = `hello ${keyword.toUpperCase()} world`;
        const mixedContent = `hello ${keyword} world`;

        const lowerResult = categoryDetectorService.matchKeywords(
          lowerContent,
          [keyword],
        );
        const upperResult = categoryDetectorService.matchKeywords(
          upperContent,
          [keyword],
        );
        const mixedResult = categoryDetectorService.matchKeywords(
          mixedContent,
          [keyword],
        );

        // All should have the same score (case insensitive)
        expect(lowerResult.score).toBe(upperResult.score);
        expect(upperResult.score).toBe(mixedResult.score);
      }),
      { numRuns: 100 },
    );
  });

  it('should return empty result for empty keywords array', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 100 }), (content) => {
        const result = categoryDetectorService.matchKeywords(content, []);

        expect(result.score).toBe(0);
        expect(result.matchedKeywords).toHaveLength(0);
      }),
      { numRuns: 50 },
    );
  });

  it('should handle special characters in content gracefully', () => {
    fc.assert(
      fc.property(keywordArb, (keyword) => {
        // Content with special characters around keyword
        const content = `hello! ${keyword}? world... @#$%`;

        const result = categoryDetectorService.matchKeywords(
          content.toLowerCase(),
          [keyword],
        );

        // Should still match the keyword
        expect(result.score).toBeGreaterThan(0);
        expect(result.matchedKeywords).toContain(keyword);
      }),
      { numRuns: 100 },
    );
  });

  it('should track all matched keywords correctly', () => {
    fc.assert(
      fc.property(
        fc.array(keywordArb, { minLength: 1, maxLength: 5 }),
        (keywords) => {
          // Ensure unique keywords
          const uniqueKeywords = [...new Set(keywords)];

          // Content containing all keywords
          const content = uniqueKeywords.join(' ').toLowerCase();

          const result = categoryDetectorService.matchKeywords(
            content,
            uniqueKeywords,
          );

          // All keywords should be in matchedKeywords
          for (const keyword of uniqueKeywords) {
            expect(result.matchedKeywords).toContain(keyword);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
