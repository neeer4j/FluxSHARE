import { contextBridge, ipcRenderer } from 'electron';

/**
 * Strict TypeScript interface for window.fluxshare exposed to renderer process.
 */
export interface FluxShareApi {
  readonly getAppVersion: () => Promise<string>;
  readonly getPlatform: () => Promise<string>;
}

const api: FluxShareApi = {
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  getPlatform: () => ipcRenderer.invoke('app:get-platform')
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('fluxshare', api);
  } catch (error) {
    console.error('Failed to expose fluxshare API via contextBridge:', error);
  }
} else {
  // Fallback for non-isolated test environments
  (window as unknown as { fluxshare: FluxShareApi }).fluxshare = api;
}
