# Connector Master - Integration Hub

## Overview

The Connector Master is a centralized system for managing all third-party integrations, handling authentication, mapping incoming data, and sending data into the existing Lead Management flow.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONNECTOR MASTER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Webhook    │  │    OAuth     │  │   Polling    │          │
│  │  Connector   │  │  Connectors  │  │  Connectors  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────────┬────┴────────────────┘                   │
│                      │                                          │
│              ┌───────▼───────┐                                  │
│              │  Validation   │                                  │
│              │    Layer      │                                  │
│              └───────┬───────┘                                  │
│                      │                                          │
│              ┌───────▼───────┐                                  │
│              │ Normalization │                                  │
│              │    Layer      │                                  │
│              └───────┬───────┘                                  │
│                      │                                          │
│              ┌───────▼───────┐                                  │
│              │ Deduplication │                                  │
│              │    Layer      │                                  │
│              └───────┬───────┘                                  │
│                      │                                          │
│              ┌───────▼───────┐                                  │
│              │  Lead Service │                                  │
│              │   (Existing)  │                                  │
│              └───────────────┘                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Supported Connectors

### 1. Custom Webhook Connector

- **Type**: `webhook`
- **Auth**: Webhook Secret (HMAC-SHA256)
- **Features**:
  - Unique webhook URL per connector
  - Configurable field mapping
  - Payload validation
  - Signature verification
  - Raw payload storage for audit

### 2. Meta (Facebook & Instagram)

- **Type**: `meta`
- **Auth**: OAuth 2.0
- **Features**:
  - Facebook Lead Ads integration
  - Instagram Lead Forms
  - Page selection
  - Campaign tracking

### 3. Google Ads

- **Type**: `google`
- **Auth**: OAuth 2.0
- **Features**:
  - Lead Form Extensions
  - Campaign attribution
  - Real-time sync

### 4. YouTube

- **Type**: `youtube`
- **Auth**: OAuth 2.0
- **Features**:
  - Channel interactions
  - Comment leads
  - Subscriber data

### 5. LinkedIn

- **Type**: `linkedin`
- **Auth**: OAuth 2.0
- **Features**:
  - Lead Gen Forms
  - Campaign tracking
  - Company data

### 6. WhatsApp Business

- **Type**: `whatsapp`
- **Auth**: API Key
- **Features**:
  - WhatsApp Business API integration
  - Message-based lead capture
  - Contact profile data

### 7. IndiaMART

- **Type**: `indiamart`
- **Auth**: Webhook (Push API)
- **Features**:
  - Push API (real-time leads)
  - Pull API (fallback/scheduled sync)
  - Buyer inquiry capture
  - Product-based lead tracking
  - GLID/Mobile Key authentication

### 8. TradeIndia

- **Type**: `tradeindia`
- **Auth**: API Key
- **Features**:
  - Pull API (scheduled sync)
  - Buyer inquiry capture
  - Manual sync trigger
  - Last sync tracking

## API Endpoints

### Connector Management

```
GET    /api/connectors              - List all connectors
POST   /api/connectors              - Create new connector
GET    /api/connectors/:id          - Get connector details
PUT    /api/connectors/:id          - Update connector
DELETE /api/connectors/:id          - Delete connector
```

### Connector Operations

```
POST   /api/connectors/:id/test-connection    - Test connection
POST   /api/connectors/:id/test-webhook       - Test webhook payload
POST   /api/connectors/:id/regenerate-secret  - Regenerate webhook secret
PUT    /api/connectors/:id/field-mapping      - Update field mapping
GET    /api/connectors/:id/logs               - Get activity logs
```

### OAuth Endpoints

```
GET    /api/connectors/oauth/authorize/:type  - Get OAuth URL
GET    /api/connectors/oauth/callback         - OAuth callback handler
```

### Webhook Endpoint (Public)

```
POST   /api/connectors/webhook/:webhookId     - Receive webhook data
GET    /api/connectors/webhook/:webhookId     - Webhook verification (Meta)
```

### IndiaMART Endpoint (Public)

```
POST   /api/connectors/indiamart/:webhookId   - Receive IndiaMART Push API data
```

### TradeIndia Endpoint

```
POST   /api/connectors/:id/sync-tradeindia    - Trigger manual sync
```

## Field Mapping

### Default Mappings

Each connector type has default field mappings:

**Webhook:**

```json
{
  "phone": "phoneNumber",
  "name": "name",
  "email": "email",
  "source": "source"
}
```

**Meta:**

```json
{
  "field_data.phone_number": "phoneNumber",
  "field_data.full_name": "name",
  "field_data.email": "email",
  "ad_name": "source",
  "campaign_name": "campaign"
}
```

**IndiaMART:**

```json
{
  "SENDER_MOBILE": "phoneNumber",
  "SENDER_NAME": "name",
  "SENDER_EMAIL": "email",
  "SENDER_COMPANY": "businessName",
  "SENDER_ADDRESS": "addressLine1",
  "SENDER_CITY": "city",
  "SENDER_STATE": "state",
  "SENDER_PINCODE": "pincode",
  "SENDER_COUNTRY_ISO": "country",
  "PRODUCT_NAME": "productName",
  "QUERY_MESSAGE": "notes",
  "UNIQUE_QUERY_ID": "externalId"
}
```

**TradeIndia:**

```json
{
  "sender_mobile": "phoneNumber",
  "sender_name": "name",
  "sender_email": "email",
  "sender_company": "businessName",
  "sender_address": "addressLine1",
  "sender_city": "city",
  "sender_state": "state",
  "sender_country": "country",
  "product_name": "productName",
  "inquiry_message": "notes",
  "rfi_id": "externalId"
}
```

### Custom Mapping

Users can customize field mappings through the UI:

1. Navigate to Connector Configuration
2. Go to "Field Mapping" tab
3. Map source fields to lead fields
4. Test with sample payload
5. Save mapping

### Supported Lead Fields

| Field        | Required | Description            |
| ------------ | -------- | ---------------------- |
| phoneNumber  | Yes      | Lead's phone number    |
| name         | No       | Lead's full name       |
| email        | No       | Lead's email address   |
| source       | No       | Lead source identifier |
| businessName | No       | Business/Company name  |
| addressLine1 | No       | Address line 1         |
| addressLine2 | No       | Address line 2         |
| city         | No       | City                   |
| state        | No       | State/Province         |
| country      | No       | Country                |
| pincode      | No       | Postal/ZIP code        |

## Webhook Integration Guide

### 1. Create Webhook Connector

```bash
POST /api/connectors
{
  "name": "My CRM Integration",
  "type": "webhook",
  "description": "Leads from external CRM"
}
```

Response:

```json
{
  "id": "uuid",
  "webhookUrl": "/api/connectors/webhook/abc123",
  "webhookSecret": "secret_key_here"
}
```

### 2. Send Data to Webhook

```bash
POST /api/connectors/webhook/abc123
Content-Type: application/json
X-Webhook-Signature: sha256=<signature>

{
  "phone": "+919876543210",
  "name": "John Doe",
  "email": "john@example.com",
  "source": "Website Form"
}
```

### 3. Signature Verification (Optional)

```javascript
const crypto = require('crypto');

function signPayload(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}

const signature = signPayload(payload, webhookSecret);
// Add header: X-Webhook-Signature: sha256=<signature>
```

## IndiaMART Integration Guide

### Overview

IndiaMART connector supports two integration modes:

1. **Push API (Primary)**: Real-time lead delivery via webhook
2. **Pull API (Fallback)**: Scheduled sync for missed leads

### Setup Steps

1. **Create IndiaMART Connector**

```bash
POST /api/connectors
{
  "name": "IndiaMART Leads",
  "type": "indiamart",
  "description": "Buyer inquiries from IndiaMART"
}
```

2. **Configure Credentials**
   - Enter your GLID (Global Lead ID)
   - Enter your Mobile Key from IndiaMART Lead Manager
   - Optionally enable Pull API fallback

3. **Configure Push API in IndiaMART**
   - Login to IndiaMART Lead Manager
   - Go to Settings → Push API Configuration
   - Enter the webhook URL provided by the system
   - Save and activate

### IndiaMART Payload Format

```json
{
  "UNIQUE_QUERY_ID": "123456789",
  "SENDER_NAME": "Buyer Name",
  "SENDER_MOBILE": "9876543210",
  "SENDER_EMAIL": "buyer@example.com",
  "SENDER_COMPANY": "Buyer Company",
  "SENDER_ADDRESS": "123 Street",
  "SENDER_CITY": "Mumbai",
  "SENDER_STATE": "Maharashtra",
  "SENDER_PINCODE": "400001",
  "SENDER_COUNTRY_ISO": "IN",
  "PRODUCT_NAME": "Product Inquiry",
  "QUERY_MESSAGE": "I am interested in your product",
  "QUERY_TIME": "2024-01-15 10:30:00"
}
```

## TradeIndia Integration Guide

### Overview

TradeIndia connector uses Pull API for scheduled lead synchronization.

### Setup Steps

1. **Create TradeIndia Connector**

```bash
POST /api/connectors
{
  "name": "TradeIndia Leads",
  "type": "tradeindia",
  "description": "Buyer inquiries from TradeIndia"
}
```

2. **Configure API Credentials**
   - Enter your User ID
   - Enter your Profile ID
   - Enter your API Key from TradeIndia seller dashboard
   - Set sync interval (5-120 minutes)

3. **Manual Sync**

```bash
POST /api/connectors/:id/sync-tradeindia
```

### TradeIndia Payload Format

```json
{
  "rfi_id": "TI123456",
  "sender_name": "Buyer Name",
  "sender_mobile": "9876543210",
  "sender_email": "buyer@example.com",
  "sender_company": "Buyer Company",
  "sender_address": "123 Street",
  "sender_city": "Delhi",
  "sender_state": "Delhi",
  "sender_country": "India",
  "product_name": "Product Inquiry",
  "inquiry_message": "Please send quotation",
  "inquiry_time": "2024-01-15T10:30:00Z"
}
```

## Security

### Permissions

| Action           | Admin | Manager | Executive |
| ---------------- | ----- | ------- | --------- |
| Create Connector | ✅    | ✅      | ❌        |
| Edit Connector   | ✅    | ✅      | ❌        |
| Delete Connector | ✅    | ❌      | ❌        |
| View Webhook URL | ✅    | ✅      | ❌        |
| View Logs        | ✅    | ✅      | ❌        |

### Data Protection

- OAuth tokens are encrypted at rest
- Webhook secrets are hashed
- Raw payloads stored for audit (configurable retention)
- IP address logging for security

## Error Handling

### Webhook Errors

| Error               | HTTP Code | Description                               |
| ------------------- | --------- | ----------------------------------------- |
| Connector not found | 404       | Invalid webhook URL                       |
| Invalid signature   | 401       | Signature verification failed             |
| Missing phone       | 400       | Phone number required                     |
| Duplicate lead      | 200       | Lead already exists (returns existing ID) |

### Retry Mechanism

For failed webhook processing:

1. Store raw payload
2. Mark as "failed"
3. Log error details
4. Available for manual retry

## Monitoring

### Activity Logs

All connector activities are logged:

- Connection tests
- Webhook received
- Lead created
- Errors
- Configuration changes

### Metrics

Track via logs:

- Leads created per connector
- Success/failure rates
- Processing time
- Duplicate rate

## Future Enhancements

1. **Scheduled Sync**: Pull data on schedule for OAuth connectors
2. **Batch Processing**: Handle bulk webhook payloads
3. **Webhook Retry**: Automatic retry for failed webhooks
4. **Rate Limiting**: Per-connector rate limits
5. **Data Transformation**: Advanced field transformations
6. **Conditional Routing**: Route leads based on rules
