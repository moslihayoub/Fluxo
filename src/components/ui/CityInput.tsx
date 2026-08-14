'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';

export const POPULAR_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Tanger',
  'Agadir',
  'Fès',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
  'Safi',
  'Mohammédia',
  'El Jadida',
  'Nador',
  'Béni Mellal',
  'Khémisset',
  'Taza',
  'Khouribga',
  'Settat',
  'Larache',
  'Ksar El Kebir',
  'Guelmim',
  'Berrechid',
  'Ouarzazate',
  'Dakhla',
  'Laâyoune',
  'Essaouira',
  'Ifrane',
  'Al Hoceïma',
  'Taroudant',
  'Paris',
  'Lyon',
  'Marseille',
  'Bruxelles',
  'Madrid',
  'Barcelone',
  'Dubaï',
  'Londres',
  'Genève',
  'Montréal',
  'New York',
];

interface CityInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CityInput({
  value,
  onChange,
  placeholder = 'Ex: Casablanca',
  className = '',
  disabled = false,
}: CityInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchNormalized = (searchTerm || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const filteredCities = POPULAR_CITIES.filter((city) => {
    const cityNorm = city
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return cityNorm.includes(searchNormalized);
  });

  const handleSelect = (city: string) => {
    setSearchTerm(city);
    onChange(city);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    setHighlightIndex(0);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightIndex((prev) => (prev + 1 < filteredCities.length ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredCities.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && filteredCities.length > 0 && filteredCities[highlightIndex]) {
        e.preventDefault();
        handleSelect(filteredCities[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div
        className={`flex h-10 w-full items-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-within:ring-2 focus-within:ring-violet-500 focus-within:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <MapPin className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
        <input
          type="text"
          disabled={disabled}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none placeholder:text-zinc-400 text-zinc-900 dark:text-white text-sm"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute top-11 left-0 z-50 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
        >
          <div className="max-h-56 overflow-y-auto p-1">
            {filteredCities.length === 0 ? (
              <div className="p-3 text-xs text-zinc-500 text-center">
                <span>Aucune ville suggérée.</span>
                <p className="mt-0.5 text-zinc-400">"{searchTerm}" sera utilisé.</p>
              </div>
            ) : (
              filteredCities.map((city, idx) => {
                const isSelected = value?.toLowerCase() === city.toLowerCase();
                const isHighlighted = idx === highlightIndex;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-semibold'
                        : isHighlighted
                        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{city}</span>
                    </div>
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
