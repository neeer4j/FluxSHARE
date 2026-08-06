import { NETWORK_CONSTANTS, type Device } from '@fluxshare/shared';
import {
  type SignalingMessage,
  type TransferOfferMessage,
  isSignalingMessage
} from '@fluxshare/protocol';

type Handlers = {
  onPeersList?: (peers: Device[]) => void;
  onPeerAnnounce?: (peer: Device) => void;
  onPeerLeave?: (peerId: string) => void;
  onTransferOffer?: (msg: TransferOfferMessage) => void;
  onWebRtcOffer?: (msg: SignalingMessage) => void;
  onWebRtcAnswer?: (msg: SignalingMessage) => void;
  onIceCandidate?: (msg: SignalingMessage) => void;
  onRawMessage?: (msg: SignalingMessage) => void;
};

export class SignalingClient {
  private ws: WebSocket | null = null;
  private url: string;
  private device: Device;
  private handlers: Handlers = {};

  constructor(url: string, device: Device) {
    this.url = url;
    this.device = device;
  }

  public setHandlers(h: Handlers): void {
    this.handlers = h;
  }

  public connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.addEventListener('open', () => {
      // Announce ourselves immediately
      const announce: SignalingMessage = {
        type: 'PEER_ANNOUNCE',
        senderId: this.device.id,
        timestamp: Date.now(),
        payload: {
          device: this.device,
          protocolVersion: NETWORK_CONSTANTS.PROTOCOL_VERSION
        }
      } as unknown as SignalingMessage;

      this.ws?.send(JSON.stringify(announce));
    });

    this.ws.addEventListener('message', (ev) => {
      try {
        const parsed = JSON.parse(ev.data.toString());
        if (!isSignalingMessage(parsed)) return;
        const msg = parsed as SignalingMessage;

        // Dispatch to typed handlers
        if (msg.type === 'PEERS_LIST' && this.handlers.onPeersList) {
          // @ts-expect-error peers payload
          this.handlers.onPeersList(msg.payload.peers as Device[]);
        }

        if (msg.type === 'PEER_ANNOUNCE' && this.handlers.onPeerAnnounce) {
          // @ts-expect-error device payload
          this.handlers.onPeerAnnounce(msg.payload.device as Device);
        }

        if (msg.type === 'PEER_LEAVE' && this.handlers.onPeerLeave) {
          this.handlers.onPeerLeave(msg.senderId);
        }

        if (msg.type === 'TRANSFER_OFFER' && this.handlers.onTransferOffer) {
          this.handlers.onTransferOffer(msg as TransferOfferMessage);
        }

        if (msg.type === 'WEBRTC_OFFER' && this.handlers.onWebRtcOffer) {
          this.handlers.onWebRtcOffer(msg);
        }

        if (msg.type === 'WEBRTC_ANSWER' && this.handlers.onWebRtcAnswer) {
          this.handlers.onWebRtcAnswer(msg);
        }

        if (msg.type === 'WEBRTC_ICE_CANDIDATE' && this.handlers.onIceCandidate) {
          this.handlers.onIceCandidate(msg);
        }

        if (this.handlers.onRawMessage) this.handlers.onRawMessage(msg);
      } catch (error) {
        // ignore malformed messages
      }
    });

    this.ws.addEventListener('close', () => {
      // attempt simple reconnect after delay
      setTimeout(() => this.connect(), 2000);
    });

    this.ws.addEventListener('error', () => {
      // let close handle reconnect
    });
  }

  public disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  public send(msg: SignalingMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(msg));
  }
}

export function buildWsUrl(host: string, port: number): string {
  const sanitizedHost = host || 'localhost';
  return `ws://${sanitizedHost}:${port}`;
}
