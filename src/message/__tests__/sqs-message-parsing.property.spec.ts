import * as fc from 'fast-check';
import { SqsConsumerService } from '../services/sqs-consumer.service';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Lead, Message, Category, User, UserCategory } from '../../entities';
import { AutoReplyService } from '../../auto-reply/auto-reply.service';
import { SlaService } from '../../sla/sla.service';
import { ChatGateway } from '../gateways/chat.gateway';
import { WhatsAppService } from '../../common/services/whatsapp.service';
import { CategoryDetectorService } from '../services/category-detector.service';

/**
 * **Feature: whatsapp-lead-management, Property 4: SQS Message Parsing**
 * **Validates: Requirements 2.2**
 *
 * For any valid SQS message payload, the system SHALL correctly extract
 * phone number, content, and timestamp fields.
 */
describe('Property 4: SQS Message Parsing', () => {
  let sqsConsumerService: SqsConsumerService;

  beforeEach(() => {
    // Create a mock ConfigService
    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          'aws.region': 'us-east-1',
          'aws.accessKeyId': undefined,
          'aws.secretAccessKey': undefined,
          'aws.sqs.queueUrl': '',
        };
        return config[key] ?? defaultValue;
      }),
    } as unknown as ConfigService;

    // Create mock repositories
    const mockLeadRepository = {} as Repository<Lead>;
    const mockMessageRepository = {} as Repository<Message>;
    const mockCategoryRepository = {} as Repository<Category>;
    const mockUserRepository = {} as Repository<User>;
    const mockUserCategoryRepository = {} as Repository<UserCategory>;

    // Create mock services
    const mockAutoReplyService = {} as AutoReplyService;
    const mockSlaService = {} as SlaService;
    const mockChatGateway = {} as ChatGateway;
    const mockWhatsAppService = {} as WhatsAppService;
    const mockCategoryDetectorService = {} as CategoryDetectorService;

    sqsConsumerService = new SqsConsumerService(
      mockConfigService,
      mockLeadRepository,
      mockMessageRepository,
      mockCategoryRepository,
      mockUserRepository,
      mockUserCategoryRepository,
      mockAutoReplyService,
      mockSlaService,
      mockChatGateway,
      mockWhatsAppService,
      mockCategoryDetectorService,
    );
  });

  // Helper to generate digit strings using array of integers
  const digitString = (minLength: number, maxLength: number) =>
    fc
      .array(fc.integer({ min: 0, max: 9 }), { minLength, maxLength })
      .map((digits) => digits.join(''));

  // Arbitrary for valid phone numbers
  const phoneNumberArb = fc.oneof(
    // With country code
    fc
      .tuple(
        fc.constantFrom('+1', '+44', '+91', '+86', '+49'),
        digitString(10, 10),
      )
      .map(([code, num]) => `${code}${num}`),
    // Without + prefix
    digitString(10, 15),
    // With spaces and dashes
    fc
      .tuple(
        fc.constantFrom('+1', '+44', '+91'),
        digitString(3, 3),
        digitString(3, 3),
        digitString(4, 4),
      )
      .map(([code, a, b, c]) => `${code} ${a}-${b}-${c}`),
  );

  // Arbitrary for message content
  const messageContentArb = fc.string({ minLength: 1, maxLength: 1000 });

  // Arbitrary for valid ISO timestamps - use integer to avoid invalid date issues
  const timestampArb = fc
    .integer({
      min: new Date('2020-01-01').getTime(),
      max: new Date('2030-12-31').getTime(),
    })
    .map((ts) => new Date(ts).toISOString());

  // Arbitrary for optional media URL
  const mediaUrlArb = fc.option(fc.webUrl(), { nil: undefined });

  // Arbitrary for optional media type
  const mediaTypeArb = fc.option(
    fc.constantFrom('image', 'video', 'document', 'audio'),
    { nil: undefined },
  );

  // Arbitrary for Unix timestamp (seconds since epoch)
  const unixTimestampArb = fc
    .integer({
      min: Math.floor(new Date('2020-01-01').getTime() / 1000),
      max: Math.floor(new Date('2030-12-31').getTime() / 1000),
    })
    .map((ts) => ts.toString());

  // Arbitrary for valid SQS message payload (WhatsApp webhook format)
  const validSqsPayloadArb = fc.record({
    id: fc.stringMatching(/^wamid\.[A-Za-z0-9]+$/),
    from: phoneNumberArb,
    timestamp: unixTimestampArb,
    type: fc.constant('text'),
    text: fc.record({
      body: messageContentArb,
    }),
  });

  it('should correctly extract phone number from any valid payload', () => {
    fc.assert(
      fc.property(validSqsPayloadArb, (payload) => {
        const body = JSON.stringify(payload);
        const result = sqsConsumerService.parseMessage(body);

        expect(result).not.toBeNull();
        if (result) {
          // Phone number should be normalized (start with + and contain only digits after)
          expect(result.phoneNumber).toMatch(/^\+\d+$/);
          // Should contain the digits from the original phone number
          const originalDigits = payload.from.replace(/\D/g, '');
          expect(result.phoneNumber.replace(/\D/g, '')).toBe(originalDigits);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('should correctly extract content from any valid payload', () => {
    fc.assert(
      fc.property(validSqsPayloadArb, (payload) => {
        const body = JSON.stringify(payload);
        const result = sqsConsumerService.parseMessage(body);

        expect(result).not.toBeNull();
        if (result) {
          expect(result.content).toBe(payload.text.body);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('should correctly extract timestamp from any valid payload', () => {
    fc.assert(
      fc.property(validSqsPayloadArb, (payload) => {
        const body = JSON.stringify(payload);
        const result = sqsConsumerService.parseMessage(body);

        expect(result).not.toBeNull();
        if (result) {
          expect(result.timestamp).toBeInstanceOf(Date);
          // Unix timestamp is in seconds, convert to milliseconds for comparison
          const expectedDate = new Date(parseInt(payload.timestamp, 10) * 1000);
          expect(result.timestamp.getTime()).toBe(expectedDate.getTime());
        }
      }),
      { numRuns: 100 },
    );
  });

  it('should preserve message ID when present', () => {
    fc.assert(
      fc.property(validSqsPayloadArb, (payload) => {
        const body = JSON.stringify(payload);
        const result = sqsConsumerService.parseMessage(body);

        expect(result).not.toBeNull();
        if (result) {
          expect(result.rawMessageId).toBe(payload.id);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('should return null for invalid JSON', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => {
          try {
            JSON.parse(s);
            return false;
          } catch {
            return true;
          }
        }),
        (invalidJson) => {
          const result = sqsConsumerService.parseMessage(invalidJson);
          expect(result).toBeNull();
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should return null when required fields are missing', () => {
    // Missing 'from' field
    const missingFromArb = fc.record({
      id: fc.stringMatching(/^wamid\.[A-Za-z0-9]+$/),
      timestamp: unixTimestampArb,
      type: fc.constant('text'),
      text: fc.record({ body: messageContentArb }),
    });

    fc.assert(
      fc.property(missingFromArb, (payload) => {
        const body = JSON.stringify(payload);
        const result = sqsConsumerService.parseMessage(body);
        expect(result).toBeNull();
      }),
      { numRuns: 50 },
    );

    // Missing 'timestamp' field
    const missingTimestampArb = fc.record({
      id: fc.stringMatching(/^wamid\.[A-Za-z0-9]+$/),
      from: phoneNumberArb,
      type: fc.constant('text'),
      text: fc.record({ body: messageContentArb }),
    });

    fc.assert(
      fc.property(missingTimestampArb, (payload) => {
        const body = JSON.stringify(payload);
        const result = sqsConsumerService.parseMessage(body);
        expect(result).toBeNull();
      }),
      { numRuns: 50 },
    );

    // Missing 'type' field
    const missingTypeArb = fc.record({
      id: fc.stringMatching(/^wamid\.[A-Za-z0-9]+$/),
      from: phoneNumberArb,
      timestamp: unixTimestampArb,
      text: fc.record({ body: messageContentArb }),
    });

    fc.assert(
      fc.property(missingTypeArb, (payload) => {
        const body = JSON.stringify(payload);
        const result = sqsConsumerService.parseMessage(body);
        expect(result).toBeNull();
      }),
      { numRuns: 50 },
    );
  });
});
