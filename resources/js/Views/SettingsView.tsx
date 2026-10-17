import React, { useState } from 'react';
import { Company } from '../types';
import { Building2, Save, CheckCircle2, CreditCard, Upload, Image as ImageIcon } from 'lucide-react';

interface SettingsViewProps {
    company: Company;
    onSaveCompany: (updated: Company, logoFile?: File | null) => void;
}

export default function SettingsView({ company, onSaveCompany }: SettingsViewProps) {
    const [name, setName] = useState(company.name);
    const [legalName, setLegalName] = useState(company.legal_name || '');
    const [email, setEmail] = useState(company.email);
    const [phone, setPhone] = useState(company.phone);
    const [address, setAddress] = useState(company.address);
    const [taxId, setTaxId] = useState(company.tax_id || '');
    const [currency, setCurrency] = useState(company.currency);
    const [invoicePrefix, setInvoicePrefix] = useState(company.invoice_prefix);
    const [quotePrefix, setQuotePrefix] = useState(company.quote_prefix);
    const [paymentTerms, setPaymentTerms] = useState(company.payment_terms);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(company.logo_url || null);
    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveCompany({
            ...company,
            name,
            legal_name: legalName,
            email,
            phone,
            address,
            tax_id: taxId,
            currency,
            invoice_prefix: invoicePrefix,
            quote_prefix: quotePrefix,
            payment_terms: Number(paymentTerms),
            logo_url: logoPreview || company.logo_url,
        }, logoFile);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Paramètres de l'Entreprise</h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Configurez votre raison sociale, devise (FCFA), préfixes et mentions légales.
                    </p>
                </div>
            </div>

            {isSaved && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>Les paramètres de l'entreprise ont été enregistrés avec succès.</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Information Entreprise */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Building2 size={16} className="text-indigo-600" />
                        Identité commerciale & Coordonnées
                    </h2>

                    {/* Logo Entreprise Widget */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 shadow-xs overflow-hidden">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Logo entreprise"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                    {name ? name.slice(0, 2).toUpperCase() : 'RI'}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1 flex-1">
                            <label className="block text-xs font-bold text-slate-800">
                                Logo officiel de l'entreprise
                            </label>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Ce logo s'affiche dans votre barre de navigation et sur tous vos devis & factures.
                            </p>
                            <div className="pt-1 flex flex-wrap items-center gap-2">
                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer shadow-xs transition">
                                    <Upload size={13} className="text-indigo-600" />
                                    <span>{logoPreview ? 'Changer le logo' : 'Importer un logo'}</span>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setLogoFile(file);
                                                setLogoPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="sr-only"
                                    />
                                </label>
                                {logoFile && (
                                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                        ✓ Nouveau logo sélectionné : {logoFile.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nom commercial *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Raison sociale (Légale)</label>
                            <input
                                type="text"
                                value={legalName}
                                onChange={(e) => setLegalName(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Email de contact *</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone *</label>
                            <input
                                type="text"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Adresse complète *</label>
                            <input
                                type="text"
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Identifiant Fiscal / N° CC</label>
                            <input
                                type="text"
                                value={taxId}
                                onChange={(e) => setTaxId(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Devise & Numérotation */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <CreditCard size={16} className="text-indigo-600" />
                        Facturation & Numérotation
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Devise principale *</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="FCFA">FCFA (XOF - Franc CFA)</option>
                                <option value="EUR">EUR (€ - Euro)</option>
                                <option value="USD">USD ($ - US Dollar)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Préfixe Factures</label>
                            <input
                                type="text"
                                value={invoicePrefix}
                                onChange={(e) => setInvoicePrefix(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Préfixe Devis</label>
                            <input
                                type="text"
                                value={quotePrefix}
                                onChange={(e) => setQuotePrefix(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
                    >
                        <Save size={16} />
                        <span>Enregistrer les modifications</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
