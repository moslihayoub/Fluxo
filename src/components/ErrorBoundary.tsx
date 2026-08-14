'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Component:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      const language = typeof window !== 'undefined' ? (useStore.getState()?.language || 'fr') : 'fr';
      const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400 shadow-inner">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>
          <div className="inline-block px-3 py-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 rounded-full text-rose-600 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-3">
            {t('tech.500.badge')}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {t('tech.500.title')}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
            {t('tech.500.desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={this.handleReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md active:scale-95 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('tech.reload')}</span>
            </button>
            <button
              onClick={() => { if (typeof window !== 'undefined') window.location.href = '/'; }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl font-semibold text-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>{t('tech.backHome')}</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
