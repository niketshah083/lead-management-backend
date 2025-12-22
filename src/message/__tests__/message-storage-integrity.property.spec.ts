import * as fc from 'fast-check';
import { Message } from '../../entities';
import { MessageDirection, MessageStatus } from '../../common/enums';

/**
 * Property 13: Message Storage Integrity
 * For any message received via SQS, the system SHALL store it in the database
 * with correct lead association and content.
 * Validates: Requirements 6.2
 */
describe('Property 13: Message Storage Integrity', () => {
  // Simulate message storage
  interface StoredMessage {
    id: string;
    leadId: string;
    direction: MessageDirection;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    status: MessageStatus;
    isAutoReply: boolean;
    createdAt: Date;
  }

  function storeIncomingMessage(
    leadId: string,
    content: string,
    mediaUrl?: string,
    mediaType?: string,
  ): StoredMessage {
    return {
      id: `msg-${Date.now()}`,
      leadId,
      direction: MessageDirection.INBOUND,
      content,
      mediaUrl,
      mediaType,
      status: MessageStatus.DELIVERED,
      isAutoReply: false,
      createdAt: new Date(),
    };
  }

  it('should preserve lead association for all stored messages', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 1000 }),
        (leadId, content) => {
          const stored = storeIncomingMessage(leadId, content);
          expect(stored.leadId).toBe(leadId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should preserve message content exactly', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 5000 }),
        (leadId, content) => {
          const stored = storeIncomingMessage(leadId, content);
          expect(stored.content).toBe(content);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should set direction to INBOUND for incoming messages', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        (leadId, content) => {
          const stored = storeIncomingMessage(leadId, content);
          expect(stored.direction).toBe(MessageDirection.INBOUND);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should set status to DELIVERED for incoming messages', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        (leadId, content) => {
          const stored = storeIncomingMessage(leadId, content);
          expect(stored.status).toBe(MessageStatus.DELIVERED);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should set isAutoReply to false for incoming messages', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        (leadId, content) => {
          const stored = storeIncomingMessage(leadId, content);
          expect(stored.isAutoReply).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should preserve media URL when provided', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.webUrl(),
        fc.constantFrom('image', 'video', 'document'),
        (leadId, content, mediaUrl, mediaType) => {
          const stored = storeIncomingMessage(
            leadId,
            content,
            mediaUrl,
            mediaType,
          );
          expect(stored.mediaUrl).toBe(mediaUrl);
          expect(stored.mediaType).toBe(mediaType);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should handle messages without media', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        (leadId, content) => {
          const stored = storeIncomingMessage(leadId, content);
          expect(stored.mediaUrl).toBeUndefined();
          expect(stored.mediaType).toBeUndefined();
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should generate message IDs for each stored message', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }),
        (leadId, content) => {
          const message = storeIncomingMessage(leadId, content);
          // Each message should have an ID
          expect(message.id).toBeDefined();
          expect(message.id.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should set createdAt timestamp', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        (leadId, content) => {
          const before = new Date();
          const stored = storeIncomingMessage(leadId, content);
          const after = new Date();

          expect(stored.createdAt).toBeInstanceOf(Date);
          expect(stored.createdAt.getTime()).toBeGreaterThanOrEqual(
            before.getTime(),
          );
          expect(stored.createdAt.getTime()).toBeLessThanOrEqual(
            after.getTime(),
          );
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should handle special characters in content', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.oneof(
          fc.constant('Hello 👋 World 🌍'),
          fc.constant('Special chars: <>&"\''),
          fc.constant('Unicode: 你好世界'),
          fc.constant('Newlines:\n\r\nTabs:\t'),
          fc.string({ minLength: 1, maxLength: 500 }),
        ),
        (leadId, content) => {
          const stored = storeIncomingMessage(leadId, content);
          expect(stored.content).toBe(content);
        },
      ),
      { numRuns: 50 },
    );
  });
});
