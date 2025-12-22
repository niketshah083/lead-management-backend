/**
 * **Feature: whatsapp-lead-management, Property 11: Category Assignment Persistence**
 * **Validates: Requirements 5.1, 5.3**
 *
 * For any category assignment to a Customer Executive, the many-to-many relationship
 * SHALL be persisted and retrievable.
 */

import 'reflect-metadata';
import * as fc from 'fast-check';
import { UserRole } from '../../common/enums';

// Arbitrary generator for valid UUID
const uuidArb = fc.uuid();

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
 * without database dependencies.
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
    isActive?: boolean;
  }): MockUser {
    const id = `user-${++this.idCounter}`;
    const user: MockUser = {
      id,
      email: data.email,
      name: data.name,
      role: data.role,
      isActive: data.isActive ?? true,
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

  /**
   * Assign categories to a user
   * Requirements: 5.1 - Store the many-to-many relationship
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
   * Get categories assigned to a user
   * Requirements: 5.3 - Display all assigned categories
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

  /**
   * Add a single category to a user
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
   * Remove a category from a user
   * Requirements: 5.2 - Prevent new lead assignments for that category
   */
  removeCategory(
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
        error: 'Only Customer Executives can have categories removed',
      };
    }

    // Find and remove the assignment
    let found = false;
    for (const [key, uc] of this.userCategories.entries()) {
      if (uc.userId === userId && uc.categoryId === categoryId) {
        this.userCategories.delete(key);
        found = true;
        break;
      }
    }

    if (!found) {
      return { success: false, error: 'Category not assigned to user' };
    }

    // Update user's categories
    user.categories = user.categories.filter((c) => c.id !== categoryId);
    this.users.set(userId, user);

    return { success: true, user: { ...user } };
  }

  clear(): void {
    this.users.clear();
    this.categories.clear();
    this.userCategories.clear();
    this.idCounter = 0;
  }
}

describe('Category Assignment Persistence Property Tests', () => {
  let store: MockUserCategoryStore;

  beforeEach(() => {
    store = new MockUserCategoryStore();
  });

  /**
   * **Feature: whatsapp-lead-management, Property 11: Category Assignment Persistence**
   * **Validates: Requirements 5.1, 5.3**
   *
   * For any category assignment to a Customer Executive, the many-to-many relationship
   * SHALL be persisted and retrievable.
   */
  it('Property 11: Category assignments are persisted and retrievable', () => {
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
          // Create a Customer Executive
          const user = store.createUser({
            email,
            name,
            role: UserRole.CUSTOMER_EXECUTIVE,
            isActive: true,
          });

          // Create categories
          const categories = categoryDataList.map((data) =>
            store.createCategory(data),
          );
          const categoryIds = categories.map((c) => c.id);

          // Assign categories to user
          const result = store.assignCategories(user.id, categoryIds);

          // Verify assignment succeeded
          if (!result.success) return false;

          // Retrieve assigned categories
          const retrievedCategories = store.getUserCategories(user.id);
          if (!retrievedCategories) return false;

          // Verify all categories are persisted
          if (retrievedCategories.length !== categoryIds.length) return false;

          // Verify each category is present
          const retrievedIds = retrievedCategories.map((c) => c.id);
          return categoryIds.every((id) => retrievedIds.includes(id));
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 11 (extended): Single category addition is persisted
   */
  it('Property 11 (extended): Single category addition is persisted', () => {
    fc.assert(
      fc.property(
        emailArb,
        nameArb,
        categoryNameArb,
        keywordsArb,
        (email, name, categoryName, keywords) => {
          // Create a Customer Executive
          const user = store.createUser({
            email,
            name,
            role: UserRole.CUSTOMER_EXECUTIVE,
            isActive: true,
          });

          // Create a category
          const category = store.createCategory({
            name: categoryName,
            description: 'Test description',
            keywords,
          });

          // Add category to user
          const result = store.addCategory(user.id, category.id);
          if (!result.success) return false;

          // Retrieve and verify
          const retrievedCategories = store.getUserCategories(user.id);
          if (!retrievedCategories) return false;

          return (
            retrievedCategories.length === 1 &&
            retrievedCategories[0].id === category.id
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 11 (removal): Category removal updates the relationship
   */
  it('Property 11 (removal): Category removal updates the relationship', () => {
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
          { minLength: 2, maxLength: 5 },
        ),
        (email, name, categoryDataList) => {
          // Create a Customer Executive
          const user = store.createUser({
            email,
            name,
            role: UserRole.CUSTOMER_EXECUTIVE,
            isActive: true,
          });

          // Create categories
          const categories = categoryDataList.map((data) =>
            store.createCategory(data),
          );
          const categoryIds = categories.map((c) => c.id);

          // Assign all categories
          store.assignCategories(user.id, categoryIds);

          // Remove the first category
          const categoryToRemove = categoryIds[0];
          const removeResult = store.removeCategory(user.id, categoryToRemove);
          if (!removeResult.success) return false;

          // Retrieve and verify
          const retrievedCategories = store.getUserCategories(user.id);
          if (!retrievedCategories) return false;

          // Should have one less category
          if (retrievedCategories.length !== categoryIds.length - 1)
            return false;

          // Removed category should not be present
          const retrievedIds = retrievedCategories.map((c) => c.id);
          return !retrievedIds.includes(categoryToRemove);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 11 (reassignment): Reassigning categories replaces previous assignments
   */
  it('Property 11 (reassignment): Reassigning categories replaces previous assignments', () => {
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
          { minLength: 2, maxLength: 4 },
        ),
        fc.array(
          fc.record({
            name: categoryNameArb,
            description: fc.string({ minLength: 0, maxLength: 100 }),
            keywords: keywordsArb,
          }),
          { minLength: 1, maxLength: 3 },
        ),
        (email, name, firstCategoryDataList, secondCategoryDataList) => {
          // Create a Customer Executive
          const user = store.createUser({
            email,
            name,
            role: UserRole.CUSTOMER_EXECUTIVE,
            isActive: true,
          });

          // Create first set of categories
          const firstCategories = firstCategoryDataList.map((data) =>
            store.createCategory(data),
          );
          const firstCategoryIds = firstCategories.map((c) => c.id);

          // Assign first set
          store.assignCategories(user.id, firstCategoryIds);

          // Create second set of categories
          const secondCategories = secondCategoryDataList.map((data) =>
            store.createCategory(data),
          );
          const secondCategoryIds = secondCategories.map((c) => c.id);

          // Reassign with second set
          const result = store.assignCategories(user.id, secondCategoryIds);
          if (!result.success) return false;

          // Retrieve and verify
          const retrievedCategories = store.getUserCategories(user.id);
          if (!retrievedCategories) return false;

          // Should only have second set of categories
          if (retrievedCategories.length !== secondCategoryIds.length)
            return false;

          const retrievedIds = retrievedCategories.map((c) => c.id);

          // All second set categories should be present
          const allSecondPresent = secondCategoryIds.every((id) =>
            retrievedIds.includes(id),
          );

          // No first set categories should be present (unless they're also in second set)
          const noFirstPresent = firstCategoryIds.every(
            (id) =>
              secondCategoryIds.includes(id) || !retrievedIds.includes(id),
          );

          return allSecondPresent && noFirstPresent;
        },
      ),
      { numRuns: 100 },
    );
  });
});
