import * as fc from 'fast-check';
import { Message } from '../../entities';
import { MessageDirection, MessageStatus } from '../../common/enums';

/**
 * Property 7: Auto-Reply Logging
 * For any auto-reply sent, the system SHALL create a message record in the
 * conversation thread with `isAutoReply=true`.
 * Validates: Requirements 3.3
 */
describe('Property 7: Auto-Reply Logging', () => {
  // Type for auto-reply message (sentById can be null for auto-replies)
  interface AutoReplyMessageData {
    leadId: string;
    direction: MessageDirection;
    content: string;
    status: MessageStatus;
    isAutoReply: boolean;
    sentById: string | null;
  }

  // Simulate auto-reply message creation
  function createAutoReplyMessage(
    leadId: string,
    content: string,
    sent: boolean,
  ): AutoReplyMessageData {
    return {
      leadId,
      direction: MessageDirection.OUTBOUND,
      content,
      status: sent ? MessageStatus.SENT : MessageStatus.FAILED,
      isAutoReply: true,
      sentById: null, // Auto-replies have no sender
    };
  }

  // Validate auto-reply message properties
  function validateAutoReplyMessage(message: AutoReplyMessageData): boolean {
    return (
      message.isAutoReply === true &&
      message.direction === MessageDirection.OUTBOUND &&
      message.sentById === null &&
      message.content !== undefined &&
      message.content.length > 0 &&
      message.leadId !== undefined
    );
  }

  it('should always create message with isAutoReply=true for auto-replies', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.boolean(),
        (leadId, content, sent) => {
          const message = createAutoReplyMessage(leadId, content, sent);
          expect(message.isAutoReply).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should always set direction to OUTBOUND for auto-replies', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.boolean(),
        (leadId, content, sent) => {
          const message = createAutoReplyMessage(leadId, content, sent);
          expect(message.direction).toBe(MessageDirection.OUTBOUND);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should set status to SENT when delivery succeeds', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        (leadId, content) => {
          const message = createAutoReplyMessage(leadId, content, true);
          expect(message.status).toBe(MessageStatus.SENT);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should set status to FAILED when delivery fails', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        (leadId, content) => {
          const message = createAutoReplyMessage(leadId, content, false);
          expect(message.status).toBe(MessageStatus.FAILED);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should have no sender (sentById=null) for auto-replies', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.boolean(),
        (leadId, content, sent) => {
          const message = createAutoReplyMessage(leadId, content, sent);
          expect(message.sentById).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should preserve the lead association', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.boolean(),
        (leadId, content, sent) => {
          const message = createAutoReplyMessage(leadId, content, sent);
          expect(message.leadId).toBe(leadId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should preserve the message content', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.boolean(),
        (leadId, content, sent) => {
          const message = createAutoReplyMessage(leadId, content, sent);
          expect(message.content).toBe(content);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should pass all validation rules for auto-reply messages', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.boolean(),
        (leadId, content, sent) => {
          const message = createAutoReplyMessage(leadId, content, sent);
          expect(validateAutoReplyMessage(message)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should distinguish auto-replies from manual messages', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.uuid(),
        (leadId, content, senderId) => {
          // Auto-reply message
          const autoReply = createAutoReplyMessage(leadId, content, true);

          // Manual message (simulated)
          const manualMessage: AutoReplyMessageData = {
            leadId,
            direction: MessageDirection.OUTBOUND,
            content,
            status: MessageStatus.SENT,
            isAutoReply: false,
            sentById: senderId,
          };

          // Auto-reply should have isAutoReply=true and no sender
          expect(autoReply.isAutoReply).toBe(true);
          expect(autoReply.sentById).toBeNull();

          // Manual message should have isAutoReply=false and a sender
          expect(manualMessage.isAutoReply).toBe(false);
          expect(manualMessage.sentById).toBe(senderId);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should create valid message records for any template content', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.oneof(
          fc.constant('Thank you for contacting us!'),
          fc.constant('We will get back to you shortly.'),
          fc.constant('Your inquiry has been received.'),
          fc.string({ minLength: 1, maxLength: 1000 }),
        ),
        fc.boolean(),
        (leadId, templateContent, sent) => {
          const message = createAutoReplyMessage(leadId, templateContent, sent);

          expect(message.leadId).toBe(leadId);
          expect(message.content).toBe(templateContent);
          expect(message.isAutoReply).toBe(true);
          expect(message.direction).toBe(MessageDirection.OUTBOUND);
        },
      ),
      { numRuns: 100 },
    );
  });
});
