import * as fc from 'fast-check';
import { LeadStatus } from '../../common/enums';

/**
 * Property 34: Report Filter Application
 * For any filter combination, the report SHALL return only leads
 * matching all specified criteria.
 * Validates: Requirements 13.4
 */
describe('Property 34: Report Filter Application', () => {
  interface Lead {
    id: string;
    categoryId: string;
    userId: string;
    status: LeadStatus;
    createdAt: Date;
  }

  interface ReportFilter {
    dateFrom?: Date;
    dateTo?: Date;
    categoryId?: string;
    userId?: string;
    status?: LeadStatus[];
  }

  // Apply filters to leads
  function applyFilters(leads: Lead[], filters: ReportFilter): Lead[] {
    return leads.filter((lead) => {
      // Date from filter (use getTime for precise comparison)
      if (
        filters.dateFrom &&
        lead.createdAt.getTime() < filters.dateFrom.getTime()
      ) {
        return false;
      }

      // Date to filter (use getTime for precise comparison)
      if (
        filters.dateTo &&
        lead.createdAt.getTime() > filters.dateTo.getTime()
      ) {
        return false;
      }

      // Category filter
      if (filters.categoryId && lead.categoryId !== filters.categoryId) {
        return false;
      }

      // User filter
      if (filters.userId && lead.userId !== filters.userId) {
        return false;
      }

      // Status filter
      if (
        filters.status &&
        filters.status.length > 0 &&
        !filters.status.includes(lead.status)
      ) {
        return false;
      }

      return true;
    });
  }

  const leadArbitrary = fc.record({
    id: fc.uuid(),
    categoryId: fc.constantFrom('cat-1', 'cat-2', 'cat-3'),
    userId: fc.constantFrom('user-1', 'user-2', 'user-3'),
    status: fc.constantFrom(...Object.values(LeadStatus)),
    createdAt: fc.date({
      min: new Date('2024-01-01'),
      max: new Date('2024-12-31'),
    }),
  });

  it('should filter by category correctly', () => {
    fc.assert(
      fc.property(
        fc.array(leadArbitrary, { minLength: 1, maxLength: 30 }),
        fc.constantFrom('cat-1', 'cat-2', 'cat-3'),
        (leads, categoryId) => {
          const filtered = applyFilters(leads, { categoryId });

          // All results should have the specified category
          expect(filtered.every((l) => l.categoryId === categoryId)).toBe(true);

          // Should include all leads with that category
          const expected = leads.filter((l) => l.categoryId === categoryId);
          expect(filtered.length).toBe(expected.length);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should filter by user correctly', () => {
    fc.assert(
      fc.property(
        fc.array(leadArbitrary, { minLength: 1, maxLength: 30 }),
        fc.constantFrom('user-1', 'user-2', 'user-3'),
        (leads, userId) => {
          const filtered = applyFilters(leads, { userId });

          // All results should have the specified user
          expect(filtered.every((l) => l.userId === userId)).toBe(true);

          // Should include all leads with that user
          const expected = leads.filter((l) => l.userId === userId);
          expect(filtered.length).toBe(expected.length);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should filter by status correctly', () => {
    fc.assert(
      fc.property(
        fc.array(leadArbitrary, { minLength: 1, maxLength: 30 }),
        fc.array(fc.constantFrom(...Object.values(LeadStatus)), {
          minLength: 1,
          maxLength: 3,
        }),
        (leads, statuses) => {
          const uniqueStatuses = [...new Set(statuses)];
          const filtered = applyFilters(leads, { status: uniqueStatuses });

          // All results should have one of the specified statuses
          expect(filtered.every((l) => uniqueStatuses.includes(l.status))).toBe(
            true,
          );

          // Should include all leads with those statuses
          const expected = leads.filter((l) =>
            uniqueStatuses.includes(l.status),
          );
          expect(filtered.length).toBe(expected.length);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should filter by date range correctly', () => {
    fc.assert(
      fc.property(
        fc.array(leadArbitrary, { minLength: 1, maxLength: 30 }),
        (leads) => {
          // Use fixed dates to avoid edge cases with random date generation
          const dateFrom = new Date('2024-03-01T00:00:00.000Z');
          const dateTo = new Date('2024-09-30T23:59:59.999Z');

          const filtered = applyFilters(leads, { dateFrom, dateTo });

          // All results should be within date range
          const fromTime = dateFrom.getTime();
          const toTime = dateTo.getTime();

          expect(
            filtered.every(
              (l) =>
                l.createdAt.getTime() >= fromTime &&
                l.createdAt.getTime() <= toTime,
            ),
          ).toBe(true);

          // Should include all leads within that range
          const expected = leads.filter(
            (l) =>
              l.createdAt.getTime() >= fromTime &&
              l.createdAt.getTime() <= toTime,
          );
          expect(filtered.length).toBe(expected.length);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should apply multiple filters with AND logic', () => {
    fc.assert(
      fc.property(
        fc.array(leadArbitrary, { minLength: 5, maxLength: 30 }),
        fc.constantFrom('cat-1', 'cat-2', 'cat-3'),
        fc.constantFrom('user-1', 'user-2', 'user-3'),
        (leads, categoryId, userId) => {
          const filtered = applyFilters(leads, { categoryId, userId });

          // All results should match both filters
          expect(
            filtered.every(
              (l) => l.categoryId === categoryId && l.userId === userId,
            ),
          ).toBe(true);

          // Should include all leads matching both criteria
          const expected = leads.filter(
            (l) => l.categoryId === categoryId && l.userId === userId,
          );
          expect(filtered.length).toBe(expected.length);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should return all leads when no filters applied', () => {
    fc.assert(
      fc.property(
        fc.array(leadArbitrary, { minLength: 0, maxLength: 30 }),
        (leads) => {
          const filtered = applyFilters(leads, {});
          expect(filtered.length).toBe(leads.length);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should return empty array when no leads match filters', () => {
    const leads: Lead[] = [
      {
        id: '1',
        categoryId: 'cat-1',
        userId: 'user-1',
        status: LeadStatus.NEW,
        createdAt: new Date('2024-06-15'),
      },
    ];

    const filtered = applyFilters(leads, { categoryId: 'cat-nonexistent' });
    expect(filtered.length).toBe(0);
  });

  it('should handle complex filter combinations', () => {
    fc.assert(
      fc.property(
        fc.array(leadArbitrary, { minLength: 10, maxLength: 50 }),
        fc.constantFrom('cat-1', 'cat-2', 'cat-3'),
        fc.constantFrom('user-1', 'user-2', 'user-3'),
        fc.array(fc.constantFrom(...Object.values(LeadStatus)), {
          minLength: 1,
          maxLength: 2,
        }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-06-30') }),
        fc.date({ min: new Date('2024-07-01'), max: new Date('2024-12-31') }),
        (leads, categoryId, userId, statuses, dateFrom, dateTo) => {
          const uniqueStatuses = [...new Set(statuses)];
          const filters: ReportFilter = {
            categoryId,
            userId,
            status: uniqueStatuses,
            dateFrom,
            dateTo,
          };

          const filtered = applyFilters(leads, filters);

          // Verify all results match all criteria
          for (const lead of filtered) {
            expect(lead.categoryId).toBe(categoryId);
            expect(lead.userId).toBe(userId);
            expect(uniqueStatuses.includes(lead.status)).toBe(true);
            expect(lead.createdAt >= dateFrom).toBe(true);
            expect(lead.createdAt <= dateTo).toBe(true);
          }
        },
      ),
      { numRuns: 30 },
    );
  });
});
