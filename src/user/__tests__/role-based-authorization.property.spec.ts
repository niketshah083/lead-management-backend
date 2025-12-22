/**
 * **Feature: whatsapp-lead-management, Property 27: Role-Based Authorization**
 * **Validates: Requirements 11.2**
 *
 * For any resource access attempt, the system SHALL allow access only if the user's role has the required permission.
 */

import 'reflect-metadata';
import * as fc from 'fast-check';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../common/enums';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';

// Arbitrary generators
const userRoleArb = fc.constantFrom(...Object.values(UserRole));
const rolesSubsetArb = fc.subarray(Object.values(UserRole), { minLength: 0 });

// Create a mock execution context
function createMockExecutionContext(userRole: UserRole): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: { role: userRole },
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

// Create a mock reflector that returns the specified roles
function createMockReflector(requiredRoles: UserRole[] | undefined): Reflector {
  return {
    getAllAndOverride: (key: string) => {
      if (key === ROLES_KEY) {
        return requiredRoles;
      }
      return undefined;
    },
  } as unknown as Reflector;
}

describe('Role-Based Authorization Property Tests', () => {
  /**
   * **Feature: whatsapp-lead-management, Property 27: Role-Based Authorization**
   * **Validates: Requirements 11.2**
   *
   * For any user role and any set of required roles, access SHALL be granted
   * if and only if the user's role is in the required roles set.
   */
  it('Property 27: Access granted iff user role is in required roles', () => {
    fc.assert(
      fc.property(userRoleArb, rolesSubsetArb, (userRole, requiredRoles) => {
        const context = createMockExecutionContext(userRole);
        const reflector = createMockReflector(
          requiredRoles.length > 0 ? requiredRoles : undefined,
        );
        const guard = new RolesGuard(reflector);

        const canActivate = guard.canActivate(context);

        // If no roles are required (empty or undefined), access should be granted
        if (requiredRoles.length === 0) {
          return canActivate === true;
        }

        // Access should be granted iff user's role is in the required roles
        const shouldHaveAccess = requiredRoles.includes(userRole);
        return canActivate === shouldHaveAccess;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 27 (Admin access): Admin role should have access when Admin is in required roles
   */
  it('Property 27: Admin has access when Admin role is required', () => {
    fc.assert(
      fc.property(rolesSubsetArb, (otherRoles) => {
        // Always include ADMIN in required roles for this test
        const requiredRoles = [...new Set([...otherRoles, UserRole.ADMIN])];

        const context = createMockExecutionContext(UserRole.ADMIN);
        const reflector = createMockReflector(requiredRoles);
        const guard = new RolesGuard(reflector);

        return guard.canActivate(context) === true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 27 (Role exclusion): User without required role should be denied
   */
  it('Property 27: User without required role is denied access', () => {
    fc.assert(
      fc.property(userRoleArb, (userRole) => {
        // Create required roles that exclude the user's role
        const allRoles = Object.values(UserRole);
        const requiredRoles = allRoles.filter((r) => r !== userRole);

        // Skip if all roles would be excluded (shouldn't happen with 3 roles)
        if (requiredRoles.length === 0) {
          return true;
        }

        const context = createMockExecutionContext(userRole);
        const reflector = createMockReflector(requiredRoles);
        const guard = new RolesGuard(reflector);

        return guard.canActivate(context) === false;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 27 (No restriction): When no roles are specified, all users have access
   */
  it('Property 27: No role restriction grants access to all users', () => {
    fc.assert(
      fc.property(userRoleArb, (userRole) => {
        const context = createMockExecutionContext(userRole);
        const reflector = createMockReflector(undefined);
        const guard = new RolesGuard(reflector);

        return guard.canActivate(context) === true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 27 (Single role): When exactly one role is required, only that role has access
   */
  it('Property 27: Single required role grants access only to that role', () => {
    fc.assert(
      fc.property(userRoleArb, userRoleArb, (userRole, requiredRole) => {
        const context = createMockExecutionContext(userRole);
        const reflector = createMockReflector([requiredRole]);
        const guard = new RolesGuard(reflector);

        const canActivate = guard.canActivate(context);
        const shouldHaveAccess = userRole === requiredRole;

        return canActivate === shouldHaveAccess;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 27 (Role hierarchy): Test that role-based access respects the hierarchy
   * Admin > Manager > Customer Executive in terms of typical access patterns
   */
  it('Property 27: Admin-only endpoints reject non-admin users', () => {
    fc.assert(
      fc.property(userRoleArb, (userRole) => {
        const context = createMockExecutionContext(userRole);
        const reflector = createMockReflector([UserRole.ADMIN]);
        const guard = new RolesGuard(reflector);

        const canActivate = guard.canActivate(context);

        // Only ADMIN should have access
        if (userRole === UserRole.ADMIN) {
          return canActivate === true;
        }
        return canActivate === false;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 27 (Manager access): Manager-level endpoints accept Admin and Manager
   */
  it('Property 27: Manager-level endpoints accept Admin and Manager', () => {
    fc.assert(
      fc.property(userRoleArb, (userRole) => {
        const context = createMockExecutionContext(userRole);
        const reflector = createMockReflector([
          UserRole.ADMIN,
          UserRole.MANAGER,
        ]);
        const guard = new RolesGuard(reflector);

        const canActivate = guard.canActivate(context);

        // ADMIN and MANAGER should have access
        if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) {
          return canActivate === true;
        }
        return canActivate === false;
      }),
      { numRuns: 100 },
    );
  });
});
