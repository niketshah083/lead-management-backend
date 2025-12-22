/**
 * Property Test: Multi-CE Lead Visibility
 * **Feature: whatsapp-lead-management, Property 9: Multi-CE Lead Visibility**
 * **Validates: Requirements 4.1, 4.2**
 *
 * For any qualified lead with a category, all Customer Executives assigned
 * to that category SHALL see the lead in their dashboard.
 */

import * as fc from 'fast-check';
import { LeadVisibilityService } from '../services';
import { Lead, User, Category } from '../../entities';
import { UserRole, LeadStatus } from '../../common/enums';

describe('Property 9: Multi-CE Lead Visibility', () => {
  // Arbitraries for generating test data
  const uuidArb = fc.uuid();

  const categoryArb = fc.record({
    id: uuidArb,
    name: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.string({ maxLength: 200 }),
    keywords: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
      maxLength: 5,
    }),
    isActive: fc.constant(true),
  });

  const ceUserArb = (managerId: string | null = null) =>
    fc.record({
      id: uuidArb,
      email: fc.emailAddress(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      role: fc.constant(UserRole.CUSTOMER_EXECUTIVE),
      managerId: fc.constant(managerId),
      isActive: fc.constant(true),
      categories: fc.constant([] as Category[]),
    });

  const leadArb = (categoryId: string) =>
    fc.record({
      id: uuidArb,
      phoneNumber: fc.stringMatching(/^\+[1-9]\d{9,14}$/),
      name: fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
        nil: undefined,
      }),
      categoryId: fc.constant(categoryId),
      status: fc.constant(LeadStatus.NEW),
      assignedToId: fc.constant(null as string | null),
      isQualified: fc.constant(true),
    });

  /**
   * Property: All CEs assigned to a category can see unassigned leads in that category
   */
  it('should make unassigned leads visible to all CEs with matching category', async () => {
    await fc.assert(
      fc.asyncProperty(
        categoryArb,
        fc.array(ceUserArb(), { minLength: 1, maxLength: 5 }),
        async (category, ceUsers) => {
          // Assign category to all CEs
          const cesWithCategory = ceUsers.map((ce) => ({
            ...ce,
            categories: [category as Category],
          }));

          // Create an unassigned lead in this category
          const leadData = fc.sample(leadArb(category.id), 1)[0];
          const lead = {
            ...leadData,
            assignedToId: undefined,
          } as Partial<Lead>;

          // Mock repository
          const mockUserRepo = {
            findOne: jest.fn().mockImplementation(({ where }) => {
              const user = cesWithCategory.find((ce) => ce.id === where.id);
              return Promise.resolve(user);
            }),
            find: jest.fn().mockResolvedValue([]),
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue(cesWithCategory),
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

          // Verify each CE can access the lead
          for (const ce of cesWithCategory) {
            const canAccess = await service.canAccessLead(
              lead as Lead,
              ce as User,
            );
            expect(canAccess).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: CEs without category assignment cannot see leads in that category
   */
  it('should hide unassigned leads from CEs without matching category', async () => {
    await fc.assert(
      fc.asyncProperty(
        categoryArb,
        categoryArb,
        ceUserArb(),
        async (leadCategory, ceCategory, ce) => {
          // Ensure categories are different
          fc.pre(leadCategory.id !== ceCategory.id);

          // CE has different category
          const ceWithCategory = {
            ...ce,
            categories: [ceCategory as Category],
          };

          // Create an unassigned lead in a different category
          const leadData = fc.sample(leadArb(leadCategory.id), 1)[0];
          const lead = {
            ...leadData,
            assignedToId: undefined,
          } as Partial<Lead>;

          // Mock repository
          const mockUserRepo = {
            findOne: jest.fn().mockResolvedValue(ceWithCategory),
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
              getMany: jest.fn().mockResolvedValue([]),
            }),
          };

          const service = new LeadVisibilityService(
            mockUserRepo as any,
            mockLeadRepo as any,
          );

          const canAccess = await service.canAccessLead(
            lead as Lead,
            ceWithCategory as User,
          );
          expect(canAccess).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Multiple CEs see the same lead simultaneously
   */
  it('should display lead in all eligible CE dashboards simultaneously', async () => {
    await fc.assert(
      fc.asyncProperty(
        categoryArb,
        fc.integer({ min: 2, max: 5 }),
        async (category, numCEs) => {
          // Generate multiple CEs with same category
          const ceUsers = fc.sample(ceUserArb(), numCEs);
          const cesWithCategory = ceUsers.map((ce) => ({
            ...ce,
            categories: [category as Category],
          }));

          // Create an unassigned lead
          const leadData = fc.sample(leadArb(category.id), 1)[0];
          const lead = {
            ...leadData,
            assignedToId: undefined,
          } as Partial<Lead>;

          // Track which CEs can see the lead
          const visibilityResults: boolean[] = [];

          for (const ce of cesWithCategory) {
            const mockUserRepo = {
              findOne: jest.fn().mockResolvedValue(ce),
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
              ce as User,
            );
            visibilityResults.push(canAccess);
          }

          // All CEs should see the lead
          expect(visibilityResults.every((v) => v === true)).toBe(true);
          expect(visibilityResults.length).toBe(numCEs);
        },
      ),
      { numRuns: 100 },
    );
  });
});
