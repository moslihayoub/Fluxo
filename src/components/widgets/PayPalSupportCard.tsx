import React from 'react';
import { Coffee, Heart, ShieldCheck } from 'lucide-react';
import PayPalSupportButton from './PayPalSupportButton';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';

interface PayPalSupportCardProps {
  className?: string;
}

export default function PayPalSupportCard({ className = '' }: PayPalSupportCardProps) {
  const language = useStore((s) => s.language);
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent p-5 backdrop-blur-sm shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md transform -rotate-3 hover:rotate-0 transition-transform">
            <Coffee className="w-6 h-6 fill-current text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                {t('paypal.title')} <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline-block animate-pulse" />
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-500" /> {t('paypal.optional')}
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-lg leading-relaxed">
              {t('paypal.desc')}
            </p>
          </div>
        </div>

        <PayPalSupportButton className="shrink-0 w-full sm:w-auto" />
      </div>
    </div>
  );
}
