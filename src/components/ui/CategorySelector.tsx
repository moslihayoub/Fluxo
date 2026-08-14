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
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Catégorie Principale</label>
          {isCreating !== 'main' && (
            <button
              type="button"
              onClick={() => { setIsCreating('main'); setNewCatName(''); }}
              className="text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Nouvelle catégorie
            </button>
          )}
        </div>
        
        {isCreating === 'main' ? (
          <div className="flex items-center gap-2 animate-in fade-in duration-200">
            <input
              type="text"
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder={productType === 'service' ? 'Ex: Prestations, Maintenance, Formations...' : 'Ex: Vêtements, Accessoires, Cosmétiques...'}
              className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:text-white"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={!newCatName.trim()}
              className="px-3 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              Créer
            </button>
            <button
              type="button"
              onClick={() => { setIsCreating(null); setNewCatName(''); }}
              className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        ) : (
          <Select
            value={selectedMainId || undefined}
            onValueChange={(val) => {
              if (val === 'CREATE_NEW') {
                setIsCreating('main');
              } else {
                setSelectedMainId(val);
                onChange(val);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Sélectionner une catégorie --">
                {selectedMainCat?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {mainCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
              <SelectItem value="CREATE_NEW" className="text-violet-600 dark:text-violet-400 font-semibold">
                + Créer une catégorie principale
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* 2. Sous-catégorie (Uniquement si Catégorie Principale sélectionnée) */}
      {selectedMainId && isCreating !== 'main' && (
        <div className="pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Sous-catégorie (Optionnel)</label>
            {isCreating !== 'sub' && (
              <button
                type="button"
                onClick={() => { setIsCreating('sub'); setNewCatName(''); }}
                className="text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Nouvelle sous-catégorie
              </button>
            )}
          </div>
          
          {isCreating === 'sub' ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <input
                type="text"
                autoFocus
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder={productType === 'service' ? 'Ex: Frontend, Mobile, Maintenance...' : 'Ex: Chaussures, T-shirts, Accessoires...'}
                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:text-white"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={!newCatName.trim()}
                className="px-3 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                Créer
              </button>
              <button
                type="button"
                onClick={() => { setIsCreating(null); setNewCatName(''); }}
                className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          ) : (
            <Select
              value={value && value !== selectedMainId ? value : ''}
              onValueChange={(val) => {
                if (val === 'CREATE_NEW') {
                  setIsCreating('sub');
                } else if (val === '') {
                  onChange(selectedMainId);
                } else {
                  onChange(val);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Aucune sous-catégorie --">
                  {selectedSubCat?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {subCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
                <SelectItem value="CREATE_NEW" className="text-violet-600 dark:text-violet-400 font-semibold">
                  + Créer une sous-catégorie
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
