// Preload script - expose a minimal, safe API to the renderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateAvailable: (cb) => {
    ipcRenderer.on('update-available', (_event, info) => cb(info));
  },
  onUpdateDownloaded: (cb) => {
    ipcRenderer.on('update-downloaded', (_event, info) => cb(info));
  },
  // Simple local helper to clear localStorage if recovery is needed
  clearLocalStorage: () => {
    try { localStorage.clear(); return true; } catch (e) { return false; }
  }
});