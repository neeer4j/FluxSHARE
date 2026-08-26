import type { Device, FileMetadata } from '@fluxshare/shared';

/**
 * Message types exchanged over WebSocket signaling channels.
 */
export type SignalingMessageType =
  | 'PEER_ANNOUNCE'
  | 'PEER_LEAVE'
  | 'PEERS_LIST'
  | 'WEBRTC_OFFER'
  | 'WEBRTC_ANSWER'
  | 'WEBRTC_ICE_CANDIDATE'
  | 'TRANSFER_OFFER'
  | 'TRANSFER_ACCEPT'
  | 'TRANSFER_REJECT'
  | 'TRANSFER_CANCEL'
  | 'TRANSFER_RESUME_REQUEST'
  | 'TRANSFER_RESUME_RESPONSE';

export interface BaseSignalingMessage {
  readonly type: SignalingMessageType;
  readonly senderId: string;
  readonly targetId?: string;
  readonly timestamp: number;
}

export interface PeerAnnounceMessage extends BaseSignalingMessage {
  readonly type: 'PEER_ANNOUNCE';
  readonly payload: {
    readonly device: Device;
    readonly protocolVersion: string;
  };
}

export interface PeerLeaveMessage extends BaseSignalingMessage {
  readonly type: 'PEER_LEAVE';
  readonly payload: {
    readonly reason?: string;
  };
}

export interface PeersListMessage extends BaseSignalingMessage {
  readonly type: 'PEERS_LIST';
  readonly payload: {
    readonly peers: readonly Device[];
  };
}

export interface WebRtcOfferMessage extends BaseSignalingMessage {
  readonly type: 'WEBRTC_OFFER';
  readonly targetId: string;
  readonly payload: {
    readonly sdp: string;
    readonly sessionId: string;
  };
}

export interface WebRtcAnswerMessage extends BaseSignalingMessage {
  readonly type: 'WEBRTC_ANSWER';
  readonly targetId: string;
  readonly payload: {
    readonly sdp: string;
    readonly sessionId: string;
  };
}

export interface WebRtcIceCandidateMessage extends BaseSignalingMessage {
  readonly type: 'WEBRTC_ICE_CANDIDATE';
  readonly targetId: string;
  readonly payload: {
    readonly candidate: string;
    readonly sdpMid?: string | null;
    readonly sdpMLineIndex?: number | null;
    readonly sessionId: string;
  };
}

export interface TransferOfferMessage extends BaseSignalingMessage {
  readonly type: 'TRANSFER_OFFER';
  readonly targetId: string;
  readonly payload: {
    readonly sessionId: string;
    readonly files: readonly FileMetadata[];
    readonly totalBytes: number;
  };
}

export interface TransferAcceptMessage extends BaseSignalingMessage {
  readonly type: 'TRANSFER_ACCEPT';
  readonly targetId: string;
  readonly payload: {
    readonly sessionId: string;
  };
}

export interface TransferRejectMessage extends BaseSignalingMessage {
  readonly type: 'TRANSFER_REJECT';
  readonly targetId: string;
  readonly payload: {
    readonly sessionId: string;
    readonly reason?: string;
  };
}

export interface TransferCancelMessage extends BaseSignalingMessage {
  readonly type: 'TRANSFER_CANCEL';
  readonly targetId: string;
  readonly payload: {
    readonly sessionId: string;
    readonly reason?: string;
  };
}

export interface TransferResumeRequestMessage extends BaseSignalingMessage {
  readonly type: 'TRANSFER_RESUME_REQUEST';
  readonly targetId: string;
  readonly payload: {
    readonly fileId: string;
  };
}

export interface TransferResumeResponseMessage extends BaseSignalingMessage {
  readonly type: 'TRANSFER_RESUME_RESPONSE';
  readonly targetId: string;
  readonly payload: {
    readonly fileId: string;
    readonly lastContiguousChunk: number; // -1 if none
  };
}

export type SignalingMessage =
  | PeerAnnounceMessage
  | PeerLeaveMessage
  | PeersListMessage
  | WebRtcOfferMessage
  | WebRtcAnswerMessage
  | WebRtcIceCandidateMessage
  | TransferOfferMessage
  | TransferAcceptMessage
  | TransferRejectMessage
  | TransferCancelMessage
  | TransferResumeRequestMessage
  | TransferResumeResponseMessage;

/**
 * Type guard to check if an arbitrary JSON object is a valid SignalingMessage.
 */
export function isSignalingMessage(obj: unknown): obj is SignalingMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const msg = obj as Record<string, unknown>;
  return (
    typeof msg.type === 'string' &&
    typeof msg.senderId === 'string' &&
    typeof msg.timestamp === 'number'
  );
}
