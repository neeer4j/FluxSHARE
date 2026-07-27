/**
 * UUID v4 regular expression pattern.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Basic IPv4 validation regular expression.
 */
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * Validates whether a string is a correctly formatted UUID v4.
 */
export function isValidUuid(uuid: string): boolean {
  return typeof uuid === 'string' && UUID_REGEX.test(uuid);
}

/**
 * Validates whether a port number is within the valid TCP/UDP range (1-65535).
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port > 0 && port <= 65535;
}

/**
 * Validates whether a string is a well-formed IPv4 address.
 */
export function isValidIPv4(ip: string): boolean {
  return typeof ip === 'string' && IPV4_REGEX.test(ip);
}

/**
 * Sanitizes a raw filename to prevent path traversal and remove characters
 * that are illegal on Windows (`< > : " / \ | ? *`) or POSIX file systems.
 *
 * @param rawFilename Unsanitized filename string
 * @returns Safe filename suitable for local disk storage
 */
export function sanitizeFilename(rawFilename: string): string {
  if (!rawFilename || typeof rawFilename !== 'string') {
    return 'unnamed_file';
  }

  // Strip directory paths (prevent path traversal like ../../etc/passwd)
  const baseName = rawFilename.replace(/^.*[\\/]/, '');

  // Remove illegal characters across Windows and macOS/Linux
  const sanitized = baseName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/^\.+/, '') // Prevent hidden file creation or relative dot files
    .trim();

  return sanitized.length > 0 ? sanitized : 'unnamed_file';
}
