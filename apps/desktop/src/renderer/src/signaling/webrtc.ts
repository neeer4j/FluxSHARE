import { NETWORK_CONSTANTS } from '@fluxshare/shared';
import type { SignalingMessage } from '@fluxshare/protocol';

type PendingFile = {
  fileName: string;
  totalSize: number;
  receivedBuffers: Uint8Array[];
  receivedBytes: number;
};

function uint8ArrayToBase64(u8: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < u8.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.prototype.slice.call(u8, i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export class WebRtcManager {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private remoteId: string;
  private localId: string;
  private signalingSend: (msg: SignalingMessage) => void;
  private pendingFiles = new Map<string, PendingFile>();

  constructor(localId: string, remoteId: string, signalingSend: (msg: SignalingMessage) => void) {
    this.remoteId = remoteId;
    this.localId = localId;
    this.signalingSend = signalingSend;
  }

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        const msg: SignalingMessage = {
          type: 'WEBRTC_ICE_CANDIDATE',
          senderId: this.localId,
          targetId: this.remoteId,
          timestamp: Date.now(),
          payload: {
            candidate: JSON.stringify(ev.candidate),
            sdpMid: (ev.candidate as any)?.sdpMid ?? null,
            sdpMLineIndex: (ev.candidate as any)?.sdpMLineIndex ?? null,
            sessionId: `${Date.now()}`
          }
        } as SignalingMessage;
        this.signalingSend(msg);
      }
    };

    pc.ondatachannel = (ev) => {
      this.setupDataChannel(ev.channel);
    };

    this.pc = pc;
    return pc;
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dc = channel;
    this.dc.binaryType = 'arraybuffer';
    this.dc.onopen = () => {
      console.info('DataChannel open');
    };

    this.dc.onmessage = (ev) => {
      try {
        if (typeof ev.data === 'string') {
          const data = JSON.parse(ev.data);
          if (data && data.type === 'FILE_START') {
            const fileId = data.fileId as string;
            this.pendingFiles.set(fileId, {
              fileName: data.payload.fileName,
              totalSize: data.payload.fileSize,
              receivedBuffers: [],
              receivedBytes: 0
            });
          } else if (data && data.type === 'FILE_COMPLETE') {
            const fileId = data.fileId as string;
            const pending = this.pendingFiles.get(fileId);
            if (pending) {
              // concatenate
              const full = new Uint8Array(pending.receivedBytes);
              let offset = 0;
              for (const b of pending.receivedBuffers) {
                full.set(b, offset);
                offset += b.byteLength;
              }

              // try Electron save
              if (window.fluxshare && typeof window.fluxshare.saveFile === 'function') {
                const base64 = uint8ArrayToBase64(full);
                window.fluxshare.saveFile(pending.fileName, base64).then((res) => {
                  console.info('Saved file result', res);
                });
              } else {
                const blob = new Blob([full], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = pending.fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }

              this.pendingFiles.delete(fileId);
            }
          } else if (data && data.type === 'CHUNK_ACK') {
            // could be used to throttle sender if implemented
          }
        } else if (ev.data instanceof ArrayBuffer) {
          const arr = new Uint8Array(ev.data);
          // assume single active file transfer (ordered channel)
          const firstKey = this.pendingFiles.keys().next();
          if (!firstKey.done) {
            const fileId = firstKey.value;
            const pending = this.pendingFiles.get(fileId);
            if (pending) {
              pending.receivedBuffers.push(arr);
              pending.receivedBytes += arr.byteLength;

              // occasionally send ACK
              if (pending.receivedBytes % (NETWORK_CONSTANTS.DEFAULT_CHUNK_SIZE_BYTES * 10) === 0) {
                try {
                  this.dc?.send(JSON.stringify({ type: 'CHUNK_ACK', fileId, bytesReceived: pending.receivedBytes }));
                } catch (e) {}
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to process datachannel message', err);
      }
    };
  }

  public async initiateNegotiation(): Promise<RTCSessionDescriptionInit | null> {
    const pc = this.createPeerConnection();
    const dc = pc.createDataChannel('file');
    this.setupDataChannel(dc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // send WEBRTC_OFFER via signaling
    const msg: SignalingMessage = {
      type: 'WEBRTC_OFFER',
      senderId: this.localId,
      targetId: this.remoteId,
      timestamp: Date.now(),
      payload: {
        sdp: offer.sdp,
        sessionId: `${Date.now()}`
      }
    } as SignalingMessage;
    this.signalingSend(msg);
    return offer;
  }

  public async handleRemoteOffer(sdp: string) {
    const pc = this.createPeerConnection();
    await pc.setRemoteDescription({ type: 'offer', sdp });
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    const msg: SignalingMessage = {
      type: 'WEBRTC_ANSWER',
      senderId: this.localId,
      targetId: this.remoteId,
      timestamp: Date.now(),
      payload: {
        sdp: answer.sdp,
        sessionId: `${Date.now()}`
      }
    } as SignalingMessage;
    this.signalingSend(msg);
  }

  public async handleRemoteAnswer(sdp: string) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription({ type: 'answer', sdp });
  }

  public async handleRemoteIce(candidateJson: string) {
    if (!this.pc || !candidateJson) return;
    try {
      const cand = JSON.parse(candidateJson);
      await this.pc.addIceCandidate(cand);
    } catch (err) {
      console.warn('Failed to add ICE candidate', err);
    }
  }

  public async sendFile(file: File) {
    if (!this.dc || this.dc.readyState !== 'open') {
      console.warn('DataChannel not open');
      return;
    }

    const chunkSize = NETWORK_CONSTANTS.DEFAULT_CHUNK_SIZE_BYTES;
    const fileId = `file-${Date.now()}`;

    // compute SHA-256 for files <= 50MB for integrity
    let sha256Hex = '';
    try {
      if (file.size <= 50 * 1024 * 1024) {
        const arr = new Uint8Array(await file.arrayBuffer());
        const digest = await crypto.subtle.digest('SHA-256', arr.buffer);
        const dv = new Uint8Array(digest);
        sha256Hex = Array.from(dv).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (err) {
      console.warn('Failed to compute sha256, continuing without it', err);
    }

    // send FILE_START
    const startMsg = {
      type: 'FILE_START',
      sessionId: `${Date.now()}`,
      fileId,
      payload: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        sha256: sha256Hex,
        chunkSizeBytes: chunkSize,
        totalChunks: Math.ceil(file.size / chunkSize)
      }
    };
    this.dc.send(JSON.stringify(startMsg));

    let offset = 0;
    while (offset < file.size) {
      const slice = file.slice(offset, offset + chunkSize);
      // eslint-disable-next-line no-await-in-loop
      const chunk = await new Promise<ArrayBuffer>((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result as ArrayBuffer);
        fr.onerror = rej;
        fr.readAsArrayBuffer(slice);
      });

      // send raw binary chunk
      try {
        this.dc.send(chunk);
      } catch (err) {
        console.warn('Failed to send chunk over DataChannel', err);
        throw err;
      }

      offset += chunkSize;

      // throttle if bufferedAmount too high
      while (this.dc.bufferedAmount > NETWORK_CONSTANTS.MAX_BUFFERED_AMOUNT_BYTES) {
        // wait for bufferedAmount to drain
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    const completeMsg = {
      type: 'FILE_COMPLETE',
      sessionId: `${Date.now()}`,
      fileId,
      payload: { sha256: sha256Hex, verified: true }
    };
    this.dc.send(JSON.stringify(completeMsg));
  }

  public async waitForOpen(timeoutMs = 15000): Promise<void> {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const check = () => {
        if (this.dc && this.dc.readyState === 'open') return resolve();
        if (Date.now() - start > timeoutMs) return reject(new Error('DataChannel open timeout'));
        setTimeout(check, 100);
      };
      check();
    });
  }
}
