'use client';

import { useState, useEffect } from 'react';
import { X, Building2, Phone, Mail, MapPin, Globe, Instagram, Facebook, Link as LinkIcon, User, Loader2, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { BusinessSupplier } from '@/types';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { CityInput } from '@/components/ui/CityInput';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { AvatarUpload } from '@/components/ui/AvatarUpload';

interface SupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: BusinessSupplier | null;
}

const INITIAL_STATE = {
  brandName: '',
  avatarUrl: '',
  contactFirstName: '',
  contactLastName: '',
  phone: '',
  whatsapp: '',
  city: '',
  address: '',
  email: '',
  website: '',
  insta: '',
  fb: '',
  tiktok: '',
  other: '',
  merchandiseType: 'physical' as 'physical' | 'digital',
  isWhatsappSameAsPhone: false,
};

export default function SupplierDialog({ isOpen, onClose, supplier }: SupplierDialogProps) {
  const addSupplier = useStore((s) => s.addBusinessSupplier);
  const updateSupplier = useStore((s) => s.updateBusinessSupplier);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_STATE);

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        let fName = supplier.contactFirstName || '';
        let lName = supplier.contactLastName || '';
        if (!fName && supplier.contactName) {
          const parts = supplier.contactName.trim().split(' ');
          fName = parts[0] || '';
          lName = parts.slice(1).join(' ') || '';
        }
        setFormData({
          brandName: supplier.brandName || '',
          avatarUrl: supplier.avatarUrl || '',
          contactFirstName: fName,
          contactLastName: lName,
          phone: supplier.phone || '',
          whatsapp: supplier.whatsapp || '',
          city: supplier.city || '',
          address: supplier.address || '',
          email: supplier.email || '',
          website: supplier.website || '',
          insta: supplier.socialLinks?.insta || '',
          fb: supplier.socialLinks?.fb || '',
          tiktok: supplier.socialLinks?.tiktok || '',
          other: supplier.socialLinks?.other || '',
          merchandiseType: (supplier.merchandiseType as 'physical' | 'digital') || 'physical',
          isWhatsappSameAsPhone: supplier.whatsapp === supplier.phone && !!supplier.phone,
        });
      } else {
        setFormData(INITIAL_STATE);
      }
    }
  }, [isOpen, supplier]);

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData(INITIAL_STATE);
    setIsSubmitting(false);
    onClose();
  };

  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({
      ...prev,
      phone,
      whatsapp: prev.isWhatsappSameAsPhone ? phone : prev.whatsapp
    }));
  };

  const handleWhatsappToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isWhatsappSameAsPhone: checked,
      whatsapp: checked ? prev.phone : ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.brandName.trim()) {
      toast.error('Le nom de la marque est obligatoire');
      return;
    }

    setIsSubmitting(true);

    try {
      const rawBrand = formData.brandName.trim();
      const rawPhone = formData.phone ? formData.phone.trim() : '';
      const rawWhatsapp = formData.isWhatsappSameAsPhone ? rawPhone : (formData.whatsapp ? formData.whatsapp.trim() : undefined);
      const rawEmail = formData.email ? formData.email.trim() : undefined;
      const rawCity = formData.city ? formData.city.trim() : undefined;
      const rawAddress = formData.address ? formData.address.trim() : undefined;
      const rawWebsite = formData.website ? formData.website.trim() : undefined;
      const rawFname = formData.contactFirstName ? formData.contactFirstName.trim() : undefined;
      const rawLname = formData.contactLastName ? formData.contactLastName.trim() : undefined;
      const fullContact = (rawFname || rawLname) ? `${rawFname || ''} ${rawLname || ''}`.trim() : undefined;

      const socialLinks: any = {};
      if (formData.insta?.trim()) socialLinks.insta = formData.insta.trim();
      if (formData.fb?.trim()) socialLinks.fb = formData.fb.trim();
      if (formData.tiktok?.trim()) socialLinks.tiktok = formData.tiktok.trim();
      if (formData.other?.trim()) socialLinks.other = formData.other.trim();

      const payload: any = {
        brandName: rawBrand,
        avatarUrl: formData.avatarUrl?.trim() || undefined,
        contactName: fullContact,
        contactFirstName: rawFname,
        contactLastName: rawLname,
        phone: rawPhone,
        whatsapp: rawWhatsapp || undefined,
        city: rawCity,
        address: rawAddress,
        email: rawEmail || undefined,
        website: rawWebsite,
        merchandiseType: formData.merchandiseType || 'physical',
      };
      if (Object.keys(socialLinks).length > 0) {
        payload.socialLinks = socialLinks;
      }

      if (supplier) {
        updateSupplier(supplier.id, payload);
        toast.success('Fournisseur modifié avec succès');
      } else {
        addSupplier(payload);
        toast.success('Fournisseur ajouté avec succès');
      }

      handleClose();
    } catch (err: any) {
      console.error('Erreur enregistrement fournisseur:', err);
      toast.error(err?.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center sm:block p-4 sm:p-0">
      <div className="absolute sm:fixed inset-0 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleClose} />
      <div className="relative sm:fixed sm:inset-y-0 sm:right-0 z-10 bg-white dark:bg-zinc-900 w-full max-w-md sm:max-w-none sm:w-[50%] rounded-3xl sm:rounded-none sm:rounded-l-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none sm:h-full animate-in fade-in sm:slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {supplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <form id="supplier-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar with Dual Solution: Import or URL */}
            <div className="mb-4">
              <AvatarUpload
                value={formData.avatarUrl}
                onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                defaultIcon="building"
                shape="rounded"
              />
            </div>

            {/* Brand Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-500" />
                Informations Marque
              </h3>
              
              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Nom de la Marque *</label>
                <Input
                  type="text"
                  required
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="Ex: Zara, Apple, Supplier LLC"
                  enableCopy
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1.5">
                  Type de Marchandise
                </label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, merchandiseType: 'physical' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      formData.merchandiseType === 'physical'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    📦 Produit Physique
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, merchandiseType: 'digital' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      formData.merchandiseType === 'digital'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    ⚡ Digital / Service
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-violet-500" />
                Contact Commercial <span className="text-xs font-normal text-zinc-400">(Optionnel)</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                    Prénom <span className="text-zinc-400 font-normal lowercase">(optionnel)</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.contactFirstName}
                    onChange={(e) => setFormData({ ...formData, contactFirstName: e.target.value })}
                    placeholder="Ex: Youssef"
                    enableCopy
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                    Nom <span className="text-zinc-400 font-normal lowercase">(optionnel)</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.contactLastName}
                    onChange={(e) => setFormData({ ...formData, contactLastName: e.target.value })}
                    placeholder="Ex: Benani"
                    enableCopy
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                  Numéro Téléphone <span className="text-zinc-400 font-normal lowercase">(optionnel)</span>
                </label>
                <PhoneInput
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Ex: 6 00 00 00 00"
                  enableCopy
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                  WhatsApp <span className="text-zinc-400 font-normal lowercase">(optionnel)</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer select-none bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isWhatsappSameAsPhone}
                      onChange={(e) => handleWhatsappToggle(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="font-medium">Identique au numéro de téléphone</span>
                  </label>
                  {!formData.isWhatsappSameAsPhone && (
                    <PhoneInput
                      value={formData.whatsapp}
                      onChange={(whatsapp) => setFormData({ ...formData, whatsapp })}
                      placeholder="Ex: 6 00 00 00 00"
                      enableCopy
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                  Email <span className="text-zinc-400 font-normal lowercase">(optionnel)</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@fournisseur.com"
                  iconLeft={<Mail className="w-4 h-4" />}
                  enableCopy
                />
              </div>
            </div>

            {/* Localisation */}
            <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-500" />
                Localisation
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Ville</label>
                  <CityInput
                    value={formData.city}
                    onChange={(city) => setFormData({ ...formData, city })}
                    placeholder="Ex: Casablanca"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Adresse</label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Rue Commerciale"
                    enableCopy
                  />
                </div>
              </div>
            </div>

            {/* Links & Socials */}
            <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-500" />
                Liens & Réseaux Sociaux
              </h3>
              
              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Site Web</label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://fournisseur.com"
                  iconLeft={<Globe className="w-4 h-4" />}
                  enableCopy
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Instagram</label>
                  <Input
                    type="text"
                    value={formData.insta}
                    onChange={(e) => setFormData({ ...formData, insta: e.target.value })}
                    placeholder="@fournisseur"
                    iconLeft={<Instagram className="w-4 h-4" />}
                    enableCopy
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Facebook</label>
                  <Input
                    type="text"
                    value={formData.fb}
                    onChange={(e) => setFormData({ ...formData, fb: e.target.value })}
                    placeholder="Page Facebook"
                    iconLeft={<Facebook className="w-4 h-4" />}
                    enableCopy
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">TikTok</label>
                  <Input
                    type="text"
                    value={formData.tiktok}
                    onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                    placeholder="@pseudo"
                    enableCopy
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Autre lien</label>
                  <Input
                    type="url"
                    value={formData.other}
                    onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                    placeholder="Lien supplémentaire"
                    iconLeft={<LinkIcon className="w-4 h-4" />}
                    enableCopy
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-800/40">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="supplier-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-violet-600 dark:bg-violet-500 text-white rounded-xl font-bold hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : supplier ? (
              <><CheckCircle2 className="w-4 h-4" /> Enregistrer</>
            ) : (
              <><Building2 className="w-4 h-4" /> Créer</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
