'use client';

import { useState } from 'react';
import { Menu, X, Calendar, BarChart2, Tag, TrendingUp, Sun, Moon, Monitor, LogIn, LogOut, Globe, ShoppingBag, Users, Receipt, Briefcase, User, Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import type { ActiveView } from '@/types';
import { getTranslation } from '@/lib/i18n';
import { Package, Search, Truck } from 'lucide-react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const workspaceMode = useStore((s) => s.workspaceMode);
  const setWorkspaceMode = useStore((s) => s.setWorkspaceMode);
  const setBusinessProfileType = useStore((s) => s.setBusinessProfileType);
  const setIsSearchModalOpen = useStore((s) => s.setIsSearchModalOpen);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const navItems: { id: string; label: string; icon: React.ElementType }[] = workspaceMode === 'business' ? [
    { id: 'dashboard', label: t('nav.dashboard'), icon: TrendingUp },
    { id: 'business_orders', label: t('nav.sales'), icon: ShoppingBag },
    { id: 'business_clients', label: t('nav.clients'), icon: Users },
    { id: 'business_products', label: t('nav.products'), icon: Package },
    { id: 'business_suppliers', label: 'Fournisseurs', icon: Truck },
    { id: 'business_fees', label: t('nav.fees'), icon: Receipt },
  ] : [
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
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(`Erreur: ${err.message || err.code}`);
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

  const handleNavClick = (id: ActiveView) => {
    setActiveView(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Bottom Fixed Bar (Mobile Only) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md flex items-center justify-between px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        {/* Logo */}
        <div className="flex items-center gap-2" onClick={() => handleNavClick('months')}>
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center shadow-sm">
            <span className="text-white dark:text-zinc-900 text-xs font-black tracking-tighter font-mono">FX</span>
          </div>
          <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white leading-none">
            Fluxo
          </span>
        </div>

        <div className="flex items-center gap-2">
          {workspaceMode === 'business' && (
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="p-2 text-zinc-900 dark:text-white"
            >
              <Search className="w-6 h-6" />
            </button>
          )}
          {/* Burger Menu Button */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Menu"
            className="p-2 -mr-2 text-zinc-900 dark:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Full Page Overlay Menu */}
      {isOpen && (
        <div data-testid="mobile-nav-overlay" className="sm:hidden fixed inset-0 z-[100] bg-white dark:bg-zinc-950 animate-in slide-in-from-bottom flex flex-col">
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
                  onClick={() => handleNavClick(id as any)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-lg font-medium transition-all ${
                    activeView === id
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
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

              {/* Mode */}
              {workspaceMode && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                    {workspaceMode === 'business' ? <Briefcase className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    <span className="font-medium">Mode</span>
                  </div>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                    <button
                      onClick={() => {
                        setWorkspaceMode('personal');
                        setActiveView('months');
                        setIsOpen(false);
                      }}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${workspaceMode === 'personal' ? 'bg-white dark:bg-zinc-900 shadow-sm text-blue-600 dark:text-blue-400' : 'text-zinc-500'}`}
                    >
                      Perso
                    </button>
                    <button
                      onClick={() => {
                        setWorkspaceMode('business');
                        if (!useStore.getState().businessProfileType) setBusinessProfileType('freelance');
                        setActiveView('dashboard');
                        setIsOpen(false);
                      }}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${workspaceMode === 'business' ? 'bg-white dark:bg-zinc-900 shadow-sm text-violet-600 dark:text-violet-400' : 'text-zinc-500'}`}
                    >
                      Pro
                    </button>
                  </div>
                </div>
              )}
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
                  {t('nav.signIn')}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
