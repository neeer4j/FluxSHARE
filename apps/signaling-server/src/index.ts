import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { NETWORK_CONSTANTS } from '@fluxshare/shared';
import { isSignalingMessage, type SignalingMessage } from '@fluxshare/protocol';
import { createLogger } from '@fluxshare/utils';

const logger = createLogger('SignalingServer', 'info');
const PORT = Number(process.env.PORT) || NETWORK_CONSTANTS.DEFAULT_SIGNALING_PORT;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'fluxshare-signaling-server',
    version: NETWORK_CONSTANTS.PROTOCOL_VERSION,
    timestamp: Date.now()
  });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map<string, WebSocket>();

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
        logger.info(`Peer announced: ${message.payload.device.name} (${registeredPeerId})`);
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
      logger.info(`Peer disconnected: ${registeredPeerId}`);
    }
  });

  ws.on('error', (error) => {
    logger.error('WebSocket connection error:', error);
  });
});

server.listen(PORT, () => {
  logger.info(`Signaling server listening on http://localhost:${PORT}`);
  logger.info(`WebSocket endpoint active on ws://localhost:${PORT}`);
});
