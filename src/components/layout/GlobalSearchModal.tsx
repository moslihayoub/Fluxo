'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Search,
  X,
  ArrowRight,
  User,
  Building2,
  Package,
  Layers,
  Calendar,
  Settings,
  CreditCard,
  Tag,
  Receipt,
  FileText,
  DollarSign,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency, fromCents } from '@/lib/utils';
import type { ActiveView } from '@/types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Clients' | 'Fournisseurs' | 'Produits & Services' | 'Opérations';
  icon: React.ReactNode;
  action: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const globalSearch = useStore((s) => s.globalSearch);
  const setGlobalSearch = useStore((s) => s.setGlobalSearch);
  const setActiveView = useStore((s) => s.setActiveView);
  const setWorkspaceMode = useStore((s) => s.setWorkspaceMode);
  
  const clients = useStore((s) => s.businessClients);
  const suppliers = useStore((s) => s.businessSuppliers);
  const products = useStore((s) => s.businessProducts);
  const operations = useStore((s) => s.operations);
  const months = useStore((s) => s.months);
  const workspaceMode = useStore((s) => s.workspaceMode);

  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
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

  const query = (globalSearch || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const searchResults = useMemo<SearchResultItem[]>(() => {
    const results: SearchResultItem[] = [];

    // 1. Navigation items
    const navItems = [
      { name: 'Dashboard', view: 'dashboard' as ActiveView, mode: 'personal' as const, icon: <Layers className="w-4 h-4 text-blue-500" /> },
      { name: 'Dashboard Pro', view: 'business_dashboard' as ActiveView, mode: 'business' as const, icon: <Layers className="w-4 h-4 text-violet-500" /> },
      { name: 'Ventes & Commandes', view: 'business_orders' as ActiveView, mode: 'business' as const, icon: <Receipt className="w-4 h-4 text-emerald-500" /> },
      { name: 'Clients', view: 'business_clients' as ActiveView, mode: 'business' as const, icon: <User className="w-4 h-4 text-cyan-500" /> },
      { name: 'Produits & Services', view: 'business_products' as ActiveView, mode: 'business' as const, icon: <Package className="w-4 h-4 text-amber-500" /> },
      { name: 'Fournisseurs', view: 'business_suppliers' as ActiveView, mode: 'business' as const, icon: <Building2 className="w-4 h-4 text-indigo-500" /> },
      { name: 'Frais & Dépenses Pro', view: 'business_fees' as ActiveView, mode: 'business' as const, icon: <DollarSign className="w-4 h-4 text-rose-500" /> },
      { name: 'Opérations', view: 'operations' as ActiveView, mode: 'personal' as const, icon: <FileText className="w-4 h-4 text-emerald-500" /> },
      { name: 'Périodes & Mois', view: 'months' as ActiveView, mode: 'personal' as const, icon: <Calendar className="w-4 h-4 text-violet-500" /> },
      { name: 'Catégories', view: 'categories' as ActiveView, mode: 'personal' as const, icon: <Tag className="w-4 h-4 text-orange-500" /> },
      { name: 'Paramètres', view: 'settings' as ActiveView, mode: 'personal' as const, icon: <Settings className="w-4 h-4 text-zinc-500" /> },
      { name: 'Paramètres Entreprise Pro', view: 'business_settings' as ActiveView, mode: 'business' as const, icon: <Settings className="w-4 h-4 text-violet-500" /> },
    ];

    if (!query) {
      return [];
    }

    // 1. Navigation shortcuts
    navItems.forEach((nav) => {
      const navNorm = nav.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (navNorm.includes(query)) {
        results.push({
          id: `nav-${nav.view}-${nav.mode}`,
          title: nav.name,
          subtitle: `Accéder à la vue ${nav.name}`,
          category: 'Navigation',
          icon: nav.icon,
          action: () => {
            setWorkspaceMode(nav.mode);
            setActiveView(nav.view);
            onClose();
          },
        });
      }
    });

    if (query) {
      // 2. Clients
      (clients || []).forEach((client) => {
        const clientName = client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client sans nom';
        const clientNorm = `${clientName} ${client.phone || ''} ${client.email || ''} ${client.city || ''}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        if (clientNorm.includes(query)) {
          results.push({
            id: `client-${client.id}`,
            title: clientName,
            subtitle: [client.phone, client.email, client.city].filter(Boolean).join(' · ') || 'Client',
            category: 'Clients',
            icon: <User className="w-4 h-4 text-cyan-500" />,
            action: () => {
              setWorkspaceMode('business');
              setActiveView('business_clients');
              onClose();
            },
          });
        }
      });

      // 3. Fournisseurs
      (suppliers || []).forEach((supp) => {
        const suppNorm = `${supp.brandName} ${supp.contactName || ''} ${supp.phone || ''} ${supp.city || ''}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        if (suppNorm.includes(query)) {
          results.push({
            id: `supplier-${supp.id}`,
            title: supp.brandName,
            subtitle: [supp.contactName, supp.phone, supp.city].filter(Boolean).join(' · ') || 'Fournisseur',
            category: 'Fournisseurs',
            icon: <Building2 className="w-4 h-4 text-indigo-500" />,
            action: () => {
              setWorkspaceMode('business');
              setActiveView('business_suppliers');
              onClose();
            },
          });
        }
      });

      // 4. Produits & Services
      (products || []).forEach((prod) => {
        const prodNorm = `${prod.name} ${prod.type}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (prodNorm.includes(query)) {
          const price = formatCurrency(fromCents(prod.defaultPrice_cents) || 0);
          results.push({
            id: `product-${prod.id}`,
            title: prod.name,
            subtitle: `${prod.type === 'service' ? 'Prestation / Service' : 'Produit'} · ${price}`,
            category: 'Produits & Services',
            icon: <Package className="w-4 h-4 text-amber-500" />,
            action: () => {
              setWorkspaceMode('business');
              setActiveView('business_products');
              onClose();
            },
          });
        }
      });

      // 5. Opérations
      (operations || []).slice(0, 150).forEach((op) => {
        const opNorm = `${op.label} ${op.notes || ''} ${op.operationTypeLabel || ''}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        if (opNorm.includes(query)) {
          const amount = formatCurrency(fromCents(op.amount_cents) || 0);
          results.push({
            id: `op-${op.id}`,
            title: op.label,
            subtitle: `${op.kind === 'encaissement' ? '+' : '-'}${amount} · ${op.notes || op.operationTypeLabel || 'Opération'}`,
            category: 'Opérations',
            icon: <FileText className="w-4 h-4 text-emerald-500" />,
            action: () => {
              setWorkspaceMode('personal');
              setActiveView('operations');
              onClose();
            },
          });
        }
      });
    }

    return results.slice(0, 20); // Top 20 results
  }, [query, clients, suppliers, products, operations, setActiveView, setWorkspaceMode, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < searchResults.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      if (searchResults.length > 0 && searchResults[selectedIndex]) {
        e.preventDefault();
        searchResults[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[75vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 h-16 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <Search className="w-5 h-5 text-violet-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher un client, fournisseur, produit, opération ou page..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-base sm:text-lg px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
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

        {/* Suggestions / Results list */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-800/40">
          {!globalSearch.trim() ? (
            <div className="py-12 text-center text-zinc-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-violet-500/50 animate-pulse" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Tapez pour rechercher...</p>
              <p className="text-xs text-zinc-400 mt-1">Clients, Fournisseurs, Produits, Factures, Pages et Opérations</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Aucun résultat trouvé pour "{globalSearch}"</p>
            </div>
          ) : (
            searchResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-violet-50 dark:bg-violet-950/40 text-zinc-900 dark:text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-violet-100 dark:bg-violet-900/60 shadow-xs' : 'bg-zinc-100 dark:bg-zinc-800'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-violet-600 dark:text-violet-400 translate-x-0.5' : 'text-zinc-300 dark:text-zinc-600'
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span>↑↓ pour naviguer</span>
            <span>↵ pour sélectionner</span>
          </div>
          <span>{searchResults.length} résultats</span>
        </div>
      </div>
    </div>
  );
}
