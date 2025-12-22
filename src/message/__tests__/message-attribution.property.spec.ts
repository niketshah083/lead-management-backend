/**
 * Property Test: Message Attribution
 * **Feature: whatsapp-lead-management, Property 18: Message Attribution**
 * **Validates: Requirements 7.3, 8.3**
 *
 * For any message sent by a Manager or Admin, the message record
 * SHALL correctly attribute the sender.
 */

import * as fc from 'fast-check';
import { MessageService } from '../services/message.service';
import { Message, Lead, User } from '../../entities';
import { UserRole, MessageDirection, MessageStatus } from '../../common/enums';

describe('Property 18: Message Attribution', () => {
  const uuidArb = fc.uuid();

  const userArb = (role: UserRole) =>
    fc.record({
      id: uuidArb,
      email: fc.emailAddress(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      role: fc.constant(role),
      isActive: fc.constant(true),
    });

  const leadArb = fc.record({
    id: uuidArb,
    phoneNumber: fc.stringMatching(/^\+[1-9]\d{9,14}$/),
    categoryId: uuidArb,
    status: fc.constant('new'),
  });

  const messageContentArb = fc.record({
    content: fc.string({ minLength: 1, maxLength: 500 }),
    mediaUrl: fc.option(fc.webUrl(), { nil: undefined }),
    mediaType: fc.option(fc.constantFrom('image', 'video', 'document'), {
      nil: undefined,
    }),
  });

  /**
   * Property: Messages sent by Manager are attributed to Manager
   */
  it('should attribute messages sent by Manager to the Manager', async () => {
    await fc.assert(
      fc.asyncProperty(
        userArb(UserRole.MANAGER),
        leadArb,
        messageContentArb,
        async (manager, lead, messageContent) => {
          let savedMessage: any = null;

          const mockMessageRepo = {
            create: jest.fn().mockImplementation((data) => ({
              id: fc.sample(uuidArb, 1)[0],
              ...data,
            })),
            save: jest.fn().mockImplementation((msg) => {
              savedMessage = msg;
              return Promise.resolve(msg);
            }),
          };

          const mockLeadRepo = {
            findOne: jest.fn().mockResolvedValue(lead),
          };

          const mockWhatsAppService = {
            sendTextMessage: jest.fn().mockResolvedValue(true),
            sendImage: jest.fn().mockResolvedValue(true),
            sendVideo: jest.fn().mockResolvedValue(true),
            sendDocument: jest.fn().mockResolvedValue(true),
          };

          const mockS3Service = {
            getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.com'),
          };

          const service = new MessageService(
            mockMessageRepo as any,
            mockLeadRepo as any,
            mockWhatsAppService as any,
            mockS3Service as any,
          );

          await service.send(lead.id, messageContent as any, manager.id);

          // Verify message is attributed to manager
          expect(savedMessage).not.toBeNull();
          expect(savedMessage.sentById).toBe(manager.id);
          expect(savedMessage.direction).toBe(MessageDirection.OUTBOUND);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Messages sent by Admin are attributed to Admin
   */
  it('should attribute messages sent by Admin to the Admin', async () => {
    await fc.assert(
      fc.asyncProperty(
        userArb(UserRole.ADMIN),
        leadArb,
        messageContentArb,
        async (admin, lead, messageContent) => {
          let savedMessage: any = null;

          const mockMessageRepo = {
            create: jest.fn().mockImplementation((data) => ({
              id: fc.sample(uuidArb, 1)[0],
              ...data,
            })),
            save: jest.fn().mockImplementation((msg) => {
              savedMessage = msg;
              return Promise.resolve(msg);
            }),
          };

          const mockLeadRepo = {
            findOne: jest.fn().mockResolvedValue(lead),
          };

          const mockWhatsAppService = {
            sendTextMessage: jest.fn().mockResolvedValue(true),
            sendImage: jest.fn().mockResolvedValue(true),
            sendVideo: jest.fn().mockResolvedValue(true),
            sendDocument: jest.fn().mockResolvedValue(true),
          };

          const mockS3Service = {
            getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.com'),
          };

          const service = new MessageService(
            mockMessageRepo as any,
            mockLeadRepo as any,
            mockWhatsAppService as any,
            mockS3Service as any,
          );

          await service.send(lead.id, messageContent as any, admin.id);

          // Verify message is attributed to admin
          expect(savedMessage).not.toBeNull();
          expect(savedMessage.sentById).toBe(admin.id);
          expect(savedMessage.direction).toBe(MessageDirection.OUTBOUND);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Messages sent by CE are attributed to CE
   */
  it('should attribute messages sent by CE to the CE', async () => {
    await fc.assert(
      fc.asyncProperty(
        userArb(UserRole.CUSTOMER_EXECUTIVE),
        leadArb,
        messageContentArb,
        async (ce, lead, messageContent) => {
          let savedMessage: any = null;

          const mockMessageRepo = {
            create: jest.fn().mockImplementation((data) => ({
              id: fc.sample(uuidArb, 1)[0],
              ...data,
            })),
            save: jest.fn().mockImplementation((msg) => {
              savedMessage = msg;
              return Promise.resolve(msg);
            }),
          };

          const mockLeadRepo = {
            findOne: jest.fn().mockResolvedValue(lead),
          };

          const mockWhatsAppService = {
            sendTextMessage: jest.fn().mockResolvedValue(true),
            sendImage: jest.fn().mockResolvedValue(true),
            sendVideo: jest.fn().mockResolvedValue(true),
            sendDocument: jest.fn().mockResolvedValue(true),
          };

          const mockS3Service = {
            getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.com'),
          };

          const service = new MessageService(
            mockMessageRepo as any,
            mockLeadRepo as any,
            mockWhatsAppService as any,
            mockS3Service as any,
          );

          await service.send(lead.id, messageContent as any, ce.id);

          // Verify message is attributed to CE
          expect(savedMessage).not.toBeNull();
          expect(savedMessage.sentById).toBe(ce.id);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Inbound messages have no sender attribution
   */
  it('should not attribute inbound messages to any user', async () => {
    await fc.assert(
      fc.asyncProperty(
        leadArb,
        fc.string({ minLength: 1, maxLength: 500 }),
        async (lead, content) => {
          let savedMessage: any = null;

          const mockMessageRepo = {
            create: jest.fn().mockImplementation((data) => ({
              id: fc.sample(uuidArb, 1)[0],
              ...data,
            })),
            save: jest.fn().mockImplementation((msg) => {
              savedMessage = msg;
              return Promise.resolve(msg);
            }),
          };

          const mockLeadRepo = {
            findOne: jest.fn().mockResolvedValue(lead),
          };

          const mockWhatsAppService = {};

          const mockS3Service = {
            getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.com'),
          };

          const service = new MessageService(
            mockMessageRepo as any,
            mockLeadRepo as any,
            mockWhatsAppService as any,
            mockS3Service as any,
          );

          await service.storeIncomingMessage(lead.id, content);

          // Verify inbound message has no sender
          expect(savedMessage).not.toBeNull();
          expect(savedMessage.sentById).toBeUndefined();
          expect(savedMessage.direction).toBe(MessageDirection.INBOUND);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Attribution is preserved when retrieving conversation
   */
  it('should preserve attribution when retrieving conversation', async () => {
    await fc.assert(
      fc.asyncProperty(
        leadArb,
        fc.array(userArb(UserRole.CUSTOMER_EXECUTIVE), {
          minLength: 1,
          maxLength: 3,
        }),
        async (lead, senders) => {
          // Create messages with different senders
          const messages = senders.map((sender, index) => ({
            id: fc.sample(uuidArb, 1)[0],
            leadId: lead.id,
            direction: MessageDirection.OUTBOUND,
            content: `Message ${index}`,
            sentById: sender.id,
            sentBy: sender,
            status: MessageStatus.SENT,
            createdAt: new Date(),
          }));

          const mockMessageRepo = {
            findAndCount: jest
              .fn()
              .mockResolvedValue([messages, messages.length]),
          };

          const mockLeadRepo = {
            findOne: jest.fn().mockResolvedValue(lead),
          };

          const mockWhatsAppService = {};

          const mockS3Service = {
            getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.com'),
          };

          const service = new MessageService(
            mockMessageRepo as any,
            mockLeadRepo as any,
            mockWhatsAppService as any,
            mockS3Service as any,
          );

          const result = await service.getConversation(lead.id, {
            page: 1,
            limit: 50,
          });

          // Verify each message has correct attribution
          result.data.forEach((msg, index) => {
            expect(msg.sentById).toBe(senders[index].id);
            expect(msg.sentBy).toEqual(senders[index]);
          });
        },
      ),
      { numRuns: 100 },
    );
  });
});
