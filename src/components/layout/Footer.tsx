'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import PayPalSupportButton from '@/components/widgets/PayPalSupportButton';
import { FeedbackTriggerButton } from '@/components/widgets/FeedbackWidget';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const language = useStore((s) => s.language);
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <footer className="relative sm:fixed sm:bottom-0 sm:left-0 sm:right-0 z-30 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md py-3 sm:py-2.5 px-4 text-xs text-zinc-500 dark:text-zinc-400 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Copyright & Moslih84 Attribution */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">© {currentYear} Fluxo.</span>
          <span>{t('footer.createdBy')}</span>
          <a
            href="https://moslih84.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1 transition-colors"
          >
            Moslih84
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Right: Feedback icon + PayPal Support button */}
        <div className="flex items-center gap-2 shrink-0">
          <FeedbackTriggerButton variant="small" />
          <PayPalSupportButton variant="small" />
        </div>
      </div>
    </footer>
  );
}
