/**
 * DataChannel wire message types for high-performance file streaming.
 */
export type DataChannelMessageType =
  | 'FILE_START'
  | 'CHUNK_DATA'
  | 'CHUNK_ACK'
  | 'FILE_COMPLETE'
  | 'TRANSFER_COMPLETE'
  | 'TRANSFER_ERROR';

export interface BaseDataChannelMessage {
  readonly type: DataChannelMessageType;
  readonly sessionId: string;
  readonly fileId: string;
}

export interface FileStartMessage extends BaseDataChannelMessage {
  readonly type: 'FILE_START';
  readonly payload: {
    readonly fileName: string;
    readonly fileSize: number;
    readonly mimeType: string;
    readonly sha256: string;
    readonly chunkSizeBytes: number;
    readonly totalChunks: number;
  };
}

export interface ChunkHeaderMessage extends BaseDataChannelMessage {
  readonly type: 'CHUNK_DATA';
  readonly payload: {
    readonly chunkIndex: number;
    readonly byteOffset: number;
    readonly byteLength: number;
    /**
     * Optional AES-256-GCM authentication tag or HMAC for chunk integrity.
     */
    readonly authTagHex?: string;
  };
}

export interface ChunkAckMessage extends BaseDataChannelMessage {
  readonly type: 'CHUNK_ACK';
  readonly payload: {
    readonly chunkIndex: number;
    readonly bytesReceived: number;
  };
}

export interface FileCompleteMessage extends BaseDataChannelMessage {
  readonly type: 'FILE_COMPLETE';
  readonly payload: {
    readonly sha256: string;
    readonly verified: boolean;
  };
}

export interface TransferCompleteMessage {
  readonly type: 'TRANSFER_COMPLETE';
  readonly sessionId: string;
  readonly payload: {
    readonly totalBytesTransferred: number;
    readonly durationMs: number;
  };
}

export interface TransferErrorMessage {
  readonly type: 'TRANSFER_ERROR';
  readonly sessionId: string;
  readonly fileId?: string;
  readonly payload: {
    readonly errorCode: string;
    readonly message: string;
  };
}

export type DataChannelMessage =
  | FileStartMessage
  | ChunkHeaderMessage
  | ChunkAckMessage
  | FileCompleteMessage
  | TransferCompleteMessage
  | TransferErrorMessage;

/**
 * Type guard for DataChannel messages.
 */
export function isDataChannelMessage(obj: unknown): obj is DataChannelMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const msg = obj as Record<string, unknown>;
  return (
    typeof msg.type === 'string' &&
    typeof msg.sessionId === 'string'
  );
}
