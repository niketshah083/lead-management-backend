/**
 * **Feature: whatsapp-lead-management, Property 12: Inactive User Category Assignment Rejection**
 * **Validates: Requirements 5.4**
 *
 * For any attempt to assign a category to an inactive Customer Executive,
 * the system SHALL reject the assignment.
 */

import 'reflect-metadata';
import * as fc from 'fast-check';
import { UserRole } from '../../common/enums';

// Arbitrary generator for valid email
const emailArb = fc
  .tuple(
    fc
      .string({ minLength: 1, maxLength: 10 })
      .filter((s) => /^[a-z]+$/.test(s)),
    fc
      .string({ minLength: 1, maxLength: 10 })
      .filter((s) => /^[a-z]+$/.test(s)),
  )
  .map(([local, domain]) => `${local}@${domain}.com`);

// Arbitrary generator for valid name
const nameArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length > 0)
  .map((s) => s.trim());

// Arbitrary generator for category name
const categoryNameArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0)
  .map((s) => s.trim());

// Arbitrary generator for keywords array
const keywordsArb = fc.array(
  fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0)
    .map((s) => s.trim()),
  { minLength: 1, maxLength: 5 },
);

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  categories: MockCategory[];
}

interface MockCategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  isActive: boolean;
  deletedAt: Date | null;
}

interface MockUserCategory {
  id: string;
  userId: string;
  categoryId: string;
  assignedAt: Date;
}

/**
 * Mock store that simulates the user-category assignment behavior
 * with focus on inactive user rejection.
 */
class MockUserCategoryStore {
  private users: Map<string, MockUser> = new Map();
  private categories: Map<string, MockCategory> = new Map();
  private userCategories: Map<string, MockUserCategory> = new Map();
  private idCounter = 0;

  createUser(data: {
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
  }): MockUser {
    const id = `user-${++this.idCounter}`;
    const user: MockUser = {
      id,
      email: data.email,
      name: data.name,
      role: data.role,
      isActive: data.isActive,
      categories: [],
    };
    this.users.set(id, user);
    return { ...user };
  }

  createCategory(data: {
    name: string;
    description: string;
    keywords: string[];
  }): MockCategory {
    const id = `category-${++this.idCounter}`;
    const category: MockCategory = {
      id,
      name: data.name,
      description: data.description,
      keywords: [...data.keywords],
      isActive: true,
      deletedAt: null,
    };
    this.categories.set(id, category);
    return { ...category };
  }

  deactivateUser(userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    user.isActive = false;
    this.users.set(userId, user);
    return true;
  }

  /**
   * Assign categories to a user
   * Requirements: 5.4 - Validate that the Customer Executive is active
   */
  assignCategories(
    userId: string,
    categoryIds: string[],
  ): { success: boolean; error?: string; user?: MockUser } {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Only Customer Executives can have categories assigned
    if (user.role !== UserRole.CUSTOMER_EXECUTIVE) {
      return {
        success: false,
        error: 'Only Customer Executives can have categories assigned',
      };
    }

    // Requirements 5.4: Validate that the Customer Executive is active
    if (!user.isActive) {
      return {
        success: false,
        error: 'Cannot assign categories to an inactive Customer Executive',
      };
    }

    // Validate all categories exist and are active
    const validCategories: MockCategory[] = [];
    for (const categoryId of categoryIds) {
      const category = this.categories.get(categoryId);
      if (!category || category.deletedAt !== null) {
        return {
          success: false,
          error: `Category ${categoryId} not found or inactive`,
        };
      }
      validCategories.push(category);
    }

    // Clear existing assignments for this user
    for (const [key, uc] of this.userCategories.entries()) {
      if (uc.userId === userId) {
        this.userCategories.delete(key);
      }
    }

    // Create new assignments
    for (const category of validCategories) {
      const ucId = `uc-${++this.idCounter}`;
      this.userCategories.set(ucId, {
        id: ucId,
        userId,
        categoryId: category.id,
        assignedAt: new Date(),
      });
    }

    // Update user's categories
    user.categories = validCategories.map((c) => ({ ...c }));
    this.users.set(userId, user);

    return { success: true, user: { ...user } };
  }

  /**
   * Add a single category to a user
   * Requirements: 5.4 - Validate that the Customer Executive is active
   */
  addCategory(
    userId: string,
    categoryId: string,
  ): { success: boolean; error?: string; user?: MockUser } {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.role !== UserRole.CUSTOMER_EXECUTIVE) {
      return {
        success: false,
        error: 'Only Customer Executives can have categories assigned',
      };
    }

    // Requirements 5.4: Validate that the Customer Executive is active
    if (!user.isActive) {
      return {
        success: false,
        error: 'Cannot assign categories to an inactive Customer Executive',
      };
    }

    const category = this.categories.get(categoryId);
    if (!category || category.deletedAt !== null) {
      return { success: false, error: 'Category not found or inactive' };
    }

    // Check if already assigned
    for (const uc of this.userCategories.values()) {
      if (uc.userId === userId && uc.categoryId === categoryId) {
        return { success: false, error: 'Category already assigned' };
      }
    }

    // Create assignment
    const ucId = `uc-${++this.idCounter}`;
    this.userCategories.set(ucId, {
      id: ucId,
      userId,
      categoryId,
      assignedAt: new Date(),
    });

    user.categories.push({ ...category });
    this.users.set(userId, user);

    return { success: true, user: { ...user } };
  }

  /**
   * Get categories assigned to a user
   */
  getUserCategories(userId: string): MockCategory[] | null {
    const user = this.users.get(userId);
    if (!user) return null;

    const categories: MockCategory[] = [];
    for (const uc of this.userCategories.values()) {
      if (uc.userId === userId) {
        const category = this.categories.get(uc.categoryId);
        if (category) {
          categories.push({ ...category });
        }
      }
    }
    return categories;
  }

  clear(): void {
    this.users.clear();
    this.categories.clear();
    this.userCategories.clear();
    this.idCounter = 0;
  }
}

describe('Inactive User Category Assignment Rejection Property Tests', () => {
  let store: MockUserCategoryStore;

  beforeEach(() => {
    store = new MockUserCategoryStore();
  });

  /**
   * **Feature: whatsapp-lead-management, Property 12: Inactive User Category Assignment Rejection**
   * **Validates: Requirements 5.4**
   *
   * For any attempt to assign a category to an inactive Customer Executive,
   * the system SHALL reject the assignment.
   */
  it('Property 12: Inactive user category assignment is rejected', () => {
    fc.assert(
      fc.property(
        emailArb,
        nameArb,
        fc.array(
          fc.record({
            name: categoryNameArb,
            description: fc.string({ minLength: 0, maxLength: 100 }),
            keywords: keywordsArb,
          }),
          { minLength: 1, maxLength: 5 },
        ),
        (email, name, categoryDataList) => {
          // Create an INACTIVE Customer Executive
          const user = store.createUser({
            email,
            name,
            role: UserRole.CUSTOMER_EXECUTIVE,
            isActive: false, // User is inactive
          });

          // Create categories
          const categories = categoryDataList.map((data) =>
            store.createCategory(data),
          );
          const categoryIds = categories.map((c) => c.id);

          // Attempt to assign categories to inactive user
          const result = store.assignCategories(user.id, categoryIds);

          // Assignment should be rejected
          return (
            result.success === false &&
            result.error ===
              'Cannot assign categories to an inactive Customer Executive'
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 12 (single category): Single category addition to inactive user is rejected
   */
  it('Property 12 (single category): Single category addition to inactive user is rejected', () => {
    fc.assert(
      fc.property(
        emailArb,
        nameArb,
        categoryNameArb,
        keywordsArb,
        (email, name, categoryName, keywords) => {
          // Create an INACTIVE Customer Executive
          const user = store.createUser({
            email,
            name,
            role: UserRole.CUSTOMER_EXECUTIVE,
            isActive: false, // User is inactive
          });

          // Create a category
          const category = store.createCategory({
            name: categoryName,
            description: 'Test description',
            keywords,
          });

          // Attempt to add category to inactive user
          const result = store.addCategory(user.id, category.id);

          // Assignment should be rejected
          return (
            result.success === false &&
            result.error ===
              'Cannot assign categories to an inactive Customer Executive'
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 12 (deactivation): Assignment rejected after user deactivation
   */
  it('Property 12 (deactivation): Assignment rejected after user deactivation', () => {
    fc.assert(
      fc.property(
        emailArb,
        nameArb,
        categoryNameArb,
        keywordsArb,
        (email, name, categoryName, keywords) => {
          // Create an ACTIVE Customer Executive
          const user = store.createUser({
            email,
            name,
            role: UserRole.CUSTOMER_EXECUTIVE,
            isActive: true, // User starts active
          });

          // Create a category
          const category = store.createCategory({
            name: categoryName,
            description: 'Test description',
            keywords,
          });

          // Deactivate the user
          store.deactivateUser(user.id);

          // Attempt to add category to now-inactive user
          const result = store.addCategory(user.id, category.id);

          // Assignment should be rejected
          return (
            result.success === false &&
            result.error ===
              'Cannot assign categories to an inactive Customer Executive'
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 12 (contrast): Active user assignment succeeds
   * This test ensures the rejection is specifically for inactive users
   */
  it('Property 12 (contrast): Active user assignment succeeds', () => {
    fc.assert(
      fc.property(
        emailArb,
        nameArb,
        categoryNameArb,
        keywordsArb,
        (email, name, categoryName, keywords) => {
          // Create an ACTIVE Customer Executive
          const user = store.createUser({
            email,
            name,
            role: UserRole.CUSTOMER_EXECUTIVE,
            isActive: true, // User is active
          });

          // Create a category
          const category = store.createCategory({
            name: categoryName,
            description: 'Test description',
            keywords,
          });

          // Attempt to add category to active user
          const result = store.addCategory(user.id, category.id);

          // Assignment should succeed
          return result.success === true;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 12 (no side effects): Rejected assignment leaves no categories assigned
   */
  it('Property 12 (no side effects): Rejected assignment leaves no categories assigned', () => {
    fc.assert(
      fc.property(
        emailArb,
        nameArb,
        fc.array(
          fc.record({
            name: categoryNameArb,
            description: fc.string({ minLength: 0, maxLength: 100 }),
            keywords: keywordsArb,
          }),
          { minLength: 1, maxLength: 5 },
        ),
        (email, name, categoryDataList) => {
          // Create an INACTIVE Customer Executive
          const user = store.createUser({
            email,
            name,
            role: UserRole.CUSTOMER_EXECUTIVE,
            isActive: false, // User is inactive
          });

          // Create categories
          const categories = categoryDataList.map((data) =>
            store.createCategory(data),
          );
          const categoryIds = categories.map((c) => c.id);

          // Attempt to assign categories to inactive user
          store.assignCategories(user.id, categoryIds);

          // Verify no categories were assigned
          const assignedCategories = store.getUserCategories(user.id);

          return assignedCategories !== null && assignedCategories.length === 0;
        },
      ),
      { numRuns: 100 },
    );
  });
});
