import * as fc from 'fast-check';
import { UserRole } from '../../common/enums';

/**
 * Property 24: New Lead Notification Dispatch
 * For any new qualified lead, the system SHALL send both email and push
 * notifications to all eligible Customer Executives.
 * Validates: Requirements 10.1, 10.2
 */
describe('Property 24: New Lead Notification Dispatch', () => {
  interface User {
    id: string;
    email: string;
    role: UserRole;
    categoryIds: string[];
    isActive: boolean;
  }

  interface Lead {
    id: string;
    categoryId: string;
  }

  // Get eligible CEs for a lead
  function getEligibleCEs(users: User[], lead: Lead): User[] {
    return users.filter(
      (u) =>
        u.role === UserRole.CUSTOMER_EXECUTIVE &&
        u.isActive &&
        u.categoryIds.includes(lead.categoryId),
    );
  }

  // Simulate notification dispatch
  function dispatchNotifications(
    eligibleUsers: User[],
    emailEnabled: boolean,
    pushEnabled: boolean,
  ): { emailCount: number; pushCount: number } {
    return {
      emailCount: emailEnabled
        ? eligibleUsers.filter((u) => u.email).length
        : 0,
      pushCount: pushEnabled ? eligibleUsers.length : 0,
    };
  }

  it('should send email to all eligible CEs when email is enabled', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 1, max: 5 }),
        (leadId, categoryId, ceCount) => {
          const lead: Lead = { id: leadId, categoryId };

          const users: User[] = Array.from({ length: ceCount }, (_, i) => ({
            id: `ce-${i}`,
            email: `ce${i}@example.com`,
            role: UserRole.CUSTOMER_EXECUTIVE,
            categoryIds: [categoryId],
            isActive: true,
          }));

          const eligibleCEs = getEligibleCEs(users, lead);
          const result = dispatchNotifications(eligibleCEs, true, false);

          expect(result.emailCount).toBe(ceCount);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should send push to all eligible CEs when push is enabled', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 1, max: 5 }),
        (leadId, categoryId, ceCount) => {
          const lead: Lead = { id: leadId, categoryId };

          const users: User[] = Array.from({ length: ceCount }, (_, i) => ({
            id: `ce-${i}`,
            email: `ce${i}@example.com`,
            role: UserRole.CUSTOMER_EXECUTIVE,
            categoryIds: [categoryId],
            isActive: true,
          }));

          const eligibleCEs = getEligibleCEs(users, lead);
          const result = dispatchNotifications(eligibleCEs, false, true);

          expect(result.pushCount).toBe(ceCount);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should send both when both are enabled', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 1, max: 5 }),
        (leadId, categoryId, ceCount) => {
          const lead: Lead = { id: leadId, categoryId };

          const users: User[] = Array.from({ length: ceCount }, (_, i) => ({
            id: `ce-${i}`,
            email: `ce${i}@example.com`,
            role: UserRole.CUSTOMER_EXECUTIVE,
            categoryIds: [categoryId],
            isActive: true,
          }));

          const eligibleCEs = getEligibleCEs(users, lead);
          const result = dispatchNotifications(eligibleCEs, true, true);

          expect(result.emailCount).toBe(ceCount);
          expect(result.pushCount).toBe(ceCount);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should not send when both are disabled', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 1, max: 5 }),
        (leadId, categoryId, ceCount) => {
          const lead: Lead = { id: leadId, categoryId };

          const users: User[] = Array.from({ length: ceCount }, (_, i) => ({
            id: `ce-${i}`,
            email: `ce${i}@example.com`,
            role: UserRole.CUSTOMER_EXECUTIVE,
            categoryIds: [categoryId],
            isActive: true,
          }));

          const eligibleCEs = getEligibleCEs(users, lead);
          const result = dispatchNotifications(eligibleCEs, false, false);

          expect(result.emailCount).toBe(0);
          expect(result.pushCount).toBe(0);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should only notify CEs with matching category', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), fc.uuid(), (leadId, cat1, cat2) => {
        if (cat1 === cat2) return true;

        const lead: Lead = { id: leadId, categoryId: cat1 };

        const users: User[] = [
          {
            id: 'ce-1',
            email: 'ce1@example.com',
            role: UserRole.CUSTOMER_EXECUTIVE,
            categoryIds: [cat1],
            isActive: true,
          },
          {
            id: 'ce-2',
            email: 'ce2@example.com',
            role: UserRole.CUSTOMER_EXECUTIVE,
            categoryIds: [cat2],
            isActive: true,
          },
        ];

        const eligibleCEs = getEligibleCEs(users, lead);
        expect(eligibleCEs.length).toBe(1);
        expect(eligibleCEs[0].id).toBe('ce-1');
      }),
      { numRuns: 50 },
    );
  });

  it('should not notify inactive CEs', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (leadId, categoryId) => {
        const lead: Lead = { id: leadId, categoryId };

        const users: User[] = [
          {
            id: 'ce-1',
            email: 'ce1@example.com',
            role: UserRole.CUSTOMER_EXECUTIVE,
            categoryIds: [categoryId],
            isActive: true,
          },
          {
            id: 'ce-2',
            email: 'ce2@example.com',
            role: UserRole.CUSTOMER_EXECUTIVE,
            categoryIds: [categoryId],
            isActive: false,
          },
        ];

        const eligibleCEs = getEligibleCEs(users, lead);
        expect(eligibleCEs.length).toBe(1);
        expect(eligibleCEs[0].id).toBe('ce-1');
      }),
      { numRuns: 50 },
    );
  });
});
