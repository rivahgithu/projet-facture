import React, { useState, useEffect } from 'react';
import { Quote, Client, Product, DocumentItem, QuoteStatus } from '../types';
import { formatCurrency } from '../utils';
import { X, Plus, Trash2, FileText, Check } from 'lucide-react';
import ClientSearchSelect from './ClientSearchSelect';

interface QuoteFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        quoteData: Omit<Quote, 'id' | 'converted_invoice_id'>,
        editingId?: number
    ) => void;
    clients: Client[];
    products: Product[];
    currency: string;
    quoteToEdit?: Quote | null;
}

export default function QuoteFormModal({
    isOpen,
    onClose,
    onSave,
    clients,
    products,
    currency,
    quoteToEdit,
}: QuoteFormModalProps) {
    if (!isOpen) return null;

    const [selectedClientId, setSelectedClientId] = useState<number>(clients[0]?.id || 1);
    const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [validUntil, setValidUntil] = useState<string>(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [status, setStatus] = useState<QuoteStatus>('envoyé');
    const [notes, setNotes] = useState<string>(
        'Conditions : Proposition commerciale valable 30 jours. Acompte de 40% au démarrage des travaux, solde à la livraison conforme.'
    );

    // Multi-line items state
    const [items, setItems] = useState<DocumentItem[]>([
        {
            id: 'qitem-1',
            product_id: products[0]?.id || 1,
            description: products[0]?.name || 'Prestation de service',
            quantity: 1,
            unit: products[0]?.unit || 'Prestation',
            unit_price: products[0]?.unit_price || 350000,
            discount_rate: 0,
            tax_rate: 18,
            line_total: Math.round((products[0]?.unit_price || 350000) * 1.18),
        },
    ]);

    useEffect(() => {
        if (quoteToEdit) {
            setSelectedClientId(quoteToEdit.client_id);
            setIssueDate(quoteToEdit.issue_date);
            setValidUntil(quoteToEdit.valid_until);
            setStatus(quoteToEdit.status);
            setNotes(
                quoteToEdit.notes ||
                'Conditions : Proposition commerciale valable 30 jours. Acompte de 40% au démarrage des travaux, solde à la livraison conforme.'
            );
            if (quoteToEdit.items && quoteToEdit.items.length > 0) {
                setItems(quoteToEdit.items);
            }
        } else {
            setSelectedClientId(clients[0]?.id || 1);
            setIssueDate(new Date().toISOString().split('T')[0]);
            setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
            setStatus('envoyé');
            setNotes(
                'Conditions : Proposition commerciale valable 30 jours. Acompte de 40% au démarrage des travaux, solde à la livraison conforme.'
            );
            setItems([
                {
                    id: 'qitem-1',
                    product_id: products[0]?.id || 1,
                    description: products[0]?.name || 'Prestation de service',
                    quantity: 1,
                    unit: products[0]?.unit || 'Prestation',
                    unit_price: products[0]?.unit_price || 350000,
                    discount_rate: 0,
                    tax_rate: 18,
                    line_total: Math.round((products[0]?.unit_price || 350000) * 1.18),
                },
            ]);
        }
    }, [isOpen, quoteToEdit]);

    const handleAddItem = () => {
        const defaultProd = products[0];
        setItems([
            ...items,
            {
                id: `qitem-${Date.now()}`,
                product_id: defaultProd?.id || 1,
                description: defaultProd?.name || 'Nouvelle prestation',
                quantity: 1,
                unit: defaultProd?.unit || 'Prestation',
                unit_price: defaultProd?.unit_price || 200000,
                discount_rate: 0,
                tax_rate: 18,
                line_total: Math.round((defaultProd?.unit_price || 200000) * 1.18),
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length <= 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof DocumentItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        const q = Number(newItems[index].quantity) || 0;
        const p = Number(newItems[index].unit_price) || 0;
        const disc = Number(newItems[index].discount_rate) || 0;
        const tax = Number(newItems[index].tax_rate) || 0;

        const basePrice = q * p * (1 - disc / 100);
        const lineTotal = basePrice * (1 + tax / 100);

        newItems[index].line_total = Math.round(lineTotal);
        setItems(newItems);
    };

    const handleProductSelect = (index: number, productId: number) => {
        const prod = products.find((p) => p.id === productId);
        if (!prod) return;

        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            product_id: prod.id,
            description: prod.description || prod.name,
            unit: prod.unit,
            unit_price: prod.unit_price,
            tax_rate: prod.tax_rate,
            line_total: Math.round(prod.unit_price * (1 + prod.tax_rate / 100)),
        };
        setItems(newItems);
    };

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
    const discountTotal = items.reduce(
        (acc, item) => acc + item.quantity * item.unit_price * (item.discount_rate / 100),
        0
    );
    const taxTotal = items.reduce((acc, item) => {
        const base = item.quantity * item.unit_price * (1 - item.discount_rate / 100);
        return acc + base * (item.tax_rate / 100);
    }, 0);
    const total = Math.round(subtotal - discountTotal + taxTotal);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const client = clients.find((c) => c.id === selectedClientId) || clients[0];

        onSave(
            {
                quote_number: quoteToEdit ? quoteToEdit.quote_number : `DEV-2026-${Math.floor(100 + Math.random() * 900)}`,
                client_id: client.id,
                client_name: client.company_name || client.name,
                status,
                issue_date: issueDate,
                valid_until: validUntil,
                currency,
                items,
                subtotal,
                discount_total: discountTotal,
                tax_total: Math.round(taxTotal),
                total,
                notes,
            },
            quoteToEdit ? quoteToEdit.id : undefined
        );

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-900">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                                {quoteToEdit ? `Modifier le Devis ${quoteToEdit.quote_number}` : 'Créer un nouveau Devis'}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {quoteToEdit
                                    ? `Modification des prestations, validité et conditions du devis ${quoteToEdit.client_name}.`
                                    : 'Préparez votre proposition commerciale avec calculs automatiques HT, TVA et TTC.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Header info */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50/80 p-4 border border-slate-200/80 rounded-2xl">
                        <ClientSearchSelect
                            clients={clients}
                            selectedClientId={selectedClientId}
                            onChange={(id) => setSelectedClientId(id)}
                        />

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Date d'émission *</label>
                            <input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Date de validité *</label>
                            <input
                                type="date"
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Statut du devis *</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                            >
                                <option value="brouillon">Brouillon</option>
                                <option value="envoyé">Envoyé</option>
                                <option value="accepté">Accepté</option>
                                <option value="refusé">Refusé</option>
                                <option value="expiré">Expiré</option>
                            </select>
                        </div>
                    </div>

                    {/* Prestations Table */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                                Lignes de prestation / produits
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold border border-indigo-200 transition flex items-center gap-1"
                            >
                                <Plus size={14} />
                                <span>Ajouter une ligne</span>
                            </button>
                        </div>

                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                            <th className="p-3">Produit / Prestation</th>
                                            <th className="p-3 w-20 text-center">Qté</th>
                                            <th className="p-3 w-24">Unité</th>
                                            <th className="p-3 w-32 text-right">Prix Unit. HT</th>
                                            <th className="p-3 w-20 text-center">Remise %</th>
                                            <th className="p-3 w-20 text-center">TVA %</th>
                                            <th className="p-3 w-32 text-right">Total HT</th>
                                            <th className="p-3 w-12 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50">
                                                <td className="p-3">
                                                    <div className="space-y-1.5">
                                                        <select
                                                            onChange={(e) => handleProductSelect(index, Number(e.target.value))}
                                                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-none"
                                                            defaultValue=""
                                                        >
                                                            <option value="" disabled>Sélectionner du catalogue...</option>
                                                            {products.map((p) => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                            placeholder="Description détaillée de la prestation..."
                                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                                                            required
                                                        />
                                                    </div>
                                                </td>

                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center font-bold text-slate-900 focus:outline-none font-mono"
                                                        required
                                                    />
                                                </td>

                                                <td className="p-3">
                                                    <input
                                                        type="text"
                                                        value={item.unit}
                                                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                                                        placeholder="Prestation"
                                                    />
                                                </td>

                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={item.unit_price}
                                                        onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                                                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-right font-bold text-slate-900 focus:outline-none font-mono"
                                                        required
                                                    />
                                                </td>

                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={item.discount_rate}
                                                        onChange={(e) => handleItemChange(index, 'discount_rate', Number(e.target.value))}
                                                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center text-slate-900 focus:outline-none font-mono"
                                                    />
                                                </td>

                                                <td className="p-3">
                                                    <select
                                                        value={item.tax_rate}
                                                        onChange={(e) => handleItemChange(index, 'tax_rate', Number(e.target.value))}
                                                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center text-slate-900 focus:outline-none font-mono"
                                                    >
                                                        <option value={0}>0%</option>
                                                        <option value={9}>9%</option>
                                                        <option value={18}>18%</option>
                                                    </select>
                                                </td>

                                                <td className="p-3 text-right font-black text-slate-900 font-mono">
                                                    {formatCurrency(item.quantity * item.unit_price * (1 - item.discount_rate / 100), currency)}
                                                </td>

                                                <td className="p-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(index)}
                                                        disabled={items.length <= 1}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg transition"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Totals & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Notes & Conditions de l'offre
                            </label>
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 leading-relaxed"
                                placeholder="Conditions de validité, acompte, délais de livraison..."
                            />
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                            <div className="flex justify-between text-slate-500 font-medium">
                                <span>Sous-total HT :</span>
                                <span className="font-mono text-slate-800 font-bold">{formatCurrency(subtotal, currency)}</span>
                            </div>
                            {discountTotal > 0 && (
                                <div className="flex justify-between text-emerald-600 font-medium">
                                    <span>Remise commerciale :</span>
                                    <span className="font-mono font-bold">-{formatCurrency(discountTotal, currency)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-500 font-medium">
                                <span>TVA ({items[0]?.tax_rate || 18}%) :</span>
                                <span className="font-mono text-slate-800 font-bold">{formatCurrency(taxTotal, currency)}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                                <span>TOTAL TTC :</span>
                                <span className="font-mono text-indigo-700 text-base">{formatCurrency(total, currency)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
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
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
                        >
                            <Check size={16} />
                            <span>{quoteToEdit ? 'Mettre à jour le Devis' : 'Enregistrer le Devis'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
