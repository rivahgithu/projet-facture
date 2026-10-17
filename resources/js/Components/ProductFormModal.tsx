import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, PackagePlus, Check, Pencil } from 'lucide-react';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: Omit<Product, 'id'>, editingId?: number) => void;
    currency: string;
    initialProduct?: Product | null;
}

export default function ProductFormModal({
    isOpen,
    onClose,
    onSave,
    currency,
    initialProduct,
}: ProductFormModalProps) {
    if (!isOpen) return null;

    const [name, setName] = useState(initialProduct?.name || '');
    const [reference, setReference] = useState(initialProduct?.reference || '');
    const [description, setDescription] = useState(initialProduct?.description || '');
    const [unit, setUnit] = useState(initialProduct?.unit || 'Prestation');
    const [unitPrice, setUnitPrice] = useState<number>(initialProduct?.unit_price ?? 250000);
    const [taxRate, setTaxRate] = useState<number>(initialProduct?.tax_rate ?? 18);

    useEffect(() => {
        if (initialProduct) {
            setName(initialProduct.name);
            setReference(initialProduct.reference || '');
            setDescription(initialProduct.description || '');
            setUnit(initialProduct.unit || 'Prestation');
            setUnitPrice(initialProduct.unit_price);
            setTaxRate(initialProduct.tax_rate);
        } else {
            setName('');
            setReference('');
            setDescription('');
            setUnit('Prestation');
            setUnitPrice(250000);
            setTaxRate(18);
        }
    }, [initialProduct, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(
            {
                name,
                reference: reference.trim() || undefined,
                description,
                unit,
                unit_price: Number(unitPrice),
                tax_rate: Number(taxRate),
                is_active: true,
            },
            initialProduct ? initialProduct.id : undefined
        );
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto text-slate-900">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                            {initialProduct ? <Pencil size={20} /> : <PackagePlus size={20} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                                {initialProduct ? 'Modifier le Produit / Service' : 'Nouveau Produit / Service'}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                {initialProduct ? 'Mettre à jour les informations du catalogue.' : 'Ajouter un article au catalogue.'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nom du service / produit *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Audit de Sécurité Web"
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Référence (SKU)</label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="Ex: AUDIT-SEC-01"
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Description détaillée *</label>
                        <textarea
                            rows={3}
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descriptif de la prestation..."
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Prix Unitaire ({currency}) *</label>
                            <input
                                type="number"
                                required
                                min={0}
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(Number(e.target.value))}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Unité *</label>
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="Prestation">Prestation</option>
                                <option value="Projet">Projet</option>
                                <option value="Mois">Mois</option>
                                <option value="Heure">Heure</option>
                                <option value="Jour">Jour</option>
                                <option value="Unité">Unité</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Taux TVA (%) *</label>
                            <input
                                type="number"
                                required
                                value={taxRate}
                                onChange={(e) => setTaxRate(Number(e.target.value))}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <Check size={16} />
                            <span>{initialProduct ? 'Enregistrer les modifications' : 'Ajouter au Catalogue'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
