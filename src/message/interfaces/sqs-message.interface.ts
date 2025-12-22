/**
 * WhatsApp Webhook payload structure (full webhook body)
 */
export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  value: WhatsAppValue;
  field: string;
}

export interface WhatsAppValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
}

export interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string; // 'text', 'image', 'video', 'document', 'interactive', 'nfm_reply'
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  video?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  document?: {
    id: string;
    mime_type: string;
    sha256: string;
    filename?: string;
    caption?: string;
  };
  interactive?: {
    type: string; // 'list_reply', 'button_reply', 'nfm_reply'
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
    button_reply?: {
      id: string;
      title: string;
    };
    nfm_reply?: {
      response_json: string;
      body: string;
      name: string;
    };
  };
}

export interface WhatsAppStatus {
  id: string;
  status: string; // 'sent', 'delivered', 'read', 'failed'
  timestamp: string;
  recipient_id: string;
  errors?: Array<{
    code: number;
    title: string;
  }>;
}

/**
 * SQS Message payload - Raw WhatsApp webhook message format
 * This is the first element of the messages array from WhatsApp webhook
 */
export interface SqsMessagePayload {
  from: string;
  id: string;
  timestamp: string;
  type: string; // 'text', 'image', 'video', 'document', 'interactive'
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  video?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  document?: {
    id: string;
    mime_type: string;
    sha256: string;
    filename?: string;
    caption?: string;
  };
  interactive?: {
    type: string; // 'list_reply', 'button_reply', 'nfm_reply'
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
    button_reply?: {
      id: string;
      title: string;
    };
    nfm_reply?: {
      response_json: string;
      body: string;
      name: string;
    };
  };
  // Optional: customer name from contacts array (if passed)
  customerName?: string;
}

/**
 * Parsed SQS message for internal processing
 */
export interface ParsedSqsMessage {
  phoneNumber: string;
  content: string;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: string;
  rawMessageId?: string;
  customerName?: string;
  messageType?: string;
  // Interactive message data
  interactiveType?: string;
  listReplyId?: string;
  listReplyTitle?: string;
  // Flow response data
  flowToken?: string;
  flowData?: FlowResponseData;
}

/**
 * Flow response data structure (from lead generation flow)
 * New format:
 * {
 *   "name": "dakshesh",
 *   "buisness_name": "mehta",  // optional (note: typo in WhatsApp flow)
 *   "email": "dakshesh@gmail.com",  // optional
 *   "pincode": "394210",  // optional
 *   "terms_agreement": true,
 *   "offers_acceptance": true
 * }
 */
export interface FlowResponseData {
  // New format fields
  name?: string;
  buisness_name?: string; // Note: typo in WhatsApp flow
  business_name?: string; // Correct spelling fallback
  pincode?: string | number;
  // Legacy format fields
  first_name?: string;
  last_name?: string;
  // Common fields
  email?: string;
  terms_agreement?: boolean;
  offers_acceptance?: boolean;
  // For category selection flow
  selected_category_id?: string;
}
