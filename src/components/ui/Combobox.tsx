'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Check, ChevronDown, Plus } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  [key: string]: any;
}

interface ComboboxProps {
  options: Option[];
  value: string;
  onChange: (value: string, option?: Option) => void;
  placeholder?: string;
  allowCustom?: boolean;
  customLabel?: string;
  clearOnSelect?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  allowCustom = false,
  customLabel = 'Utiliser',
  clearOnSelect = false,
  className = '',
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (clearOnSelect) {
      if (!value) setQuery('');
      return;
    }
    const selectedOption = options.find((opt) => opt.id === value || opt.label === value);
    if (selectedOption) {
      setQuery(selectedOption.label);
    } else if (value && allowCustom) {
      setQuery(value);
    } else {
      setQuery('');
    }
  }, [value, options, allowCustom, clearOnSelect]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (clearOnSelect) {
          setQuery('');
        } else {
          const selectedOption = options.find((opt) => opt.id === value || opt.label === value);
          if (selectedOption) {
            setQuery(selectedOption.label);
          } else if (value && allowCustom) {
            setQuery(value);
          } else {
            setQuery('');
          }
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options, allowCustom, clearOnSelect]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const showCustomOption = allowCustom && query.trim() !== '' && !options.find((opt) => opt.label.toLowerCase() === query.toLowerCase());

  const handleSelect = (val: string, opt?: Option) => {
    onChange(val, opt);
    if (clearOnSelect) {
      setQuery('');
    } else {
      setQuery(opt ? opt.label : val);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className="relative flex items-center w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 overflow-hidden cursor-pointer"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="pl-3 text-zinc-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-transparent border-none focus:ring-0 px-3 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500"
          placeholder={placeholder}
          value={query}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[0].id, filteredOptions[0]);
              } else if (allowCustom && query.trim() !== '') {
                handleSelect(query);
              }
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setIsOpen(true);
          }}
        />
        <div className="pr-3 text-zinc-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1">
            {filteredOptions.length === 0 && !showCustomOption && (
              <div className="px-3 py-3 text-sm text-zinc-500 text-center">Aucun résultat trouvé</div>
            )}
            
            {filteredOptions.map((opt) => {
              const isSelected = value === opt.id || value === opt.label;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id, opt)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-medium'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {opt.label}
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}

            {showCustomOption && (
              <button
                type="button"
                onClick={() => handleSelect(query)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {customLabel} &quot;{query}&quot;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
