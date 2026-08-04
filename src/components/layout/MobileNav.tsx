'use client';

import { useState } from 'react';
import { Menu, X, Calendar, BarChart2, Tag, TrendingUp, Sun, Moon, Monitor, LogIn, LogOut, Globe } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import type { ActiveView } from '@/types';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const navItems: { id: ActiveView; label: { fr: string, en: string }; icon: React.ElementType }[] = [
    { id: 'months', label: { fr: 'Mois', en: 'Months' }, icon: Calendar },
    { id: 'operations', label: { fr: 'Opérations', en: 'Operations' }, icon: BarChart2 },
    { id: 'categories', label: { fr: 'Catégories', en: 'Categories' }, icon: Tag },
    { id: 'dashboard', label: { fr: 'Dashboard', en: 'Dashboard' }, icon: TrendingUp },
  ];

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success(language === 'fr' ? 'Connexion réussie !' : 'Successfully logged in!');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(`Erreur: ${err.message || err.code}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success(language === 'fr' ? 'Déconnecté avec succès' : 'Logged out successfully');
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavClick = (id: ActiveView) => {
    setActiveView(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Bottom Fixed Bar (Mobile Only) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 h-14 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md flex items-center justify-between px-4 pb-safe">
        {/* Logo */}
        <div className="flex items-center gap-2" onClick={() => handleNavClick('months')}>
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center shadow-sm">
            <span className="text-white dark:text-zinc-900 text-xs font-black tracking-tighter font-mono">FX</span>
          </div>
          <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white leading-none">
            Fluxo
          </span>
        </div>

        {/* Burger Menu Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 text-zinc-900 dark:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Full Page Overlay Menu */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 z-[100] bg-white dark:bg-zinc-950 animate-in slide-in-from-bottom flex flex-col">
          {/* Header of the menu */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center shadow-sm">
                <span className="text-white dark:text-zinc-900 text-xs font-black tracking-tighter font-mono">FX</span>
              </div>
              <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white leading-none">
                Fluxo
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 -mr-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
            {/* Nav */}
            <div className="space-y-2">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-medium transition-all ${
                    activeView === id
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label[language]}
                </button>
              ))}
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            {/* Settings */}
            <div className="space-y-4 px-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {language === 'fr' ? 'Paramètres' : 'Settings'}
              </h3>
              
              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">{language === 'fr' ? 'Langue' : 'Language'}</span>
                </div>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setLanguage('fr')}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${language === 'fr' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${language === 'en' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                  <span className="font-medium">{language === 'fr' ? 'Thème' : 'Theme'}</span>
                </div>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-1.5 rounded-md ${theme === 'light' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`p-1.5 rounded-md ${theme === 'system' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            {/* Auth */}
            <div className="px-2">
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold">
                        {user.email?.[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                        {user.displayName || 'Utilisateur'}
                      </span>
                      <span className="text-xs text-zinc-500 truncate">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    {language === 'fr' ? 'Se déconnecter' : 'Log Out'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { handleLogin(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  {language === 'fr' ? 'Se connecter avec Google' : 'Sign in with Google'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
