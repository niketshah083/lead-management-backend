export enum ConnectorType {
  WEBHOOK = 'webhook',
  META = 'meta',
  GOOGLE = 'google',
  YOUTUBE = 'youtube',
  LINKEDIN = 'linkedin',
  WHATSAPP = 'whatsapp',
  INDIAMART = 'indiamart',
  TRADEINDIA = 'tradeindia',
}

export enum ConnectorStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  PENDING = 'pending',
}

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  FAILED = 'failed',
}
