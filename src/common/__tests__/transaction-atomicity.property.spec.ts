/**
 * **Feature: whatsapp-lead-management, Property 37: Transaction Atomicity**
 * **Validates: Requirements 14.5**
 *
 * For any multi-table operation that fails partway through, the system SHALL
 * rollback all changes, leaving the database in its original state.
 */

import 'reflect-metadata';
import * as fc from 'fast-check';

interface OperationRecord {
  type: string;
  data: unknown;
}

interface EntityData {
  entity: string;
  [key: string]: unknown;
}

/**
 * Mock QueryRunner that simulates transaction behavior.
 * This allows us to test the transaction logic without a real database.
 */
class MockQueryRunner {
  private operations: OperationRecord[] = [];
  private committed = false;
  private rolledBack = false;
  private shouldFailOnOperation: number | null = null;
  private operationCount = 0;

  constructor(failOnOperation: number | null = null) {
    this.shouldFailOnOperation = failOnOperation;
  }

  async connect(): Promise<void> {
    // Simulates connection
  }

  async startTransaction(): Promise<void> {
    this.operations = [];
    this.committed = false;
    this.rolledBack = false;
    this.operationCount = 0;
  }

  get manager() {
    const self = this;
    return {
      delete: async (entity: string, criteria: unknown) => {
        self.operationCount++;
        if (self.shouldFailOnOperation === self.operationCount) {
          throw new Error('Simulated database error during delete');
        }
        self.operations.push({ type: 'delete', data: { entity, criteria } });
      },
      create: (entity: string, data: Record<string, unknown>): EntityData => {
        return { entity, ...data };
      },
      save: async (data: unknown) => {
        self.operationCount++;
        if (self.shouldFailOnOperation === self.operationCount) {
          throw new Error('Simulated database error during save');
        }
        self.operations.push({ type: 'save', data });
        return data;
      },
    };
  }

  async commitTransaction(): Promise<void> {
    if (this.rolledBack) {
      throw new Error('Cannot commit a rolled back transaction');
    }
    this.committed = true;
  }

  async rollbackTransaction(): Promise<void> {
    if (this.committed) {
      throw new Error('Cannot rollback a committed transaction');
    }
    this.rolledBack = true;
    this.operations = []; // Clear operations on rollback
  }

  async release(): Promise<void> {
    // Simulates releasing the connection
  }

  isCommitted(): boolean {
    return this.committed;
  }

  isRolledBack(): boolean {
    return this.rolledBack;
  }

  getOperations(): OperationRecord[] {
    return this.operations;
  }

  getOperationCount(): number {
    return this.operationCount;
  }
}

interface TransactionResult {
  success: boolean;
  error?: Error;
}

/**
 * Simulates a transactional category assignment operation.
 * This mirrors the logic in UserService.assignCategories.
 */
async function simulateTransactionalCategoryAssignment(
  queryRunner: MockQueryRunner,
  userId: string,
  categoryIds: string[],
): Promise<TransactionResult> {
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Step 1: Delete existing category assignments
    await queryRunner.manager.delete('UserCategory', { userId });

    // Step 2: Create and save new category assignments
    const userCategories = categoryIds.map((categoryId) => {
      return queryRunner.manager.create('UserCategory', {
        userId,
        categoryId,
      });
    });

    await queryRunner.manager.save(userCategories);

    await queryRunner.commitTransaction();
    return { success: true };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    return { success: false, error: error as Error };
  } finally {
    await queryRunner.release();
  }
}

/**
 * Simulates a transactional lead creation with SLA tracking.
 * This represents another multi-table operation pattern.
 */
async function simulateTransactionalLeadCreation(
  queryRunner: MockQueryRunner,
  leadData: { phoneNumber: string; categoryId: string },
  slaPolicyId: string,
): Promise<TransactionResult> {
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Step 1: Create lead
    const lead = queryRunner.manager.create('Lead', {
      phoneNumber: leadData.phoneNumber,
      categoryId: leadData.categoryId,
      status: 'new',
    });
    const savedLead = (await queryRunner.manager.save(lead)) as EntityData;

    // Step 2: Create SLA tracking
    const slaTracking = queryRunner.manager.create('SlaTracking', {
      leadId: (savedLead.id as string) || 'generated-id',
      policyId: slaPolicyId,
      firstResponseDue: new Date(Date.now() + 3600000),
    });
    await queryRunner.manager.save(slaTracking);

    await queryRunner.commitTransaction();
    return { success: true };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    return { success: false, error: error as Error };
  } finally {
    await queryRunner.release();
  }
}

// Arbitrary generators
const uuidArb = fc.uuid();
const categoryIdsArb = fc.array(fc.uuid(), { minLength: 1, maxLength: 5 });
const phoneNumberArb = fc.stringMatching(/^[0-9]{10,15}$/);

describe('Transaction Atomicity Property Tests', () => {
  /**
   * **Feature: whatsapp-lead-management, Property 37: Transaction Atomicity**
   * **Validates: Requirements 14.5**
   */
  describe('Property 37: Transaction Atomicity', () => {
    it('successful transaction commits all operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          uuidArb,
          categoryIdsArb,
          async (userId, categoryIds) => {
            const queryRunner = new MockQueryRunner(null); // No failure

            const result = await simulateTransactionalCategoryAssignment(
              queryRunner,
              userId,
              categoryIds,
            );

            // Transaction should succeed
            expect(result.success).toBe(true);
            expect(queryRunner.isCommitted()).toBe(true);
            expect(queryRunner.isRolledBack()).toBe(false);

            // All operations should be recorded
            const operations = queryRunner.getOperations();
            expect(operations.length).toBe(2); // 1 delete + 1 save

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('failed transaction during delete rolls back all changes', async () => {
      await fc.assert(
        fc.asyncProperty(
          uuidArb,
          categoryIdsArb,
          async (userId, categoryIds) => {
            const queryRunner = new MockQueryRunner(1); // Fail on first operation (delete)

            const result = await simulateTransactionalCategoryAssignment(
              queryRunner,
              userId,
              categoryIds,
            );

            // Transaction should fail and rollback
            expect(result.success).toBe(false);
            expect(queryRunner.isCommitted()).toBe(false);
            expect(queryRunner.isRolledBack()).toBe(true);

            // No operations should remain after rollback
            const operations = queryRunner.getOperations();
            expect(operations.length).toBe(0);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('failed transaction during save rolls back all changes including prior deletes', async () => {
      await fc.assert(
        fc.asyncProperty(
          uuidArb,
          categoryIdsArb,
          async (userId, categoryIds) => {
            const queryRunner = new MockQueryRunner(2); // Fail on second operation (save)

            const result = await simulateTransactionalCategoryAssignment(
              queryRunner,
              userId,
              categoryIds,
            );

            // Transaction should fail and rollback
            expect(result.success).toBe(false);
            expect(queryRunner.isCommitted()).toBe(false);
            expect(queryRunner.isRolledBack()).toBe(true);

            // No operations should remain after rollback
            const operations = queryRunner.getOperations();
            expect(operations.length).toBe(0);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('multi-table lead creation transaction rolls back on failure', async () => {
      await fc.assert(
        fc.asyncProperty(
          phoneNumberArb,
          uuidArb,
          uuidArb,
          async (phoneNumber, categoryId, slaPolicyId) => {
            // Fail on second save (SLA tracking)
            const queryRunner = new MockQueryRunner(2);

            const result = await simulateTransactionalLeadCreation(
              queryRunner,
              { phoneNumber, categoryId },
              slaPolicyId,
            );

            // Transaction should fail and rollback
            expect(result.success).toBe(false);
            expect(queryRunner.isCommitted()).toBe(false);
            expect(queryRunner.isRolledBack()).toBe(true);

            // No operations should remain after rollback
            const operations = queryRunner.getOperations();
            expect(operations.length).toBe(0);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('transaction state is mutually exclusive: either committed or rolled back', async () => {
      await fc.assert(
        fc.asyncProperty(
          uuidArb,
          categoryIdsArb,
          fc.integer({ min: 0, max: 3 }),
          async (userId, categoryIds, failPoint) => {
            // failPoint 0 = no failure, 1-3 = fail at that operation
            const queryRunner = new MockQueryRunner(
              failPoint === 0 ? null : failPoint,
            );

            await simulateTransactionalCategoryAssignment(
              queryRunner,
              userId,
              categoryIds,
            );

            // Transaction must be in exactly one state
            const committed = queryRunner.isCommitted();
            const rolledBack = queryRunner.isRolledBack();

            // XOR: exactly one must be true
            expect(committed !== rolledBack).toBe(true);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rollback preserves original state by clearing all pending operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          uuidArb,
          categoryIdsArb,
          fc.integer({ min: 1, max: 2 }),
          async (userId, categoryIds, failPoint) => {
            const queryRunner = new MockQueryRunner(failPoint);

            // Capture state before transaction
            const operationsBefore = queryRunner.getOperations().length;

            await simulateTransactionalCategoryAssignment(
              queryRunner,
              userId,
              categoryIds,
            );

            // After rollback, operations should be cleared
            const operationsAfter = queryRunner.getOperations().length;

            expect(operationsAfter).toBe(operationsBefore);
            expect(queryRunner.isRolledBack()).toBe(true);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
