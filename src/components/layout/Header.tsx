'use client';

import { Sun, Moon, TrendingUp, BarChart2, Calendar, Tag } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useStore } from '@/store/useStore';
import type { ActiveView } from '@/types';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);

  const navItems: { id: ActiveView; label: string; icon: React.ElementType }[] = [
    { id: 'months', label: 'Mois', icon: Calendar },
    { id: 'operations', label: 'Opérations', icon: BarChart2 },
    { id: 'categories', label: 'Catégories', icon: Tag },
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md">
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
              Gestion & Trésorerie
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

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
