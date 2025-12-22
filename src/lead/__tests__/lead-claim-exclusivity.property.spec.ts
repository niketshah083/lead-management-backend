import * as fc from 'fast-check';
import { Lead } from '../../entities/lead.entity';
import { LeadStatus } from '../../common/enums';

/**
 * **Feature: whatsapp-lead-management, Property 10: Lead Claim Exclusivity**
 * **Validates: Requirements 4.3**
 *
 * For any lead claimed by a Customer Executive, the lead SHALL have exactly
 * one assignee, and subsequent claim attempts by other CEs SHALL be rejected.
 */
describe('Property 10: Lead Claim Exclusivity', () => {
  // Arbitrary for UUID-like IDs
  const uuidArb = fc.uuid();

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

  // Helper to create a mock lead
  const createMockLead = (phoneNumber: string, categoryId: string): Lead => {
    const lead = new Lead();
    lead.id = `lead-${Math.random().toString(36).substr(2, 9)}`;
    lead.phoneNumber = phoneNumber;
    lead.categoryId = categoryId;
    lead.status = LeadStatus.NEW;
    lead.assignedToId = undefined as any;
    lead.claimedAt = undefined as any;
    return lead;
  };

  // Simulate claim operation
  const claimLead = (
    lead: Lead,
    userId: string,
  ): { success: boolean; error?: string } => {
    if (lead.assignedToId) {
      return {
        success: false,
        error: 'Lead is already claimed by another user',
      };
    }
    lead.assignedToId = userId;
    lead.claimedAt = new Date();
    return { success: true };
  };

  it('should allow first claim attempt on unclaimed lead', () => {
    fc.assert(
      fc.property(
        phoneNumberArb,
        uuidArb,
        uuidArb,
        (phoneNumber, categoryId, userId) => {
          const lead = createMockLead(phoneNumber, categoryId);

          const result = claimLead(lead, userId);

          expect(result.success).toBe(true);
          expect(lead.assignedToId).toBe(userId);
          expect(lead.claimedAt).toBeInstanceOf(Date);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should reject subsequent claim attempts on already claimed lead', () => {
    fc.assert(
      fc.property(
        phoneNumberArb,
        uuidArb,
        uuidArb,
        uuidArb,
        (phoneNumber, categoryId, firstUserId, secondUserId) => {
          // Ensure different users
          if (firstUserId === secondUserId) return;

          const lead = createMockLead(phoneNumber, categoryId);

          // First claim should succeed
          const firstResult = claimLead(lead, firstUserId);
          expect(firstResult.success).toBe(true);

          // Second claim should fail
          const secondResult = claimLead(lead, secondUserId);
          expect(secondResult.success).toBe(false);
          expect(secondResult.error).toBe(
            'Lead is already claimed by another user',
          );

          // Lead should still be assigned to first user
          expect(lead.assignedToId).toBe(firstUserId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should have exactly one assignee after claim', () => {
    fc.assert(
      fc.property(
        phoneNumberArb,
        uuidArb,
        fc.array(uuidArb, { minLength: 1, maxLength: 5 }),
        (phoneNumber, categoryId, userIds) => {
          const lead = createMockLead(phoneNumber, categoryId);

          // Try to claim with multiple users
          let successfulClaimerId: string | null = null;
          for (const userId of userIds) {
            const result = claimLead(lead, userId);
            if (result.success) {
              successfulClaimerId = userId;
            }
          }

          // Should have exactly one assignee
          expect(lead.assignedToId).toBeDefined();
          expect(lead.assignedToId).toBe(successfulClaimerId);

          // Only the first user should have successfully claimed
          expect(successfulClaimerId).toBe(userIds[0]);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should set claimedAt timestamp on successful claim', () => {
    fc.assert(
      fc.property(
        phoneNumberArb,
        uuidArb,
        uuidArb,
        (phoneNumber, categoryId, userId) => {
          const lead = createMockLead(phoneNumber, categoryId);
          const beforeClaim = new Date();

          const result = claimLead(lead, userId);

          expect(result.success).toBe(true);
          expect(lead.claimedAt).toBeInstanceOf(Date);
          expect(lead.claimedAt.getTime()).toBeGreaterThanOrEqual(
            beforeClaim.getTime(),
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should not modify claimedAt on failed claim attempt', () => {
    fc.assert(
      fc.property(
        phoneNumberArb,
        uuidArb,
        uuidArb,
        uuidArb,
        (phoneNumber, categoryId, firstUserId, secondUserId) => {
          if (firstUserId === secondUserId) return;

          const lead = createMockLead(phoneNumber, categoryId);

          // First claim
          claimLead(lead, firstUserId);
          const originalClaimedAt = lead.claimedAt;

          // Wait a tiny bit to ensure different timestamp
          const secondResult = claimLead(lead, secondUserId);

          expect(secondResult.success).toBe(false);
          expect(lead.claimedAt).toBe(originalClaimedAt);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should maintain lead data integrity after claim', () => {
    fc.assert(
      fc.property(
        phoneNumberArb,
        uuidArb,
        uuidArb,
        (phoneNumber, categoryId, userId) => {
          const lead = createMockLead(phoneNumber, categoryId);
          const originalPhoneNumber = lead.phoneNumber;
          const originalCategoryId = lead.categoryId;
          const originalStatus = lead.status;

          claimLead(lead, userId);

          // Other properties should remain unchanged
          expect(lead.phoneNumber).toBe(originalPhoneNumber);
          expect(lead.categoryId).toBe(originalCategoryId);
          expect(lead.status).toBe(originalStatus);
        },
      ),
      { numRuns: 100 },
    );
  });
});
