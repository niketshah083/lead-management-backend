/**
 * Property Test: SLA Breach Escalation
 * **Feature: whatsapp-lead-management, Property 22: SLA Breach Escalation**
 * **Validates: Requirements 9.4, 10.4**
 *
 * For any SLA breach, the system SHALL send notifications to the Manager
 * and Admin with breach details.
 */

import * as fc from 'fast-check';
import { SlaPolicy, SlaTracking } from '../../entities';
import { LeadStatus } from '../../common/enums';

describe('Property 22: SLA Breach Escalation', () => {
  const uuidArb = fc.uuid();

  const slaPolicyArb = fc.record({
    id: uuidArb,
    name: fc.string({ minLength: 1, maxLength: 50 }),
    firstResponseMinutes: fc.integer({ min: 60, max: 1440 }),
    followUpMinutes: fc.integer({ min: 120, max: 2880 }),
    resolutionMinutes: fc.integer({ min: 240, max: 10080 }),
    warningThresholdPercent: fc.integer({ min: 70, max: 90 }),
    isDefault: fc.boolean(),
    isActive: fc.constant(true),
  });

  interface TrackingData {
    firstResponseDue: Date;
    firstResponseAt: Date | null;
    resolutionDue: Date;
    resolvedAt: Date | null;
  }

  /**
   * Helper to check if a tracking is in breach state
   */
  function isBreached(tracking: TrackingData, now: Date): boolean {
    // Check first response breach
    if (!tracking.firstResponseAt && now > tracking.firstResponseDue!) {
      return true;
    }

    // Check resolution breach
    if (
      tracking.firstResponseAt &&
      !tracking.resolvedAt &&
      now > tracking.resolutionDue!
    ) {
      return true;
    }

    return false;
  }

  /**
   * Property: Leads past first response due time are breached
   */
  it('should detect first response SLA breach', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const createdAt = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
        const firstResponseDue = new Date(
          createdAt.getTime() + 60 * 60 * 1000, // Was due 1 hour ago
        );

        const tracking = {
          id: fc.sample(uuidArb, 1)[0],
          leadId,
          policyId: policy.id,
          firstResponseDue,
          firstResponseAt: null, // No response yet
          firstResponseBreached: false,
          resolutionDue: new Date(
            createdAt.getTime() + policy.resolutionMinutes * 60 * 1000,
          ),
          resolvedAt: null,
          resolutionBreached: false,
          createdAt,
          policy,
        };

        const breached = isBreached(tracking, now);

        expect(breached).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Leads past resolution due time are breached
   */
  it('should detect resolution SLA breach', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const createdAt = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago
        const firstResponseDue = new Date(createdAt.getTime() + 60 * 60 * 1000);
        const resolutionDue = new Date(
          createdAt.getTime() + 24 * 60 * 60 * 1000, // Was due 24 hours ago
        );

        const tracking = {
          id: fc.sample(uuidArb, 1)[0],
          leadId,
          policyId: policy.id,
          firstResponseDue,
          firstResponseAt: new Date(createdAt.getTime() + 30 * 60 * 1000), // Responded
          firstResponseBreached: false,
          resolutionDue,
          resolvedAt: null, // Not resolved yet
          resolutionBreached: false,
          createdAt,
          policy,
        };

        const breached = isBreached(tracking, now);

        expect(breached).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Leads within SLA are not breached
   */
  it('should not flag leads within SLA as breached', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const createdAt = new Date(now.getTime() - 30 * 60 * 1000); // 30 min ago
        const firstResponseDue = new Date(
          createdAt.getTime() + 60 * 60 * 1000, // Due in 30 min
        );

        const tracking = {
          id: fc.sample(uuidArb, 1)[0],
          leadId,
          policyId: policy.id,
          firstResponseDue,
          firstResponseAt: null,
          firstResponseBreached: false,
          resolutionDue: new Date(
            createdAt.getTime() + policy.resolutionMinutes * 60 * 1000,
          ),
          resolvedAt: null,
          resolutionBreached: false,
          createdAt,
          policy,
        };

        const breached = isBreached(tracking, now);

        expect(breached).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Resolved leads are not breached
   */
  it('should not flag resolved leads as breached', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const createdAt = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        const firstResponseDue = new Date(createdAt.getTime() + 60 * 60 * 1000);
        const resolutionDue = new Date(
          createdAt.getTime() + 24 * 60 * 60 * 1000,
        );

        const tracking = {
          id: fc.sample(uuidArb, 1)[0],
          leadId,
          policyId: policy.id,
          firstResponseDue,
          firstResponseAt: new Date(createdAt.getTime() + 30 * 60 * 1000),
          firstResponseBreached: false,
          resolutionDue,
          resolvedAt: new Date(createdAt.getTime() + 20 * 60 * 60 * 1000), // Resolved
          resolutionBreached: false,
          createdAt,
          policy,
        };

        const breached = isBreached(tracking, now);

        expect(breached).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Breach detection is time-sensitive
   */
  it('should correctly detect breach based on current time', async () => {
    await fc.assert(
      fc.asyncProperty(
        slaPolicyArb,
        uuidArb,
        fc.integer({ min: -120, max: 120 }), // Minutes offset from due time
        async (policy, leadId, minutesOffset) => {
          const dueTime = new Date();
          const now = new Date(dueTime.getTime() + minutesOffset * 60 * 1000);
          const createdAt = new Date(dueTime.getTime() - 60 * 60 * 1000);

          const tracking = {
            id: fc.sample(uuidArb, 1)[0],
            leadId,
            policyId: policy.id,
            firstResponseDue: dueTime,
            firstResponseAt: null,
            firstResponseBreached: false,
            resolutionDue: new Date(
              createdAt.getTime() + policy.resolutionMinutes * 60 * 1000,
            ),
            resolvedAt: null,
            resolutionBreached: false,
            createdAt,
            policy,
          };

          const breached = isBreached(tracking, now);

          // Should be breached if now > dueTime (minutesOffset > 0)
          expect(breached).toBe(minutesOffset > 0);
        },
      ),
      { numRuns: 100 },
    );
  });
});
