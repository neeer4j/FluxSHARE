import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import os from 'os';
import { NETWORK_CONSTANTS } from '@fluxshare/shared';
import { createLogger } from '@fluxshare/utils';
import fs from 'fs/promises';
import { mkdirSync } from 'fs';

const logger = createLogger('ElectronMain', 'info');

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0B0D11',
    titleBarStyle: 'hiddenInset',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  // Enforce Content Security Policy (CSP)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:*;"
        ]
      }
    });
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    logger.info('FluxShare main window ready and displayed.');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register IPC Handlers
function setupIpcHandlers(): void {
  ipcMain.handle('app:get-version', () => {
    return NETWORK_CONSTANTS.PROTOCOL_VERSION;
  });

  ipcMain.handle('app:get-platform', () => {
    return process.platform;
  });

  ipcMain.handle('app:get-local-ip', () => {
    const interfaces = os.networkInterfaces();
    let fallbackIp = '127.0.0.1';

    for (const name of Object.keys(interfaces)) {
      const lowerName = name.toLowerCase();
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          // Prioritize Wi-Fi and Ethernet adapters
          if (
            lowerName.includes('wi-fi') ||
            lowerName.includes('wifi') ||
            lowerName.includes('ethernet') ||
            lowerName.includes('wlan')
          ) {
            return iface.address;
          }
          fallbackIp = iface.address;
        }
      }
    }
    return fallbackIp !== '127.0.0.1' ? fallbackIp : '192.168.1.6';
  });

  ipcMain.handle('file:save', async (_event, args: { filename: string; dataBase64: string; downloadPath?: string }) => {
    const downloadsDir = args.downloadPath ?? path.join(os.homedir(), 'Downloads', 'FluxShare');
    try {
      mkdirSync(downloadsDir, { recursive: true });
      const filePath = path.join(downloadsDir, args.filename);
      const buffer = Buffer.from(args.dataBase64, 'base64');
      await fs.writeFile(filePath, buffer);
      return { ok: true, path: filePath };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });
}

app.whenReady().then(() => {
  logger.info('Electron app ready. Starting FluxShare...');
  setupIpcHandlers();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
