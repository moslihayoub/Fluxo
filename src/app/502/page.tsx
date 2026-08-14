'use client';

import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import { RefreshCw, Home, CloudOff, ShieldCheck } from 'lucide-react';

export default function BadGatewayPage() {
  const language = useStore((s) => s.language) || 'fr';
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12 max-w-lg mx-auto animate-in fade-in duration-300">
      {/* Icon & 502 Badge */}
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 shadow-inner">
        <CloudOff className="w-8 h-8 animate-pulse" />
      </div>

      <div className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-full text-amber-600 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
        {t('tech.502.badge')}
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
        {t('tech.502.title')}
      </h1>
      
      <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-6 max-w-md leading-relaxed">
        {t('tech.502.desc')}
      </p>

      {/* Local storage data safety badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-8">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          {language === 'fr' 
            ? 'Vos données locales sont conservées en sécurité.' 
            : 'Your local data is safely stored in this browser.'}
        </span>
      </div>

      {/* Action Buttons directly in layout */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('tech.reload')}</span>
        </button>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl font-semibold text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>{t('tech.backHome')}</span>
        </Link>
      </div>
    </main>
  );
}
