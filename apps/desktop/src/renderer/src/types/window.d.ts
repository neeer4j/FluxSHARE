import type { FluxShareApi } from '../../preload/index';

declare global {
  interface Window {
    readonly fluxshare?: FluxShareApi;
  }
}

export {};
