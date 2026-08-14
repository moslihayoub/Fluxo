'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Link as LinkIcon, Trash2, User, Building2, Image as ImageIcon, X, Check } from 'lucide-react';
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
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [modalUrlInput, setModalUrlInput] = useState('');
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
      toast.error("L'image ne doit pas dépasser 2 Mo");
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

  const handleOpenUrlModal = () => {
    setModalUrlInput(value && !value.startsWith('data:') ? value : '');
    setIsUrlModalOpen(true);
  };

  const handleSaveUrlModal = () => {
    const trimmed = modalUrlInput.trim();
    if (trimmed) {
      onChange(trimmed);
      toast.success('Lien image enregistré');
    }
    setIsUrlModalOpen(false);
  };

  const handleRemove = () => {
    onChange('');
    setModalUrlInput('');
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

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 mt-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          Importer
        </button>

        <button
          type="button"
          onClick={handleOpenUrlModal}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-xs ${
            value.startsWith('http')
              ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800'
              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
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

      {/* Modal Dialog for Image URL */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setIsUrlModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Lien de l'image</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Collez l'URL directe d'une image hébergée en ligne (LinkedIn, Cloudinary, AWS S3, etc.) :
            </p>

            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={modalUrlInput}
              onChange={(e) => setModalUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveUrlModal();
                }
              }}
              autoFocus
              className="w-full h-10 px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4"
            />

            {modalUrlInput.trim() && (
              <div className="mb-4 p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={modalUrlInput}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Aperçu du lien</p>
                  <p className="text-[10px] text-zinc-400 truncate">{modalUrlInput}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveUrlModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
