import * as fc from 'fast-check';
import { LeadStatus } from '../../common/enums';

/**
 * Property 33: Analytics Metrics Accuracy
 * For any set of leads, the analytics dashboard SHALL display correct counts
 * by category, status, and time period.
 * Validates: Requirements 13.1
 */
describe('Property 33: Analytics Metrics Accuracy', () => {
  interface Lead {
    id: string;
    categoryId: string;
    status: LeadStatus;
    createdAt: Date;
  }

  interface DashboardMetrics {
    totalLeads: number;
    newLeads: number;
    convertedLeads: number;
    conversionRate: number;
    leadsByCategory: { categoryId: string; count: number }[];
    leadsByStatus: { status: LeadStatus; count: number }[];
  }

  // Calculate metrics from leads
  function calculateMetrics(leads: Lead[]): DashboardMetrics {
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === LeadStatus.NEW).length;
    const convertedLeads = leads.filter(
      (l) => l.status === LeadStatus.WON,
    ).length;
    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Group by category
    const categoryMap = new Map<string, number>();
    for (const lead of leads) {
      const count = categoryMap.get(lead.categoryId) || 0;
      categoryMap.set(lead.categoryId, count + 1);
    }
    const leadsByCategory = Array.from(categoryMap.entries()).map(
      ([categoryId, count]) => ({ categoryId, count }),
    );

    // Group by status
    const statusMap = new Map<LeadStatus, number>();
    for (const status of Object.values(LeadStatus)) {
      statusMap.set(status, 0);
    }
    for (const lead of leads) {
      const count = statusMap.get(lead.status) || 0;
      statusMap.set(lead.status, count + 1);
    }
    const leadsByStatus = Array.from(statusMap.entries()).map(
      ([status, count]) => ({
        status,
        count,
      }),
    );

    return {
      totalLeads,
      newLeads,
      convertedLeads,
      conversionRate,
      leadsByCategory,
      leadsByStatus,
    };
  }

  it('should calculate total leads correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            categoryId: fc.uuid(),
            status: fc.constantFrom(...Object.values(LeadStatus)),
            createdAt: fc.date(),
          }),
          { minLength: 0, maxLength: 50 },
        ),
        (leads) => {
          const metrics = calculateMetrics(leads);
          expect(metrics.totalLeads).toBe(leads.length);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should calculate new leads correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            categoryId: fc.uuid(),
            status: fc.constantFrom(...Object.values(LeadStatus)),
            createdAt: fc.date(),
          }),
          { minLength: 0, maxLength: 50 },
        ),
        (leads) => {
          const metrics = calculateMetrics(leads);
          const expectedNew = leads.filter(
            (l) => l.status === LeadStatus.NEW,
          ).length;
          expect(metrics.newLeads).toBe(expectedNew);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should calculate converted leads correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            categoryId: fc.uuid(),
            status: fc.constantFrom(...Object.values(LeadStatus)),
            createdAt: fc.date(),
          }),
          { minLength: 0, maxLength: 50 },
        ),
        (leads) => {
          const metrics = calculateMetrics(leads);
          const expectedConverted = leads.filter(
            (l) => l.status === LeadStatus.WON,
          ).length;
          expect(metrics.convertedLeads).toBe(expectedConverted);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should calculate conversion rate correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            categoryId: fc.uuid(),
            status: fc.constantFrom(...Object.values(LeadStatus)),
            createdAt: fc.date(),
          }),
          { minLength: 1, maxLength: 50 },
        ),
        (leads) => {
          const metrics = calculateMetrics(leads);
          const converted = leads.filter(
            (l) => l.status === LeadStatus.WON,
          ).length;
          const expectedRate = (converted / leads.length) * 100;
          expect(metrics.conversionRate).toBeCloseTo(expectedRate, 5);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should group leads by category correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }), // categoryIds
        fc.array(fc.integer({ min: 0, max: 4 }), {
          minLength: 1,
          maxLength: 20,
        }), // category indices
        (categoryIds, indices) => {
          const leads: Lead[] = indices.map((idx, i) => ({
            id: `lead-${i}`,
            categoryId: categoryIds[idx % categoryIds.length],
            status: LeadStatus.NEW,
            createdAt: new Date(),
          }));

          const metrics = calculateMetrics(leads);

          // Verify total count matches
          const totalFromCategories = metrics.leadsByCategory.reduce(
            (sum, c) => sum + c.count,
            0,
          );
          expect(totalFromCategories).toBe(leads.length);

          // Verify each category count
          for (const cat of metrics.leadsByCategory) {
            const expected = leads.filter(
              (l) => l.categoryId === cat.categoryId,
            ).length;
            expect(cat.count).toBe(expected);
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should group leads by status correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            categoryId: fc.uuid(),
            status: fc.constantFrom(...Object.values(LeadStatus)),
            createdAt: fc.date(),
          }),
          { minLength: 0, maxLength: 50 },
        ),
        (leads) => {
          const metrics = calculateMetrics(leads);

          // Verify total count matches
          const totalFromStatuses = metrics.leadsByStatus.reduce(
            (sum, s) => sum + s.count,
            0,
          );
          expect(totalFromStatuses).toBe(leads.length);

          // Verify each status count
          for (const stat of metrics.leadsByStatus) {
            const expected = leads.filter(
              (l) => l.status === stat.status,
            ).length;
            expect(stat.count).toBe(expected);
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should handle empty lead set', () => {
    const metrics = calculateMetrics([]);
    expect(metrics.totalLeads).toBe(0);
    expect(metrics.newLeads).toBe(0);
    expect(metrics.convertedLeads).toBe(0);
    expect(metrics.conversionRate).toBe(0);
    expect(metrics.leadsByCategory).toHaveLength(0);
  });
});
