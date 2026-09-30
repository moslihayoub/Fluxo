'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Tag, ChevronDown, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import type { BusinessCategory } from '@/types';

interface CategorySelectorProps {
  value?: string;
  onChange: (categoryId: string) => void;
  className?: string;
  productType?: 'product' | 'service';
}

export function CategorySelector({ value, onChange, className = '', productType = 'product' }: CategorySelectorProps) {
  const rawCategories = useStore((s) => s.businessCategories);
  const addCategory = useStore((s) => s.addBusinessCategory);

  // Stabilise la référence pour éviter les re-renders infinis dans useEffect/useMemo
  const categories = useMemo(() => rawCategories ?? [], [rawCategories]);

  const [selectedMainId, setSelectedMainId] = useState<string>('');
  
  // IsCreating state: 'main' | 'sub' | null
  const [isCreating, setIsCreating] = useState<'main' | 'sub' | null>(null);
  const [newCatName, setNewCatName] = useState('');

  // Determine initial selected Main ID based on the provided value
  useEffect(() => {
    if (value) {
      const cat = categories.find(c => c.id === value);
      if (cat) {
        if (cat.parentId) {
          setSelectedMainId(cat.parentId);
        } else {
          setSelectedMainId(cat.id);
        }
      }
    }
  }, [value, categories]);

  const mainCategories = useMemo(() => {
    return categories.filter(c => !c.parentId).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const subCategories = useMemo(() => {
    if (!selectedMainId) return [];
    return categories.filter(c => c.parentId === selectedMainId).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, selectedMainId]);

  const selectedMainCat = useMemo(() => {
    return categories.find(c => c.id === selectedMainId);
  }, [categories, selectedMainId]);

  const selectedSubCat = useMemo(() => {
    if (!value || value === selectedMainId) return null;
    return categories.find(c => c.id === value);
  }, [categories, value, selectedMainId]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !isCreating) return;
    
    const catName = newCatName.trim();
    const parentId = isCreating === 'sub' ? selectedMainId : undefined;
    
    const created = addCategory({
      name: catName,
      parentId: parentId,
    }); 
    
    if (created && created.id) {
      if (isCreating === 'sub') {
        onChange(created.id);
      } else {
        setSelectedMainId(created.id);
        onChange(created.id);
      }
    }
    
    setNewCatName('');
    setIsCreating(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 1. Catégorie Principale */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1.5">Catégorie Principale</label>

        {isCreating === 'main' ? (
          /* Mode saisie inline */
          <div className="flex items-center gap-2 animate-in fade-in duration-150">
            <input
              type="text"
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder={productType === 'service' ? 'Ex: Prestations, Maintenance...' : 'Ex: Vêtements, Cosmétiques...'}
              className="flex-1 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:text-white"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={!newCatName.trim()}
              className="h-10 px-3.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm shrink-0"
            >
              Créer
            </button>
            <button
              type="button"
              onClick={() => { setIsCreating(null); setNewCatName(''); }}
              className="h-10 px-3 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-lg text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              ✕
            </button>
          </div>
        ) : (
          /* Mode select + bouton Ajouter inline */
          <div className="flex items-center gap-2">
            <Select
              value={selectedMainId || undefined}
              onValueChange={(val) => {
                setSelectedMainId(val);
                onChange(val);
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="— Sélectionner une catégorie —">
                  {selectedMainCat?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {mainCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => { setIsCreating('main'); setNewCatName(''); }}
              className="h-10 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
              title="Ajouter une catégorie principale"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
        )}
      </div>

      {/* 2. Sous-catégorie */}
      {selectedMainId && isCreating !== 'main' && (
        <div className="pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1.5">Sous-catégorie <span className="normal-case font-normal">(optionnel)</span></label>

          {isCreating === 'sub' ? (
            /* Mode saisie inline sous-cat */
            <div className="flex items-center gap-2 animate-in fade-in duration-150">
              <input
                type="text"
                autoFocus
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder={productType === 'service' ? 'Ex: Frontend, Mobile...' : 'Ex: Chaussures, T-shirts...'}
                className="flex-1 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:text-white"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={!newCatName.trim()}
                className="h-10 px-3.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm shrink-0"
              >
                Créer
              </button>
              <button
                type="button"
                onClick={() => { setIsCreating(null); setNewCatName(''); }}
                className="h-10 px-3 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-lg text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
              >
                ✕
              </button>
            </div>
          ) : (
            /* Mode select + bouton Ajouter inline */
            <div className="flex items-center gap-2">
              <Select
                value={value && value !== selectedMainId ? value : ''}
                onValueChange={(val) => {
                  if (val === '') {
                    onChange(selectedMainId);
                  } else {
                    onChange(val);
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="— Aucune sous-catégorie —">
                    {selectedSubCat?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => { setIsCreating('sub'); setNewCatName(''); }}
                className="h-10 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
                title="Ajouter une sous-catégorie"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
