/**
 * Direction of the file transfer relative to the local node.
 */
export type TransferDirection = 'incoming' | 'outgoing';

/**
 * State machine status of an active or historical file transfer session.
 */
export type TransferStatus =
  | 'pending_approval' // Waiting for remote peer to accept
  | 'connecting'       // Establishing WebRTC DataChannel / Crypto Handshake
  | 'transferring'     // Active chunk streaming
  | 'paused'           // Transfer paused by user or network
  | 'completed'        // SHA-256 verification succeeded & file saved
  | 'rejected'         // Remote peer declined the transfer
  | 'cancelled'        // Transfer aborted by sender or receiver
  | 'error';           // Network or crypto failure

/**
 * Metadata for an individual file being transferred.
 */
export interface FileMetadata {
  /**
   * Unique identifier for this file within a transfer session.
   */
  readonly id: string;
  /**
   * Original filename including extension.
   */
  readonly name: string;
  /**
   * Total size in bytes.
   */
  readonly size: number;
  /**
   * MIME type of the file (e.g. 'application/pdf', 'image/png').
   */
  readonly mimeType: string;
  /**
   * Expected SHA-256 hex digest of the unencrypted file for post-transfer integrity check.
   */
  readonly sha256: string;
  /**
   * Optional relative path if transferring a folder structure.
   */
  readonly relativePath?: string;
}

/**
 * Real-time transfer throughput and progress metrics.
 */
export interface TransferProgress {
  /**
   * Total bytes successfully transferred and acknowledged.
   */
  readonly bytesTransferred: number;
  /**
   * Total bytes across all files in the session.
   */
  readonly totalBytes: number;
  /**
   * Current transfer speed in bytes per second.
   */
  readonly speedBytesPerSecond: number;
  /**
   * Estimated seconds remaining until transfer completion (ETA).
   */
  readonly estimatedSecondsRemaining: number;
  /**
   * Percentage complete (0.0 to 100.0).
   */
  readonly percentage: number;
}

/**
 * Complete transfer session state representing an exchange between two peers.
 */
export interface TransferSession {
  /**
   * Unique UUID for this transfer session.
   */
  readonly id: string;
  /**
   * Remote device participating in the transfer.
   */
  readonly remotePeerId: string;
  /**
   * Direction of the transfer from the local perspective.
   */
  readonly direction: TransferDirection;
  /**
   * Array of file metadata items included in this session.
   */
  readonly files: readonly FileMetadata[];
  /**
   * Current lifecycle state of the transfer.
   */
  readonly status: TransferStatus;
  /**
   * Latest real-time throughput metrics.
   */
  readonly progress: TransferProgress;
  /**
   * Timestamp when the session was created (milliseconds since epoch).
   */
  readonly createdAt: number;
  /**
   * Timestamp when the session completed or failed.
   */
  readonly completedAt?: number;
  /**
   * Optional human-readable error description if status is 'error'.
   */
  readonly errorMessage?: string;
}
