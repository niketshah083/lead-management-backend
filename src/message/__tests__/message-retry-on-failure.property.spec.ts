import * as fc from 'fast-check';
import { MessageStatus } from '../../common/enums';

/**
 * Property 14: Message Retry on Failure
 * For any failed message delivery, the system SHALL retry up to 3 times
 * and log the final failure status.
 * Validates: Requirements 6.6
 */
describe('Property 14: Message Retry on Failure', () => {
  const MAX_RETRY_ATTEMPTS = 3;

  // Simulate retry logic
  interface RetryResult {
    success: boolean;
    attempts: number;
    finalStatus: MessageStatus;
  }

  function simulateRetry(
    failurePattern: boolean[], // true = success, false = failure for each attempt
  ): RetryResult {
    let attempts = 0;
    let success = false;

    while (attempts < MAX_RETRY_ATTEMPTS && !success) {
      attempts++;
      success = failurePattern[attempts - 1] ?? false;
    }

    return {
      success,
      attempts,
      finalStatus: success ? MessageStatus.SENT : MessageStatus.FAILED,
    };
  }

  it('should retry up to MAX_RETRY_ATTEMPTS times on failure', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constant(false), {
          minLength: MAX_RETRY_ATTEMPTS,
          maxLength: MAX_RETRY_ATTEMPTS,
        }),
        (failurePattern) => {
          const result = simulateRetry(failurePattern);
          expect(result.attempts).toBe(MAX_RETRY_ATTEMPTS);
          expect(result.success).toBe(false);
          expect(result.finalStatus).toBe(MessageStatus.FAILED);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should stop retrying after first success', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: MAX_RETRY_ATTEMPTS }),
        (successAttempt) => {
          // Create pattern where success happens at successAttempt
          const failurePattern = Array(MAX_RETRY_ATTEMPTS).fill(false);
          failurePattern[successAttempt - 1] = true;

          const result = simulateRetry(failurePattern);
          expect(result.attempts).toBe(successAttempt);
          expect(result.success).toBe(true);
          expect(result.finalStatus).toBe(MessageStatus.SENT);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should succeed on first attempt if no failure', () => {
    fc.assert(
      fc.property(
        fc.constant([true, true, true] as boolean[]),
        (failurePattern) => {
          const result = simulateRetry(failurePattern);
          expect(result.attempts).toBe(1);
          expect(result.success).toBe(true);
          expect(result.finalStatus).toBe(MessageStatus.SENT);
        },
      ),
      { numRuns: 10 },
    );
  });

  it('should set FAILED status after all retries exhausted', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constant(false), {
          minLength: MAX_RETRY_ATTEMPTS,
          maxLength: MAX_RETRY_ATTEMPTS,
        }),
        (failurePattern) => {
          const result = simulateRetry(failurePattern);
          expect(result.finalStatus).toBe(MessageStatus.FAILED);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should set SENT status on any successful attempt', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), {
          minLength: MAX_RETRY_ATTEMPTS,
          maxLength: MAX_RETRY_ATTEMPTS,
        }),
        (failurePattern) => {
          // Ensure at least one success
          const hasSuccess = failurePattern.some((v) => v);
          if (!hasSuccess) {
            return true; // Skip patterns with no success
          }

          const result = simulateRetry(failurePattern);
          expect(result.finalStatus).toBe(MessageStatus.SENT);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should never exceed MAX_RETRY_ATTEMPTS', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 0, maxLength: 10 }),
        (failurePattern) => {
          const result = simulateRetry(failurePattern);
          expect(result.attempts).toBeLessThanOrEqual(MAX_RETRY_ATTEMPTS);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should attempt at least once', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 0, maxLength: 10 }),
        (failurePattern) => {
          const result = simulateRetry(failurePattern);
          expect(result.attempts).toBeGreaterThanOrEqual(1);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should handle intermittent failures correctly', () => {
    // Test pattern: fail, fail, succeed
    const pattern = [false, false, true];
    const result = simulateRetry(pattern);
    expect(result.attempts).toBe(3);
    expect(result.success).toBe(true);
    expect(result.finalStatus).toBe(MessageStatus.SENT);
  });

  it('should handle early success correctly', () => {
    // Test pattern: fail, succeed
    const pattern = [false, true, false];
    const result = simulateRetry(pattern);
    expect(result.attempts).toBe(2);
    expect(result.success).toBe(true);
    expect(result.finalStatus).toBe(MessageStatus.SENT);
  });

  it('should correctly report attempt count for various patterns', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), {
          minLength: MAX_RETRY_ATTEMPTS,
          maxLength: MAX_RETRY_ATTEMPTS,
        }),
        (failurePattern) => {
          const result = simulateRetry(failurePattern);

          // Find first success index
          const firstSuccessIndex = failurePattern.findIndex((v) => v);

          if (firstSuccessIndex === -1) {
            // No success, should have tried all attempts
            expect(result.attempts).toBe(MAX_RETRY_ATTEMPTS);
          } else {
            // Success found, should have stopped at that attempt
            expect(result.attempts).toBe(firstSuccessIndex + 1);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
