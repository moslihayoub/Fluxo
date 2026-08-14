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
  'New York'
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  const filteredCities = POPULAR_CITIES.filter((city) =>
    city.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleSelect = (city: string) => {
    setSearchTerm(city);
    onChange(city);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    setIsOpen(true);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 flex items-center justify-center text-zinc-400 pointer-events-none">
          <MapPin className="w-4 h-4" />
        </div>
        <input
          type="text"
          disabled={disabled}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-zinc-200 bg-white pl-10 pr-9 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-violet-400 transition-all duration-200"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
        >
          <ChevronDown className="w-4 h-4 opacity-70" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-11 left-0 z-50 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg animate-in fade-in zoom-in-95 duration-150 overflow-hidden max-h-56 overflow-y-auto p-1">
          {filteredCities.length > 0 ? (
            filteredCities.map((city) => {
              const isSelected = value?.toLowerCase() === city.toLowerCase();
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    {city}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />}
                </button>
              );
            })
          ) : (
            <div className="p-2.5 text-xs text-zinc-500 text-center">
              Ville personnalisée : <span className="font-semibold text-zinc-800 dark:text-zinc-200">{searchTerm}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
