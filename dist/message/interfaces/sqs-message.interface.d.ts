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
    type: string;
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
        type: string;
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
    status: string;
    timestamp: string;
    recipient_id: string;
    errors?: Array<{
        code: number;
        title: string;
    }>;
}
export interface SqsMessagePayload {
    from: string;
    id: string;
    timestamp: string;
    type: string;
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
        type: string;
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
    customerName?: string;
}
export interface ParsedSqsMessage {
    phoneNumber: string;
    content: string;
    timestamp: Date;
    mediaUrl?: string;
    mediaType?: string;
    rawMessageId?: string;
    customerName?: string;
    messageType?: string;
    interactiveType?: string;
    listReplyId?: string;
    listReplyTitle?: string;
    flowToken?: string;
    flowData?: FlowResponseData;
}
export interface FlowResponseData {
    name?: string;
    buisness_name?: string;
    business_name?: string;
    pincode?: string | number;
    first_name?: string;
    last_name?: string;
    email?: string;
    terms_agreement?: boolean;
    offers_acceptance?: boolean;
    selected_category_id?: string;
}
