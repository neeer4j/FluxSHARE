/**
 * Supported operating systems for FluxShare peers.
 */
export type DeviceOS = 'windows' | 'macos' | 'linux';

/**
 * Online availability status of a discovered device on the LAN.
 */
export type DeviceStatus = 'online' | 'busy' | 'offline';

/**
 * Represents a discovered or local peer device on the local network.
 */
export interface Device {
  /**
   * Cryptographically random unique identifier for the device session.
   */
  readonly id: string;
  /**
   * Human-readable hostname or user-defined display name.
   */
  readonly name: string;
  /**
   * Operating system platform, used for selecting device icons in UI.
   */
  readonly os: DeviceOS;
  /**
   * IPv4 or IPv6 LAN address of the device.
   */
  readonly ip: string;
  /**
   * Listening port for direct WebRTC signaling fallback / mDNS announcement.
   */
  readonly port: number;
  /**
   * Current availability status.
   */
  readonly status: DeviceStatus;
  /**
   * Optional URL or asset identifier for custom avatar or device icon.
   */
  readonly avatarUrl?: string;
  /**
   * Timestamp of the last heartbeat or discovery packet received.
   */
  readonly lastSeen: number;
}
