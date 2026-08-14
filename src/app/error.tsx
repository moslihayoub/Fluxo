'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import { RefreshCw, Home, ServerCrash } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const language = useStore((s) => s.language) || 'fr';
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  useEffect(() => {
    console.error('Captured Application Error:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12 max-w-lg mx-auto animate-in fade-in duration-300">
      {/* Icon & 500 Badge */}
      <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-inner">
        <ServerCrash className="w-8 h-8 animate-pulse" />
      </div>

      <div className="inline-block px-3 py-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 rounded-full text-rose-600 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-3">
        {t('tech.500.badge')}
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
        {t('tech.500.title')}
      </h1>
      
      <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-8 max-w-md leading-relaxed">
        {t('tech.500.desc')}
      </p>

      {/* Action Buttons directly in layout */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-rose-600/20 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('tech.retry')}</span>
        </button>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl font-semibold text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>{t('tech.backHome')}</span>
        </Link>
      </div>

      {error.digest && (
        <p className="mt-6 font-mono text-xs text-zinc-400 dark:text-zinc-600">
          ID: {error.digest}
        </p>
      )}
    </main>
  );
}
