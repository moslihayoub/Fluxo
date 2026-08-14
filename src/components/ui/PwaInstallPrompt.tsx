'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';

export default function PwaInstallPrompt() {
  const { language } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
    if (deferredPrompt && !sessionStorage.getItem('pwa_prompt_shown')) {
      toast.custom((tItem) => (
        <div className={`${tItem.visible ? 'animate-in fade-in slide-in-from-bottom-5' : 'animate-out fade-out slide-out-to-bottom-5'} max-w-sm w-full bg-white dark:bg-zinc-900 shadow-xl rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 pointer-events-auto`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-zinc-900 dark:bg-white shadow-sm flex items-center justify-center">
                <span className="text-white dark:text-zinc-900 text-lg font-black tracking-tighter font-mono">FX</span>
              </div>
            <div>
              <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">Installer Fluxo</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Installez l&apos;application pour un accès rapide depuis votre écran d&apos;accueil.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => {
                  toast.dismiss(tItem.id);
                  sessionStorage.setItem('pwa_prompt_shown', 'true');
                }}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={async () => {
                  toast.dismiss(tItem.id);
                  sessionStorage.setItem('pwa_prompt_shown', 'true');
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    setDeferredPrompt(null);
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Installer
              </button>
            </div>
          </div>
        </div>
      ), {
        duration: Infinity,
        id: 'pwa-toast',
        position: 'bottom-center',
      });
    }
  }, [deferredPrompt, language]);

  return null;
}
