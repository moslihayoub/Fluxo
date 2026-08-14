'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import { WifiOff, X, RefreshCw } from 'lucide-react';

export default function OfflineDetector() {
  const language = useStore((s) => s.language) || 'fr';
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [isOffline, setIsOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsDismissed(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
    };

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline || isDismissed) return null;

  return (
    <aside aria-label="Avertissement mode hors-ligne" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-zinc-900 dark:bg-zinc-800 text-white rounded-2xl p-4 shadow-2xl border border-zinc-700/80 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <WifiOff className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            {t('tech.offline.title')}
          </h4>
          <p className="text-xs text-zinc-300 dark:text-zinc-400 mt-1 leading-relaxed">
            {t('tech.offline.desc')}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 bg-white text-zinc-900 rounded-lg text-xs font-bold hover:bg-zinc-100 transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{t('tech.retry')}</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="px-3 py-1.5 bg-zinc-800 dark:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
            >
              {language === 'fr' ? 'Continuer' : 'Continue'}
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
          title="Fermer / Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
