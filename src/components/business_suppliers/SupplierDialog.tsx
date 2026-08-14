import { useState, useEffect } from 'react';
import { X, Building2, Phone, Mail, MapPin, Globe, Instagram, Facebook, Link as LinkIcon, User } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { BusinessSupplier } from '@/types';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { AvatarUpload } from '@/components/ui/AvatarUpload';

interface SupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: BusinessSupplier | null;
}

export default function SupplierDialog({ isOpen, onClose, supplier }: SupplierDialogProps) {
  const addSupplier = useStore((s) => s.addBusinessSupplier);
  const updateSupplier = useStore((s) => s.updateBusinessSupplier);
  
  const [formData, setFormData] = useState({
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
  });

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
          isWhatsappSameAsPhone: supplier.whatsapp === supplier.phone && !!supplier.phone
        });
      } else {
        setFormData({
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
          merchandiseType: 'physical',
          isWhatsappSameAsPhone: false
        });
      }
    }
  }, [isOpen, supplier]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandName.trim()) {
      toast.error('La marque du fournisseur est obligatoire');
      return;
    }

    const fullContactName = formData.contactFirstName.trim() || formData.contactLastName.trim()
      ? `${formData.contactFirstName.trim()} ${formData.contactLastName.trim()}`.trim()
      : undefined;

    const payload = {
      brandName: formData.brandName.trim(),
      avatarUrl: formData.avatarUrl || undefined,
      contactName: fullContactName,
      contactFirstName: formData.contactFirstName.trim() || undefined,
      contactLastName: formData.contactLastName.trim() || undefined,
      phone: formData.phone || '',
      whatsapp: formData.isWhatsappSameAsPhone ? formData.phone : (formData.whatsapp || undefined),
      city: formData.city || undefined,
      address: formData.address || undefined,
      email: formData.email || undefined,
      website: formData.website || undefined,
      socialLinks: {
        insta: formData.insta || undefined,
        fb: formData.fb || undefined,
        tiktok: formData.tiktok || undefined,
        other: formData.other || undefined,
      },
      merchandiseType: formData.merchandiseType || undefined,
    };

    if (supplier) {
      updateSupplier(supplier.id, payload);
      toast.success('Fournisseur modifié');
    } else {
      addSupplier(payload);
      toast.success('Fournisseur ajouté');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:block p-4 sm:p-0">
      <div className="absolute sm:fixed inset-0 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative sm:fixed sm:inset-y-0 sm:right-0 z-10 bg-white dark:bg-zinc-900 w-full max-w-md sm:max-w-none sm:w-[50%] rounded-3xl sm:rounded-none sm:rounded-l-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none sm:h-full animate-in fade-in sm:slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            {supplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
          </h2>
          <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
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
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Nom de la Marque *</label>
                <Input
                  type="text"
                  required
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="mt-1"
                  placeholder="Ex: Zara"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Type de marchandise *</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 w-full h-[42px]">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, merchandiseType: 'physical'})}
                    className={`flex-1 text-xs font-medium rounded-md transition-colors ${formData.merchandiseType === 'physical' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                  >
                    Physique
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, merchandiseType: 'digital'})}
                    className={`flex-1 text-xs font-medium rounded-md transition-colors ${formData.merchandiseType === 'digital' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                  >
                    Digital
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* Contact Person */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                Contact Responsable
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Prénom du contact</label>
                  <Input
                    type="text"
                    value={formData.contactFirstName}
                    onChange={(e) => setFormData({ ...formData, contactFirstName: e.target.value })}
                    className="mt-1"
                    placeholder="Ex: Mehdi"
                    iconLeft={<User className="w-4 h-4" />}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Nom du contact (optionnel)</label>
                  <Input
                    type="text"
                    value={formData.contactLastName}
                    onChange={(e) => setFormData({ ...formData, contactLastName: e.target.value })}
                    className="mt-1"
                    placeholder="Ex: Alaoui"
                    iconLeft={<User className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Téléphone</label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(val) => setFormData({ ...formData, phone: val })}
                  placeholder="Ex: 6 12 34 56 78"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">WhatsApp (Optionnel)</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.isWhatsappSameAsPhone}
                      onChange={(e) => {
                        const isSame = e.target.checked;
                        setFormData({ 
                          ...formData, 
                          isWhatsappSameAsPhone: isSame,
                          whatsapp: isSame ? formData.phone : formData.whatsapp
                        });
                      }}
                    />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-violet-600"></div>
                    <span className="ml-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">Identique au téléphone</span>
                  </label>
                </div>
                <PhoneInput
                  value={formData.isWhatsappSameAsPhone ? formData.phone : formData.whatsapp}
                  onChange={(val) => !formData.isWhatsappSameAsPhone && setFormData({ ...formData, whatsapp: val })}
                  placeholder="Numéro WhatsApp"
                  disabled={formData.isWhatsappSameAsPhone}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Email (Optionnel)</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                  placeholder="Ex: contact@zara.com"
                  iconLeft={<Mail className="w-4 h-4" />}
                />
              </div>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                Localisation
              </h3>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Ville (Optionnelle)</label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1"
                  placeholder="Ex: Casablanca"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Adresse (Optionnelle)</label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1"
                  placeholder="Ex: 123 Bd Anfa"
                />
              </div>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* Online Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                Présence en ligne
              </h3>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Site Web (Optionnel)</label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="mt-1"
                  placeholder="Ex: https://zara.com"
                  iconLeft={<Globe className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Instagram (Optionnel)</label>
                <Input
                  type="text"
                  value={formData.insta}
                  onChange={(e) => setFormData({ ...formData, insta: e.target.value })}
                  className="mt-1"
                  placeholder="Lien ou @pseudo"
                  iconLeft={<Instagram className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Facebook (Optionnel)</label>
                <Input
                  type="text"
                  value={formData.fb}
                  onChange={(e) => setFormData({ ...formData, fb: e.target.value })}
                  className="mt-1"
                  placeholder="Lien de la page"
                  iconLeft={<Facebook className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">TikTok (Optionnel)</label>
                <Input
                  type="text"
                  value={formData.tiktok}
                  onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                  className="mt-1"
                  placeholder="Lien ou @pseudo"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Autre lien (Optionnel)</label>
                <Input
                  type="url"
                  value={formData.other}
                  onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                  className="mt-1"
                  placeholder="Autre lien pertinent"
                  iconLeft={<LinkIcon className="w-4 h-4" />}
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="supplier-form"
            className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
          >
            {supplier ? 'Enregistrer' : 'Créer'}
          </button>
        </div>

      </div>
    </div>
  );
}
