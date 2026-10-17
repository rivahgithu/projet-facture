import React, { useState } from 'react';
import { Invoice, Payment } from '../types';
import { formatCurrency, formatDate, getPaymentStatusBadge, getDocumentStatusBadge } from '../utils';
import { 
    X, 
    Printer, 
    Download,
    PlusCircle, 
    CreditCard, 
    FileText, 
    History,
    AlertCircle,
    Building2,
    User,
    CheckCircle2
} from 'lucide-react';

interface InvoiceDetailModalProps {
    invoice: Invoice | null;
    onClose: () => void;
    onAddPayment: (invoiceId: number, payment: Omit<Payment, 'id' | 'invoice_id' | 'recorded_by'>) => void;
    companyName: string;
}

export default function InvoiceDetailModal({
    invoice,
    onClose,
    onAddPayment,
    companyName,
}: InvoiceDetailModalProps) {
    if (!invoice) return null;

    const [activeTab, setActiveTab] = useState<'preview' | 'payments' | 'add_payment'>('preview');

    const pdfUrl = `/invoices/${invoice.id}/pdf`;
    const pdfDownloadUrl = `/invoices/${invoice.id}/pdf?download=1`;

    // Form state for adding payment
    const [amount, setAmount] = useState<number>(invoice.balance_due);
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState<'espèces' | 'virement' | 'chèque' | 'mobile_money'>('virement');
    const [reference, setReference] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [formError, setFormError] = useState<string>('');

    const handleRecordPayment = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (amount <= 0) {
            setFormError('Le montant doit être supérieur à 0 FCFA.');
            return;
        }

        if (amount > invoice.balance_due) {
            setFormError(`Le montant ne peut pas dépasser le solde restant (${formatCurrency(invoice.balance_due, invoice.currency)}).`);
            return;
        }

        onAddPayment(invoice.id, {
            amount: Number(amount),
            payment_date: paymentDate,
            method,
            reference: reference.trim() || undefined,
            notes: notes.trim() || undefined,
        });

        setActiveTab('payments');
    };

    const docStatus = getDocumentStatusBadge(invoice.document_status);
    const payStatus = getPaymentStatusBadge(invoice.payment_status);

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
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{invoice.invoice_number}</h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${docStatus.className}`}>
                                    {docStatus.label}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${payStatus.className}`}>
                                    {payStatus.label}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Client : <strong className="text-slate-800">{invoice.client_name}</strong> | Émission : {formatDate(invoice.issue_date)}
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

                {/* Sub-Header Tabs */}
                <div className="px-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-4 py-3 text-xs font-extrabold border-b-2 transition ${
                                activeTab === 'preview'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            Facture & Détails
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`px-4 py-3 text-xs font-extrabold border-b-2 transition flex items-center gap-2 ${
                                activeTab === 'payments'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            <History size={14} />
                            <span>Règlements Enregistrés ({invoice.payments.length})</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {invoice.balance_due > 0 && invoice.document_status !== 'annulée' && (
                            <button
                                onClick={() => {
                                    setAmount(invoice.balance_due);
                                    setActiveTab('add_payment');
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                            >
                                <PlusCircle size={14} />
                                <span>Enregistrer Règlement</span>
                            </button>
                        )}
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <Printer size={14} />
                            <span>Aperçu PDF</span>
                        </a>
                        <a
                            href={pdfDownloadUrl}
                            download
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                        >
                            <Download size={14} />
                            <span>Télécharger</span>
                        </a>
                    </div>
                </div>

                {/* Modal Body Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* TAB 1: PREVIEW & DETAILS */}
                    {activeTab === 'preview' && (
                        <div className="space-y-6">
                            {/* Summary Financial Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Total Facturé TTC
                                    </div>
                                    <div className="text-xl font-black text-slate-900 font-mono">
                                        {formatCurrency(invoice.total, invoice.currency)}
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                                    <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                                        Total Encaissé
                                    </div>
                                    <div className="text-xl font-black text-emerald-700 font-mono">
                                        {formatCurrency(invoice.amount_paid, invoice.currency)}
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                                    <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                                        Solde Restant à Payer
                                    </div>
                                    <div className="text-xl font-black text-amber-700 font-mono">
                                        {formatCurrency(invoice.balance_due, invoice.currency)}
                                    </div>
                                </div>
                            </div>

                            {/* Client & Issuer Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                                <div className="space-y-1.5">
                                    <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <Building2 size={14} className="text-indigo-600" />
                                        Émetteur
                                    </div>
                                    <div className="text-sm font-extrabold text-slate-900">{companyName}</div>
                                    <div className="text-xs text-slate-500 font-medium space-y-0.5">
                                        <p>Avenue Chardy, Plateau, Abidjan</p>
                                        <p>N° CC : CI-ABJ-2024-B-12345</p>
                                        <p>Email : contact@rivah-digital.ci</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <User size={14} className="text-indigo-600" />
                                        Facturé à (Client)
                                    </div>
                                    <div className="text-sm font-extrabold text-slate-900">{invoice.client_name}</div>
                                    <div className="text-xs text-slate-500 font-medium space-y-0.5">
                                        <p>{invoice.client_address}</p>
                                        <p>Email : {invoice.client_email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                                            <th className="p-3">Description</th>
                                            <th className="p-3 text-center">Qté</th>
                                            <th className="p-3 text-right">Prix Unitaire</th>
                                            <th className="p-3 text-center">Taxe</th>
                                            <th className="p-3 text-right">Total HT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {invoice.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-3 font-bold text-slate-800">
                                                    {item.description}
                                                </td>
                                                <td className="p-3 text-center text-slate-600 font-mono">
                                                    {item.quantity} {item.unit}
                                                </td>
                                                <td className="p-3 text-right text-slate-600 font-mono">
                                                    {formatCurrency(item.unit_price, invoice.currency)}
                                                </td>
                                                <td className="p-3 text-center text-slate-500 font-mono">
                                                    {item.tax_rate}%
                                                </td>
                                                <td className="p-3 text-right font-black text-slate-900 font-mono">
                                                    {formatCurrency(item.unit_price * item.quantity, invoice.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals Breakdown */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="text-xs text-slate-500 font-medium max-w-xs space-y-1">
                                    <div className="font-bold text-slate-800">Notes & Conditions :</div>
                                    <p>{invoice.notes || 'Aucune note spécifique.'}</p>
                                    <p className="text-[11px] text-slate-400 pt-1">
                                        Date d'échéance : <strong className="text-slate-700">{formatDate(invoice.due_date)}</strong>
                                    </p>
                                </div>

                                <div className="w-full sm:w-72 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-500 font-semibold">
                                        <span>Sous-total HT</span>
                                        <span className="font-mono text-slate-900 font-bold">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 font-semibold">
                                        <span>TVA (18%)</span>
                                        <span className="font-mono text-slate-900 font-bold">{formatCurrency(invoice.tax_total, invoice.currency)}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                                        <span>Total TTC</span>
                                        <span className="font-mono text-indigo-600">{formatCurrency(invoice.total, invoice.currency)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PAYMENTS HISTORY */}
                    {activeTab === 'payments' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900">Historique des Règlements Enregistrés</h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Les paiements enregistrés réduisent directement le solde restant de la facture.
                                    </p>
                                </div>

                                {invoice.balance_due > 0 && invoice.document_status !== 'annulée' && (
                                    <button
                                        onClick={() => {
                                            setAmount(invoice.balance_due);
                                            setActiveTab('add_payment');
                                        }}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition flex items-center gap-1.5"
                                    >
                                        <PlusCircle size={15} />
                                        <span>Ajouter un Règlement</span>
                                    </button>
                                )}
                            </div>

                            {invoice.payments.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                                        <CreditCard size={20} />
                                    </div>
                                    <div className="text-sm font-bold text-slate-800">Aucun règlement enregistré</div>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                                        Cette facture n'a encore reçu aucun paiement. Cliquez sur le bouton ci-dessus pour enregistrer un règlement.
                                    </p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Mode de Paiement</th>
                                                <th className="p-3">Référence</th>
                                                <th className="p-3">Enregistré par</th>
                                                <th className="p-3 text-right">Montant</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {invoice.payments.map((pmt) => (
                                                <tr key={pmt.id}>
                                                    <td className="p-3 text-slate-800 font-bold">
                                                        {formatDate(pmt.payment_date)}
                                                    </td>
                                                    <td className="p-3 text-slate-700 capitalize font-bold flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                                        {pmt.method.replace('_', ' ')}
                                                    </td>
                                                    <td className="p-3 text-slate-500 font-mono">
                                                        {pmt.reference || '-'}
                                                    </td>
                                                    <td className="p-3 text-slate-500">
                                                        {pmt.recorded_by}
                                                    </td>
                                                    <td className="p-3 text-right font-black text-emerald-600 font-mono">
                                                        +{formatCurrency(pmt.amount, invoice.currency)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: ADD PAYMENT FORM */}
                    {activeTab === 'add_payment' && (
                        <form onSubmit={handleRecordPayment} className="space-y-5 max-w-xl mx-auto">
                            <div className="text-center space-y-1">
                                <h3 className="text-base font-extrabold text-slate-900">Nouveau Règlement sur {invoice.invoice_number}</h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Solde restant actuel : <strong className="text-amber-600">{formatCurrency(invoice.balance_due, invoice.currency)}</strong>
                                </p>
                            </div>

                            {formError && (
                                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div className="space-y-4 bg-slate-50/80 p-5 border border-slate-200 rounded-2xl">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Montant encaissement (FCFA) *
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={invoice.balance_due}
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        required
                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setAmount(invoice.balance_due)}
                                            className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-[11px] font-bold text-slate-700"
                                        >
                                            Solde total ({formatCurrency(invoice.balance_due, invoice.currency)})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAmount(Math.round(invoice.balance_due / 2))}
                                            className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-[11px] font-bold text-slate-700"
                                        >
                                            50% du solde
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Date du règlement *
                                        </label>
                                        <input
                                            type="date"
                                            value={paymentDate}
                                            onChange={(e) => setPaymentDate(e.target.value)}
                                            required
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Mode de règlement *
                                        </label>
                                        <select
                                            value={method}
                                            onChange={(e) => setMethod(e.target.value as any)}
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="virement">Virement Bancaire</option>
                                            <option value="mobile_money">Mobile Money (Wave, Orange, MTN)</option>
                                            <option value="espèces">Espèces (Cash)</option>
                                            <option value="chèque">Chèque</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Référence transaction facultative
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: VIR-Ecobank-9988231"
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('preview')}
                                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                                >
                                    <CheckCircle2 size={16} />
                                    <span>Valider le Règlement</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
