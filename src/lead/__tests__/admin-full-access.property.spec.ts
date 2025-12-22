/**
 * Property Test: Admin Full Access
 * **Feature: whatsapp-lead-management, Property 17: Admin Full Access**
 * **Validates: Requirements 8.1, 8.2**
 *
 * For any Admin user, the system SHALL return all leads across all teams
 * and categories, regardless of assignment.
 */

import * as fc from 'fast-check';
import { LeadVisibilityService } from '../services';
import { Lead, User } from '../../entities';
import { UserRole, LeadStatus } from '../../common/enums';

describe('Property 17: Admin Full Access', () => {
  const uuidArb = fc.uuid();

  const categoryArb = fc.record({
    id: uuidArb,
    name: fc.string({ minLength: 1, maxLength: 50 }),
    isActive: fc.constant(true),
  });

  const adminArb = fc.record({
    id: uuidArb,
    email: fc.emailAddress(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    role: fc.constant(UserRole.ADMIN),
    managerId: fc.constant(null as string | null),
    isActive: fc.constant(true),
  });

  const userArb = fc.record({
    id: uuidArb,
    email: fc.emailAddress(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    role: fc.constantFrom(UserRole.MANAGER, UserRole.CUSTOMER_EXECUTIVE),
    managerId: fc.option(uuidArb, { nil: null }),
    isActive: fc.constant(true),
  });

  const leadArb = (categoryId: string, assignedToId: string | null) =>
    fc.record({
      id: uuidArb,
      phoneNumber: fc.stringMatching(/^\+[1-9]\d{9,14}$/),
      categoryId: fc.constant(categoryId),
      status: fc.constantFrom(...Object.values(LeadStatus)),
      assignedToId: fc.constant(assignedToId),
      isQualified: fc.boolean(),
    });

  /**
   * Property: Admin can access any lead regardless of assignment
   */
  it('should allow admin to access any lead regardless of assignment', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminArb,
        categoryArb,
        userArb,
        async (admin, category, assignee) => {
          // Create lead assigned to any user
          const leadData = fc.sample(leadArb(category.id, assignee.id), 1)[0];
          const lead = leadData as Partial<Lead>;

          const mockUserRepo = {
            findOne: jest.fn().mockResolvedValue(admin),
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
            admin as User,
          );
          expect(canAccess).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Admin can access unassigned leads
   */
  it('should allow admin to access unassigned leads', async () => {
    await fc.assert(
      fc.asyncProperty(adminArb, categoryArb, async (admin, category) => {
        // Create unassigned lead
        const leadData = fc.sample(leadArb(category.id, null), 1)[0];
        const lead = leadData as Partial<Lead>;

        const mockUserRepo = {
          findOne: jest.fn().mockResolvedValue(admin),
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
          admin as User,
        );
        expect(canAccess).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Admin can access leads from any category
   */
  it('should allow admin to access leads from any category', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminArb,
        fc.array(categoryArb, { minLength: 1, maxLength: 5 }),
        async (admin, categories) => {
          // Create leads in different categories
          const leads: Partial<Lead>[] = [];
          for (const category of categories) {
            const leadData = fc.sample(leadArb(category.id, null), 1)[0];
            leads.push(leadData as Partial<Lead>);
          }

          const mockUserRepo = {
            findOne: jest.fn().mockResolvedValue(admin),
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
              getMany: jest.fn().mockResolvedValue(leads),
            }),
          };

          const service = new LeadVisibilityService(
            mockUserRepo as any,
            mockLeadRepo as any,
          );

          // Admin should access all leads
          for (const lead of leads) {
            const canAccess = await service.canAccessLead(
              lead as Lead,
              admin as User,
            );
            expect(canAccess).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Admin can access leads in any status
   */
  it('should allow admin to access leads in any status', async () => {
    await fc.assert(
      fc.asyncProperty(adminArb, categoryArb, async (admin, category) => {
        // Create leads in all statuses
        const leads: Partial<Lead>[] = [];
        for (const status of Object.values(LeadStatus)) {
          const leadData: Partial<Lead> = {
            id: fc.sample(uuidArb, 1)[0],
            phoneNumber: '+1234567890',
            categoryId: category.id,
            status,
            assignedToId: undefined,
            isQualified: true,
          };
          leads.push(leadData);
        }

        const mockUserRepo = {
          findOne: jest.fn().mockResolvedValue(admin),
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
            getMany: jest.fn().mockResolvedValue(leads),
          }),
        };

        const service = new LeadVisibilityService(
          mockUserRepo as any,
          mockLeadRepo as any,
        );

        // Admin should access leads in all statuses
        for (const lead of leads) {
          const canAccess = await service.canAccessLead(
            lead as Lead,
            admin as User,
          );
          expect(canAccess).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Admin visibility filter does not restrict results
   */
  it('should not apply any filter restrictions for admin', async () => {
    await fc.assert(
      fc.asyncProperty(adminArb, async (admin) => {
        let filterApplied = false;

        const mockUserRepo = {
          findOne: jest.fn().mockResolvedValue(admin),
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
            andWhere: jest.fn().mockImplementation(() => {
              filterApplied = true;
              return {
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
              };
            }),
            orderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([]),
          }),
        };

        const service = new LeadVisibilityService(
          mockUserRepo as any,
          mockLeadRepo as any,
        );

        const query = mockLeadRepo.createQueryBuilder('lead');
        await service.applyVisibilityFilter(query as any, admin as User);

        // For admin, no additional filter should be applied via andWhere
        // The applyVisibilityFilter should return early for admin
        expect(filterApplied).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
