/**
 * **Feature: whatsapp-lead-management, Property 28: Token Expiry Enforcement**
 * **Validates: Requirements 11.3**
 *
 * For any expired JWT token, the system SHALL reject the request and require re-authentication.
 */

import 'reflect-metadata';
import * as fc from 'fast-check';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UserRole } from '../../common/enums';
import { JwtPayload } from '../interfaces';

// Arbitrary generators
const userRoleArb = fc.constantFrom(...Object.values(UserRole));
const uuidArb = fc.uuid();
const emailArb = fc.emailAddress();

// Arbitrary generator for user data
const userDataArb = fc.record({
  id: uuidArb,
  email: emailArb,
  role: userRoleArb,
});

// Arbitrary generator for expiration time in seconds (positive values for valid tokens)
const validExpirationArb = fc.integer({ min: 60, max: 86400 }); // 1 minute to 1 day

// Arbitrary generator for already-expired tokens (negative expiration)
const expiredExpirationArb = fc.integer({ min: -86400, max: -1 }); // Already expired

describe('Token Expiry Enforcement Property Tests', () => {
  const testSecret = 'test-secret-key-for-property-testing';

  /**
   * **Feature: whatsapp-lead-management, Property 28: Token Expiry Enforcement**
   * **Validates: Requirements 11.3**
   *
   * For any token with a valid (future) expiration time, verification SHALL succeed.
   */
  it('Property 28: Valid (non-expired) tokens are accepted', () => {
    fc.assert(
      fc.property(userDataArb, validExpirationArb, (userData, expiresIn) => {
        const jwtService = new JwtService({
          secret: testSecret,
          signOptions: { expiresIn },
        });

        const payload: JwtPayload = {
          sub: userData.id,
          email: userData.email,
          role: userData.role,
        };

        const token = jwtService.sign(payload);

        try {
          const decoded = jwtService.verify<JwtPayload>(token);
          // Token should be valid and contain correct claims
          return (
            decoded.sub === userData.id &&
            decoded.email === userData.email &&
            decoded.role === userData.role &&
            typeof decoded.exp === 'number' &&
            decoded.exp > Math.floor(Date.now() / 1000)
          );
        } catch {
          return false; // Should not throw for valid tokens
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Feature: whatsapp-lead-management, Property 28: Token Expiry Enforcement**
   * **Validates: Requirements 11.3**
   *
   * For any token that has already expired, verification SHALL fail with TokenExpiredError.
   */
  it('Property 28: Expired tokens are rejected', () => {
    fc.assert(
      fc.property(
        userDataArb,
        expiredExpirationArb,
        (userData, negativeExpiry) => {
          const jwtService = new JwtService({
            secret: testSecret,
          });

          const payload: JwtPayload = {
            sub: userData.id,
            email: userData.email,
            role: userData.role,
          };

          // Create a token that is already expired by setting exp in the past
          const now = Math.floor(Date.now() / 1000);
          const expiredPayload = {
            ...payload,
            iat: now + negativeExpiry - 10, // Issued before expiry
            exp: now + negativeExpiry, // Expired in the past
          };

          const token = jwtService.sign(expiredPayload, { noTimestamp: true });

          try {
            jwtService.verify(token);
            return false; // Should not reach here - expired tokens should throw
          } catch (error) {
            // Should throw TokenExpiredError for expired tokens
            return error instanceof TokenExpiredError;
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Token expiration time is correctly encoded
   * For any expiration duration, the token's exp claim should be approximately iat + duration.
   */
  it('Property 28 (extended): Token exp claim matches configured expiration', () => {
    fc.assert(
      fc.property(userDataArb, validExpirationArb, (userData, expiresIn) => {
        const jwtService = new JwtService({
          secret: testSecret,
          signOptions: { expiresIn },
        });

        const payload: JwtPayload = {
          sub: userData.id,
          email: userData.email,
          role: userData.role,
        };

        const beforeSign = Math.floor(Date.now() / 1000);
        const token = jwtService.sign(payload);
        const afterSign = Math.floor(Date.now() / 1000);

        const decoded = jwtService.verify<JwtPayload>(token);

        // exp should be approximately iat + expiresIn (within 1 second tolerance)
        const expectedExpMin = beforeSign + expiresIn;
        const expectedExpMax = afterSign + expiresIn + 1;

        return (
          typeof decoded.exp === 'number' &&
          typeof decoded.iat === 'number' &&
          decoded.exp >= expectedExpMin &&
          decoded.exp <= expectedExpMax
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Tokens with ignoreExpiration=false reject expired tokens
   * This tests the verification behavior explicitly.
   */
  it('Property 28 (verification): ignoreExpiration=false rejects expired tokens', () => {
    fc.assert(
      fc.property(userDataArb, (userData) => {
        const jwtService = new JwtService({
          secret: testSecret,
        });

        const payload: JwtPayload = {
          sub: userData.id,
          email: userData.email,
          role: userData.role,
        };

        // Create an already-expired token
        const now = Math.floor(Date.now() / 1000);
        const expiredPayload = {
          ...payload,
          iat: now - 3600, // Issued 1 hour ago
          exp: now - 1800, // Expired 30 minutes ago
        };

        const token = jwtService.sign(expiredPayload, { noTimestamp: true });

        // With ignoreExpiration=false (default), should reject
        try {
          jwtService.verify(token, { ignoreExpiration: false });
          return false;
        } catch (error) {
          if (!(error instanceof TokenExpiredError)) {
            return false;
          }
        }

        // With ignoreExpiration=true, should accept
        try {
          const decoded = jwtService.verify<JwtPayload>(token, {
            ignoreExpiration: true,
          });
          return decoded.sub === userData.id;
        } catch {
          return false;
        }
      }),
      { numRuns: 100 },
    );
  });
});
