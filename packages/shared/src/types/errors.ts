/**
 * Standardized domain error codes across FluxShare packages.
 */
export enum ErrorCode {
  // Network & Discovery
  DISCOVERY_FAILED = 'DISCOVERY_FAILED',
  PEER_UNREACHABLE = 'PEER_UNREACHABLE',
  SIGNALING_DISCONNECTED = 'SIGNALING_DISCONNECTED',
  WEBRTC_CONNECTION_FAILED = 'WEBRTC_CONNECTION_FAILED',
  DATA_CHANNEL_ERROR = 'DATA_CHANNEL_ERROR',

  // Protocol & Handshake
  PROTOCOL_VERSION_MISMATCH = 'PROTOCOL_VERSION_MISMATCH',
  TRANSFER_REJECTED = 'TRANSFER_REJECTED',
  TRANSFER_CANCELLED = 'TRANSFER_CANCELLED',
  TRANSFER_TIMEOUT = 'TRANSFER_TIMEOUT',

  // Crypto & Verification
  KEY_EXCHANGE_FAILED = 'KEY_EXCHANGE_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  HASH_VERIFICATION_FAILED = 'HASH_VERIFICATION_FAILED',

  // File System & I/O
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  INSUFFICIENT_DISK_SPACE = 'INSUFFICIENT_DISK_SPACE',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',

  // General
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Custom error class for all FluxShare domain exceptions.
 */
export class FluxShareError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'FluxShareError';
    this.code = code;
    this.details = details;

    // Preserve stack trace in Node / V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FluxShareError);
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
}
