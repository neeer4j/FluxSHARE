import http from 'http';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { NETWORK_CONSTANTS } from '@fluxshare/shared';
import { isSignalingMessage, type SignalingMessage } from '@fluxshare/protocol';
import { createLogger } from '@fluxshare/utils';

const logger = createLogger('SignalingServer', 'info');
const PORT = Number(process.env.PORT) || NETWORK_CONSTANTS.DEFAULT_SIGNALING_PORT;
const HOST = '0.0.0.0';

export function buildHealthPayload() {
  return {
    status: 'ok',
    service: 'fluxshare-signaling-server',
    version: NETWORK_CONSTANTS.PROTOCOL_VERSION,
    timestamp: Date.now()
  } as const;
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json(buildHealthPayload());
});

// Serve built web/desktop renderer static files for zero-install mobile access
const staticPath = path.resolve(__dirname, '../../desktop/dist/renderer');
app.use(express.static(staticPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map<string, WebSocket>();
// store last announced device metadata for peers
const peerMeta = new Map<string, any>();

wss.on('connection', (ws: WebSocket, req) => {
  const remoteIp = req.socket.remoteAddress ?? 'unknown_ip';
  logger.info(`New WebSocket client connected from ${remoteIp}`);

  let registeredPeerId: string | null = null;

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (!isSignalingMessage(parsed)) {
        logger.warn('Received malformed signaling packet, ignoring.');
        return;
      }

      const message = parsed as SignalingMessage;

      if (message.type === 'PEER_ANNOUNCE') {
        registeredPeerId = message.senderId;
        clients.set(registeredPeerId, ws);
        // store device info
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        peerMeta.set(registeredPeerId, (message as any).payload?.device ?? { id: registeredPeerId });
        logger.info(`Peer announced: ${(message as any).payload?.device?.name ?? registeredPeerId} (${registeredPeerId})`);

        // Broadcast updated peers list to all connected clients
        const peersListMsg = {
          type: 'PEERS_LIST',
          senderId: 'signaling-server',
          timestamp: Date.now(),
          payload: { peers: Array.from(peerMeta.values()) }
        };
        for (const [_, cws] of clients) {
          if (cws.readyState === WebSocket.OPEN) {
            try { cws.send(JSON.stringify(peersListMsg)); } catch {}
          }
        }
        return;
      }

      if (message.targetId && clients.has(message.targetId)) {
        const targetWs = clients.get(message.targetId);
        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
          targetWs.send(JSON.stringify(message));
          logger.debug(`Relayed ${message.type} from ${message.senderId} to ${message.targetId}`);
        }
      }
    } catch (error) {
      logger.error('Failed to process WebSocket message', error);
    }
  });

  ws.on('close', () => {
    if (registeredPeerId && clients.has(registeredPeerId)) {
      clients.delete(registeredPeerId);
      peerMeta.delete(registeredPeerId);
      logger.info(`Peer disconnected: ${registeredPeerId}`);

      // notify remaining peers
      const leaveMsg = {
        type: 'PEER_LEAVE',
        senderId: registeredPeerId,
        timestamp: Date.now(),
        payload: { reason: 'disconnected' }
      };
      for (const [_, cws] of clients) {
        if (cws.readyState === WebSocket.OPEN) {
          try { cws.send(JSON.stringify(leaveMsg)); } catch {}
        }
      }

      // broadcast updated peers list
      const peersListMsg = {
        type: 'PEERS_LIST',
        senderId: 'signaling-server',
        timestamp: Date.now(),
        payload: { peers: Array.from(peerMeta.values()) }
      };
      for (const [_, cws] of clients) {
        if (cws.readyState === WebSocket.OPEN) {
          try { cws.send(JSON.stringify(peersListMsg)); } catch {}
        }
      }
    }
  });

  ws.on('error', (error) => {
    logger.error('WebSocket connection error:', error);
  });
});

server.listen(PORT, HOST, () => {
  logger.info(`Signaling server listening on http://${HOST}:${PORT}`);
  logger.info(`WebSocket endpoint active on ws://${HOST}:${PORT}`);
});

