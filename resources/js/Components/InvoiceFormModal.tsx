import React, { useState, useEffect } from 'react';
import { Invoice, Client, Product, DocumentItem } from '../types';
import { formatCurrency } from '../utils';
import { X, Plus, Trash2, Check, FileText } from 'lucide-react';
import ClientSearchSelect from './ClientSearchSelect';

interface InvoiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        invoiceData: Omit<Invoice, 'id' | 'amount_paid' | 'balance_due' | 'payments'>,
        editingId?: number
    ) => void;
    clients: Client[];
    products: Product[];
    currency: string;
    invoiceToEdit?: Invoice | null;
}

export default function InvoiceFormModal({
    isOpen,
    onClose,
    onSave,
    clients,
    products,
    currency,
    invoiceToEdit,
}: InvoiceFormModalProps) {
    if (!isOpen) return null;

    const [selectedClientId, setSelectedClientId] = useState<number>(clients[0]?.id || 1);
    const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState<string>(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [documentStatus, setDocumentStatus] = useState<'brouillon' | 'émise'>('émise');
    const [notes, setNotes] = useState<string>('Conditions de paiement : RÈGLEMENT PAR VIREMENT BANCAIRE OU WAVE / ORANGE MONEY.');

    // Multi-line items state
    const [items, setItems] = useState<DocumentItem[]>([
        {
            id: 'item-1',
            product_id: products[0]?.id || 1,
            description: products[0]?.name || 'Prestation de service',
            quantity: 1,
            unit: products[0]?.unit || 'Prestation',
            unit_price: products[0]?.unit_price || 500000,
            discount_rate: 0,
            tax_rate: 18,
            line_total: (products[0]?.unit_price || 500000) * 1.18,
        },
    ]);

    useEffect(() => {
        if (invoiceToEdit) {
            setSelectedClientId(invoiceToEdit.client_id);
            setIssueDate(invoiceToEdit.issue_date);
            setDueDate(invoiceToEdit.due_date);
            setDocumentStatus(invoiceToEdit.document_status === 'annulée' ? 'brouillon' : invoiceToEdit.document_status);
            setNotes(invoiceToEdit.notes || '');
            if (invoiceToEdit.items && invoiceToEdit.items.length > 0) {
                setItems(invoiceToEdit.items);
            }
        } else {
            setSelectedClientId(clients[0]?.id || 1);
            setIssueDate(new Date().toISOString().split('T')[0]);
            setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
            setDocumentStatus('émise');
            setNotes('Conditions de paiement : RÈGLEMENT PAR VIREMENT BANCAIRE OU WAVE / ORANGE MONEY.');
            setItems([
                {
                    id: 'item-1',
                    product_id: products[0]?.id || 1,
                    description: products[0]?.name || 'Prestation de service',
                    quantity: 1,
                    unit: products[0]?.unit || 'Prestation',
                    unit_price: products[0]?.unit_price || 500000,
                    discount_rate: 0,
                    tax_rate: 18,
                    line_total: (products[0]?.unit_price || 500000) * 1.18,
                },
            ]);
        }
    }, [isOpen, invoiceToEdit]);

    const handleAddItem = () => {
        const defaultProd = products[0];
        setItems([
            ...items,
            {
                id: `item-${Date.now()}`,
                product_id: defaultProd?.id || 1,
                description: defaultProd?.name || 'Nouvelle ligne de prestation',
                quantity: 1,
                unit: defaultProd?.unit || 'Prestation',
                unit_price: defaultProd?.unit_price || 250000,
                discount_rate: 0,
                tax_rate: 18,
                line_total: (defaultProd?.unit_price || 250000) * 1.18,
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

        onSave({
            invoice_number: invoiceToEdit ? invoiceToEdit.invoice_number : `FAC-2026-${Math.floor(100 + Math.random() * 900)}`,
            client_id: client.id,
            client_name: client.company_name || client.name,
            client_email: client.email,
            client_address: client.address,
            document_status: documentStatus,
            payment_status: invoiceToEdit ? invoiceToEdit.payment_status : 'non_payée',
            issue_date: issueDate,
            due_date: dueDate,
            currency,
            items,
            subtotal,
            discount_total: discountTotal,
            tax_total: Math.round(taxTotal),
            total,
            notes,
        }, invoiceToEdit ? invoiceToEdit.id : undefined);

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-900">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                                {invoiceToEdit ? `Modifier la Facture ${invoiceToEdit.invoice_number}` : 'Créer une nouvelle Facture'}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {invoiceToEdit
                                    ? `Modification des lignes, dates et conditions de la facture client ${invoiceToEdit.client_name}.`
                                    : 'Calculs automatiques des sous-totaux, remises et TVA (18%) en FCFA.'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Header info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/80 p-4 border border-slate-200/80 rounded-2xl">
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
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Date d'échéance *</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Lignes de facture */}
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
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                            <th className="p-3 w-1/3">Produit / Description</th>
                                            <th className="p-3 text-center w-20">Qté</th>
                                            <th className="p-3 text-right w-32">Prix Unitaire (FCFA)</th>
                                            <th className="p-3 text-center w-20">TVA %</th>
                                            <th className="p-3 text-right w-32">Total TTC</th>
                                            <th className="p-3 text-center w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="p-3 space-y-1">
                                                    <select
                                                        value={item.product_id || ''}
                                                        onChange={(e) => handleProductSelect(index, Number(e.target.value))}
                                                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-indigo-700"
                                                    >
                                                        {products.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name} ({formatCurrency(p.unit_price, currency)})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                                                    />
                                                </td>
                                                <td className="p-3 text-center">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                        className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-900 font-mono"
                                                    />
                                                </td>
                                                <td className="p-3 text-right">
                                                    <input
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                                                        className="w-28 px-2 py-1 bg-white border border-slate-200 rounded-lg text-right text-xs font-bold text-slate-900 font-mono"
                                                    />
                                                </td>
                                                <td className="p-3 text-center">
                                                    <input
                                                        type="number"
                                                        value={item.tax_rate}
                                                        onChange={(e) => handleItemChange(index, 'tax_rate', Number(e.target.value))}
                                                        className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-900 font-mono"
                                                    />
                                                </td>
                                                <td className="p-3 text-right font-black text-slate-900 font-mono">
                                                    {formatCurrency(item.line_total, currency)}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                    >
                                                        <Trash2 size={16} />
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
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                        <div className="w-full sm:w-1/2 space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">Notes / Instructions de règlement</label>
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800"
                            />
                        </div>

                        <div className="w-full sm:w-72 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
                            <div className="flex justify-between text-slate-500 font-semibold">
                                <span>Sous-total HT</span>
                                <span className="font-mono text-slate-900 font-bold">{formatCurrency(subtotal, currency)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-semibold">
                                <span>TVA (18%)</span>
                                <span className="font-mono text-slate-900 font-bold">{formatCurrency(taxTotal, currency)}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                                <span>TOTAL TTC</span>
                                <span className="font-mono text-indigo-600">{formatCurrency(total, currency)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-[#ff6b52] hover:bg-[#f05a41] text-white text-xs font-extrabold shadow-md shadow-orange-500/20 transition flex items-center gap-1.5"
                        >
                            <Check size={16} />
                            <span>{invoiceToEdit ? 'Enregistrer les modifications' : 'Enregistrer la Facture'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
