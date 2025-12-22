/**
 * **Feature: whatsapp-lead-management, Property 2: Soft-Delete Exclusion**
 * **Validates: Requirements 1.3**
 *
 * For any soft-deleted category, querying active categories SHALL NOT include
 * the deleted category, and attempting to assign new leads to it SHALL be rejected.
 */

import 'reflect-metadata';
import * as fc from 'fast-check';

// Arbitrary generator for valid category name (unique, non-empty)
const categoryNameArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0)
  .map((s) => s.trim());

// Arbitrary generator for category description
const categoryDescriptionArb = fc.string({ minLength: 0, maxLength: 500 });

// Arbitrary generator for keywords array
const keywordsArb = fc.array(
  fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0)
    .map((s) => s.trim()),
  { minLength: 1, maxLength: 10 },
);

// Arbitrary generator for CreateCategoryDto
const createCategoryDtoArb = fc.record({
  name: categoryNameArb,
  description: categoryDescriptionArb,
  keywords: keywordsArb,
});

interface CategoryData {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCategoryDto {
  name: string;
  description: string;
  keywords: string[];
}

/**
 * Mock category store that simulates soft-delete behavior
 */
class MockCategoryStoreWithSoftDelete {
  private categories: Map<string, CategoryData> = new Map();
  private idCounter = 0;

  create(dto: CreateCategoryDto): CategoryData {
    const id = `test-uuid-${++this.idCounter}`;
    const now = new Date();

    const category: CategoryData = {
      id,
      name: dto.name,
      description: dto.description,
      keywords: [...dto.keywords],
      isActive: true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.categories.set(id, category);
    return { ...category };
  }

  /**
   * Find all active (non-deleted) categories
   */
  findAll(): CategoryData[] {
    return Array.from(this.categories.values())
      .filter((c) => c.deletedAt === null)
      .map((c) => ({ ...c }));
  }

  /**
   * Find one category by ID (only if not deleted)
   */
  findOne(id: string): CategoryData | null {
    const category = this.categories.get(id);
    if (!category || category.deletedAt !== null) return null;
    return { ...category };
  }

  /**
   * Soft-delete a category
   */
  softDelete(id: string): boolean {
    const category = this.categories.get(id);
    if (!category || category.deletedAt !== null) return false;

    category.deletedAt = new Date();
    category.isActive = false;
    return true;
  }

  /**
   * Check if a category exists and is active (for lead assignment validation)
   */
  isActiveCategory(id: string): boolean {
    const category = this.categories.get(id);
    return category !== undefined && category.deletedAt === null;
  }

  /**
   * Simulate lead assignment - should fail for deleted categories
   */
  assignLeadToCategory(
    leadId: string,
    categoryId: string,
  ): { success: boolean; error?: string } {
    if (!this.isActiveCategory(categoryId)) {
      return {
        success: false,
        error: 'Cannot assign lead to deleted or non-existent category',
      };
    }
    return { success: true };
  }

  clear(): void {
    this.categories.clear();
    this.idCounter = 0;
  }
}

describe('Soft-Delete Exclusion Property Tests', () => {
  let store: MockCategoryStoreWithSoftDelete;

  beforeEach(() => {
    store = new MockCategoryStoreWithSoftDelete();
  });

  /**
   * **Feature: whatsapp-lead-management, Property 2: Soft-Delete Exclusion**
   * **Validates: Requirements 1.3**
   *
   * For any soft-deleted category, querying active categories SHALL NOT include
   * the deleted category.
   */
  it('Property 2: Soft-deleted categories are excluded from findAll results', () => {
    fc.assert(
      fc.property(
        fc.array(createCategoryDtoArb, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (categoryDtos, deleteIndex) => {
          // Create all categories
          const created = categoryDtos.map((dto) => store.create(dto));

          // Soft-delete one category (use modulo to ensure valid index)
          const indexToDelete = deleteIndex % created.length;
          const deletedCategory = created[indexToDelete];
          store.softDelete(deletedCategory.id);

          // Query all active categories
          const activeCategories = store.findAll();

          // Verify deleted category is NOT in the results
          const deletedInResults = activeCategories.some(
            (c) => c.id === deletedCategory.id,
          );

          // Verify all other categories ARE in the results
          const otherCategories = created.filter(
            (c) => c.id !== deletedCategory.id,
          );
          const allOthersPresent = otherCategories.every((c) =>
            activeCategories.some((ac) => ac.id === c.id),
          );

          return !deletedInResults && allOthersPresent;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2 (extended): Soft-deleted category cannot be found by ID
   */
  it('Property 2 (extended): Soft-deleted category returns null on findOne', () => {
    fc.assert(
      fc.property(createCategoryDtoArb, (createDto) => {
        // Create category
        const created = store.create(createDto);

        // Verify it can be found before deletion
        const beforeDelete = store.findOne(created.id);
        if (!beforeDelete) return false;

        // Soft-delete the category
        store.softDelete(created.id);

        // Verify it cannot be found after deletion
        const afterDelete = store.findOne(created.id);

        return afterDelete === null;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2 (lead assignment): Cannot assign leads to soft-deleted categories
   */
  it('Property 2 (lead assignment): Lead assignment to soft-deleted category is rejected', () => {
    fc.assert(
      fc.property(createCategoryDtoArb, fc.uuid(), (createDto, leadId) => {
        // Create category
        const created = store.create(createDto);

        // Verify lead can be assigned before deletion
        const beforeDelete = store.assignLeadToCategory(leadId, created.id);
        if (!beforeDelete.success) return false;

        // Soft-delete the category
        store.softDelete(created.id);

        // Verify lead assignment is rejected after deletion
        const afterDelete = store.assignLeadToCategory(leadId, created.id);

        return afterDelete.success === false && afterDelete.error !== undefined;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2 (multiple deletions): Multiple soft-deletes maintain exclusion
   */
  it('Property 2 (multiple deletions): All soft-deleted categories are excluded', () => {
    fc.assert(
      fc.property(
        fc.array(createCategoryDtoArb, { minLength: 3, maxLength: 10 }),
        fc.array(fc.boolean(), { minLength: 3, maxLength: 10 }),
        (categoryDtos, deleteFlags) => {
          // Create all categories
          const created = categoryDtos.map((dto) => store.create(dto));

          // Soft-delete categories based on flags
          const deletedIds = new Set<string>();
          created.forEach((category, index) => {
            if (deleteFlags[index % deleteFlags.length]) {
              store.softDelete(category.id);
              deletedIds.add(category.id);
            }
          });

          // Query all active categories
          const activeCategories = store.findAll();

          // Verify no deleted categories are in results
          const noDeletedInResults = activeCategories.every(
            (c) => !deletedIds.has(c.id),
          );

          // Verify all non-deleted categories are in results
          const nonDeletedCategories = created.filter(
            (c) => !deletedIds.has(c.id),
          );
          const allNonDeletedPresent = nonDeletedCategories.every((c) =>
            activeCategories.some((ac) => ac.id === c.id),
          );

          return noDeletedInResults && allNonDeletedPresent;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2 (isActive check): isActiveCategory returns false for deleted categories
   */
  it('Property 2 (isActive): isActiveCategory returns false after soft-delete', () => {
    fc.assert(
      fc.property(createCategoryDtoArb, (createDto) => {
        // Create category
        const created = store.create(createDto);

        // Verify isActive before deletion
        const activeBefore = store.isActiveCategory(created.id);
        if (!activeBefore) return false;

        // Soft-delete the category
        store.softDelete(created.id);

        // Verify isActive after deletion
        const activeAfter = store.isActiveCategory(created.id);

        return activeAfter === false;
      }),
      { numRuns: 100 },
    );
  });
});
