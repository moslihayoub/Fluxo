import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { COUNTRY_CODES } from '@/lib/phone-codes';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, placeholder = 'Numéro de téléphone...', className = '', disabled = false }: PhoneInputProps) {
  // Extract dial code and number if value exists
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse incoming value when value prop changes
  useEffect(() => {
    if (value) {
      const match = COUNTRY_CODES.find(c => value.startsWith(c.dialCode));
      if (match) {
        setSelectedCountry(match);
        setPhoneNumber(value.slice(match.dialCode.length).trim());
      } else {
        setPhoneNumber(value);
      }
    } else {
      setPhoneNumber('');
    }
  }, [value]);

  // Update parent when parts change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhoneNumber(val);
    onChange(`${selectedCountry.dialCode} ${val}`.trim());
  };

  const handleCountrySelect = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(country);
    setIsOpen(false);
    onChange(`${country.dialCode} ${phoneNumber}`.trim());
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

  const filteredCountries = COUNTRY_CODES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.dialCode.includes(search)
  );

  return (
    <div className={`relative flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm ring-offset-white dark:ring-offset-zinc-950 focus-within:ring-2 focus-within:ring-zinc-900 focus-within:ring-offset-2 dark:focus-within:ring-zinc-300 ${disabled ? 'opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-950' : ''} ${className}`} ref={dropdownRef}>
      
      {/* Country Selector Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border-r border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-l-md shrink-0 focus:outline-none disabled:cursor-not-allowed"
      >
        <img 
          src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`} 
          srcSet={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png 2x`}
          width="20" 
          alt={selectedCountry.name} 
          className="h-3.5 object-cover rounded-[2px]" 
        />
        <ChevronDown className="w-4 h-4 opacity-50" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-11 left-0 z-50 w-64 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
          <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Chercher un pays..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-[250px] overflow-y-auto p-1">
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-sm text-zinc-500">Aucun résultat.</div>
            ) : (
              filteredCountries.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <img 
                      src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} 
                      srcSet={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png 2x`}
                      width="20" 
                      alt={country.name} 
                      className="h-3.5 object-cover rounded-[2px]" 
                    />
                    <span className="text-zinc-900 dark:text-zinc-100">{country.name}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400">{country.dialCode}</span>
                    <Check className={`h-4 w-4 ${selectedCountry.code === country.code ? 'opacity-100 text-zinc-900 dark:text-white' : 'opacity-0'}`} />
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
        className="flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-zinc-500 min-w-0 disabled:cursor-not-allowed"
      />
    </div>
  );
}
