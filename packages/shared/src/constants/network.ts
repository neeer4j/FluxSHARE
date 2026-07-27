/**
 * Application-wide network and protocol constants.
 */
export const NETWORK_CONSTANTS = {
  /**
   * Default TCP port for the local fallback WebSocket signaling server.
   */
  DEFAULT_SIGNALING_PORT: 54321,

  /**
   * mDNS / Bonjour service name advertised across the LAN.
   */
  MDNS_SERVICE_TYPE: '_fluxshare._tcp',

  /**
   * Protocol version string included in handshake packets.
   */
  PROTOCOL_VERSION: '1.0.0',

  /**
   * Default chunk size in bytes for WebRTC DataChannel file streaming (64 KB).
   */
  DEFAULT_CHUNK_SIZE_BYTES: 64 * 1024,

  /**
   * Maximum buffered amount threshold in bytes before pausing DataChannel send (16 MB).
   */
  MAX_BUFFERED_AMOUNT_BYTES: 16 * 1024 * 1024,

  /**
   * Heartbeat interval in milliseconds for peer LAN liveness detection.
   */
  HEARTBEAT_INTERVAL_MS: 5000,

  /**
   * Peer offline expiration threshold in milliseconds.
   */
  PEER_TIMEOUT_MS: 15000
} as const;
