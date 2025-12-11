const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
let autoUpdater;
try {
  // electron-updater is optional during dev; require only if installed.
  // It will be added as a dependency for production auto-updates.
  // eslint-disable-next-line global-require
  const { autoUpdater: _au } = require('electron-updater');
  autoUpdater = _au;
} catch (err) {
  autoUpdater = null;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
try {
  const squirrelStartup = require('electron-squirrel-startup');
  if (squirrelStartup) {
    app.quit();
  }
} catch (err) {
  // `electron-squirrel-startup` may not be installed in dev environments.
  // Ignore the error so the app can run during development.
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Security best practice
      contextIsolation: true, // Security best practice
      sandbox: false // Needed for some persistent storage access patterns
    },
    autoHideMenuBar: true // Modern look
  });

  // Decide whether to load from localhost (Dev) or file (Prod)
  // In a real setup, we might check an env var. 
  // For this logical setup, we assume if dist/index.html exists, we are in prod.
  
  // However, standard electron-builder logic relies on loading the file in production.
  // The 'electron:dev' script in package.json runs vite on port 5173.
  
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  // Setup auto-update listeners if available
  if (autoUpdater) {
    autoUpdater.on('update-available', (info) => {
      BrowserWindow.getAllWindows().forEach(win => win.webContents.send('update-available', info));
    });
    autoUpdater.on('update-downloaded', (info) => {
      BrowserWindow.getAllWindows().forEach(win => win.webContents.send('update-downloaded', info));
    });
  }

  // IPC handlers for update APIs used by preload
  ipcMain.handle('get-app-version', () => app.getVersion());
  ipcMain.handle('check-for-updates', async () => {
    if (!autoUpdater) return { ok: false, message: 'autoUpdater not available' };
    try {
      const res = await autoUpdater.checkForUpdates();
      return { ok: true, result: res };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  });
  ipcMain.handle('install-update', async () => {
    if (!autoUpdater) return { ok: false, message: 'autoUpdater not available' };
    try {
      // Quit and install when ready
      autoUpdater.quitAndInstall();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});