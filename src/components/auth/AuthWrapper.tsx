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

  return <SyncManager>{children}</SyncManager>;
}
