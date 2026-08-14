'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { Image as ImageIcon, Plus, Trash2, Building2, Globe, Calculator, FileText, Settings2, CreditCard, Database, Terminal, Layers, Mail, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateId } from '@/lib/utils';
import { COUNTRIES, CURRENCIES } from '@/lib/data';
import type { LegalIdentifier, TaxMode } from '@/types';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { CityInput } from '@/components/ui/CityInput';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { ScrollReveal } from '@/components/ui/Animation';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import AdminLogsView from '@/components/admin/AdminLogsView';
import AdminStackView from '@/components/admin/AdminStackView';

type Tab = 'profile' | 'localization' | 'fiscality' | 'documents' | 'advanced' | 'logs' | 'stack';

export default function BusinessSettingsView() {
  const { businessSettings, setBusinessSettings, businessProfileType, linkProGainsToPerso, setLinkProGainsToPerso, workspaceMode } = useStore();
  const isPersonal = workspaceMode === 'personal';
  
  const [activeTab, setActiveTab] = useState<Tab>(isPersonal ? 'localization' : 'profile');
  
  // Auto-switch to valid tab if current tab is not available in personal mode
  useEffect(() => {
    if (isPersonal && (activeTab === 'profile' || activeTab === 'fiscality' || activeTab === 'documents')) {
      setActiveTab('localization');
    }
  }, [isPersonal, activeTab]);
  
  // Profile
  const [companyName, setCompanyName] = useState(businessSettings.companyName || '');
  const [address, setAddress] = useState(businessSettings.address || '');
  const [city, setCity] = useState(businessSettings.city || '');
  const [country, setCountry] = useState(businessSettings.country || 'Maroc');
  const [phone, setPhone] = useState(businessSettings.phone || '');
  const [email, setEmail] = useState(businessSettings.email || '');
  const [logoBase64, setLogoBase64] = useState(businessSettings.logoBase64 || '');
  const [identifiers, setIdentifiers] = useState<LegalIdentifier[]>(
    businessSettings.identifiers || [
      { id: generateId(), label: 'ICE', value: '' },
      { id: generateId(), label: 'TVA', value: '' }
    ]
  );
  
  // Localization
  const [countryCode, setCountryCode] = useState(businessSettings.countryCode || 'MA');
  const [currency, setCurrency] = useState(businessSettings.currency || 'MAD');
  
  // Fiscality
  const [defaultTaxMode, setDefaultTaxMode] = useState<TaxMode>(businessSettings.defaultTaxMode || 'HT');
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(businessSettings.defaultTaxRate || 20);
  const [incomeTaxRateProduct, setIncomeTaxRateProduct] = useState<number>(businessSettings.incomeTaxRateProduct || 0.5);
  const [incomeTaxRateService, setIncomeTaxRateService] = useState<number>(businessSettings.incomeTaxRateService || 1.0);
  
  // Documents
  const [invoiceFooterText, setInvoiceFooterText] = useState(businessSettings.invoiceFooterText || '');
  const [legalNotice, setLegalNotice] = useState(businessSettings.legalNotice || '');
  const [paymentInstructions, setPaymentInstructions] = useState(businessSettings.paymentInstructions || '');
  const [customPaymentMethods, setCustomPaymentMethods] = useState<string[]>(businessSettings.customPaymentMethods || []);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 2Mo');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIdentifier = () => {
    setIdentifiers([...identifiers, { id: generateId(), label: 'Nouveau', value: '' }]);
  };

  const handleUpdateIdentifier = (id: string, field: 'label' | 'value', newValue: string) => {
    setIdentifiers(identifiers.map(ident => 
      ident.id === id ? { ...ident, [field]: newValue } : ident
    ));
  };

  const handleRemoveIdentifier = (id: string) => {
    setIdentifiers(identifiers.filter(ident => ident.id !== id));
  };
  
  const handleAddPaymentMethod = () => {
    if (newPaymentMethod.trim() && !customPaymentMethods.includes(newPaymentMethod.trim())) {
      setCustomPaymentMethods([...customPaymentMethods, newPaymentMethod.trim()]);
      setNewPaymentMethod('');
    }
  };

  const handleRemovePaymentMethod = (method: string) => {
    setCustomPaymentMethods(customPaymentMethods.filter(m => m !== method));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusinessSettings({
        companyName,
        address,
        city,
        country,
        phone,
        email,
        logoBase64,
        identifiers: identifiers.filter(i => i.label.trim() !== '' || i.value.trim() !== ''),
        countryCode,
        currency,
        defaultTaxMode,
        defaultTaxRate,
        incomeTaxRateProduct,
        incomeTaxRateService,
        invoiceFooterText,
        legalNotice,
        paymentInstructions,
        customPaymentMethods
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [
    companyName, address, city, country, phone, email, logoBase64, identifiers, 
    countryCode, currency, defaultTaxMode, defaultTaxRate, 
    incomeTaxRateProduct, incomeTaxRateService, invoiceFooterText, legalNotice, paymentInstructions, customPaymentMethods,
    setBusinessSettings
  ]);

  const { user } = useAuth();
  const isDev = process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));
  const isAdmin = isDev || user?.email === 'moslihayoub@gmail.com' || (Boolean(user?.email) && user!.email!.includes('moslih'));

  const tabs = [
    ...(!isPersonal ? [
      { id: 'profile', label: 'Profil & Entreprise', icon: Building2 },
    ] : []),
    { id: 'localization', label: 'Pays & Devises', icon: Globe },
    ...(!isPersonal ? [
      { id: 'fiscality', label: 'Fiscalité & Taxes', icon: Calculator },
      { id: 'documents', label: 'Documents & Paiements', icon: FileText },
    ] : []),
    ...(isAdmin ? [
      { id: 'logs', label: 'Logs & Audit Système', icon: Terminal },
      { id: 'stack', label: 'Stack & Architecture AI', icon: Layers },
    ] : []),
    ...(isDev ? [{ id: 'advanced', label: 'Avancé & Données', icon: Database }] : []),
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6 animate-in fade-in duration-500 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings2 className="w-6 h-6" /> Hub de Paramétrage
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {isPersonal 
            ? 'Configurez vos préférences régionales et paramètres personnels.' 
            : 'Configurez votre environnement d\'entreprise (Identité, Fiscalité, Factures, Devises).'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 h-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal ${
                activeTab === tab.id 
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm min-h-[500px]">
          
          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <ScrollReveal className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">Identité Visuelle</h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <AvatarUpload
                    value={logoBase64}
                    onChange={setLogoBase64}
                    defaultIcon="building"
                    shape="rounded"
                    label="Logo Entreprise"
                  />
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Nom de l'entreprise</label>
                      <Input
                        type="text"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        placeholder="Fluxo LLC"
                        enableCopy
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">Coordonnées complètes</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Téléphone</label>
                    <PhoneInput
                      value={phone}
                      onChange={setPhone}
                      placeholder="Ex: 6 00 00 00 00"
                      enableCopy
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="contact@entreprise.com"
                      iconLeft={<Mail className="w-4 h-4" />}
                      enableCopy
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Adresse</label>
                    <Input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="123 Rue de la réussite..."
                      iconLeft={<MapPin className="w-4 h-4" />}
                      enableCopy
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Ville</label>
                    <CityInput
                      value={city}
                      onChange={setCity}
                      placeholder="Ex: Casablanca"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Pays</label>
                    <CountrySelect
                      value={country || 'Maroc'}
                      onChange={setCountry}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">Informations légales (ICE, SIRET...)</h2>
                <div className="space-y-3">
                  {identifiers.map(ident => (
                    <div key={ident.id} className="flex items-center gap-3">
                      <div className="w-1/3">
                        <Input type="text" value={ident.label} onChange={e => handleUpdateIdentifier(ident.id, 'label', e.target.value)} placeholder="Ex: ICE" className="font-medium" />
                      </div>
                      <div className="flex-1">
                        <Input type="text" value={ident.value} onChange={e => handleUpdateIdentifier(ident.id, 'value', e.target.value)} placeholder="000123456789000" className="font-mono" />
                      </div>
                      <button onClick={() => handleRemoveIdentifier(ident.id)} className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={handleAddIdentifier} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                    <Plus className="w-4 h-4" /> Ajouter un identifiant
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">Intégration avec l'espace Personnel</h2>
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Lier les bénéfices Pro au Perso</h3>
                    <p className="text-xs text-zinc-500">Ajoute automatiquement le profit net de l'activité Pro comme revenu dans votre tableau de bord Perso.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={linkProGainsToPerso} onChange={(e) => setLinkProGainsToPerso(e.target.checked)} />
                    <div className="relative w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
                  </label>
                </div>
              </div>

            </ScrollReveal>
          )}

          {/* TAB: LOCALIZATION */}
          {activeTab === 'localization' && (
            <ScrollReveal className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">Pays & Monnaie</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Pays d'opération</label>
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un pays..." />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Devise principale</label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une devise..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* TAB: FISCALITY */}
          {activeTab === 'fiscality' && (
            <ScrollReveal className="space-y-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-900/30">
                <p className="font-medium mb-1">Information fiscale : {businessProfileType === 'freelance' ? 'Auto-entrepreneur' : 'Société'}</p>
                {businessProfileType === 'freelance' 
                  ? "En tant qu'auto-entrepreneur (selon la loi marocaine), vous êtes hors champ de la TVA (0%). Vous payez un Impôt sur le Revenu (IR) basé sur votre chiffre d'affaires : 0.5% pour le commerce et 1% pour les services."
                  : "En tant que société, vous devez facturer la TVA à vos clients et déclarer votre TVA."
                }
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">TVA (Taxe sur la Valeur Ajoutée)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Régime de TVA par défaut</label>
                    <Select 
                      value={defaultTaxMode} 
                      onValueChange={(val) => setDefaultTaxMode(val as TaxMode)} 
                      disabled={businessProfileType === 'freelance'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir le régime..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HT">Hors Taxes (TVA non applicable)</SelectItem>
                        <SelectItem value="TVA">Assujetti à la TVA (Prix HT + TVA)</SelectItem>
                        <SelectItem value="TTC">Prix TTC (TVA incluse)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Taux de TVA par défaut (%)</label>
                    <Input 
                      type="number" 
                      value={defaultTaxRate} 
                      onChange={e => setDefaultTaxRate(Number(e.target.value))} 
                      disabled={businessProfileType === 'freelance' || defaultTaxMode === 'HT'}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">Impôt sur le Revenu (IR)</h2>
                <p className="text-sm text-zinc-500">Permet à l'application de calculer vos bénéfices nets réels en provisionnant cet impôt.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Taux IR pour Produits Physiques (%)</label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={incomeTaxRateProduct} 
                      onChange={e => setIncomeTaxRateProduct(Number(e.target.value))} 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Taux IR pour Services (%)</label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={incomeTaxRateService} 
                      onChange={e => setIncomeTaxRateService(Number(e.target.value))} 
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* TAB: DOCUMENTS */}
          {activeTab === 'documents' && (
            <ScrollReveal className="space-y-8">
              
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">Personnalisation des Documents</h2>
                
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Mention Légale Automatique</label>
                  <p className="text-xs text-zinc-500 mb-2">S'affichera en bas de vos factures si vous êtes hors champ de la TVA.</p>
                  <Input 
                    type="text" 
                    value={legalNotice} 
                    onChange={e => setLegalNotice(e.target.value)} 
                    placeholder="Ex: Exonéré de TVA - Auto-entrepreneur" 
                  />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Modalités de paiement (Ex: RIB Bancaire)</label>
                  <p className="text-xs text-zinc-500 mb-2">S'affichera sous le montant total si le client paie par virement.</p>
                  <textarea 
                    value={paymentInstructions} 
                    onChange={e => setPaymentInstructions(e.target.value)} 
                    placeholder="Banque Populaire&#10;RIB: 000 000 00000000000000 00" 
                    rows={3}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none text-sm" 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Pied de page (RIB, Conditions...)</label>
                  <textarea 
                    value={invoiceFooterText} 
                    onChange={e => setInvoiceFooterText(e.target.value)} 
                    placeholder="RIB: 000 000 00000000000000 00 | Merci pour votre confiance." 
                    rows={4}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <CreditCard className="w-5 h-5" /> Modes de Paiement Personnalisés
                </h2>
                <p className="text-sm text-zinc-500">Ajoutez des moyens de paiements spécifiques à votre activité (ex: PayPal, Wafacash, Stripe).</p>
                
                <div className="flex gap-2">
                  <Input 
                    type="text" 
                    value={newPaymentMethod} 
                    onChange={e => setNewPaymentMethod(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleAddPaymentMethod()}
                    placeholder="Nouveau moyen de paiement..." 
                  />
                  <button 
                    onClick={handleAddPaymentMethod}
                    className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors whitespace-nowrap"
                  >
                    Ajouter
                  </button>
                </div>
                
                {customPaymentMethods.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {customPaymentMethods.map((method, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-700 dark:text-zinc-300">
                        {method}
                        <button onClick={() => handleRemovePaymentMethod(method)} className="text-zinc-400 hover:text-rose-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </ScrollReveal>
          )}

          {/* TAB: ADVANCED */}
          {activeTab === 'advanced' && (
            <ScrollReveal className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">Données de test (Scénarios)</h2>
                <p className="text-sm text-zinc-500">Injectez des données fictives pour tester le Dashboard et les différents scénarios.</p>
                <button
                  onClick={() => {
                    const { addBusinessClient, addBusinessSupplier, addBusinessOrder, addOperation, addOperationType, operationTypes, activeMonthId } = useStore.getState();
                    addBusinessClient({
                      name: 'Test Client',
                      clientType: 'perso',
                      phone: '+212600000000'
                    });
                    addBusinessSupplier({
                      brandName: 'Test Supplier',
                      merchandiseType: 'physical',
                      phone: '+212600000000'
                    });
                    toast.success('Données de test injectées !');
                  }}
                  className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
                >
                  Générer des données fictives
                </button>
              </div>
            </ScrollReveal>
          )}

          {/* TAB: ADMIN LOGS */}
          {activeTab === 'logs' && <AdminLogsView />}

          {/* TAB: ADMIN STACK & ARCHITECTURE */}
          {activeTab === 'stack' && <AdminStackView />}
          
        </div>
      </div>
    </div>
  );
}
