import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Percent, Star } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { BusinessClient } from '@/types';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { CityInput } from '@/components/ui/CityInput';
import { AvatarUpload } from '@/components/ui/AvatarUpload';

interface ClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: BusinessClient | null;
}

export default function ClientDialog({ isOpen, onClose, client }: ClientDialogProps) {
  const addClient = useStore((s) => s.addBusinessClient);
  const updateClient = useStore((s) => s.updateBusinessClient);
  const businessProducts = useStore((s) => s.businessProducts) || [];
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    isVip: false,
    defaultDiscountRate: '',
    avatarUrl: '',
    freeProductIds: [] as string[],
    clientType: 'perso' as 'perso' | 'pro',
    city: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (client) {
        let fName = client.firstName || '';
        let lName = client.lastName || '';
        if (!fName && client.name) {
          const parts = client.name.trim().split(' ');
          fName = parts[0] || '';
          lName = parts.slice(1).join(' ') || '';
        }
        setFormData({
          firstName: fName,
          lastName: lName,
          phone: client.phone,
          email: client.email || '',
          address: client.address || '',
          isVip: client.isVip || false,
          defaultDiscountRate: client.defaultDiscountRate ? String(client.defaultDiscountRate) : '',
          avatarUrl: client.avatarUrl || '',
          freeProductIds: client.freeProductIds || [],
          clientType: client.clientType || 'perso',
          city: client.city || ''
        });
      } else {
        setFormData({ firstName: '', lastName: '', phone: '', email: '', address: '', isVip: false, defaultDiscountRate: '', avatarUrl: '', freeProductIds: [], clientType: 'perso', city: '' });
      }
    }
  }, [isOpen, client]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.phone) {
      toast.error('Le prénom et le téléphone sont obligatoires');
      return;
    }

    const fullName = formData.lastName.trim()
      ? `${formData.firstName.trim()} ${formData.lastName.trim()}`
      : formData.firstName.trim();

    const payload = {
      name: fullName,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim() || undefined,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address || undefined,
      isVip: formData.isVip,
      defaultDiscountRate: formData.defaultDiscountRate ? parseFloat(formData.defaultDiscountRate) : undefined,
      avatarUrl: formData.avatarUrl || undefined,
      freeProductIds: formData.freeProductIds.length > 0 ? formData.freeProductIds : undefined,
      clientType: formData.clientType,
      city: formData.city || undefined,
    };

    if (client) {
      updateClient(client.id, payload);
      toast.success('Client modifié');
    } else {
      addClient(payload);
      toast.success('Client ajouté');
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
            {client ? 'Modifier le client' : 'Nouveau client'}
          </h2>
          <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Avatar with Dual Solution: Import or URL */}
            <div className="mb-4">
              <AvatarUpload
                value={formData.avatarUrl}
                onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                defaultIcon="user"
                shape="circle"
              />
            </div>

            {/* Infos de base */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                    Prénom *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Ex: Youssef"
                    iconLeft={<User className="w-4 h-4" />}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                    Nom (optionnel)
                  </label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Ex: Benjelloun"
                    iconLeft={<User className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Téléphone *</label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(val) => setFormData({ ...formData, phone: val })}
                  placeholder="Ex: 6 12 34 56 78"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ex: email@domaine.com"
                  iconLeft={<Mail className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Type de Client</label>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-md p-1 w-full h-10 items-center">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, clientType: 'perso'})}
                      className={`flex-1 h-full text-xs font-medium rounded transition-colors flex items-center justify-center ${formData.clientType === 'perso' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      Perso
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, clientType: 'pro'})}
                      className={`flex-1 h-full text-xs font-medium rounded transition-colors flex items-center justify-center ${formData.clientType === 'pro' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      Pro
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Ville</label>
                  <CityInput
                    value={formData.city}
                    onChange={(city) => setFormData({ ...formData, city })}
                    placeholder="Ex: Casablanca"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Adresse</label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: 123 Rue Maarif"
                  iconLeft={<MapPin className="w-4 h-4" />}
                />
              </div>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800 my-4" />

            {/* Règles Commerciales */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Avantages Client</h3>
              
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${formData.isVip ? 'bg-amber-500 text-white' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500'}`}>
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-white text-sm">Client VIP</div>
                    <div className="text-xs text-zinc-500">Badge de fidélité spécial</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.isVip} onChange={e => setFormData({...formData, isVip: e.target.checked})} />
                  <div className="relative w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Promo Auto (Pourcentage)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.defaultDiscountRate}
                  onChange={(e) => setFormData({ ...formData, defaultDiscountRate: e.target.value })}
                  placeholder="Ex: 10 pour 10%"
                  iconLeft={<Percent className="w-4 h-4 text-emerald-500" />}
                />
                <p className="text-xs text-zinc-500 mt-1">S&apos;appliquera automatiquement à ses futures commandes.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2 block">
                  Produits Offerts
                </label>
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 max-h-40 overflow-y-auto">
                  {businessProducts.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-2">Aucun produit disponible</p>
                  ) : (
                    <div className="space-y-2">
                      {businessProducts.map(product => {
                        const isSelected = formData.freeProductIds.includes(product.id);
                        return (
                          <label key={product.id} className="flex items-center gap-3 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                            <div className="relative inline-flex items-center">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isSelected}
                                onChange={(e) => {
                                  const newIds = e.target.checked 
                                    ? [...formData.freeProductIds, product.id]
                                    : formData.freeProductIds.filter(id => id !== product.id);
                                  setFormData({ ...formData, freeProductIds: newIds });
                                }}
                              />
                              <div className="relative w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                              <span className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                                <Package className="w-4 h-4 text-zinc-400" />
                                {product.name}
                              </span>
                              <span className="text-xs text-zinc-500">{product.defaultPrice_cents.toFixed(2)} MAD</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-1">Ces produits seront facturés 0 MAD pour ce client.</p>
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
            form="client-form"
            className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
          >
            {client ? 'Enregistrer' : 'Créer'}
          </button>
        </div>

      </div>
    </div>
  );
}
