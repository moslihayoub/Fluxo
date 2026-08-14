'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface CopyButtonProps {
  value?: string;
  className?: string;
  tooltipText?: string;
}

export function CopyButton({ value = '', className = '', tooltipText = 'Copié !' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      toast.success(tooltipText, { duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Impossible de copier');
    }
  };

  if (!value) return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copier dans le presse-papier"
      className={`p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${className}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50 duration-150" />
      ) : (
        <Copy className="w-3.5 h-3.5 transition-transform active:scale-90" />
      )}
    </button>
  );
}
