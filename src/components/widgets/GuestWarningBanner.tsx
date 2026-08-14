'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, X, LogIn } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';

interface GuestWarningBannerProps {
  className?: string;
}

export default function GuestWarningBanner({ className = '' }: GuestWarningBannerProps) {
  const { user, loading } = useAuth();
  const language = useStore((s) => s.language);
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem('guest_banner_dismissed') === 'true';
      setIsDismissed(dismissed);
    }
  }, []);

  if (loading || user || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('guest_banner_dismissed', 'true');
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success(language === 'fr' ? 'Connexion réussie !' : 'Signed in successfully!');
      handleDismiss();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(`Erreur: ${err.message || err.code}`);
      }
    }
  };

  return (
    <div className={`w-full rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 flex-1">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              {t('nav.guestMode')}
            </h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/70 mt-0.5 max-w-2xl leading-relaxed">
              {language === 'fr' 
                ? 'Vos données sont actuellement enregistrées uniquement sur ce navigateur. Connectez-vous avec Google pour sécuriser vos données et y accéder depuis tous vos appareils.'
                : 'Your data is currently only saved in this browser. Sign in with Google to secure your data and access it anywhere.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSignIn}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            {t('nav.signIn')}
          </button>
        </div>
      </div>
    </div>
  );
}
