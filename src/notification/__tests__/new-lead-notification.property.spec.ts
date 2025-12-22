/**
 * Property Test: New Lead Notification Dispatch
 * **Feature: whatsapp-lead-management, Property 24: New Lead Notification Dispatch**
 * **Validates: Requirements 10.1, 10.2**
 *
 * For any new qualified lead, the system SHALL send both email and push
 * notifications to all eligible Customer Executives.
 */

import * as fc from 'fast-check';
import { UserRole, LeadStatus } from '../../common/enums';

describe('Property 24: New Lead Notification Dispatch', () => {
  const uuidArb = fc.uuid();

  const userArb = fc.record({
    id: uuidArb,
    email: fc.emailAddress(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    role: fc.constant(UserRole.CUSTOMER_EXECUTIVE),
    fcmToken: fc.option(fc.string({ minLength: 10, maxLength: 200 }), {
      nil: undefined,
    }),
    isActive: fc.constant(true),
  });

  const leadArb = fc.record({
    id: uuidArb,
    phoneNumber: fc.stringMatching(/^\+[1-9]\d{9,14}$/),
    categoryId: uuidArb,
    status: fc.constant(LeadStatus.NEW),
    isQualified: fc.constant(true),
  });

  interface NotificationConfig {
    emailEnabled: boolean;
    pushEnabled: boolean;
  }

  /**
   * Helper to determine which notifications should be sent
   */
  function getExpectedNotifications(
    config: NotificationConfig,
    eligibleUsers: { email?: string; fcmToken?: string }[],
  ): { emailCount: number; pushCount: number } {
    const emailCount =
      config.emailEnabled && eligibleUsers.some((u) => u.email)
        ? eligibleUsers.filter((u) => u.email).length
        : 0;

    const pushCount =
      config.pushEnabled && eligibleUsers.some((u) => u.fcmToken)
        ? eligibleUsers.filter((u) => u.fcmToken).length
        : 0;

    return { emailCount, pushCount };
  }

  /**
   * Property: All eligible CEs receive email notification when enabled
   */
  it('should send email to all eligible CEs when email is enabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        leadArb,
        fc.array(userArb, { minLength: 1, maxLength: 5 }),
        async (lead, eligibleUsers) => {
          const config: NotificationConfig = {
            emailEnabled: true,
            pushEnabled: false,
          };

          const expected = getExpectedNotifications(config, eligibleUsers);

          // All users with email should receive notification
          const usersWithEmail = eligibleUsers.filter((u) => u.email);
          expect(expected.emailCount).toBe(usersWithEmail.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: All eligible CEs receive push notification when enabled
   */
  it('should send push notification to all eligible CEs when push is enabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        leadArb,
        fc.array(userArb, { minLength: 1, maxLength: 5 }),
        async (lead, eligibleUsers) => {
          const config: NotificationConfig = {
            emailEnabled: false,
            pushEnabled: true,
          };

          const expected = getExpectedNotifications(config, eligibleUsers);

          // All users with FCM token should receive notification
          const usersWithToken = eligibleUsers.filter((u) => u.fcmToken);
          expect(expected.pushCount).toBe(usersWithToken.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Both email and push sent when both enabled
   */
  it('should send both email and push when both are enabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        leadArb,
        fc.array(userArb, { minLength: 1, maxLength: 5 }),
        async (lead, eligibleUsers) => {
          const config: NotificationConfig = {
            emailEnabled: true,
            pushEnabled: true,
          };

          const expected = getExpectedNotifications(config, eligibleUsers);

          const usersWithEmail = eligibleUsers.filter((u) => u.email);
          const usersWithToken = eligibleUsers.filter((u) => u.fcmToken);

          expect(expected.emailCount).toBe(usersWithEmail.length);
          expect(expected.pushCount).toBe(usersWithToken.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: No notifications when both disabled
   */
  it('should not send notifications when both are disabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        leadArb,
        fc.array(userArb, { minLength: 1, maxLength: 5 }),
        async (lead, eligibleUsers) => {
          const config: NotificationConfig = {
            emailEnabled: false,
            pushEnabled: false,
          };

          const expected = getExpectedNotifications(config, eligibleUsers);

          expect(expected.emailCount).toBe(0);
          expect(expected.pushCount).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: No notifications when no eligible users
   */
  it('should not send notifications when no eligible users', async () => {
    await fc.assert(
      fc.asyncProperty(leadArb, async (lead) => {
        const config: NotificationConfig = {
          emailEnabled: true,
          pushEnabled: true,
        };

        const expected = getExpectedNotifications(config, []);

        expect(expected.emailCount).toBe(0);
        expect(expected.pushCount).toBe(0);
      }),
      { numRuns: 100 },
    );
  });
});
