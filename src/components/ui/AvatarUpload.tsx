'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Link as LinkIcon, Trash2, User, Building2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  defaultIcon?: 'user' | 'building' | 'image';
  label?: string;
  shape?: 'circle' | 'rounded';
}

export function AvatarUpload({
  value = '',
  onChange,
  defaultIcon = 'user',
  label = 'Photo / Avatar',
  shape = 'circle',
}: AvatarUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image valide');
      return;
    }

    // 2MB max
    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2 Mo');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onChange(base64);
      toast.success('Image importée');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange(trimmed);
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const IconComponent = defaultIcon === 'building' ? Building2 : defaultIcon === 'image' ? ImageIcon : User;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Avatar Preview */}
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <div
          className={`relative w-20 h-20 bg-white dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden shadow-sm transition-all group-hover:border-violet-500 dark:group-hover:border-violet-400 ${
            shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
          }`}
        >
          {value ? (
            <img src={value} alt="Aperçu" className="w-full h-full object-cover" />
          ) : (
            <IconComponent className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
          )}

          <div
            className={`absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity ${
              shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
            }`}
          >
            <Camera className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-medium">Changer</span>
          </div>
        </div>
      </div>

      {/* Action Buttons / Toggles */}
      <div className="flex items-center gap-1.5 mt-3">
        <button
          type="button"
          onClick={() => {
            setMode('upload');
            fileInputRef.current?.click();
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            mode === 'upload' && !value.startsWith('http')
              ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Importer
        </button>

        <button
          type="button"
          onClick={() => setMode('url')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            mode === 'url' || value.startsWith('http')
              ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          Lien URL
        </button>

        {value && (
          <button
            type="button"
            onClick={handleRemove}
            title="Supprimer la photo"
            className="p-1.5 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* URL Input Mode */}
      {mode === 'url' && (
        <div className="w-full mt-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <input
            type="url"
            placeholder="Coller l'URL de l'image (ex: https://...)"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              onChange(e.target.value);
            }}
            onBlur={handleUrlSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUrlSubmit(e);
              }
            }}
            className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      )}
    </div>
  );
}
