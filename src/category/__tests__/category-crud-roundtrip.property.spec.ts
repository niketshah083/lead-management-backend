/**
 * **Feature: whatsapp-lead-management, Property 1: Category CRUD Round-Trip**
 * **Validates: Requirements 1.1, 1.4**
 *
 * For any valid category data (name, description, keywords, media), creating and then
 * retrieving the category SHALL return equivalent data with all fields intact.
 */

import 'reflect-metadata';
import * as fc from 'fast-check';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import {
  CreateCategoryDto,
  CategoryDto,
  UpdateCategoryDto,
} from '../../common/dto/category.dto';

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

// Arbitrary generator for UpdateCategoryDto (partial updates)
const updateCategoryDtoArb = fc.record({
  name: fc.option(categoryNameArb, { nil: undefined }),
  description: fc.option(categoryDescriptionArb, { nil: undefined }),
  keywords: fc.option(keywordsArb, { nil: undefined }),
  isActive: fc.option(fc.boolean(), { nil: undefined }),
});

/**
 * Simulates the category service behavior for testing CRUD round-trip.
 * This is a pure function implementation that mirrors the service logic
 * without database dependencies.
 */
class MockCategoryStore {
  private categories: Map<string, CategoryDto> = new Map();
  private idCounter = 0;

  create(dto: CreateCategoryDto): CategoryDto {
    const id = `test-uuid-${++this.idCounter}`;
    const now = new Date();

    const category: CategoryDto = {
      id,
      name: dto.name,
      description: dto.description,
      keywords: [...dto.keywords],
      media: [],
      autoReplyTemplates: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    this.categories.set(id, category);
    return { ...category };
  }

  findOne(id: string): CategoryDto | null {
    const category = this.categories.get(id);
    if (!category) return null;
    return { ...category };
  }

  update(id: string, dto: UpdateCategoryDto): CategoryDto | null {
    const category = this.categories.get(id);
    if (!category) return null;

    const updated: CategoryDto = {
      ...category,
      name: dto.name !== undefined ? dto.name : category.name,
      description:
        dto.description !== undefined ? dto.description : category.description,
      keywords:
        dto.keywords !== undefined ? [...dto.keywords] : [...category.keywords],
      isActive: dto.isActive !== undefined ? dto.isActive : category.isActive,
      updatedAt: new Date(),
    };

    this.categories.set(id, updated);
    return { ...updated };
  }

  clear(): void {
    this.categories.clear();
    this.idCounter = 0;
  }
}

describe('Category CRUD Round-Trip Property Tests', () => {
  let store: MockCategoryStore;

  beforeEach(() => {
    store = new MockCategoryStore();
  });

  /**
   * **Feature: whatsapp-lead-management, Property 1: Category CRUD Round-Trip**
   * **Validates: Requirements 1.1, 1.4**
   *
   * For any valid category data, creating and then retrieving the category
   * SHALL return equivalent data with all fields intact.
   */
  it('Property 1: Create then retrieve returns equivalent category data', () => {
    fc.assert(
      fc.property(createCategoryDtoArb, (createDto) => {
        // Create category
        const created = store.create(createDto);

        // Retrieve category
        const retrieved = store.findOne(created.id);

        // Verify retrieved is not null
        if (!retrieved) return false;

        // Verify all fields match
        return (
          retrieved.name === createDto.name &&
          retrieved.description === createDto.description &&
          JSON.stringify(retrieved.keywords) ===
            JSON.stringify(createDto.keywords) &&
          retrieved.isActive === true &&
          retrieved.id === created.id
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 1 (extended): Update then retrieve returns updated data
   */
  it('Property 1 (extended): Update then retrieve returns updated category data', () => {
    fc.assert(
      fc.property(
        createCategoryDtoArb,
        updateCategoryDtoArb,
        (createDto, updateDto) => {
          // Create category first
          const created = store.create(createDto);

          // Update category
          const updated = store.update(created.id, updateDto);
          if (!updated) return false;

          // Retrieve category
          const retrieved = store.findOne(created.id);
          if (!retrieved) return false;

          // Verify updated fields
          const expectedName =
            updateDto.name !== undefined ? updateDto.name : createDto.name;
          const expectedDescription =
            updateDto.description !== undefined
              ? updateDto.description
              : createDto.description;
          const expectedKeywords =
            updateDto.keywords !== undefined
              ? updateDto.keywords
              : createDto.keywords;
          const expectedIsActive =
            updateDto.isActive !== undefined ? updateDto.isActive : true;

          return (
            retrieved.name === expectedName &&
            retrieved.description === expectedDescription &&
            JSON.stringify(retrieved.keywords) ===
              JSON.stringify(expectedKeywords) &&
            retrieved.isActive === expectedIsActive
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 1 (DTO serialization): CreateCategoryDto round-trip through class-transformer
   */
  it('Property 1 (DTO): CreateCategoryDto serialization round-trip', () => {
    fc.assert(
      fc.property(createCategoryDtoArb, (dtoData) => {
        // Create instance from plain object
        const instance = plainToInstance(CreateCategoryDto, dtoData);

        // Serialize to plain object
        const serialized = instanceToPlain(instance);

        // Verify fields are preserved
        return (
          serialized.name === dtoData.name &&
          serialized.description === dtoData.description &&
          JSON.stringify(serialized.keywords) ===
            JSON.stringify(dtoData.keywords)
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 1 (idempotence): Multiple retrieves return same data
   */
  it('Property 1 (idempotence): Multiple retrieves return identical data', () => {
    fc.assert(
      fc.property(createCategoryDtoArb, (createDto) => {
        // Create category
        const created = store.create(createDto);

        // Retrieve multiple times
        const retrieved1 = store.findOne(created.id);
        const retrieved2 = store.findOne(created.id);
        const retrieved3 = store.findOne(created.id);

        if (!retrieved1 || !retrieved2 || !retrieved3) return false;

        // All retrieves should return identical data
        return (
          retrieved1.name === retrieved2.name &&
          retrieved2.name === retrieved3.name &&
          retrieved1.description === retrieved2.description &&
          retrieved2.description === retrieved3.description &&
          JSON.stringify(retrieved1.keywords) ===
            JSON.stringify(retrieved2.keywords) &&
          JSON.stringify(retrieved2.keywords) ===
            JSON.stringify(retrieved3.keywords)
        );
      }),
      { numRuns: 100 },
    );
  });
});
