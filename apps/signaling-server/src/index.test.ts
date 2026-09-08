import { describe, expect, it } from 'vitest';
import { buildHealthPayload } from './index';

describe('signaling server health payload', () => {
  it('returns a healthy status payload', () => {
    const payload = buildHealthPayload();

    expect(payload).toMatchObject({
      status: 'ok',
      service: 'fluxshare-signaling-server'
    });
  });
});
