/**
 * Property Test: Lead Closure SLA Stop
 * **Feature: whatsapp-lead-management, Property 23: Lead Closure SLA Stop**
 * **Validates: Requirements 12.4**
 *
 * For any lead status change to "Won" or "Lost", the system SHALL stop
 * all SLA timers and mark the lead as resolved.
 */

import * as fc from 'fast-check';
import { SlaService } from '../sla.service';
import { SlaPolicy, SlaTracking } from '../../entities';

describe('Property 23: Lead Closure SLA Stop', () => {
  const uuidArb = fc.uuid();

  const slaPolicyArb = fc.record({
    id: uuidArb,
    name: fc.string({ minLength: 1, maxLength: 50 }),
    firstResponseMinutes: fc.integer({ min: 5, max: 1440 }),
    followUpMinutes: fc.integer({ min: 10, max: 2880 }),
    resolutionMinutes: fc.integer({ min: 60, max: 10080 }),
    warningThresholdPercent: fc.integer({ min: 50, max: 95 }),
    isDefault: fc.boolean(),
    isActive: fc.constant(true),
  });

  /**
   * Property: Resolution records the resolved time
   */
  it('should record resolution time when lead is closed', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const tracking = {
          id: fc.sample(uuidArb, 1)[0],
          leadId,
          policyId: policy.id,
          firstResponseDue: new Date(now.getTime() + 60 * 60 * 1000),
          firstResponseAt: new Date(now.getTime() - 30 * 60 * 1000),
          firstResponseBreached: false,
          resolutionDue: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          resolvedAt: null,
          resolutionBreached: false,
          createdAt: new Date(now.getTime() - 60 * 60 * 1000),
          policy,
        };

        let savedTracking: Partial<SlaTracking> | null = null;
        const beforeResolution = new Date();

        const mockPolicyRepo = {
          findOne: jest.fn().mockResolvedValue(policy),
        };

        const mockTrackingRepo = {
          findOne: jest.fn().mockResolvedValue(tracking),
          save: jest.fn().mockImplementation((data) => {
            savedTracking = { ...data };
            return Promise.resolve(savedTracking);
          }),
        };

        const mockLeadRepo = {};

        const service = new SlaService(
          mockPolicyRepo as any,
          mockTrackingRepo as any,
          mockLeadRepo as any,
        );

        await service.recordResolution(leadId);

        const afterResolution = new Date();

        // Verify resolution time was recorded
        expect(savedTracking).not.toBeNull();
        expect(savedTracking!.resolvedAt).not.toBeNull();
        expect(savedTracking!.resolvedAt!.getTime()).toBeGreaterThanOrEqual(
          beforeResolution.getTime(),
        );
        expect(savedTracking!.resolvedAt!.getTime()).toBeLessThanOrEqual(
          afterResolution.getTime(),
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Resolution before due time is not breached
   */
  it('should mark as not breached when resolved before due time', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const tracking = {
          id: fc.sample(uuidArb, 1)[0],
          leadId,
          policyId: policy.id,
          firstResponseDue: new Date(now.getTime() + 60 * 60 * 1000),
          firstResponseAt: new Date(now.getTime() - 30 * 60 * 1000),
          firstResponseBreached: false,
          resolutionDue: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Due in 24 hours
          resolvedAt: null,
          resolutionBreached: false,
          createdAt: new Date(now.getTime() - 60 * 60 * 1000),
          policy,
        };

        let savedTracking: Partial<SlaTracking> | null = null;

        const mockPolicyRepo = {
          findOne: jest.fn().mockResolvedValue(policy),
        };

        const mockTrackingRepo = {
          findOne: jest.fn().mockResolvedValue(tracking),
          save: jest.fn().mockImplementation((data) => {
            savedTracking = { ...data };
            return Promise.resolve(savedTracking);
          }),
        };

        const mockLeadRepo = {};

        const service = new SlaService(
          mockPolicyRepo as any,
          mockTrackingRepo as any,
          mockLeadRepo as any,
        );

        await service.recordResolution(leadId);

        expect(savedTracking!.resolutionBreached).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Resolution after due time is marked as breached
   */
  it('should mark as breached when resolved after due time', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const tracking = {
          id: fc.sample(uuidArb, 1)[0],
          leadId,
          policyId: policy.id,
          firstResponseDue: new Date(now.getTime() - 48 * 60 * 60 * 1000),
          firstResponseAt: new Date(now.getTime() - 47 * 60 * 60 * 1000),
          firstResponseBreached: false,
          resolutionDue: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Due 24 hours ago
          resolvedAt: null,
          resolutionBreached: false,
          createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
          policy,
        };

        let savedTracking: Partial<SlaTracking> | null = null;

        const mockPolicyRepo = {
          findOne: jest.fn().mockResolvedValue(policy),
        };

        const mockTrackingRepo = {
          findOne: jest.fn().mockResolvedValue(tracking),
          save: jest.fn().mockImplementation((data) => {
            savedTracking = { ...data };
            return Promise.resolve(savedTracking);
          }),
        };

        const mockLeadRepo = {};

        const service = new SlaService(
          mockPolicyRepo as any,
          mockTrackingRepo as any,
          mockLeadRepo as any,
        );

        await service.recordResolution(leadId);

        expect(savedTracking!.resolutionBreached).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Resolution stops all SLA timers
   */
  it('should stop all SLA timers on resolution', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const tracking = {
          id: fc.sample(uuidArb, 1)[0],
          leadId,
          policyId: policy.id,
          firstResponseDue: new Date(now.getTime() + 60 * 60 * 1000),
          firstResponseAt: new Date(now.getTime() - 30 * 60 * 1000),
          firstResponseBreached: false,
          resolutionDue: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          resolvedAt: null,
          resolutionBreached: false,
          createdAt: new Date(now.getTime() - 60 * 60 * 1000),
          policy,
        };

        let savedTracking: Partial<SlaTracking> | null = null;

        const mockPolicyRepo = {
          findOne: jest.fn().mockResolvedValue(policy),
        };

        const mockTrackingRepo = {
          findOne: jest.fn().mockResolvedValue(tracking),
          save: jest.fn().mockImplementation((data) => {
            savedTracking = { ...data };
            return Promise.resolve(savedTracking);
          }),
        };

        const mockLeadRepo = {};

        const service = new SlaService(
          mockPolicyRepo as any,
          mockTrackingRepo as any,
          mockLeadRepo as any,
        );

        await service.recordResolution(leadId);

        // After resolution, resolvedAt should be set
        expect(savedTracking!.resolvedAt).not.toBeNull();
      }),
      { numRuns: 100 },
    );
  });
});
