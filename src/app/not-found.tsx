'use client';

import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import { Home, ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  const language = useStore((s) => s.language) || 'fr';
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12 max-w-lg mx-auto animate-in fade-in duration-300">
      {/* Icon & 404 Badge */}
      <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4 shadow-inner">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <div className="inline-block px-3 py-1 bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/60 rounded-full text-violet-600 dark:text-violet-300 text-xs font-bold uppercase tracking-wider mb-3">
        {t('tech.404.badge')}
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
        {t('tech.404.title')}
      </h1>
      
      <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-8 max-w-md leading-relaxed">
        {t('tech.404.desc')}
      </p>

      {/* Action Buttons directly in layout */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>{t('tech.backHome')}</span>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'fr' ? 'Retour' : 'Back'}</span>
        </button>
      </div>
    </main>
  );
}
