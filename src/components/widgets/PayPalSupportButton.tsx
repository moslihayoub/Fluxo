'use client';

import React from 'react';
import { Coffee, ExternalLink } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';

export function PayPalLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.762.762 0 0 1 .752-.638h7.241c3.125 0 5.405 1.543 4.962 5.093-.327 2.62-2.176 4.316-4.992 4.316H9.278a.641.641 0 0 0-.633.541l-1.569 8.305z"
        fill="#003087"
      />
      <path
        d="M9.076 12.494h3.633c2.816 0 4.665-1.696 4.992-4.316.353-2.835-1.127-4.52-4.2-4.52H7.034a.762.762 0 0 0-.752.638L4.689 19.349a.641.641 0 0 0 .633.74h3.122l.633-7.595z"
        fill="#0070BA"
      />
      <path
        d="M17.433 8.178c-.327 2.62-2.176 4.316-4.992 4.316H8.808a.641.641 0 0 0-.633.541l-1.569 8.305h3.633a.641.641 0 0 0 .633-.541l1.1-7.05h1.9c2.816 0 4.665-1.696 4.992-4.316z"
        fill="#00457C"
      />
    </svg>
  );
}

interface PayPalSupportButtonProps {
  variant?: 'default' | 'small' | 'icon';
  className?: string;
}

export default function PayPalSupportButton({ variant = 'default', className = '' }: PayPalSupportButtonProps) {
  const paypalUrl = process.env.NEXT_PUBLIC_PAYPAL_URL || 'https://www.paypal.com/paypalme/moslihayoub';
  const language = useStore((s) => s.language);
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  if (variant === 'icon') {
    return (
      <a
        href={paypalUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`${t('paypal.button')} (PayPal)`}
        className={`p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 ${className}`}
      >
        <Coffee className="w-4 h-4 text-amber-500 fill-amber-500" />
        <PayPalLogo className="w-4 h-4" />
      </a>
    );
  }

  if (variant === 'small') {
    return (
      <a
        href={paypalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 text-zinc-900 dark:text-white font-bold hover:scale-105 active:scale-95 transition-all shadow-sm ${className}`}
      >
        <Coffee className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
        <span>{t('paypal.button')}</span>
        <span className="text-zinc-400 font-normal">|</span>
        <span className="inline-flex items-center gap-1">
          <PayPalLogo className="w-3.5 h-3.5 shrink-0" />
          <span className="text-blue-600 dark:text-blue-400 font-extrabold">PayPal</span>
        </span>
        <ExternalLink className="w-3 h-3 text-zinc-400 ml-0.5" />
      </a>
    );
  }

  return (
    <a
      href={paypalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 text-zinc-900 dark:text-white font-bold hover:scale-105 active:scale-95 transition-all shadow-md ${className}`}
    >
      <Coffee className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
      <span>{t('paypal.button')}</span>
      <span className="text-zinc-300 dark:text-zinc-700">|</span>
      <span className="inline-flex items-center gap-1.5">
        <PayPalLogo className="w-4 h-4 shrink-0" />
        <span className="text-blue-600 dark:text-blue-400 font-extrabold">PayPal</span>
      </span>
      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
    </a>
  );
}
