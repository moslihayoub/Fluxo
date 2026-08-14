'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';
import { COUNTRIES } from '@/lib/data';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CountrySelect({
  value,
  onChange,
  placeholder = 'Sélectionner un pays...',
  className = '',
  disabled = false,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find(
    (c) => c.name.toLowerCase() === (value || '').toLowerCase() || c.code.toUpperCase() === (value || '').toUpperCase()
  );

  const handleSelect = (countryName: string) => {
    onChange(countryName);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 text-left transition-all duration-200"
      >
        <span className="flex items-center gap-2.5 truncate">
          <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className={selectedCountry || value ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-500'}>
            {selectedCountry ? selectedCountry.name : value || placeholder}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 opacity-60 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-11 left-0 z-50 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
          <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50">
            <Search className="mr-2 h-4 w-4 shrink-0 text-zinc-400" />
            <input
              className="flex h-7 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-zinc-500 text-zinc-900 dark:text-white"
              placeholder="Rechercher un pays..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="p-3 text-xs text-zinc-500 text-center">Aucun pays trouvé</div>
            ) : (
              filtered.map((country) => {
                const isSelected =
                  value?.toLowerCase() === country.name.toLowerCase() ||
                  value?.toUpperCase() === country.code.toUpperCase();
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-semibold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <span>{country.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
