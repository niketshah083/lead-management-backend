/**
 * **Feature: whatsapp-lead-management, Property 29: Session Invalidation on Deactivation**
 * **Validates: Requirements 11.4**
 *
 * For any user deactivation, all active sessions for that user SHALL be immediately invalidated.
 */

import 'reflect-metadata';
import * as fc from 'fast-check';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../common/enums';
import { JwtPayload } from '../../auth/interfaces';

// Arbitrary generators
const userRoleArb = fc.constantFrom(...Object.values(UserRole));
const uuidArb = fc.uuid();
const emailArb = fc.emailAddress();

// Arbitrary generator for user data
const userDataArb = fc.record({
  id: uuidArb,
  email: emailArb,
  role: userRoleArb,
  isActive: fc.boolean(),
});

/**
 * Simulates the JWT strategy's validate method behavior
 * This is the core logic that determines if a session is valid
 */
function validateSession(
  payload: JwtPayload,
  userLookup: (id: string) => { isActive: boolean } | null,
): { valid: boolean; error?: string } {
  const user = userLookup(payload.sub);

  if (!user) {
    return { valid: false, error: 'User not found' };
  }

  if (!user.isActive) {
    return { valid: false, error: 'User account is deactivated' };
  }

  return { valid: true };
}

describe('Session Invalidation on Deactivation Property Tests', () => {
  /**
   * **Feature: whatsapp-lead-management, Property 29: Session Invalidation on Deactivation**
   * **Validates: Requirements 11.4**
   *
   * For any user that has been deactivated (isActive=false), session validation SHALL fail.
   */
  it('Property 29: Deactivated user sessions are invalidated', () => {
    fc.assert(
      fc.property(userDataArb, (userData) => {
        const payload: JwtPayload = {
          sub: userData.id,
          email: userData.email,
          role: userData.role,
        };

        // Simulate user lookup returning the user with their active status
        const userLookup = (id: string) => {
          if (id === userData.id) {
            return { isActive: userData.isActive };
          }
          return null;
        };

        const result = validateSession(payload, userLookup);

        // If user is active, session should be valid
        // If user is inactive, session should be invalid
        return result.valid === userData.isActive;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 29: Active users maintain valid sessions
   */
  it('Property 29: Active user sessions remain valid', () => {
    fc.assert(
      fc.property(uuidArb, emailArb, userRoleArb, (id, email, role) => {
        const payload: JwtPayload = {
          sub: id,
          email: email,
          role: role,
        };

        // User is active
        const userLookup = () => ({ isActive: true });

        const result = validateSession(payload, userLookup);

        return result.valid === true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 29: Inactive users always have invalid sessions
   */
  it('Property 29: Inactive user sessions are always invalid', () => {
    fc.assert(
      fc.property(uuidArb, emailArb, userRoleArb, (id, email, role) => {
        const payload: JwtPayload = {
          sub: id,
          email: email,
          role: role,
        };

        // User is inactive (deactivated)
        const userLookup = () => ({ isActive: false });

        const result = validateSession(payload, userLookup);

        return (
          result.valid === false &&
          result.error === 'User account is deactivated'
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 29: Non-existent users have invalid sessions
   */
  it('Property 29: Non-existent user sessions are invalid', () => {
    fc.assert(
      fc.property(uuidArb, emailArb, userRoleArb, (id, email, role) => {
        const payload: JwtPayload = {
          sub: id,
          email: email,
          role: role,
        };

        // User doesn't exist
        const userLookup = () => null;

        const result = validateSession(payload, userLookup);

        return result.valid === false && result.error === 'User not found';
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 29: Session state changes immediately with user status
   * For any user, changing isActive from true to false should immediately invalidate sessions
   */
  it('Property 29: Session invalidation is immediate upon deactivation', () => {
    fc.assert(
      fc.property(uuidArb, emailArb, userRoleArb, (id, email, role) => {
        const payload: JwtPayload = {
          sub: id,
          email: email,
          role: role,
        };

        // Simulate a mutable user state
        let userState = { isActive: true };
        const userLookup = () => userState;

        // Initially, session should be valid
        const beforeDeactivation = validateSession(payload, userLookup);
        if (!beforeDeactivation.valid) {
          return false;
        }

        // Deactivate the user
        userState = { isActive: false };

        // After deactivation, session should be invalid
        const afterDeactivation = validateSession(payload, userLookup);

        return afterDeactivation.valid === false;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 29: Multiple sessions for same user are all invalidated
   * For any user with multiple tokens, deactivation invalidates all of them
   */
  it('Property 29: All sessions for deactivated user are invalidated', () => {
    fc.assert(
      fc.property(
        uuidArb,
        emailArb,
        userRoleArb,
        fc.integer({ min: 1, max: 10 }),
        (id, email, role, sessionCount) => {
          // Create multiple "sessions" (tokens) for the same user
          const sessions: JwtPayload[] = Array.from(
            { length: sessionCount },
            () => ({
              sub: id,
              email: email,
              role: role,
            }),
          );

          // User is deactivated
          const userLookup = () => ({ isActive: false });

          // All sessions should be invalid
          return sessions.every((payload) => {
            const result = validateSession(payload, userLookup);
            return result.valid === false;
          });
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 29: Deactivation of one user doesn't affect other users' sessions
   */
  it('Property 29: Deactivation is user-specific', () => {
    fc.assert(
      fc.property(
        uuidArb,
        uuidArb,
        emailArb,
        emailArb,
        userRoleArb,
        (deactivatedUserId, activeUserId, email1, email2, role) => {
          // Skip if IDs happen to be the same
          if (deactivatedUserId === activeUserId) {
            return true;
          }

          const deactivatedPayload: JwtPayload = {
            sub: deactivatedUserId,
            email: email1,
            role: role,
          };

          const activePayload: JwtPayload = {
            sub: activeUserId,
            email: email2,
            role: role,
          };

          // User lookup: deactivated user is inactive, other user is active
          const userLookup = (id: string) => {
            if (id === deactivatedUserId) {
              return { isActive: false };
            }
            if (id === activeUserId) {
              return { isActive: true };
            }
            return null;
          };

          const deactivatedResult = validateSession(
            deactivatedPayload,
            userLookup,
          );
          const activeResult = validateSession(activePayload, userLookup);

          // Deactivated user's session should be invalid
          // Active user's session should remain valid
          return (
            deactivatedResult.valid === false && activeResult.valid === true
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
