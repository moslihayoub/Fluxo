'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { COUNTRY_CODES } from '@/lib/phone-codes';
import { CopyButton } from './CopyButton';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  enableCopy?: boolean;
}

// ── Phone Sanitizer & Formatter ─────────────────────────────────────────────
export function formatPhoneNumber(digits: string, countryCode: string = 'MA'): string {
  // Strip non-digits
  const clean = digits.replace(/\D/g, '');
  if (!clean) return '';

  if (countryCode === 'MA' || countryCode === 'FR') {
    // Group in pairs: 6 XX XX XX XX or 06 XX XX XX XX
    const parts = clean.match(/.{1,2}/g) || [];
    return parts.join(' ');
  }

  if (clean.length > 6) {
    const parts = clean.match(/.{1,3}/g) || [];
    return parts.join(' ');
  }

  return clean;
}

export function sanitizePhoneInput(raw: string): string {
  return raw.replace(/[^\d\s-]/g, '').trim();
}

export function PhoneInput({
  value,
  onChange,
  placeholder = 'Ex: 6 00 00 00 00',
  className = '',
  disabled = false,
  enableCopy = true,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // default MA
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse incoming value when value prop changes
  useEffect(() => {
    if (value) {
      const match = COUNTRY_CODES.find((c) => value.startsWith(c.dialCode));
      if (match) {
        setSelectedCountry(match);
        const rawPart = value.slice(match.dialCode.length).replace(/\D/g, '');
        setPhoneNumber(formatPhoneNumber(rawPart, match.code));
      } else {
        const rawPart = value.replace(/\D/g, '');
        setPhoneNumber(formatPhoneNumber(rawPart, selectedCountry.code));
      }
    } else {
      setPhoneNumber('');
    }
  }, [value, selectedCountry.code]);

  // Update parent when digits change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/\D/g, '');
    const formatted = formatPhoneNumber(cleanDigits, selectedCountry.code);
    setPhoneNumber(formatted);

    if (cleanDigits) {
      onChange(`${selectedCountry.dialCode} ${formatted}`.trim());
    } else {
      onChange('');
    }
  };

  const handleCountrySelect = (country: (typeof COUNTRY_CODES)[0]) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch('');
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    const formatted = formatPhoneNumber(cleanDigits, country.code);
    setPhoneNumber(formatted);

    if (cleanDigits) {
      onChange(`${country.dialCode} ${formatted}`.trim());
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchNormalized = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filteredCountries = COUNTRY_CODES.filter((c) => {
    const nameNorm = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return nameNorm.includes(searchNormalized) || c.dialCode.includes(search);
  });

  const fullPhoneString = phoneNumber ? `${selectedCountry.dialCode} ${phoneNumber}`.trim() : '';

  return (
    <div
      className={`relative flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm ring-offset-white dark:ring-offset-zinc-950 focus-within:ring-2 focus-within:ring-violet-500 focus-within:ring-offset-2 dark:focus-within:ring-violet-400 ${
        disabled ? 'opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-950' : ''
      } ${className}`}
      ref={dropdownRef}
    >
      {/* Country Selector Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-2 border-r border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-l-md shrink-0 focus:outline-none disabled:cursor-not-allowed"
      >
        <img
          src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
          srcSet={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png 2x`}
          width="20"
          alt={selectedCountry.name}
          className="h-3.5 object-cover rounded-[2px]"
        />
        <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{selectedCountry.dialCode}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-11 left-0 z-50 w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
          <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50">
            <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <input
              className="flex h-7 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-zinc-500 text-zinc-900 dark:text-white"
              placeholder="Chercher un pays ou indicatif..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto p-1">
            {filteredCountries.length === 0 ? (
              <div className="py-4 text-center text-xs text-zinc-500">Aucun pays trouvé</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="flex items-center gap-2 truncate">
                    <img
                      src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                      srcSet={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png 2x`}
                      width="18"
                      alt={country.name}
                      className="h-3 object-cover rounded-[2px]"
                    />
                    <span className="text-zinc-900 dark:text-zinc-100 truncate">{country.name}</span>
                  </span>
                  <span className="flex items-center gap-1.5 ml-2 shrink-0">
                    <span className="font-mono text-zinc-500 dark:text-zinc-400">{country.dialCode}</span>
                    {selectedCountry.code === country.code && (
                      <Check className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    )}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Phone Number Input */}
      <input
        type="tel"
        value={phoneNumber}
        disabled={disabled}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-zinc-400 text-zinc-900 dark:text-white min-w-0 disabled:cursor-not-allowed"
      />

      {/* Copy Button */}
      {enableCopy && fullPhoneString && (
        <div className="flex items-center pr-2">
          <CopyButton value={fullPhoneString} tooltipText="Numéro copié !" />
        </div>
      )}
    </div>
  );
}
