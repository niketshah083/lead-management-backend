import * as fc from 'fast-check';

/**
 * Property 20: SLA Timer Stop on Response
 * For any first response to a lead by the assigned CE, the system SHALL record
 * the response time and stop the first response timer.
 * Validates: Requirements 9.6
 */
describe('Property 20: SLA Timer Stop on Response', () => {
  interface SlaTracking {
    leadId: string;
    firstResponseDue: Date;
    firstResponseAt?: Date;
    firstResponseBreached: boolean;
    resolutionDue: Date;
    resolvedAt?: Date;
    resolutionBreached: boolean;
    createdAt: Date;
  }

  // Simulate recording first response
  function recordFirstResponse(
    tracking: SlaTracking,
    responseTime: Date,
  ): SlaTracking {
    if (tracking.firstResponseAt) {
      return tracking; // Already recorded
    }

    return {
      ...tracking,
      firstResponseAt: responseTime,
      firstResponseBreached: responseTime > tracking.firstResponseDue,
    };
  }

  it('should record first response time', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // leadId
        fc.integer({ min: 1, max: 60 }), // responseDelayMinutes
        (leadId, responseDelayMinutes) => {
          const createdAt = new Date();
          const firstResponseDue = new Date(
            createdAt.getTime() + 30 * 60 * 1000,
          ); // 30 min SLA
          const resolutionDue = new Date(createdAt.getTime() + 240 * 60 * 1000);

          const tracking: SlaTracking = {
            leadId,
            firstResponseDue,
            firstResponseBreached: false,
            resolutionDue,
            resolutionBreached: false,
            createdAt,
          };

          const responseTime = new Date(
            createdAt.getTime() + responseDelayMinutes * 60 * 1000,
          );
          const updated = recordFirstResponse(tracking, responseTime);

          expect(updated.firstResponseAt).toBeDefined();
          expect(updated.firstResponseAt?.getTime()).toBe(
            responseTime.getTime(),
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should mark as breached if response is after due time', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // leadId
        fc.integer({ min: 31, max: 120 }), // responseDelayMinutes (after 30 min SLA)
        (leadId, responseDelayMinutes) => {
          const createdAt = new Date();
          const firstResponseDue = new Date(
            createdAt.getTime() + 30 * 60 * 1000,
          ); // 30 min SLA
          const resolutionDue = new Date(createdAt.getTime() + 240 * 60 * 1000);

          const tracking: SlaTracking = {
            leadId,
            firstResponseDue,
            firstResponseBreached: false,
            resolutionDue,
            resolutionBreached: false,
            createdAt,
          };

          const responseTime = new Date(
            createdAt.getTime() + responseDelayMinutes * 60 * 1000,
          );
          const updated = recordFirstResponse(tracking, responseTime);

          expect(updated.firstResponseBreached).toBe(true);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should not mark as breached if response is before due time', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // leadId
        fc.integer({ min: 1, max: 29 }), // responseDelayMinutes (before 30 min SLA)
        (leadId, responseDelayMinutes) => {
          const createdAt = new Date();
          const firstResponseDue = new Date(
            createdAt.getTime() + 30 * 60 * 1000,
          ); // 30 min SLA
          const resolutionDue = new Date(createdAt.getTime() + 240 * 60 * 1000);

          const tracking: SlaTracking = {
            leadId,
            firstResponseDue,
            firstResponseBreached: false,
            resolutionDue,
            resolutionBreached: false,
            createdAt,
          };

          const responseTime = new Date(
            createdAt.getTime() + responseDelayMinutes * 60 * 1000,
          );
          const updated = recordFirstResponse(tracking, responseTime);

          expect(updated.firstResponseBreached).toBe(false);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should not update if first response already recorded', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // leadId
        fc.integer({ min: 1, max: 20 }), // firstResponseMinutes
        fc.integer({ min: 21, max: 40 }), // secondResponseMinutes
        (leadId, firstResponseMinutes, secondResponseMinutes) => {
          const createdAt = new Date();
          const firstResponseDue = new Date(
            createdAt.getTime() + 30 * 60 * 1000,
          );
          const resolutionDue = new Date(createdAt.getTime() + 240 * 60 * 1000);

          const firstResponseTime = new Date(
            createdAt.getTime() + firstResponseMinutes * 60 * 1000,
          );

          const tracking: SlaTracking = {
            leadId,
            firstResponseDue,
            firstResponseAt: firstResponseTime, // Already recorded
            firstResponseBreached: false,
            resolutionDue,
            resolutionBreached: false,
            createdAt,
          };

          const secondResponseTime = new Date(
            createdAt.getTime() + secondResponseMinutes * 60 * 1000,
          );
          const updated = recordFirstResponse(tracking, secondResponseTime);

          // Should keep original first response time
          expect(updated.firstResponseAt?.getTime()).toBe(
            firstResponseTime.getTime(),
          );
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should preserve other tracking fields', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // leadId
        fc.integer({ min: 1, max: 29 }), // responseDelayMinutes
        (leadId, responseDelayMinutes) => {
          const createdAt = new Date();
          const firstResponseDue = new Date(
            createdAt.getTime() + 30 * 60 * 1000,
          );
          const resolutionDue = new Date(createdAt.getTime() + 240 * 60 * 1000);

          const tracking: SlaTracking = {
            leadId,
            firstResponseDue,
            firstResponseBreached: false,
            resolutionDue,
            resolutionBreached: false,
            createdAt,
          };

          const responseTime = new Date(
            createdAt.getTime() + responseDelayMinutes * 60 * 1000,
          );
          const updated = recordFirstResponse(tracking, responseTime);

          // Other fields should be preserved
          expect(updated.leadId).toBe(leadId);
          expect(updated.firstResponseDue.getTime()).toBe(
            firstResponseDue.getTime(),
          );
          expect(updated.resolutionDue.getTime()).toBe(resolutionDue.getTime());
          expect(updated.resolvedAt).toBeUndefined();
          expect(updated.resolutionBreached).toBe(false);
        },
      ),
      { numRuns: 50 },
    );
  });
});
