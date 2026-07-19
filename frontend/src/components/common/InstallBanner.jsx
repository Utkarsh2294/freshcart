import { useState } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { X, Download } from 'lucide-react';

export default function InstallBanner() {
  const { isInstallable, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-2 rounded-lg">
          <Download className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">Install Freshcart App</h4>
          <p className="text-xs text-emerald-100">For a better and faster experience</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={promptInstall} className="bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors">
          Install
        </button>
        <button onClick={() => setDismissed(true)} className="p-2 hover:bg-emerald-700 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
