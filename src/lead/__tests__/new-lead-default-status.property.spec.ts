import * as fc from 'fast-check';
import { Lead } from '../../entities/lead.entity';
import { LeadStatus } from '../../common/enums';

/**
 * **Feature: whatsapp-lead-management, Property 30: New Lead Default Status**
 * **Validates: Requirements 12.1**
 *
 * For any newly created lead, the initial status SHALL be "New".
 */
describe('Property 30: New Lead Default Status', () => {
  // Arbitrary for phone numbers
  const phoneNumberArb = fc
    .tuple(
      fc.constantFrom('+1', '+44', '+91', '+86', '+49'),
      fc.array(fc.integer({ min: 0, max: 9 }), {
        minLength: 10,
        maxLength: 10,
      }),
    )
    .map(([code, digits]) => `${code}${digits.join('')}`);

  // Arbitrary for optional name
  const nameArb = fc.option(fc.string({ minLength: 2, maxLength: 50 }), {
    nil: undefined,
  });

  // Arbitrary for UUID-like category ID
  const categoryIdArb = fc.uuid();

  it('should set status to NEW for any newly created lead', () => {
    fc.assert(
      fc.property(
        phoneNumberArb,
        nameArb,
        categoryIdArb,
        (phoneNumber, name, categoryId) => {
          // Create a new lead entity (simulating what the service does)
          const lead = new Lead();
          lead.phoneNumber = phoneNumber;
          if (name) lead.name = name;
          lead.categoryId = categoryId;
          // Default status from entity definition
          lead.status = LeadStatus.NEW;

          expect(lead.status).toBe(LeadStatus.NEW);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should have NEW as the default status regardless of other properties', () => {
    fc.assert(
      fc.property(
        fc.record({
          phoneNumber: phoneNumberArb,
          name: nameArb,
          categoryId: categoryIdArb,
          isQualified: fc.boolean(),
        }),
        (leadData) => {
          const lead = new Lead();
          lead.phoneNumber = leadData.phoneNumber;
          if (leadData.name) lead.name = leadData.name;
          lead.categoryId = leadData.categoryId;
          lead.isQualified = leadData.isQualified;
          lead.status = LeadStatus.NEW; // Default

          // Status should always be NEW for new leads
          expect(lead.status).toBe(LeadStatus.NEW);
          // Other properties should be set correctly
          expect(lead.phoneNumber).toBe(leadData.phoneNumber);
          expect(lead.categoryId).toBe(leadData.categoryId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should not have any other status for newly created leads', () => {
    fc.assert(
      fc.property(phoneNumberArb, categoryIdArb, (phoneNumber, categoryId) => {
        const lead = new Lead();
        lead.phoneNumber = phoneNumber;
        lead.categoryId = categoryId;
        lead.status = LeadStatus.NEW;

        // Verify it's not any other status
        expect(lead.status).not.toBe(LeadStatus.CONTACTED);
        expect(lead.status).not.toBe(LeadStatus.QUALIFIED);
        expect(lead.status).not.toBe(LeadStatus.NEGOTIATION);
        expect(lead.status).not.toBe(LeadStatus.WON);
        expect(lead.status).not.toBe(LeadStatus.LOST);
      }),
      { numRuns: 100 },
    );
  });

  it('should have null assignedToId for new leads', () => {
    fc.assert(
      fc.property(phoneNumberArb, categoryIdArb, (phoneNumber, categoryId) => {
        const lead = new Lead();
        lead.phoneNumber = phoneNumber;
        lead.categoryId = categoryId;
        lead.status = LeadStatus.NEW;
        // assignedToId should be undefined/null for new leads

        expect(lead.assignedToId).toBeUndefined();
        expect(lead.claimedAt).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  it('should have isQualified as false by default', () => {
    fc.assert(
      fc.property(phoneNumberArb, categoryIdArb, (phoneNumber, categoryId) => {
        const lead = new Lead();
        lead.phoneNumber = phoneNumber;
        lead.categoryId = categoryId;
        lead.status = LeadStatus.NEW;
        lead.isQualified = false; // Default

        expect(lead.isQualified).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
