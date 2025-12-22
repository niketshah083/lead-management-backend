/**
 * Property Test: SLA Timer Stop on Response
 * **Feature: whatsapp-lead-management, Property 20: SLA Timer Stop on Response**
 * **Validates: Requirements 9.6**
 *
 * For any first response to a lead by the assigned CE, the system SHALL
 * record the response time and stop the first response timer.
 */

import * as fc from 'fast-check';
import { SlaService } from '../sla.service';
import { SlaPolicy, SlaTracking } from '../../entities';

describe('Property 20: SLA Timer Stop on Response', () => {
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

  const slaTrackingArb = (policyId: string, leadId: string) => {
    const now = new Date();
    return fc.record({
      id: uuidArb,
      leadId: fc.constant(leadId),
      policyId: fc.constant(policyId),
      firstResponseDue: fc.constant(
        new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
      ),
      firstResponseAt: fc.constant(null as Date | null),
      firstResponseBreached: fc.constant(false),
      resolutionDue: fc.constant(
        new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours from now
      ),
      resolvedAt: fc.constant(null as Date | null),
      resolutionBreached: fc.constant(false),
      createdAt: fc.constant(now),
    });
  };

  /**
   * Property: First response records the response time
   */
  it('should record first response time when CE responds', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const trackingData = fc.sample(slaTrackingArb(policy.id, leadId), 1)[0];
        let savedTracking: Partial<SlaTracking> | null = null;
        const beforeResponse = new Date();

        const mockPolicyRepo = {
          findOne: jest.fn().mockResolvedValue(policy),
        };

        const mockTrackingRepo = {
          findOne: jest.fn().mockResolvedValue({
            ...trackingData,
            policy,
          }),
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

        await service.recordFirstResponse(leadId);

        const afterResponse = new Date();

        // Verify response time was recorded
        expect(savedTracking).not.toBeNull();
        expect(savedTracking!.firstResponseAt).not.toBeNull();
        expect(
          savedTracking!.firstResponseAt!.getTime(),
        ).toBeGreaterThanOrEqual(beforeResponse.getTime());
        expect(savedTracking!.firstResponseAt!.getTime()).toBeLessThanOrEqual(
          afterResponse.getTime(),
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Response before due time is not breached
   */
  it('should mark as not breached when response is before due time', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const tracking = {
          id: fc.sample(uuidArb, 1)[0],
          leadId,
          policyId: policy.id,
          firstResponseDue: new Date(now.getTime() + 60 * 60 * 1000), // Due in 1 hour
          firstResponseAt: null,
          firstResponseBreached: false,
          resolutionDue: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          resolvedAt: null,
          resolutionBreached: false,
          createdAt: now,
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

        await service.recordFirstResponse(leadId);

        expect(savedTracking!.firstResponseBreached).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Response after due time is marked as breached
   */
  it('should mark as breached when response is after due time', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const tracking = {
          id: fc.sample(uuidArb, 1)[0],
          leadId,
          policyId: policy.id,
          firstResponseDue: new Date(now.getTime() - 60 * 60 * 1000), // Due 1 hour ago
          firstResponseAt: null,
          firstResponseBreached: false,
          resolutionDue: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          resolvedAt: null,
          resolutionBreached: false,
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
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

        await service.recordFirstResponse(leadId);

        expect(savedTracking!.firstResponseBreached).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Duplicate first response does not update
   */
  it('should not update if first response already recorded', async () => {
    await fc.assert(
      fc.asyncProperty(slaPolicyArb, uuidArb, async (policy, leadId) => {
        const now = new Date();
        const originalResponseTime = new Date(now.getTime() - 30 * 60 * 1000);
        const tracking = {
          id: fc.sample(uuidArb, 1)[0],
          leadId,
          policyId: policy.id,
          firstResponseDue: new Date(now.getTime() + 60 * 60 * 1000),
          firstResponseAt: originalResponseTime, // Already responded
          firstResponseBreached: false,
          resolutionDue: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          resolvedAt: null,
          resolutionBreached: false,
          createdAt: new Date(now.getTime() - 60 * 60 * 1000),
          policy,
        };

        const mockPolicyRepo = {
          findOne: jest.fn().mockResolvedValue(policy),
        };

        const mockTrackingRepo = {
          findOne: jest.fn().mockResolvedValue(tracking),
          save: jest.fn(),
        };

        const mockLeadRepo = {};

        const service = new SlaService(
          mockPolicyRepo as any,
          mockTrackingRepo as any,
          mockLeadRepo as any,
        );

        const result = await service.recordFirstResponse(leadId);

        // Should return existing tracking without saving
        expect(result.firstResponseAt).toEqual(originalResponseTime);
        expect(mockTrackingRepo.save).not.toHaveBeenCalled();
      }),
      { numRuns: 100 },
    );
  });
});
