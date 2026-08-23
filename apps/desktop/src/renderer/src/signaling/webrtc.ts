import { NETWORK_CONSTANTS } from '@fluxshare/shared';
import type { SignalingMessage } from '@fluxshare/protocol';

type PendingFile = {
  fileName: string;
  totalSize: number;
  receivedBuffers: Uint8Array[];
  receivedBytes: number;
  receivedIndices: Set<number>;
};

function uint8ArrayToBase64(u8: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < u8.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.prototype.slice.call(u8, i, i + chunkSize));
  }
  return btoa(binary);
}

export class WebRtcManager {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private remoteId: string;
  private localId: string;
  private signalingSend: (msg: SignalingMessage) => void;
  private pendingFiles = new Map<string, PendingFile>();
  // sending state per file
  private sendingState = new Map<
    string,
    {
      file: File;
      totalChunks: number;
      chunkSize: number;
      unacked: Set<number>;
      ackTimers: Map<number, number>;
      nextToSend: number;
      windowSize: number;
    }
  >();

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
              receivedBytes: 0,
              receivedIndices: new Set<number>()
            });
            // initialize partial persistence on main process
            try {
              if ((window as any).fluxshare && typeof (window as any).fluxshare.partialInit === 'function') {
                // fire-and-forget
                (window as any).fluxshare.partialInit(fileId, { fileName: data.payload.fileName, fileSize: data.payload.fileSize });
              }
            } catch (e) {
              console.warn('partialInit failed', e);
            }
          } else if (data && data.type === 'CHUNK_HEADER') {
            // metadata header for the next binary chunk
            const fileId = data.fileId as string;
            const pending = this.pendingFiles.get(fileId);
            if (!pending) {
              this.pendingFiles.set(fileId, {
                fileName: data.payload.fileName ?? 'unknown',
                totalSize: data.payload.fileSize ?? 0,
                receivedBuffers: [],
                receivedBytes: 0,
                receivedIndices: new Set<number>()
              });
            }
            // store last expected chunk index on map
            (this.pendingFiles.get(fileId) as any).__nextChunkIndex = data.payload.chunkIndex;
          } else if (data && data.type === 'CHUNK_ACK') {
            // sender will handle ACK messages; update sending state
            try {
              const fileId = data.fileId as string;
              const chunkIndex = data.chunkIndex as number;
              const state = this.sendingState.get(fileId);
              if (state && state.unacked.has(chunkIndex)) {
                state.unacked.delete(chunkIndex);
                const timerId = state.ackTimers.get(chunkIndex);
                if (timerId) {
                  clearTimeout(timerId);
                  state.ackTimers.delete(chunkIndex);
                }
                // advance nextToSend if possible
                while (state.nextToSend < state.totalChunks && !state.unacked.has(state.nextToSend)) {
                  state.nextToSend++;
                }
              }
            } catch (e) {}
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
          }
        } else if (ev.data instanceof ArrayBuffer) {
          const arr = new Uint8Array(ev.data);
          // find a pending file which has an expected next chunk index
          for (const [fileId, pending] of this.pendingFiles.entries()) {
            const expected = (pending as any).__nextChunkIndex as number | undefined;
            if (typeof expected === 'number') {
              // persist chunk to disk via main process to allow resume across restarts
              pending.receivedBytes += arr.byteLength;
              if (pending.receivedIndices) pending.receivedIndices.add(expected);
              // clear the expected chunk index
              delete (pending as any).__nextChunkIndex;
              try {
                if ((window as any).fluxshare && typeof (window as any).fluxshare.partialWrite === 'function') {
                  const b = new Uint8Array(arr);
                  const base64 = uint8ArrayToBase64(b);
                  // fire-and-forget
                  (window as any).fluxshare.partialWrite(fileId, expected, base64).catch((e: any) => {
                    console.warn('partialWrite failed', e);
                  });
                }
              } catch (e) {
                console.warn('Failed to persist chunk', e);
              }

              // send ACK for the received chunk
              try {
                this.dc?.send(JSON.stringify({ type: 'CHUNK_ACK', fileId, chunkIndex: expected, bytesReceived: pending.receivedBytes }));
              } catch (e) {}
              break;
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

  public getLastContiguousChunk(fileId: string): number {
    const pending = this.pendingFiles.get(fileId);
    if (!pending || !pending.receivedIndices) return -1;
    let i = 0;
    while (pending.receivedIndices.has(i)) i++;
    return i - 1;
  }

  public async sendFile(file: File, startChunk = 0, fileIdParam?: string) {
    if (!this.dc || this.dc.readyState !== 'open') {
      console.warn('DataChannel not open');
      return;
    }

    const chunkSize = NETWORK_CONSTANTS.DEFAULT_CHUNK_SIZE_BYTES;
    const fileId = fileIdParam ?? `file-${Date.now()}`;

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

    // initialize sending state
    this.sendingState.set(fileId, {
      file,
      totalChunks: Math.ceil(file.size / chunkSize),
      chunkSize,
      unacked: new Set<number>(),
      ackTimers: new Map<number, number>(),
      nextToSend: startChunk,
      windowSize: 8
    });

    // send loop driven by nextToSend to allow resuming
    const state = this.sendingState.get(fileId)!;
    while (state.nextToSend < state.totalChunks) {
      const chunkIndex = state.nextToSend;
      const offset = chunkIndex * chunkSize;
      const slice = file.slice(offset, offset + chunkSize);
      // eslint-disable-next-line no-await-in-loop
      const chunk = await new Promise<ArrayBuffer>((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result as ArrayBuffer);
        fr.onerror = rej;
        fr.readAsArrayBuffer(slice);
      });

      // sliding window: wait if too many unacked
      while (state.unacked.size >= state.windowSize) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 100));
      }

      // send header and binary
      const header = { type: 'CHUNK_HEADER', fileId, payload: { chunkIndex, byteLength: chunk.byteLength, fileName: file.name, fileSize: file.size } };
      try {
        this.dc.send(JSON.stringify(header));
        this.dc.send(chunk);
      } catch (err) {
        console.warn('Failed to send chunk over DataChannel', err);
        throw err;
      }

      // track sending state
      state.unacked.add(chunkIndex);
      const t = window.setTimeout(() => {
        if (state.unacked.has(chunkIndex)) {
          state.nextToSend = Math.min(state.nextToSend, chunkIndex);
        }
      }, 5000);
      state.ackTimers.set(chunkIndex, t);

      state.nextToSend++;

      // throttle if bufferedAmount too high
      while (this.dc.bufferedAmount > NETWORK_CONSTANTS.MAX_BUFFERED_AMOUNT_BYTES) {
        // eslint-disable-next-line no-await-in-loop
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

    // cleanup
    this.sendingState.delete(fileId);
    return fileId;
  }
}
