import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  formatTransferSpeed,
  formatETA,
  formatPercentage,
  sanitizeFilename,
  isValidPort,
  isValidIPv4,
  normalizeDownloadPath
} from '../src';

describe('formatFileSize', () => {
  it('formats bytes correctly across units', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1024)).toBe('1.00 KB');
    expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.50 MB');
    expect(formatFileSize(1024 * 1024 * 1024 * 1.75)).toBe('1.75 GB');
  });

  it('handles negative or NaN values safely', () => {
    expect(formatFileSize(-100)).toBe('0 B');
    expect(formatFileSize(NaN)).toBe('0 B');
  });
});

describe('formatTransferSpeed', () => {
  it('appends /s to formatted file sizes', () => {
    expect(formatTransferSpeed(1024 * 1024 * 15.4)).toBe('15.40 MB/s');
    expect(formatTransferSpeed(0)).toBe('0 B/s');
  });
});

describe('formatETA', () => {
  it('formats seconds into readable durations', () => {
    expect(formatETA(0)).toBe('Instant');
    expect(formatETA(0.5)).toBe('< 1s');
    expect(formatETA(45)).toBe('45s');
    expect(formatETA(135)).toBe('2m 15s');
    expect(formatETA(3660)).toBe('1h 1m');
  });
});

describe('formatPercentage', () => {
  it('formats percentage with precision and clamping', () => {
    expect(formatPercentage(45.26, 1)).toBe('45.3%');
    expect(formatPercentage(150)).toBe('100.0%');
    expect(formatPercentage(-5)).toBe('0.0%');
  });
});

describe('sanitizeFilename', () => {
  it('removes path traversal and invalid characters', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFilename('my<invalid>file?.txt')).toBe('my_invalid_file_.txt');
    expect(sanitizeFilename('.hidden_file.png')).toBe('hidden_file.png');
  });
});

describe('Network Validators', () => {
  it('validates TCP/UDP ports correctly', () => {
    expect(isValidPort(54321)).toBe(true);
    expect(isValidPort(80)).toBe(true);
    expect(isValidPort(0)).toBe(false);
    expect(isValidPort(70000)).toBe(false);
  });

  it('validates IPv4 addresses correctly', () => {
    expect(isValidIPv4('192.168.1.100')).toBe(true);
    expect(isValidIPv4('10.0.0.1')).toBe(true);
    expect(isValidIPv4('256.100.50.1')).toBe(false);
    expect(isValidIPv4('invalid_ip')).toBe(false);
  });
});

describe('normalizeDownloadPath', () => {
  it('keeps valid paths and falls back safely for empty or invalid values', () => {
    expect(normalizeDownloadPath('C:\\Users\\neera\\Downloads\\FluxShare')).toBe('C:\\Users\\neera\\Downloads\\FluxShare');
    expect(normalizeDownloadPath('')).toBe('C:\\Users\\neera\\Downloads\\FluxShare');
    expect(normalizeDownloadPath('   ')).toBe('C:\\Users\\neera\\Downloads\\FluxShare');
  });
});
