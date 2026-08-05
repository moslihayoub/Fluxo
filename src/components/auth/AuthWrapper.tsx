'use client';

import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { LogIn, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';

import SyncManager from './SyncManager';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { language } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  useEffect(() => {
    const hasSetLang = localStorage.getItem('language_set');
    if (!hasSetLang && typeof window !== 'undefined') {
      const sysLang = navigator.language.startsWith('en') ? 'en' : 'fr';
      if (sysLang !== useStore.getState().language) {
        useStore.getState().setLanguage(sysLang);
      }
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (!sessionStorage.getItem('guest_toast_shown')) {
        toast.custom((toastItem) => (
          <div className={`${toastItem.visible ? 'animate-in fade-in slide-in-from-top-5' : 'animate-out fade-out slide-out-to-top-5'} max-w-sm w-full bg-white dark:bg-zinc-900 shadow-xl rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 pointer-events-auto`}>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">{t('nav.guestMode')}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t('nav.guestDesc')}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => {
                  toast.dismiss(toastItem.id);
                  sessionStorage.setItem('guest_toast_shown', 'true');
                }}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={async () => {
                  toast.dismiss(toastItem.id);
                  sessionStorage.setItem('guest_toast_shown', 'true');
                  try {
                    await signInWithPopup(auth, googleProvider);
                    toast.success('Connexion réussie !');
                  } catch (err: any) {
                    if (err.code !== 'auth/popup-closed-by-user') {
                      toast.error(`Erreur: ${err.message || err.code}`);
                    }
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                {t('nav.signIn')}
              </button>
            </div>
          </div>
        </div>
        ), {
          duration: Infinity,
          id: 'guest-toast',
          position: typeof window !== 'undefined' && window.innerWidth < 768 ? 'bottom-center' : 'top-right',
          style: {
            marginTop: typeof window !== 'undefined' && window.innerWidth >= 768 ? '4rem' : '0',
          }
        });
      }
    } else {
      toast.dismiss('guest-toast');
    }
  }, [user, loading]);

  return <SyncManager>{children}</SyncManager>;
}
