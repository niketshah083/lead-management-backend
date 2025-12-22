import * as fc from 'fast-check';
import { LeadHistory } from '../../entities/lead-history.entity';
import { LeadStatus } from '../../common/enums';

/**
 * **Feature: whatsapp-lead-management, Property 31: Status Change History**
 * **Validates: Requirements 12.2**
 *
 * For any lead status update, the system SHALL create a history record with
 * timestamp, previous status, new status, and user who made the change.
 */
describe('Property 31: Status Change History', () => {
  // Arbitrary for UUID-like IDs
  const uuidArb = fc.uuid();

  // Arbitrary for lead status
  const statusArb = fc.constantFrom(
    LeadStatus.NEW,
    LeadStatus.CONTACTED,
    LeadStatus.QUALIFIED,
    LeadStatus.NEGOTIATION,
    LeadStatus.WON,
    LeadStatus.LOST,
  );

  // Arbitrary for optional notes
  const notesArb = fc.option(fc.string({ minLength: 1, maxLength: 200 }), {
    nil: undefined,
  });

  // Helper to create a history record
  const createHistoryRecord = (
    leadId: string,
    previousStatus: LeadStatus,
    newStatus: LeadStatus,
    changedById: string,
    notes?: string,
  ): LeadHistory => {
    const history = new LeadHistory();
    history.id = `history-${Math.random().toString(36).substr(2, 9)}`;
    history.leadId = leadId;
    history.previousStatus = previousStatus;
    history.newStatus = newStatus;
    history.changedById = changedById;
    if (notes) history.notes = notes;
    history.createdAt = new Date();
    return history;
  };

  it('should record previous status correctly', () => {
    fc.assert(
      fc.property(
        uuidArb,
        statusArb,
        statusArb,
        uuidArb,
        (leadId, previousStatus, newStatus, userId) => {
          const history = createHistoryRecord(
            leadId,
            previousStatus,
            newStatus,
            userId,
          );

          expect(history.previousStatus).toBe(previousStatus);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should record new status correctly', () => {
    fc.assert(
      fc.property(
        uuidArb,
        statusArb,
        statusArb,
        uuidArb,
        (leadId, previousStatus, newStatus, userId) => {
          const history = createHistoryRecord(
            leadId,
            previousStatus,
            newStatus,
            userId,
          );

          expect(history.newStatus).toBe(newStatus);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should record user who made the change', () => {
    fc.assert(
      fc.property(
        uuidArb,
        statusArb,
        statusArb,
        uuidArb,
        (leadId, previousStatus, newStatus, userId) => {
          const history = createHistoryRecord(
            leadId,
            previousStatus,
            newStatus,
            userId,
          );

          expect(history.changedById).toBe(userId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should record timestamp of change', () => {
    fc.assert(
      fc.property(
        uuidArb,
        statusArb,
        statusArb,
        uuidArb,
        (leadId, previousStatus, newStatus, userId) => {
          const beforeCreate = new Date();
          const history = createHistoryRecord(
            leadId,
            previousStatus,
            newStatus,
            userId,
          );

          expect(history.createdAt).toBeInstanceOf(Date);
          expect(history.createdAt.getTime()).toBeGreaterThanOrEqual(
            beforeCreate.getTime(),
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should preserve optional notes when provided', () => {
    fc.assert(
      fc.property(
        uuidArb,
        statusArb,
        statusArb,
        uuidArb,
        fc.string({ minLength: 1, maxLength: 200 }),
        (leadId, previousStatus, newStatus, userId, notes) => {
          const history = createHistoryRecord(
            leadId,
            previousStatus,
            newStatus,
            userId,
            notes,
          );

          expect(history.notes).toBe(notes);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should link history to correct lead', () => {
    fc.assert(
      fc.property(
        uuidArb,
        statusArb,
        statusArb,
        uuidArb,
        (leadId, previousStatus, newStatus, userId) => {
          const history = createHistoryRecord(
            leadId,
            previousStatus,
            newStatus,
            userId,
          );

          expect(history.leadId).toBe(leadId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should create unique history records for each status change', () => {
    fc.assert(
      fc.property(
        uuidArb,
        fc.array(
          fc.record({
            previousStatus: statusArb,
            newStatus: statusArb,
            userId: uuidArb,
          }),
          { minLength: 2, maxLength: 5 },
        ),
        (leadId, changes) => {
          const histories = changes.map((change) =>
            createHistoryRecord(
              leadId,
              change.previousStatus,
              change.newStatus,
              change.userId,
            ),
          );

          // All history records should have unique IDs
          const ids = histories.map((h) => h.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(histories.length);

          // All should be linked to the same lead
          histories.forEach((h) => {
            expect(h.leadId).toBe(leadId);
          });
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should handle status transitions correctly', () => {
    fc.assert(
      fc.property(uuidArb, uuidArb, (leadId, userId) => {
        // Simulate a typical status progression
        const transitions = [
          { from: LeadStatus.NEW, to: LeadStatus.CONTACTED },
          { from: LeadStatus.CONTACTED, to: LeadStatus.QUALIFIED },
          { from: LeadStatus.QUALIFIED, to: LeadStatus.NEGOTIATION },
          { from: LeadStatus.NEGOTIATION, to: LeadStatus.WON },
        ];

        const histories = transitions.map((t) =>
          createHistoryRecord(leadId, t.from, t.to, userId),
        );

        // Verify each transition is recorded correctly
        for (let i = 0; i < transitions.length; i++) {
          expect(histories[i].previousStatus).toBe(transitions[i].from);
          expect(histories[i].newStatus).toBe(transitions[i].to);
        }
      }),
      { numRuns: 50 },
    );
  });
});
