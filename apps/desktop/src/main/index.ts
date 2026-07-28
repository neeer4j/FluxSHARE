import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import os from 'os';
import { NETWORK_CONSTANTS } from '@fluxshare/shared';
import { createLogger } from '@fluxshare/utils';

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
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
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
