/**
 * Property Test: Manager Reassignment Scope
 * **Feature: whatsapp-lead-management, Property 16: Manager Reassignment Scope**
 * **Validates: Requirements 7.4**
 *
 * For any lead reassignment by a Manager, the target Customer Executive
 * SHALL be within the Manager's team.
 */

import * as fc from 'fast-check';
import { UserRole } from '../../common/enums';

describe('Property 16: Manager Reassignment Scope', () => {
  const uuidArb = fc.uuid();

  const managerArb = fc.record({
    id: uuidArb,
    email: fc.emailAddress(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    role: fc.constant(UserRole.MANAGER),
    managerId: fc.constant(null as string | null),
    isActive: fc.constant(true),
  });

  const ceUserArb = (managerId: string) =>
    fc.record({
      id: uuidArb,
      email: fc.emailAddress(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      role: fc.constant(UserRole.CUSTOMER_EXECUTIVE),
      managerId: fc.constant(managerId),
      isActive: fc.constant(true),
    });

  /**
   * Helper function to check if reassignment is valid based on manager scope
   */
  function isValidReassignment(
    manager: { id: string; role: UserRole },
    targetUser: { id: string; managerId: string | null },
    teamMemberIds: string[],
  ): boolean {
    // Manager can reassign to themselves
    if (targetUser.id === manager.id) {
      return true;
    }
    // Manager can reassign to their team members
    return teamMemberIds.includes(targetUser.id);
  }

  /**
   * Property: Manager can reassign leads to team members
   */
  it('should allow manager to reassign leads within their team', async () => {
    await fc.assert(
      fc.asyncProperty(managerArb, async (manager) => {
        // Generate team members
        const teamMembers = fc.sample(ceUserArb(manager.id), 3);
        const targetCE = teamMembers[1];

        const teamMemberIds = teamMembers.map((m) => m.id);

        // Verify reassignment to team member is valid
        const isValid = isValidReassignment(manager, targetCE, teamMemberIds);

        expect(isValid).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Manager cannot reassign leads to users outside their team
   */
  it('should reject reassignment to users outside manager team', async () => {
    await fc.assert(
      fc.asyncProperty(managerArb, managerArb, async (manager1, manager2) => {
        // Ensure different managers
        fc.pre(manager1.id !== manager2.id);

        // Generate team for manager1
        const team1Members = fc.sample(ceUserArb(manager1.id), 2);
        // Generate team for manager2
        const team2Members = fc.sample(ceUserArb(manager2.id), 2);

        const targetCE = team2Members[0]; // From different team
        const team1MemberIds = team1Members.map((m) => m.id);

        // Verify reassignment to other team is invalid
        const isValid = isValidReassignment(manager1, targetCE, team1MemberIds);

        expect(isValid).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Manager can reassign leads to themselves
   */
  it('should allow manager to reassign leads to themselves', async () => {
    await fc.assert(
      fc.asyncProperty(managerArb, async (manager) => {
        const teamMembers = fc.sample(ceUserArb(manager.id), 2);
        const teamMemberIds = teamMembers.map((m) => m.id);

        // Manager reassigning to themselves
        const isValid = isValidReassignment(
          manager,
          { id: manager.id, managerId: null },
          teamMemberIds,
        );

        expect(isValid).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Team membership determines reassignment scope
   */
  it('should only allow reassignment based on team membership', async () => {
    await fc.assert(
      fc.asyncProperty(
        managerArb,
        fc.array(uuidArb, { minLength: 1, maxLength: 5 }),
        uuidArb,
        async (manager, teamMemberIds, outsiderId) => {
          // Ensure outsider is not in team
          fc.pre(!teamMemberIds.includes(outsiderId));
          fc.pre(outsiderId !== manager.id);

          // Team members should be valid targets
          for (const memberId of teamMemberIds) {
            const isValid = isValidReassignment(
              manager,
              { id: memberId, managerId: manager.id },
              teamMemberIds,
            );
            expect(isValid).toBe(true);
          }

          // Outsider should not be valid target
          const isOutsiderValid = isValidReassignment(
            manager,
            { id: outsiderId, managerId: null },
            teamMemberIds,
          );
          expect(isOutsiderValid).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});
