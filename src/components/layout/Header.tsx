'use client';

import { Sun, Moon, TrendingUp, BarChart2, Calendar, Tag, Globe, LogIn, LogOut, Monitor, ShoppingBag, Users, Receipt, Briefcase, User, Settings, Package, Search, Truck, Building2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';
import { getTranslation } from '@/lib/i18n';
import GlobalSearchModal from './GlobalSearchModal';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const workspaceMode = useStore((s) => s.workspaceMode);
  const setWorkspaceMode = useStore((s) => s.setWorkspaceMode);
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const isSearchModalOpen = useStore((s) => s.isSearchModalOpen);
  const setIsSearchModalOpen = useStore((s) => s.setIsSearchModalOpen);
  
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Auto-close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setIsProfileOpen(false);
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
      setIsProfileOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header className="hidden sm:block sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => setActiveView(workspaceMode === 'business' ? 'dashboard' : 'months')}>
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
                  onClick={() => {
                    // @ts-ignore
                    setActiveView(id);
                    setIsProfileOpen(false);
                  }}
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
              
              {/* Global Search Icon Button */}
              {workspaceMode === 'business' && (
                <button
                  onClick={() => {
                    setIsSearchModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center"
                  aria-label="Recherche Globale"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}

              {/* Mode Switcher (Perso / Pro Segmented Pill) */}
              {workspaceMode && (
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/90 p-0.5 sm:p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 ml-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (workspaceMode !== 'personal') {
                        setWorkspaceMode('personal');
                        setActiveView('months');
                      }
                    }}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      workspaceMode === 'personal'
                        ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title="Espace Personnel"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Perso</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (workspaceMode !== 'business') {
                        setWorkspaceMode('business');
                        setActiveView('dashboard');
                      }
                    }}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      workspaceMode === 'business'
                        ? 'bg-violet-600 text-white shadow-sm font-bold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title="Espace Professionnel"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Pro</span>
                  </button>
                </div>
              )}

              {/* Profile Avatar & Unified Dropdown (Regroups Settings, Theme & Language) */}
              <div className="relative ml-1" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:ring-2 hover:ring-zinc-200 dark:hover:ring-zinc-700 transition-all overflow-hidden"
                >
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : user?.email ? (
                    <span className="text-xs font-bold text-violet-500">{user.email[0].toUpperCase()}</span>
                  ) : (
                    <User className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {/* Unified Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {user ? (
                      <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {user.displayName || 'Utilisateur'}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                      </div>
                    ) : (
                      <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs font-bold text-zinc-500">{t('nav.guestMode')}</p>
                      </div>
                    )}
                    
                    {/* Settings / Paramètres */}
                    <button
                      onClick={() => {
                        setActiveView('business_settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2.5 font-medium"
                    >
                      <Settings className="w-4 h-4 text-zinc-500" /> {t('nav.settings')}
                    </button>

                    {/* Theme Switcher (Light / Dark / System) */}
                    <div className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 font-medium">
                        {theme === 'dark' ? <Moon className="w-4 h-4 text-zinc-500" /> : theme === 'light' ? <Sun className="w-4 h-4 text-zinc-500" /> : <Monitor className="w-4 h-4 text-zinc-500" />}
                        <span>{language === 'fr' ? 'Thème' : 'Theme'}</span>
                      </div>
                      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
                        <button
                          onClick={() => setTheme('light')}
                          title={t('nav.theme.light')}
                          className={`p-1.5 text-xs rounded transition-colors ${theme === 'light' ? 'bg-white dark:bg-zinc-900 text-amber-500 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        >
                          <Sun className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          title={t('nav.theme.dark')}
                          className={`p-1.5 text-xs rounded transition-colors ${theme === 'dark' ? 'bg-white dark:bg-zinc-900 text-indigo-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        >
                          <Moon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          title={t('nav.theme.system')}
                          className={`p-1.5 text-xs rounded transition-colors ${theme === 'system' ? 'bg-white dark:bg-zinc-900 text-violet-500 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Language Switcher (FR / EN) */}
                    <div className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 font-medium">
                        <Globe className="w-4 h-4 text-zinc-500" />
                        <span>{language === 'fr' ? 'Langue' : 'Language'}</span>
                      </div>
                      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
                        <button
                          onClick={() => { setLanguage('fr'); localStorage.setItem('language_set', 'true'); }}
                          className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${language === 'fr' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400'}`}
                        >
                          FR
                        </button>
                        <button
                          onClick={() => { setLanguage('en'); localStorage.setItem('language_set', 'true'); }}
                          className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${language === 'en' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400'}`}
                        >
                          EN
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>

                    {!user ? (
                      <button
                        onClick={handleLogin}
                        className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2.5 font-medium"
                      >
                        <LogIn className="w-4 h-4 text-emerald-500" /> {t('nav.signIn')}
                      </button>
                    ) : (
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center gap-2.5 font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" /> {t('nav.signOut')}
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>
      
      {/* Search Modal */}
      <GlobalSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}
