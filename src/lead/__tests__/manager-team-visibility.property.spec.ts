/**
 * Property Test: Manager Team Visibility
 * **Feature: whatsapp-lead-management, Property 15: Manager Team Visibility**
 * **Validates: Requirements 7.1**
 *
 * For any Manager, the dashboard SHALL display only leads assigned to
 * Customer Executives under their supervision, and no leads from other teams.
 */

import * as fc from 'fast-check';
import { LeadVisibilityService } from '../services';
import { Lead, User } from '../../entities';
import { UserRole, LeadStatus } from '../../common/enums';

describe('Property 15: Manager Team Visibility', () => {
  const uuidArb = fc.uuid();

  const categoryArb = fc.record({
    id: uuidArb,
    name: fc.string({ minLength: 1, maxLength: 50 }),
    isActive: fc.constant(true),
  });

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

  const leadArb = (categoryId: string, assignedToId: string | null) =>
    fc.record({
      id: uuidArb,
      phoneNumber: fc.stringMatching(/^\+[1-9]\d{9,14}$/),
      categoryId: fc.constant(categoryId),
      status: fc.constantFrom(...Object.values(LeadStatus)),
      assignedToId: fc.constant(assignedToId ?? undefined),
      isQualified: fc.boolean(),
    });

  /**
   * Property: Manager can see leads assigned to their team members
   */
  it('should allow manager to see leads assigned to their team members', async () => {
    await fc.assert(
      fc.asyncProperty(managerArb, categoryArb, async (manager, category) => {
        // Generate team members
        const teamMembers = fc.sample(ceUserArb(manager.id), 3);

        // Create leads assigned to team members
        const leads: Partial<Lead>[] = [];
        for (const ce of teamMembers) {
          const leadData = fc.sample(leadArb(category.id, ce.id), 1)[0];
          leads.push(leadData as Partial<Lead>);
        }

        const mockUserRepo = {
          findOne: jest.fn().mockResolvedValue(manager),
          find: jest.fn().mockResolvedValue(teamMembers),
          createQueryBuilder: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([]),
          }),
        };

        const mockLeadRepo = {
          createQueryBuilder: jest.fn().mockReturnValue({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(leads),
          }),
        };

        const service = new LeadVisibilityService(
          mockUserRepo as any,
          mockLeadRepo as any,
        );

        // Manager should be able to access all team leads
        for (const lead of leads) {
          const canAccess = await service.canAccessLead(
            lead as Lead,
            manager as User,
          );
          expect(canAccess).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Manager cannot see leads from other teams
   */
  it('should hide leads from other teams', async () => {
    await fc.assert(
      fc.asyncProperty(
        managerArb,
        managerArb,
        categoryArb,
        async (manager1, manager2, category) => {
          // Ensure different managers
          fc.pre(manager1.id !== manager2.id);

          // Generate team for manager2
          const otherTeamMembers = fc.sample(ceUserArb(manager2.id), 2);

          // Create lead assigned to other team member
          const leadData = fc.sample(
            leadArb(category.id, otherTeamMembers[0].id),
            1,
          )[0];
          const lead = leadData as Partial<Lead>;

          // Manager1's team is empty
          const mockUserRepo = {
            findOne: jest.fn().mockResolvedValue(manager1),
            find: jest.fn().mockResolvedValue([]), // No team members for manager1
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            }),
          };

          const mockLeadRepo = {
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            }),
          };

          const service = new LeadVisibilityService(
            mockUserRepo as any,
            mockLeadRepo as any,
          );

          // Manager1 should NOT be able to access lead from manager2's team
          const canAccess = await service.canAccessLead(
            lead as Lead,
            manager1 as User,
          );
          expect(canAccess).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Manager can see unassigned leads
   */
  it('should allow manager to see unassigned leads', async () => {
    await fc.assert(
      fc.asyncProperty(managerArb, categoryArb, async (manager, category) => {
        // Create unassigned lead
        const leadData = fc.sample(leadArb(category.id, null), 1)[0];
        const lead = leadData as Partial<Lead>;

        const mockUserRepo = {
          findOne: jest.fn().mockResolvedValue(manager),
          find: jest.fn().mockResolvedValue([]),
          createQueryBuilder: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([]),
          }),
        };

        const mockLeadRepo = {
          createQueryBuilder: jest.fn().mockReturnValue({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([lead]),
          }),
        };

        const service = new LeadVisibilityService(
          mockUserRepo as any,
          mockLeadRepo as any,
        );

        const canAccess = await service.canAccessLead(
          lead as Lead,
          manager as User,
        );
        expect(canAccess).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Team visibility is consistent across queries
   */
  it('should return consistent visibility for same manager-lead pair', async () => {
    await fc.assert(
      fc.asyncProperty(
        managerArb,
        categoryArb,
        fc.integer({ min: 1, max: 5 }),
        async (manager, category, numChecks) => {
          const teamMembers = fc.sample(ceUserArb(manager.id), 2);
          const leadData = fc.sample(
            leadArb(category.id, teamMembers[0].id),
            1,
          )[0];
          const lead = leadData as Partial<Lead>;

          const mockUserRepo = {
            findOne: jest.fn().mockResolvedValue(manager),
            find: jest.fn().mockResolvedValue(teamMembers),
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            }),
          };

          const mockLeadRepo = {
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([lead]),
            }),
          };

          const service = new LeadVisibilityService(
            mockUserRepo as any,
            mockLeadRepo as any,
          );

          // Check multiple times - should always return same result
          const results: boolean[] = [];
          for (let i = 0; i < numChecks; i++) {
            const canAccess = await service.canAccessLead(
              lead as Lead,
              manager as User,
            );
            results.push(canAccess);
          }

          // All results should be the same
          expect(results.every((r) => r === results[0])).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
