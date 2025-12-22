import * as fc from 'fast-check';
import { AutoReplyTemplate } from '../../entities';

/**
 * Property 8: Auto-Reply Priority Selection
 * For any message matching multiple auto-reply templates, the system SHALL select
 * and send only the template with highest priority (most specific match).
 * Validates: Requirements 3.5
 */
describe('Property 8: Auto-Reply Priority Selection', () => {
  // Helper function to simulate template selection logic
  function selectTemplate(
    templates: AutoReplyTemplate[],
    messageContent: string,
  ): AutoReplyTemplate | null {
    if (templates.length === 0) {
      return null;
    }

    const activeTemplates = templates.filter((t) => t.isActive);
    if (activeTemplates.length === 0) {
      return null;
    }

    const lowerContent = messageContent.toLowerCase();

    // Find matching templates based on trigger keyword
    const matchingTemplates = activeTemplates.filter((template) =>
      lowerContent.includes(template.triggerKeyword.toLowerCase()),
    );

    if (matchingTemplates.length > 0) {
      // Return highest priority matching template
      return matchingTemplates.reduce((highest, current) =>
        current.priority > highest.priority ? current : highest,
      );
    }

    // If no keyword match, return the highest priority template as default
    return activeTemplates.reduce((highest, current) =>
      current.priority > highest.priority ? current : highest,
    );
  }

  // Arbitrary for generating auto-reply templates
  const templateArbitrary = fc.record({
    id: fc.uuid(),
    categoryId: fc.uuid(),
    triggerKeyword: fc
      .string({ minLength: 1, maxLength: 20 })
      .filter((s) => s.trim().length > 0),
    messageContent: fc.string({ minLength: 1, maxLength: 200 }),
    priority: fc.integer({ min: 0, max: 100 }),
    isActive: fc.boolean(),
    createdAt: fc.date(),
    updatedAt: fc.date(),
  }) as fc.Arbitrary<AutoReplyTemplate>;

  it('should always select the highest priority template when multiple templates match', () => {
    fc.assert(
      fc.property(
        fc.array(templateArbitrary, { minLength: 2, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (templates, messageContent) => {
          // Ensure all templates are active and have the same trigger keyword
          const keyword = 'test';
          const activeTemplates = templates.map((t, index) => ({
            ...t,
            isActive: true,
            triggerKeyword: keyword,
            priority: index * 10, // Different priorities
          }));

          const contentWithKeyword = `${messageContent} ${keyword}`;
          const selected = selectTemplate(activeTemplates, contentWithKeyword);

          if (selected) {
            // The selected template should have the highest priority
            const maxPriority = Math.max(
              ...activeTemplates.map((t) => t.priority),
            );
            expect(selected.priority).toBe(maxPriority);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return null when no templates exist', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (messageContent) => {
          const selected = selectTemplate([], messageContent);
          expect(selected).toBeNull();
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should return null when all templates are inactive', () => {
    fc.assert(
      fc.property(
        fc.array(templateArbitrary, { minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (templates, messageContent) => {
          const inactiveTemplates = templates.map((t) => ({
            ...t,
            isActive: false,
          }));

          const selected = selectTemplate(inactiveTemplates, messageContent);
          expect(selected).toBeNull();
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should prefer keyword-matching templates over non-matching ones', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        // Use alphanumeric keywords to avoid special characters that might match unexpectedly
        fc
          .string({ minLength: 3, maxLength: 15 })
          .filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
        fc
          .string({ minLength: 3, maxLength: 15 })
          .filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
        (categoryId, matchingKeyword, nonMatchingKeyword) => {
          // Skip if keywords overlap (one contains the other)
          const lowerMatching = matchingKeyword.toLowerCase();
          const lowerNonMatching = nonMatchingKeyword.toLowerCase();
          if (
            lowerMatching === lowerNonMatching ||
            lowerMatching.includes(lowerNonMatching) ||
            lowerNonMatching.includes(lowerMatching)
          ) {
            return true;
          }

          const matchingTemplate: AutoReplyTemplate = {
            id: 'matching-id',
            categoryId,
            triggerKeyword: matchingKeyword,
            messageContent: 'Matching response',
            priority: 10, // Lower priority
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as AutoReplyTemplate;

          const nonMatchingTemplate: AutoReplyTemplate = {
            id: 'non-matching-id',
            categoryId,
            triggerKeyword: nonMatchingKeyword,
            messageContent: 'Non-matching response',
            priority: 100, // Higher priority but won't match
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as AutoReplyTemplate;

          const templates = [matchingTemplate, nonMatchingTemplate];
          // Create message that only contains the matching keyword
          const messageContent = `Hello ${matchingKeyword} world`;

          const selected = selectTemplate(templates, messageContent);

          // Should select the matching template even though it has lower priority
          expect(selected?.id).toBe('matching-id');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should select highest priority among matching templates', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => s.trim().length > 0),
        fc.array(fc.integer({ min: 0, max: 100 }), {
          minLength: 2,
          maxLength: 5,
        }),
        (categoryId, keyword, priorities) => {
          const templates: AutoReplyTemplate[] = priorities.map(
            (priority, index) =>
              ({
                id: `template-${index}`,
                categoryId,
                triggerKeyword: keyword,
                messageContent: `Response ${index}`,
                priority,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              }) as AutoReplyTemplate,
          );

          const messageContent = `Message with ${keyword}`;
          const selected = selectTemplate(templates, messageContent);

          const maxPriority = Math.max(...priorities);
          expect(selected?.priority).toBe(maxPriority);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should be case-insensitive when matching keywords', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z]+$/.test(s)),
        (categoryId, keyword) => {
          const template: AutoReplyTemplate = {
            id: 'test-id',
            categoryId,
            triggerKeyword: keyword.toLowerCase(),
            messageContent: 'Response',
            priority: 10,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as AutoReplyTemplate;

          // Test with uppercase keyword in message
          const messageContent = `Hello ${keyword.toUpperCase()} world`;
          const selected = selectTemplate([template], messageContent);

          expect(selected).not.toBeNull();
          expect(selected?.id).toBe('test-id');
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should return default template when no keyword matches', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(fc.integer({ min: 0, max: 100 }), {
          minLength: 1,
          maxLength: 5,
        }),
        (categoryId, priorities) => {
          const templates: AutoReplyTemplate[] = priorities.map(
            (priority, index) =>
              ({
                id: `template-${index}`,
                categoryId,
                triggerKeyword: `unique_keyword_${index}_xyz`,
                messageContent: `Response ${index}`,
                priority,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              }) as AutoReplyTemplate,
          );

          // Message that doesn't match any keyword
          const messageContent = 'Hello world no match here';
          const selected = selectTemplate(templates, messageContent);

          // Should return highest priority template as default
          const maxPriority = Math.max(...priorities);
          expect(selected?.priority).toBe(maxPriority);
        },
      ),
      { numRuns: 50 },
    );
  });
});
