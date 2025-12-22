# WhatsApp Message Flow

## Overview

This document describes the message handling flow for incoming WhatsApp messages.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NEW MESSAGE RECEIVED (SQS)                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Check Message Type          │
                    └───────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
    ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
    │  Text/Media   │      │  list_reply   │      │  nfm_reply    │
    │  (New Lead)   │      │  (Category    │      │  (Form        │
    │               │      │   Selection)  │      │   Submitted)  │
    └───────┬───────┘      └───────┬───────┘      └───────┬───────┘
            │                      │                      │
            ▼                      │                      │
    ┌───────────────┐              │                      │
    │ Existing Lead?│              │                      │
    └───────┬───────┘              │                      │
            │                      │                      │
     ┌──────┴──────┐               │                      │
     │             │               │                      │
     ▼             ▼               │                      │
┌─────────┐  ┌─────────────┐       │                      │
│   YES   │  │     NO      │       │                      │
│ Store   │  │ Try Detect  │       │                      │
│ Message │  │ Category    │       │                      │
└─────────┘  └──────┬──────┘       │                      │
                    │              │                      │
            ┌───────┴───────┐      │                      │
            │               │      │                      │
            ▼               ▼      │                      │
     ┌───────────┐   ┌───────────┐ │                      │
     │ Category  │   │ Category  │ │                      │
     │  FOUND    │   │ NOT FOUND │ │                      │
     └─────┬─────┘   └─────┬─────┘ │                      │
           │               │       │                      │
           ▼               ▼       │                      │
    ┌─────────────┐ ┌─────────────┐│                      │
    │ Create Lead │ │ Create Lead ││                      │
    │ with        │ │ without     ││                      │
    │ Category    │ │ Category    ││                      │
    └──────┬──────┘ └──────┬──────┘│                      │
           │               │       │                      │
           ▼               ▼       │                      │
    ┌─────────────┐ ┌─────────────┐│                      │
    │ Send Lead   │ │ Send        ││                      │
    │ Details     │ │ Category    ││                      │
    │ Flow        │ │ Selection   ││                      │
    │             │ │ List        ││                      │
    └─────────────┘ └─────────────┘│                      │
                                   │                      │
                                   ▼                      │
                          ┌───────────────┐               │
                          │ User Selects  │               │
                          │ Category      │               │
                          └───────┬───────┘               │
                                  │                       │
                                  ▼                       │
                          ┌───────────────┐               │
                          │ Update Lead   │               │
                          │ with Category │               │
                          └───────┬───────┘               │
                                  │                       │
                                  ▼                       │
                          ┌───────────────┐               │
                          │ Send Lead     │               │
                          │ Details Flow  │               │
                          └───────────────┘               │
                                                          │
                                                          ▼
                                                 ┌───────────────┐
                                                 │ Update Lead   │
                                                 │ - Name        │
                                                 │ - Email       │
                                                 └───────┬───────┘
                                                         │
                                                         ▼
                                                 ┌───────────────┐
                                                 │ Send Category │
                                                 │ Media         │
                                                 │ (Auto-Reply)  │
                                                 └───────┬───────┘
                                                         │
                                                         ▼
                                                 ┌───────────────┐
                                                 │ Assign to     │
                                                 │ Customer      │
                                                 │ Executive     │
                                                 └───────────────┘
```

## Message Types

### 1. Text/Media Message (New Lead)

- First message from a new phone number
- System tries to detect category from message keywords
- If category found: Send lead details flow directly
- If category NOT found: Send category selection list

### 2. List Reply (Category Selection)

- User selected a category from the selection list
- Format: `category_select~{categoryId}`
- Updates lead with selected category
- Sends lead details flow

### 3. NFM Reply (Form Submitted)

- User submitted the lead details form
- Flow token format: `{leadId}~{categoryId}`
- Updates lead with customer name/email
- Sends category media as auto-reply
- Assigns lead to Customer Executive

## SQS Message Payload

```typescript
interface SqsMessagePayload {
  from: string; // Phone number
  messageId?: string; // WhatsApp message ID
  timestamp: string; // ISO timestamp
  content?: string; // Message text
  messageType?: string; // 'text', 'list_reply', 'nfm_reply', etc.

  // For list_reply
  listReplyId?: string; // Selected item ID
  listReplyTitle?: string; // Selected item title

  // For nfm_reply (flow response)
  flowToken?: string; // Flow token with lead/category info
  flowData?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}
```

## Category Selection List Format

```typescript
{
  type: 'list',
  header: { type: 'text', text: 'Welcome {customerName}!' },
  body: { text: 'Please select a category...' },
  action: {
    button: 'Choose Category',
    sections: [{
      title: 'Categories',
      rows: [
        { id: 'category_select~{uuid}', title: 'Category Name', description: '...' }
      ]
    }]
  }
}
```

## Lead Details Flow

Flow ID: `1165135069021636`
Flow Token: `{leadId}~{categoryId}`

Collects:

- First Name
- Last Name
- Email
- Terms Agreement
- Offers Acceptance
