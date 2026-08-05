'use client';

import { Sun, Moon, TrendingUp, BarChart2, Calendar, Tag, Globe, LogIn, LogOut, Monitor } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useStore } from '@/store/useStore';
import type { ActiveView } from '@/types';
import { useAuth } from '@/components/auth/AuthProvider';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { getTranslation } from '@/lib/i18n';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const { user } = useAuth();
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const navItems: { id: ActiveView; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: TrendingUp },
    { id: 'months', label: t('nav.periods'), icon: Calendar },
    { id: 'operations', label: t('nav.operations'), icon: BarChart2 },
    { id: 'categories', label: t('nav.categories'), icon: Tag },
  ];

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success(t('nav.loginSuccess'));
    } catch (err: any) {
      console.error('Erreur Firebase Auth détaillée:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(`Erreur: ${err.message || err.code || 'de connexion'}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success(t('nav.signOut'));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="hidden sm:block sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => setActiveView('months')}>
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center shadow-sm">
            <span className="text-white dark:text-zinc-900 text-xs font-black tracking-tighter font-mono">FX</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white leading-none">
              Fluxo
            </span>
            <span className="text-[9px] text-zinc-400 font-medium tracking-wider uppercase leading-none mt-0.5 hidden sm:block">
              {language === 'fr' ? 'Gestion & Trésorerie' : 'Cashflow Management'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-0.5">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150
                ${activeView === id
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </nav>

        {/* Actions Right */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => {
              setLanguage(language === 'fr' ? 'en' : 'fr');
              localStorage.setItem('language_set', 'true');
            }}
            className="flex items-center gap-1 p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-bold uppercase"
            aria-label="Toggle language"
          >
            <Globe className="w-4 h-4" />
            {language}
          </button>

          {/* Theme toggle */}
          <div className="relative">
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center"
              aria-label="Theme options"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'light' ? <Sun className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </button>
            {isThemeOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden py-1 z-50">
                <button
                  onClick={() => { setTheme('light'); setIsThemeOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Sun className="w-4 h-4" /> {t('nav.theme.light')}
                </button>
                <button
                  onClick={() => { setTheme('dark'); setIsThemeOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Moon className="w-4 h-4" /> {t('nav.theme.dark')}
                </button>
                <button
                  onClick={() => { setTheme('system'); setIsThemeOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Monitor className="w-4 h-4" /> {t('nav.theme.system')}
                </button>
              </div>
            )}
          </div>

          {/* Auth Button */}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 p-1.5 pr-3 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hidden sm:block">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <LogOut className="w-3.5 h-3.5 text-zinc-500 ml-1 hidden sm:block" />
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:block">{t('nav.signIn')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
