/**
 * Property Test: Request Validation
 * **Feature: whatsapp-lead-management, Property 36: Request Validation**
 * **Validates: Requirements 14.3**
 *
 * For any invalid request payload (missing required fields, wrong types),
 * the system SHALL reject with appropriate validation errors.
 */

import 'reflect-metadata';
import * as fc from 'fast-check';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateLeadDto } from '../../lead/dto/create-lead.dto';
import { CreateUserDto } from '../dto/user.dto';
import { CreateCategoryDto } from '../dto/category.dto';
import { UserRole, LeadStatus } from '../enums';

describe('Property 36: Request Validation', () => {
  const uuidArb = fc.uuid();

  /**
   * Property: Valid CreateLeadDto passes validation
   */
  it('should accept valid CreateLeadDto', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^\+[1-9]\d{9,14}$/),
        uuidArb,
        async (phoneNumber, categoryId) => {
          const dto = plainToInstance(CreateLeadDto, {
            phoneNumber,
            categoryId,
          });

          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        },
      ),
      { numRuns: 50 },
    );
  });

  /**
   * Property: Invalid CreateLeadDto fails validation
   */
  it('should reject CreateLeadDto with missing required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          phoneNumber: fc.option(fc.string(), { nil: undefined }),
          categoryId: fc.option(fc.string(), { nil: undefined }),
        }),
        async (data) => {
          // At least one required field must be missing or invalid
          fc.pre(!data.phoneNumber || !data.categoryId);

          const dto = plainToInstance(CreateLeadDto, data);
          const errors = await validate(dto);

          // Should have validation errors
          expect(errors.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 50 },
    );
  });

  /**
   * Property: Invalid UUID in categoryId fails validation
   */
  it('should reject CreateLeadDto with invalid UUID', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^\+[1-9]\d{9,14}$/),
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter(
            (s) =>
              !s.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
              ),
          ),
        async (phoneNumber, invalidUuid) => {
          const dto = plainToInstance(CreateLeadDto, {
            phoneNumber,
            categoryId: invalidUuid,
          });

          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors.some((e) => e.property === 'categoryId')).toBe(true);
        },
      ),
      { numRuns: 50 },
    );
  });

  /**
   * Property: Valid CreateUserDto passes validation
   */
  it('should accept valid CreateUserDto', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom(...Object.values(UserRole)),
        async (email, password, name, role) => {
          const dto = plainToInstance(CreateUserDto, {
            email,
            password,
            name,
            role,
          });

          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        },
      ),
      { numRuns: 50 },
    );
  });

  /**
   * Property: Invalid email in CreateUserDto fails validation
   */
  it('should reject CreateUserDto with invalid email', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 1, maxLength: 50 })
          .filter((s) => !s.includes('@')),
        fc.string({ minLength: 8, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom(...Object.values(UserRole)),
        async (invalidEmail, password, name, role) => {
          const dto = plainToInstance(CreateUserDto, {
            email: invalidEmail,
            password,
            name,
            role,
          });

          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors.some((e) => e.property === 'email')).toBe(true);
        },
      ),
      { numRuns: 50 },
    );
  });

  /**
   * Property: Valid CreateCategoryDto passes validation
   */
  it('should accept valid CreateCategoryDto', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
          minLength: 1,
          maxLength: 10,
        }),
        async (name, description, keywords) => {
          const dto = plainToInstance(CreateCategoryDto, {
            name,
            description,
            keywords,
          });

          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        },
      ),
      { numRuns: 50 },
    );
  });

  /**
   * Property: Invalid enum value fails validation
   */
  it('should reject invalid enum values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^\+[1-9]\d{9,14}$/),
        uuidArb,
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => !Object.values(LeadStatus).includes(s as LeadStatus)),
        async (phoneNumber, categoryId, invalidStatus) => {
          const dto = plainToInstance(CreateLeadDto, {
            phoneNumber,
            categoryId,
            status: invalidStatus,
          });

          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors.some((e) => e.property === 'status')).toBe(true);
        },
      ),
      { numRuns: 50 },
    );
  });
});
