/**
 * **Feature: whatsapp-lead-management, Property 26: JWT Token Claims**
 * **Validates: Requirements 11.1**
 *
 * For any successful login, the issued JWT token SHALL contain the correct user ID and role claims.
 */

import 'reflect-metadata';
import * as fc from 'fast-check';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../common/enums';
import { JwtPayload } from '../interfaces';

// Arbitrary generators
const userRoleArb = fc.constantFrom(...Object.values(UserRole));
const uuidArb = fc.uuid();
const emailArb = fc.emailAddress();

// Arbitrary generator for user data that would be used to generate a token
const userDataArb = fc.record({
  id: uuidArb,
  email: emailArb,
  role: userRoleArb,
});

describe('JWT Token Claims Property Tests', () => {
  let jwtService: JwtService;
  const testSecret = 'test-secret-key-for-property-testing';

  beforeAll(() => {
    jwtService = new JwtService({
      secret: testSecret,
      signOptions: { expiresIn: 3600 },
    });
  });

  /**
   * **Feature: whatsapp-lead-management, Property 26: JWT Token Claims**
   * **Validates: Requirements 11.1**
   *
   * For any valid user data, when a JWT token is generated, decoding the token
   * SHALL return the correct user ID (sub), email, and role claims.
   */
  it('Property 26: JWT token contains correct user ID and role claims', () => {
    fc.assert(
      fc.property(userDataArb, (userData) => {
        // Create JWT payload
        const payload: JwtPayload = {
          sub: userData.id,
          email: userData.email,
          role: userData.role,
        };

        // Generate token
        const token = jwtService.sign(payload);

        // Verify and decode token
        const decoded = jwtService.verify<JwtPayload>(token);

        // Assert that the decoded token contains correct claims
        return (
          decoded.sub === userData.id &&
          decoded.email === userData.email &&
          decoded.role === userData.role &&
          typeof decoded.iat === 'number' &&
          typeof decoded.exp === 'number'
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Additional property: Token signature verification
   * For any token, modifying the payload should invalidate the signature.
   */
  it('Property 26 (extended): Modified token payload invalidates signature', () => {
    fc.assert(
      fc.property(userDataArb, userRoleArb, (userData, differentRole) => {
        // Skip if the different role happens to be the same
        if (differentRole === userData.role) {
          return true;
        }

        const payload: JwtPayload = {
          sub: userData.id,
          email: userData.email,
          role: userData.role,
        };

        const token = jwtService.sign(payload);

        // Split token into parts
        const parts = token.split('.');
        if (parts.length !== 3) {
          return false;
        }

        // Decode payload, modify it, and re-encode
        const decodedPayload = JSON.parse(
          Buffer.from(parts[1], 'base64url').toString(),
        );
        decodedPayload.role = differentRole;
        const modifiedPayloadBase64 = Buffer.from(
          JSON.stringify(decodedPayload),
        ).toString('base64url');

        // Create tampered token with modified payload but original signature
        const tamperedToken = `${parts[0]}.${modifiedPayloadBase64}.${parts[2]}`;

        // Verification should fail for tampered token
        try {
          jwtService.verify(tamperedToken);
          return false; // Should not reach here
        } catch {
          return true; // Expected: verification fails
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Token round-trip consistency
   * For any user data, sign then verify should return equivalent payload data.
   */
  it('Property 26 (round-trip): Sign then verify returns equivalent payload', () => {
    fc.assert(
      fc.property(userDataArb, (userData) => {
        const payload: JwtPayload = {
          sub: userData.id,
          email: userData.email,
          role: userData.role,
        };

        const token = jwtService.sign(payload);
        const decoded = jwtService.verify<JwtPayload>(token);

        // The decoded payload should contain all original claims
        return (
          decoded.sub === payload.sub &&
          decoded.email === payload.email &&
          decoded.role === payload.role
        );
      }),
      { numRuns: 100 },
    );
  });
});
