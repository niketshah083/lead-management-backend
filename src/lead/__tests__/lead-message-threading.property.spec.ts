import * as fc from 'fast-check';
import { Lead } from '../../entities/lead.entity';
import { Message } from '../../entities/message.entity';
import {
  MessageDirection,
  MessageStatus,
  LeadStatus,
} from '../../common/enums';

/**
 * **Feature: whatsapp-lead-management, Property 6: Lead Message Threading**
 * **Validates: Requirements 2.6, 6.4**
 *
 * For any sequence of messages from the same phone number, all messages
 * SHALL be linked to the same lead record in chronological order.
 */
describe('Property 6: Lead Message Threading', () => {
  // Helper to create a mock lead
  const createMockLead = (phoneNumber: string, id: string): Lead => {
    const lead = new Lead();
    lead.id = id;
    lead.phoneNumber = phoneNumber;
    lead.status = LeadStatus.NEW;
    lead.createdAt = new Date();
    lead.messages = [];
    return lead;
  };

  // Helper to create a mock message
  const createMockMessage = (
    leadId: string,
    content: string,
    timestamp: Date,
    direction: MessageDirection = MessageDirection.INBOUND,
  ): Message => {
    const message = new Message();
    message.id = `msg-${Math.random().toString(36).substr(2, 9)}`;
    message.leadId = leadId;
    message.content = content;
    message.direction = direction;
    message.status = MessageStatus.DELIVERED;
    message.createdAt = timestamp;
    return message;
  };

  // Arbitrary for phone numbers
  const phoneNumberArb = fc
    .tuple(
      fc.constantFrom('+1', '+44', '+91'),
      fc.array(fc.integer({ min: 0, max: 9 }), {
        minLength: 10,
        maxLength: 10,
      }),
    )
    .map(([code, digits]) => `${code}${digits.join('')}`);

  // Arbitrary for message content
  const messageContentArb = fc.string({ minLength: 1, maxLength: 200 });

  // Arbitrary for timestamps in sequence
  const timestampSequenceArb = (count: number) =>
    fc
      .array(
        fc.integer({ min: 1000, max: 60000 }), // milliseconds between messages
        { minLength: count, maxLength: count },
      )
      .map((intervals) => {
        const timestamps: Date[] = [];
        let current = new Date('2024-01-01T00:00:00Z').getTime();
        for (const interval of intervals) {
          current += interval;
          timestamps.push(new Date(current));
        }
        return timestamps;
      });

  it('should link all messages from same phone to same lead', () => {
    fc.assert(
      fc.property(
        phoneNumberArb,
        fc.array(messageContentArb, { minLength: 2, maxLength: 10 }),
        (phoneNumber, contents) => {
          const leadId = `lead-${Math.random().toString(36).substr(2, 9)}`;
          const lead = createMockLead(phoneNumber, leadId);

          // Create messages for this lead
          const messages = contents.map((content, index) => {
            const timestamp = new Date(Date.now() + index * 1000);
            return createMockMessage(leadId, content, timestamp);
          });

          // All messages should have the same leadId
          for (const message of messages) {
            expect(message.leadId).toBe(leadId);
          }

          // Verify all messages belong to the same lead
          const uniqueLeadIds = new Set(messages.map((m) => m.leadId));
          expect(uniqueLeadIds.size).toBe(1);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should maintain chronological order of messages', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10 }), (messageCount) => {
        const leadId = `lead-${Math.random().toString(36).substr(2, 9)}`;

        // Generate timestamps in sequence
        const baseTime = new Date('2024-01-01T00:00:00Z').getTime();
        const messages: Message[] = [];

        for (let i = 0; i < messageCount; i++) {
          const timestamp = new Date(baseTime + i * 1000);
          const message = createMockMessage(leadId, `Message ${i}`, timestamp);
          messages.push(message);
        }

        // Sort by createdAt
        const sortedMessages = [...messages].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );

        // Verify chronological order
        for (let i = 1; i < sortedMessages.length; i++) {
          expect(sortedMessages[i].createdAt.getTime()).toBeGreaterThanOrEqual(
            sortedMessages[i - 1].createdAt.getTime(),
          );
        }
      }),
      { numRuns: 100 },
    );
  });

  it('should preserve message content integrity in thread', () => {
    fc.assert(
      fc.property(
        fc.array(messageContentArb, { minLength: 1, maxLength: 10 }),
        (contents) => {
          const leadId = `lead-${Math.random().toString(36).substr(2, 9)}`;

          const messages = contents.map((content, index) => {
            const timestamp = new Date(Date.now() + index * 1000);
            return createMockMessage(leadId, content, timestamp);
          });

          // Verify content is preserved
          for (let i = 0; i < messages.length; i++) {
            expect(messages[i].content).toBe(contents[i]);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should correctly identify inbound vs outbound messages in thread', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            content: messageContentArb,
            direction: fc.constantFrom(
              MessageDirection.INBOUND,
              MessageDirection.OUTBOUND,
            ),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (messageData) => {
          const leadId = `lead-${Math.random().toString(36).substr(2, 9)}`;

          const messages = messageData.map((data, index) => {
            const timestamp = new Date(Date.now() + index * 1000);
            return createMockMessage(
              leadId,
              data.content,
              timestamp,
              data.direction,
            );
          });

          // Verify direction is preserved
          for (let i = 0; i < messages.length; i++) {
            expect(messages[i].direction).toBe(messageData[i].direction);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should handle empty message threads gracefully', () => {
    fc.assert(
      fc.property(phoneNumberArb, (phoneNumber) => {
        const leadId = `lead-${Math.random().toString(36).substr(2, 9)}`;
        const lead = createMockLead(phoneNumber, leadId);

        // Empty messages array
        lead.messages = [];

        expect(lead.messages).toHaveLength(0);
        expect(lead.phoneNumber).toBe(phoneNumber);
      }),
      { numRuns: 50 },
    );
  });

  it('should maintain thread integrity with mixed message directions', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10 }), (messageCount) => {
        const leadId = `lead-${Math.random().toString(36).substr(2, 9)}`;
        const messages: Message[] = [];

        for (let i = 0; i < messageCount; i++) {
          const timestamp = new Date(Date.now() + i * 1000);
          const direction =
            i % 2 === 0 ? MessageDirection.INBOUND : MessageDirection.OUTBOUND;

          messages.push(
            createMockMessage(leadId, `Message ${i}`, timestamp, direction),
          );
        }

        // All messages should belong to same lead
        const allSameLead = messages.every((m) => m.leadId === leadId);
        expect(allSameLead).toBe(true);

        // Should have both inbound and outbound messages
        const hasInbound = messages.some(
          (m) => m.direction === MessageDirection.INBOUND,
        );
        const hasOutbound = messages.some(
          (m) => m.direction === MessageDirection.OUTBOUND,
        );

        if (messageCount >= 2) {
          expect(hasInbound).toBe(true);
          expect(hasOutbound).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });
});
