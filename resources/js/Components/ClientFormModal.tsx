import React, { useState } from 'react';
import { Client } from '../types';
import { X, UserPlus, Check } from 'lucide-react';

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (clientData: Omit<Client, 'id' | 'created_at' | 'total_invoiced' | 'total_paid' | 'balance_due'>) => void;
}

export default function ClientFormModal({ isOpen, onClose, onSave }: ClientFormModalProps) {
    if (!isOpen) return null;

    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [taxId, setTaxId] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            company_name: companyName.trim() || undefined,
            email,
            phone,
            address,
            tax_id: taxId.trim() || undefined,
            notes: notes.trim() || undefined,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto text-slate-900">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Nouveau Client</h2>
                            <p className="text-xs text-slate-500 font-medium">Ajouter les coordonnées d'un nouveau client.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nom du contact *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Jean Kouassi"
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Raison sociale / Entreprise</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Ex: Ivoire Tech SARL"
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Adresse Email *</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="client@exemple.ci"
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone *</label>
                            <input
                                type="text"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+225 07 00 00 00 00"
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Adresse géographique / Ville *</label>
                        <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Ex: Cocody Angré, Abidjan"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Identifiant Fiscal / N° CC (optionnel)</label>
                        <input
                            type="text"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            placeholder="Ex: NCC 1928374 A"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                        >
                            <Check size={16} />
                            <span>Enregistrer le Client</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
