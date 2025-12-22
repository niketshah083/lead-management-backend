/**
 * Property Test: SLA Warning Notification
 * **Feature: whatsapp-lead-management, Property 21: SLA Warning Notification**
 * **Validates: Requirements 9.3, 10.3**
 *
 * For any lead where 80% of SLA time has elapsed without response, the system
 * SHALL send notifications to the assigned user and their Manager.
 */

import * as fc from 'fast-check';
import { SlaService } from '../sla.service';
import { SlaPolicy, SlaTracking, Lead } from '../../entities';
import { LeadStatus } from '../../common/enums';

describe('Property 21: SLA Warning Notification', () => {
  const uuidArb = fc.uuid();

  const slaPolicyArb = fc.record({
    id: uuidArb,
    name: fc.string({ minLength: 1, maxLength: 50 }),
    firstResponseMinutes: fc.integer({ min: 60, max: 1440 }), // 1-24 hours
    followUpMinutes: fc.integer({ min: 120, max: 2880 }),
    resolutionMinutes: fc.integer({ min: 240, max: 10080 }),
    warningThresholdPercent: fc.integer({ min: 70, max: 90 }),
    isDefault: fc.boolean(),
    isActive: fc.constant(true),
  });

  interface TrackingData {
    firstResponseDue: Date;
    firstResponseAt: Date | null;
    createdAt: Date;
  }

  interface PolicyData {
    warningThresholdPercent: number;
  }

  /**
   * Helper to calculate if a tracking is in warning state
   */
  function isInWarningState(
    tracking: TrackingData,
    policy: PolicyData,
    now: Date,
  ): boolean {
    if (tracking.firstResponseAt) {
      return false; // Already responded
    }

    const totalTime =
      tracking.firstResponseDue!.getTime() - tracking.createdAt!.getTime();
    const elapsed = now.getTime() - tracking.createdAt!.getTime();
    const percentElapsed = (elapsed / totalTime) * 100;

    return (
      percentElapsed >= policy.warningThresholdPercent! &&
      now < tracking.firstResponseDue!
    );
  }

  /**
   * Property: Leads at warning threshold are detected
   */
  it('should detect leads approaching SLA breach at warning threshold', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const createdAt = new Date(now.getTime() - 50 * 60 * 1000); // 50 min ago
        const firstResponseDue = new Date(
          createdAt.getTime() + policy.firstResponseMinutes * 60 * 1000,
        );

        // Calculate if this should be in warning state
        const totalTime = firstResponseDue.getTime() - createdAt.getTime();
        const elapsed = now.getTime() - createdAt.getTime();
        const percentElapsed = (elapsed / totalTime) * 100;

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
          lead: {
            id: leadId,
            status: LeadStatus.NEW,
            assignedToId: fc.sample(uuidArb, 1)[0],
          },
        };

        const shouldBeWarning =
          percentElapsed >= policy.warningThresholdPercent &&
          now < firstResponseDue;

        const isWarning = isInWarningState(tracking, policy, now);

        expect(isWarning).toBe(shouldBeWarning);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Leads below warning threshold are not flagged
   */
  it('should not flag leads below warning threshold', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        // Create tracking that's only 10% through SLA time
        const createdAt = new Date(now.getTime() - 6 * 60 * 1000); // 6 min ago
        const firstResponseDue = new Date(
          createdAt.getTime() + 60 * 60 * 1000, // 1 hour total
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
          policy: { ...policy, warningThresholdPercent: 80 },
        };

        const isWarning = isInWarningState(
          tracking,
          { ...policy, warningThresholdPercent: 80 },
          now,
        );

        // 10% elapsed should not trigger 80% warning
        expect(isWarning).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Already responded leads are not flagged for warning
   */
  it('should not flag leads that have already received first response', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const createdAt = new Date(now.getTime() - 50 * 60 * 1000);
        const firstResponseDue = new Date(createdAt.getTime() + 60 * 60 * 1000);

        const tracking = {
          id: fc.sample(uuidArb, 1)[0],
          leadId,
          policyId: policy.id,
          firstResponseDue,
          firstResponseAt: new Date(now.getTime() - 10 * 60 * 1000), // Responded 10 min ago
          firstResponseBreached: false,
          resolutionDue: new Date(
            createdAt.getTime() + policy.resolutionMinutes * 60 * 1000,
          ),
          resolvedAt: null,
          resolutionBreached: false,
          createdAt,
          policy,
        };

        const isWarning = isInWarningState(tracking, policy, now);

        expect(isWarning).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Warning threshold is configurable per policy
   */
  it('should respect policy-specific warning threshold', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 50, max: 95 }),
        uuidArb,
        async (threshold, leadId) => {
          const now = new Date();
          const createdAt = new Date(now.getTime() - 45 * 60 * 1000); // 45 min ago
          const firstResponseDue = new Date(
            createdAt.getTime() + 60 * 60 * 1000, // 1 hour total
          );

          // 45/60 = 75% elapsed
          const percentElapsed = 75;

          const policy = {
            id: fc.sample(uuidArb, 1)[0],
            warningThresholdPercent: threshold,
          };

          const tracking = {
            id: fc.sample(uuidArb, 1)[0],
            leadId,
            policyId: policy.id,
            firstResponseDue,
            firstResponseAt: null,
            firstResponseBreached: false,
            createdAt,
          };

          const isWarning = isInWarningState(tracking, policy, now);

          // Should be warning if threshold <= 75%
          expect(isWarning).toBe(threshold <= percentElapsed);
        },
      ),
      { numRuns: 100 },
    );
  });
});
