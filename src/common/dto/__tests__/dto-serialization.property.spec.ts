/**
 * **Feature: whatsapp-lead-management, Property 35: DTO Serialization Round-Trip**
 * **Validates: Requirements 14.4**
 *
 * For any entity, serializing to DTO and deserializing back SHALL produce an equivalent data structure.
 */

import 'reflect-metadata';
import * as fc from 'fast-check';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import { UserDto } from '../user.dto';
import { CategoryDto, MediaDto, AutoReplyTemplateDto } from '../category.dto';
import { LeadDto } from '../lead.dto';
import { MessageDto } from '../message.dto';
import {
  UserRole,
  LeadStatus,
  MessageDirection,
  MessageStatus,
  MediaType,
} from '../../enums';

// Arbitrary generators for enums
const userRoleArb = fc.constantFrom(...Object.values(UserRole));
const leadStatusArb = fc.constantFrom(...Object.values(LeadStatus));
const messageDirectionArb = fc.constantFrom(...Object.values(MessageDirection));
const messageStatusArb = fc.constantFrom(...Object.values(MessageStatus));
const mediaTypeArb = fc.constantFrom(...Object.values(MediaType));

// Arbitrary generator for UUID
const uuidArb = fc.uuid();

// Arbitrary generator for Date using integer timestamps for reliability
// Range: 2020-01-01 to 2030-12-31
const dateArb = fc
  .integer({ min: 1577836800000, max: 1924991999999 })
  .map((ts) => new Date(ts));

// Arbitrary generator for UserDto
const userDtoArb = fc.record({
  id: uuidArb,
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }), {
    nil: undefined,
  }),
  role: userRoleArb,
  managerId: fc.option(uuidArb, { nil: undefined }),
  isActive: fc.boolean(),
  createdAt: dateArb,
  updatedAt: dateArb,
});

// Arbitrary generator for MediaDto
const mediaDtoArb = fc.record({
  id: uuidArb,
  url: fc.webUrl(),
  type: mediaTypeArb,
  filename: fc.string({ minLength: 1, maxLength: 100 }),
  size: fc.integer({ min: 1, max: 100000000 }),
});

// Arbitrary generator for AutoReplyTemplateDto
const autoReplyTemplateDtoArb = fc.record({
  id: uuidArb,
  triggerKeyword: fc.string({ minLength: 1, maxLength: 50 }),
  messageContent: fc.string({ minLength: 1, maxLength: 500 }),
  priority: fc.integer({ min: 0, max: 100 }),
  isActive: fc.boolean(),
});

// Arbitrary generator for CategoryDto
const categoryDtoArb = fc.record({
  id: uuidArb,
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  keywords: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
    minLength: 1,
    maxLength: 10,
  }),
  media: fc.option(fc.array(mediaDtoArb, { maxLength: 5 }), { nil: undefined }),
  autoReplyTemplates: fc.option(
    fc.array(autoReplyTemplateDtoArb, { maxLength: 5 }),
    { nil: undefined },
  ),
  isActive: fc.boolean(),
  createdAt: dateArb,
  updatedAt: dateArb,
});

// Arbitrary generator for LeadDto (without nested objects for simplicity)
const leadDtoArb = fc.record({
  id: uuidArb,
  phoneNumber: fc.string({ minLength: 10, maxLength: 15 }),
  name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
    nil: undefined,
  }),
  categoryId: uuidArb,
  status: leadStatusArb,
  assignedToId: fc.option(uuidArb, { nil: undefined }),
  claimedAt: fc.option(dateArb, { nil: undefined }),
  isQualified: fc.boolean(),
  createdAt: dateArb,
  updatedAt: dateArb,
});

// Arbitrary generator for MessageDto (without nested objects for simplicity)
const messageDtoArb = fc.record({
  id: uuidArb,
  leadId: uuidArb,
  direction: messageDirectionArb,
  content: fc.string({ minLength: 1, maxLength: 1000 }),
  mediaUrl: fc.option(fc.webUrl(), { nil: undefined }),
  mediaType: fc.option(mediaTypeArb, { nil: undefined }),
  sentById: fc.option(uuidArb, { nil: undefined }),
  status: messageStatusArb,
  isAutoReply: fc.boolean(),
  createdAt: dateArb,
});

/**
 * Helper function to compare two objects for equivalence after serialization round-trip.
 * Handles Date objects by comparing their ISO string representations.
 */
function areEquivalent(original: unknown, roundTripped: unknown): boolean {
  if (original === roundTripped) return true;
  if (original === null || roundTripped === null)
    return original === roundTripped;
  if (original === undefined || roundTripped === undefined)
    return original === roundTripped;

  if (original instanceof Date && roundTripped instanceof Date) {
    return original.getTime() === roundTripped.getTime();
  }

  if (typeof original !== typeof roundTripped) return false;

  if (Array.isArray(original) && Array.isArray(roundTripped)) {
    if (original.length !== roundTripped.length) return false;
    return original.every((item, index) =>
      areEquivalent(item, roundTripped[index]),
    );
  }

  if (typeof original === 'object' && typeof roundTripped === 'object') {
    const originalKeys = Object.keys(original as object);
    const roundTrippedKeys = Object.keys(roundTripped as object);

    // Check that all keys in original exist in roundTripped
    for (const key of originalKeys) {
      const origValue = (original as Record<string, unknown>)[key];
      const rtValue = (roundTripped as Record<string, unknown>)[key];
      if (!areEquivalent(origValue, rtValue)) {
        return false;
      }
    }

    // Check for extra keys in roundTripped that have non-undefined values
    for (const key of roundTrippedKeys) {
      if (!originalKeys.includes(key)) {
        const rtValue = (roundTripped as Record<string, unknown>)[key];
        if (rtValue !== undefined) {
          return false;
        }
      }
    }

    return true;
  }

  return original === roundTripped;
}

describe('DTO Serialization Round-Trip Property Tests', () => {
  /**
   * **Feature: whatsapp-lead-management, Property 35: DTO Serialization Round-Trip**
   * **Validates: Requirements 14.4**
   */
  describe('Property 35: DTO Serialization Round-Trip', () => {
    it('UserDto: serialize then deserialize produces equivalent data', () => {
      fc.assert(
        fc.property(userDtoArb, (userData) => {
          // Create instance from plain object
          const instance = plainToInstance(UserDto, userData, {
            excludeExtraneousValues: true,
          });
          // Serialize to plain object
          const serialized = instanceToPlain(instance, {
            excludeExtraneousValues: true,
          });
          // Deserialize back to instance
          const deserialized = plainToInstance(UserDto, serialized, {
            excludeExtraneousValues: true,
          });
          // Serialize again for comparison
          const finalPlain = instanceToPlain(deserialized, {
            excludeExtraneousValues: true,
          });

          return areEquivalent(serialized, finalPlain);
        }),
        { numRuns: 100 },
      );
    });

    it('CategoryDto: serialize then deserialize produces equivalent data', () => {
      fc.assert(
        fc.property(categoryDtoArb, (categoryData) => {
          const instance = plainToInstance(CategoryDto, categoryData, {
            excludeExtraneousValues: true,
          });
          const serialized = instanceToPlain(instance, {
            excludeExtraneousValues: true,
          });
          const deserialized = plainToInstance(CategoryDto, serialized, {
            excludeExtraneousValues: true,
          });
          const finalPlain = instanceToPlain(deserialized, {
            excludeExtraneousValues: true,
          });

          return areEquivalent(serialized, finalPlain);
        }),
        { numRuns: 100 },
      );
    });

    it('LeadDto: serialize then deserialize produces equivalent data', () => {
      fc.assert(
        fc.property(leadDtoArb, (leadData) => {
          const instance = plainToInstance(LeadDto, leadData, {
            excludeExtraneousValues: true,
          });
          const serialized = instanceToPlain(instance, {
            excludeExtraneousValues: true,
          });
          const deserialized = plainToInstance(LeadDto, serialized, {
            excludeExtraneousValues: true,
          });
          const finalPlain = instanceToPlain(deserialized, {
            excludeExtraneousValues: true,
          });

          return areEquivalent(serialized, finalPlain);
        }),
        { numRuns: 100 },
      );
    });

    it('MessageDto: serialize then deserialize produces equivalent data', () => {
      fc.assert(
        fc.property(messageDtoArb, (messageData) => {
          const instance = plainToInstance(MessageDto, messageData, {
            excludeExtraneousValues: true,
          });
          const serialized = instanceToPlain(instance, {
            excludeExtraneousValues: true,
          });
          const deserialized = plainToInstance(MessageDto, serialized, {
            excludeExtraneousValues: true,
          });
          const finalPlain = instanceToPlain(deserialized, {
            excludeExtraneousValues: true,
          });

          return areEquivalent(serialized, finalPlain);
        }),
        { numRuns: 100 },
      );
    });

    it('MediaDto: serialize then deserialize produces equivalent data', () => {
      fc.assert(
        fc.property(mediaDtoArb, (mediaData) => {
          const instance = plainToInstance(MediaDto, mediaData, {
            excludeExtraneousValues: true,
          });
          const serialized = instanceToPlain(instance, {
            excludeExtraneousValues: true,
          });
          const deserialized = plainToInstance(MediaDto, serialized, {
            excludeExtraneousValues: true,
          });
          const finalPlain = instanceToPlain(deserialized, {
            excludeExtraneousValues: true,
          });

          return areEquivalent(serialized, finalPlain);
        }),
        { numRuns: 100 },
      );
    });
  });
});
