import React, { useEffect, useState } from 'react';
import { getFullDBDump } from '../services/db';

export const Diagnostics: React.FC = () => {
  const [log, setLog] = useState<string>('');
  const [updateInfo, setUpdateInfo] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<string | null>(null);

  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.onUpdateAvailable) {
      (window as any).electronAPI.onUpdateAvailable((info: any) => {
        setUpdateInfo(JSON.stringify(info));
      });
    }
    if ((window as any).electronAPI && (window as any).electronAPI.onUpdateDownloaded) {
      (window as any).electronAPI.onUpdateDownloaded((info: any) => {
        setDownloadInfo(JSON.stringify(info));
      });
    }
  }, []);

  const handleClear = () => {
    const ok = (window as any).electronAPI?.clearLocalStorage?.();
    if (ok) {
      setLog('Local storage cleared. Reloading...');
      setTimeout(() => location.reload(), 800);
    } else setLog('Failed to clear local storage.');
  };

  const handleExport = () => {
    const dump = getFullDBDump();
    const text = JSON.stringify(dump, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'srs-db-dump.json';
    a.click();
    URL.revokeObjectURL(url);
    setLog('Export initiated (srs-db-dump.json).');
  };

  const handleCheckUpdates = async () => {
    if (!(window as any).electronAPI) { setLog('Update API not available'); return; }
    setLog('Checking for updates...');
    const res = await (window as any).electronAPI.checkForUpdates();
    setLog(JSON.stringify(res));
  };

  const handleInstallUpdate = async () => {
    if (!(window as any).electronAPI) { setLog('Update API not available'); return; }
    setLog('Installing update (will quit app if available)...');
    const res = await (window as any).electronAPI.installUpdate();
    setLog(JSON.stringify(res));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Diagnostics & Support</h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <p className="text-sm text-gray-600">Use these tools to recover or export data when support is needed.</p>

        <div className="flex gap-2">
          <button onClick={handleClear} className="px-4 py-2 bg-red-600 text-white rounded">Reset Local Data</button>
          <button onClick={handleExport} className="px-4 py-2 bg-indigo-600 text-white rounded">Export DB</button>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-semibold">Auto-update</h3>
          <p className="text-sm text-gray-500">Check for updates and install them (requires update provider configured).</p>
          <div className="flex gap-2 mt-2">
            <button onClick={handleCheckUpdates} className="px-4 py-2 bg-yellow-600 text-white rounded">Check for Updates</button>
            <button onClick={handleInstallUpdate} className="px-4 py-2 bg-green-600 text-white rounded">Install Update</button>
          </div>
          {updateInfo && <pre className="mt-2 text-xs bg-gray-50 p-2 rounded">Update available: {updateInfo}</pre>}
          {downloadInfo && <pre className="mt-2 text-xs bg-gray-50 p-2 rounded">Update downloaded: {downloadInfo}</pre>}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-semibold">Logs / Actions</h3>
          <div className="mt-2">
            <textarea readOnly value={log} className="w-full h-24 p-2 bg-gray-50 border rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;
