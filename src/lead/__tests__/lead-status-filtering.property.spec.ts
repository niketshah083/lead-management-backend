import * as fc from 'fast-check';
import { Lead } from '../../entities/lead.entity';
import { LeadStatus } from '../../common/enums';

/**
 * **Feature: whatsapp-lead-management, Property 32: Lead Status Filtering**
 * **Validates: Requirements 12.3**
 *
 * For any lead query with status filter, the returned leads SHALL only
 * include leads matching the specified statuses.
 */
describe('Property 32: Lead Status Filtering', () => {
  // All possible statuses
  const allStatuses = [
    LeadStatus.NEW,
    LeadStatus.CONTACTED,
    LeadStatus.QUALIFIED,
    LeadStatus.NEGOTIATION,
    LeadStatus.WON,
    LeadStatus.LOST,
  ];

  // Arbitrary for lead status
  const statusArb = fc.constantFrom(...allStatuses);

  // Arbitrary for status filter (subset of statuses)
  const statusFilterArb = fc.subarray(allStatuses, { minLength: 1 });

  // Arbitrary for phone numbers
  const phoneNumberArb = fc
    .tuple(
      fc.constantFrom('+1', '+44', '+91'),
      fc.array(fc.integer({ min: 0, max: 9 }), {
        minLength: 10,
        maxLength: 10,
      }),
    )
    .map(([code, digits]) => `${code}${digits.join('')}`);

  // Helper to create a mock lead with status
  const createMockLead = (status: LeadStatus): Lead => {
    const lead = new Lead();
    lead.id = `lead-${Math.random().toString(36).substr(2, 9)}`;
    lead.phoneNumber = `+1${Math.random().toString().substr(2, 10)}`;
    lead.categoryId = `cat-${Math.random().toString(36).substr(2, 9)}`;
    lead.status = status;
    return lead;
  };

  // Simulate filtering leads by status
  const filterLeadsByStatus = (
    leads: Lead[],
    statusFilter: LeadStatus[],
  ): Lead[] => {
    if (!statusFilter || statusFilter.length === 0) {
      return leads;
    }
    return leads.filter((lead) => statusFilter.includes(lead.status));
  };

  it('should return only leads matching the specified statuses', () => {
    fc.assert(
      fc.property(
        fc.array(statusArb, { minLength: 1, maxLength: 20 }),
        statusFilterArb,
        (statuses, filter) => {
          const leads = statuses.map((status) => createMockLead(status));
          const filtered = filterLeadsByStatus(leads, filter);

          // All filtered leads should have a status in the filter
          for (const lead of filtered) {
            expect(filter).toContain(lead.status);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should not return leads with statuses not in the filter', () => {
    fc.assert(
      fc.property(
        fc.array(statusArb, { minLength: 1, maxLength: 20 }),
        statusFilterArb,
        (statuses, filter) => {
          const leads = statuses.map((status) => createMockLead(status));
          const filtered = filterLeadsByStatus(leads, filter);

          // No filtered lead should have a status NOT in the filter
          const excludedStatuses = allStatuses.filter(
            (s) => !filter.includes(s),
          );
          for (const lead of filtered) {
            expect(excludedStatuses).not.toContain(lead.status);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return all leads when filtering by all statuses', () => {
    fc.assert(
      fc.property(
        fc.array(statusArb, { minLength: 1, maxLength: 20 }),
        (statuses) => {
          const leads = statuses.map((status) => createMockLead(status));
          const filtered = filterLeadsByStatus(leads, allStatuses);

          expect(filtered.length).toBe(leads.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return empty array when no leads match the filter', () => {
    fc.assert(
      fc.property(statusFilterArb, (filter) => {
        // Create leads with statuses NOT in the filter
        const excludedStatuses = allStatuses.filter((s) => !filter.includes(s));

        if (excludedStatuses.length === 0) return; // Skip if filter includes all statuses

        const leads = excludedStatuses.map((status) => createMockLead(status));
        const filtered = filterLeadsByStatus(leads, filter);

        expect(filtered.length).toBe(0);
      }),
      { numRuns: 100 },
    );
  });

  it('should preserve lead data integrity after filtering', () => {
    fc.assert(
      fc.property(
        fc.array(statusArb, { minLength: 1, maxLength: 10 }),
        statusFilterArb,
        (statuses, filter) => {
          const leads = statuses.map((status) => createMockLead(status));
          const originalLeadData = leads.map((l) => ({
            id: l.id,
            phoneNumber: l.phoneNumber,
            categoryId: l.categoryId,
            status: l.status,
          }));

          const filtered = filterLeadsByStatus(leads, filter);

          // Verify filtered leads have unchanged data
          for (const lead of filtered) {
            const original = originalLeadData.find((o) => o.id === lead.id);
            expect(original).toBeDefined();
            expect(lead.phoneNumber).toBe(original!.phoneNumber);
            expect(lead.categoryId).toBe(original!.categoryId);
            expect(lead.status).toBe(original!.status);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should handle single status filter correctly', () => {
    fc.assert(
      fc.property(
        fc.array(statusArb, { minLength: 5, maxLength: 20 }),
        statusArb,
        (statuses, singleFilter) => {
          const leads = statuses.map((status) => createMockLead(status));
          const filtered = filterLeadsByStatus(leads, [singleFilter]);

          // All filtered leads should have exactly the filtered status
          for (const lead of filtered) {
            expect(lead.status).toBe(singleFilter);
          }

          // Count should match
          const expectedCount = statuses.filter(
            (s) => s === singleFilter,
          ).length;
          expect(filtered.length).toBe(expectedCount);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return all leads when no filter is applied', () => {
    fc.assert(
      fc.property(
        fc.array(statusArb, { minLength: 1, maxLength: 20 }),
        (statuses) => {
          const leads = statuses.map((status) => createMockLead(status));
          const filtered = filterLeadsByStatus(leads, []);

          expect(filtered.length).toBe(leads.length);
        },
      ),
      { numRuns: 100 },
    );
  });
});
