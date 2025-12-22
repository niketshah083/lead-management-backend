/**
 * Property Test: SLA Initialization
 * **Feature: whatsapp-lead-management, Property 19: SLA Initialization**
 * **Validates: Requirements 9.2**
 *
 * For any newly created lead, the system SHALL create an SLA tracking record
 * with first response due time calculated from the applicable policy.
 */

import * as fc from 'fast-check';
import { SlaService } from '../sla.service';
import { SlaPolicy, SlaTracking, Lead } from '../../entities';
import { LeadStatus } from '../../common/enums';

describe('Property 19: SLA Initialization', () => {
  const uuidArb = fc.uuid();

  const slaPolicyArb = fc.record({
    id: uuidArb,
    name: fc.string({ minLength: 1, maxLength: 50 }),
    firstResponseMinutes: fc.integer({ min: 5, max: 1440 }), // 5 min to 24 hours
    followUpMinutes: fc.integer({ min: 10, max: 2880 }),
    resolutionMinutes: fc.integer({ min: 60, max: 10080 }), // 1 hour to 1 week
    warningThresholdPercent: fc.integer({ min: 50, max: 95 }),
    isDefault: fc.boolean(),
    isActive: fc.constant(true),
  });

  const leadArb = fc.record({
    id: uuidArb,
    phoneNumber: fc.stringMatching(/^\+[1-9]\d{9,14}$/),
    categoryId: uuidArb,
    status: fc.constant(LeadStatus.NEW),
  });

  /**
   * Property: SLA tracking is created with correct due times
   */
  it('should create SLA tracking with correct first response due time', async () => {
    await fc.assert(
      fc.asyncProperty(leadArb, slaPolicyArb, async (lead, policy) => {
        let savedTracking: Partial<SlaTracking> | null = null;
        const beforeInit = new Date();

        const mockPolicyRepo = {
          findOne: jest.fn().mockResolvedValue(policy),
          update: jest.fn().mockResolvedValue({}),
        };

        const mockTrackingRepo = {
          create: jest.fn().mockImplementation((data) => data),
          save: jest.fn().mockImplementation((data) => {
            savedTracking = { ...data, id: fc.sample(uuidArb, 1)[0] };
            return Promise.resolve(savedTracking);
          }),
        };

        const mockLeadRepo = {
          findOne: jest.fn().mockResolvedValue(lead),
        };

        const service = new SlaService(
          mockPolicyRepo as any,
          mockTrackingRepo as any,
          mockLeadRepo as any,
        );

        await service.initializeSlaTracking(lead.id, policy.id);

        const afterInit = new Date();

        // Verify tracking was created
        expect(savedTracking).not.toBeNull();
        expect(savedTracking!.leadId).toBe(lead.id);
        expect(savedTracking!.policyId).toBe(policy.id);

        // Verify first response due time is calculated correctly
        const expectedDueMin = new Date(
          beforeInit.getTime() + policy.firstResponseMinutes * 60 * 1000,
        );
        const expectedDueMax = new Date(
          afterInit.getTime() + policy.firstResponseMinutes * 60 * 1000,
        );

        expect(
          savedTracking!.firstResponseDue!.getTime(),
        ).toBeGreaterThanOrEqual(expectedDueMin.getTime());
        expect(savedTracking!.firstResponseDue!.getTime()).toBeLessThanOrEqual(
          expectedDueMax.getTime(),
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: SLA tracking uses default policy when none specified
   */
  it('should use default policy when no policy ID provided', async () => {
    await fc.assert(
      fc.asyncProperty(leadArb, slaPolicyArb, async (lead, defaultPolicy) => {
        const policyWithDefault = { ...defaultPolicy, isDefault: true };
        let savedTracking: Partial<SlaTracking> | null = null;

        const mockPolicyRepo = {
          findOne: jest.fn().mockImplementation(({ where }) => {
            if (where.isDefault) {
              return Promise.resolve(policyWithDefault);
            }
            return Promise.resolve(null);
          }),
          update: jest.fn().mockResolvedValue({}),
        };

        const mockTrackingRepo = {
          create: jest.fn().mockImplementation((data) => data),
          save: jest.fn().mockImplementation((data) => {
            savedTracking = { ...data, id: fc.sample(uuidArb, 1)[0] };
            return Promise.resolve(savedTracking);
          }),
        };

        const mockLeadRepo = {
          findOne: jest.fn().mockResolvedValue(lead),
        };

        const service = new SlaService(
          mockPolicyRepo as any,
          mockTrackingRepo as any,
          mockLeadRepo as any,
        );

        await service.initializeSlaTracking(lead.id);

        expect(savedTracking).not.toBeNull();
        expect(savedTracking!.policyId).toBe(policyWithDefault.id);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: SLA tracking initializes with no breaches
   */
  it('should initialize SLA tracking with no breaches', async () => {
    await fc.assert(
      fc.asyncProperty(leadArb, slaPolicyArb, async (lead, policy) => {
        let savedTracking: Partial<SlaTracking> | null = null;

        const mockPolicyRepo = {
          findOne: jest.fn().mockResolvedValue(policy),
          update: jest.fn().mockResolvedValue({}),
        };

        const mockTrackingRepo = {
          create: jest.fn().mockImplementation((data) => data),
          save: jest.fn().mockImplementation((data) => {
            savedTracking = { ...data, id: fc.sample(uuidArb, 1)[0] };
            return Promise.resolve(savedTracking);
          }),
        };

        const mockLeadRepo = {
          findOne: jest.fn().mockResolvedValue(lead),
        };

        const service = new SlaService(
          mockPolicyRepo as any,
          mockTrackingRepo as any,
          mockLeadRepo as any,
        );

        await service.initializeSlaTracking(lead.id, policy.id);

        expect(savedTracking!.firstResponseBreached).toBe(false);
        expect(savedTracking!.resolutionBreached).toBe(false);
        expect(savedTracking!.firstResponseAt).toBeUndefined();
        expect(savedTracking!.resolvedAt).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Resolution due time is always after first response due time
   */
  it('should set resolution due time after first response due time', async () => {
    await fc.assert(
      fc.asyncProperty(leadArb, slaPolicyArb, async (lead, policy) => {
        // Ensure resolution time is greater than first response time
        const adjustedPolicy = {
          ...policy,
          resolutionMinutes: Math.max(
            policy.resolutionMinutes,
            policy.firstResponseMinutes + 60,
          ),
        };

        let savedTracking: Partial<SlaTracking> | null = null;

        const mockPolicyRepo = {
          findOne: jest.fn().mockResolvedValue(adjustedPolicy),
          update: jest.fn().mockResolvedValue({}),
        };

        const mockTrackingRepo = {
          create: jest.fn().mockImplementation((data) => data),
          save: jest.fn().mockImplementation((data) => {
            savedTracking = { ...data, id: fc.sample(uuidArb, 1)[0] };
            return Promise.resolve(savedTracking);
          }),
        };

        const mockLeadRepo = {
          findOne: jest.fn().mockResolvedValue(lead),
        };

        const service = new SlaService(
          mockPolicyRepo as any,
          mockTrackingRepo as any,
          mockLeadRepo as any,
        );

        await service.initializeSlaTracking(lead.id, adjustedPolicy.id);

        expect(savedTracking!.resolutionDue!.getTime()).toBeGreaterThanOrEqual(
          savedTracking!.firstResponseDue!.getTime(),
        );
      }),
      { numRuns: 100 },
    );
  });
});
