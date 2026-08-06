import { contextBridge, ipcRenderer } from 'electron';

/**
 * Strict TypeScript interface for window.fluxshare exposed to renderer process.
 */
export interface FluxShareApi {
  readonly getAppVersion: () => Promise<string>;
  readonly getPlatform: () => Promise<string>;
  readonly getLocalIp: () => Promise<string>;
  readonly saveFile?: (filename: string, dataBase64: string, downloadPath?: string) => Promise<{ ok: boolean; path?: string; error?: string }>;
}

const api: FluxShareApi = {
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  getPlatform: () => ipcRenderer.invoke('app:get-platform'),
  getLocalIp: () => ipcRenderer.invoke('app:get-local-ip')
};

// optional file save API (only available in Electron main)
if (ipcRenderer.invoke) {
  api.saveFile = (filename: string, dataBase64: string, downloadPath?: string) =>
    ipcRenderer.invoke('file:save', { filename, dataBase64, downloadPath });
}

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
