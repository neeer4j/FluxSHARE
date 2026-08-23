import { app, BrowserWindow, dialog, ipcMain, session } from 'electron';
import path from 'path';
import os from 'os';
import { NETWORK_CONSTANTS } from '@fluxshare/shared';
import { createLogger } from '@fluxshare/utils';
import fs from 'fs/promises';
import { mkdirSync } from 'fs';
import { app as electronApp } from 'electron';
import base64 from 'base-64';

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

  ipcMain.handle('dialog:open-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Choose FluxShare download folder',
      properties: ['openDirectory', 'createDirectory', 'promptToCreate']
    });

    if (canceled || filePaths.length === 0) {
      return undefined;
    }

    return filePaths[0];
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

  // Partial chunk persistence handlers
  const PARTIALS_BASE = path.join(electronApp.getPath('userData'), 'fluxshare', 'partials');

  ipcMain.handle('partial:init', async (_event, args: { fileId: string; meta: { fileName: string; fileSize: number } }) => {
    try {
      const dir = path.join(PARTIALS_BASE, args.fileId);
      mkdirSync(dir, { recursive: true });
      const metaPath = path.join(dir, 'meta.json');
      const meta = { fileName: args.meta.fileName, fileSize: args.meta.fileSize, receivedIndices: [] as number[] };
      await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf8');
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });

  ipcMain.handle('partial:write', async (_event, args: { fileId: string; chunkIndex: number; dataBase64: string }) => {
    try {
      const dir = path.join(PARTIALS_BASE, args.fileId);
      mkdirSync(dir, { recursive: true });
      const chunkPath = path.join(dir, `chunk-${args.chunkIndex}.bin`);
      const buffer = Buffer.from(args.dataBase64, 'base64');
      await fs.writeFile(chunkPath, buffer);
      // update meta
      const metaPath = path.join(dir, 'meta.json');
      let meta: any = { receivedIndices: [] };
      try {
        const raw = await fs.readFile(metaPath, 'utf8');
        meta = JSON.parse(raw);
      } catch (e) {
        meta = { receivedIndices: [] };
      }
      if (!meta.receivedIndices) meta.receivedIndices = [];
      if (!meta.receivedIndices.includes(args.chunkIndex)) meta.receivedIndices.push(args.chunkIndex);
      await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf8');
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });

  ipcMain.handle('partial:get-meta', async (_event, args: { fileId: string }) => {
    try {
      const metaPath = path.join(PARTIALS_BASE, args.fileId, 'meta.json');
      const raw = await fs.readFile(metaPath, 'utf8');
      const meta = JSON.parse(raw);
      return { ok: true, meta };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });

  ipcMain.handle('partial:assemble', async (_event, args: { fileId: string; filename: string; downloadPath?: string }) => {
    try {
      const dir = path.join(PARTIALS_BASE, args.fileId);
      const metaPath = path.join(dir, 'meta.json');
      const raw = await fs.readFile(metaPath, 'utf8');
      const meta = JSON.parse(raw);
      const indices: number[] = meta.receivedIndices || [];
      indices.sort((a, b) => a - b);
      const buffers: Buffer[] = [];
      for (const idx of indices) {
        const chunkPath = path.join(dir, `chunk-${idx}.bin`);
        const buf = await fs.readFile(chunkPath);
        buffers.push(buf);
      }
      const final = Buffer.concat(buffers);
      const downloadsDir = args.downloadPath ?? path.join(os.homedir(), 'Downloads', 'FluxShare');
      mkdirSync(downloadsDir, { recursive: true });
      const outPath = path.join(downloadsDir, args.filename);
      await fs.writeFile(outPath, final);
      return { ok: true, path: outPath };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });

  ipcMain.handle('partial:delete', async (_event, args: { fileId: string }) => {
    try {
      const dir = path.join(PARTIALS_BASE, args.fileId);
      // remove files
      // conservative: attempt to unlink files
      try {
        const files = await fs.readdir(dir);
        for (const f of files) {
          await fs.unlink(path.join(dir, f));
        }
      } catch (e) {}
      try {
        await fs.rmdir(dir);
      } catch (e) {}
      return { ok: true };
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
