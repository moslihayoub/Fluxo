'use client';

import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const globalSearch = useStore((s) => s.globalSearch);
  const setGlobalSearch = useStore((s) => s.setGlobalSearch);
  const language = useStore((s) => s.language);
  const t = (key: any) => getTranslation(language, key);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure the modal is rendered before focusing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/20 dark:bg-zinc-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 h-16 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('nav.search') || "Rechercher..."}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-lg px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
          />
          {globalSearch && (
            <button
              onClick={() => {
                setGlobalSearch('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="ml-2 flex items-center gap-1 text-xs text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
            <span>ESC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
