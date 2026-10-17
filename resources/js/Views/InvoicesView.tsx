import React, { useState, useEffect, useMemo } from 'react';
import { Invoice } from '../types';
import { formatCurrency, formatDate, getPaymentStatusBadge, getDocumentStatusBadge } from '../utils';
import { 
    Receipt, 
    Plus, 
    Search, 
    Eye, 
    Pencil, 
    Printer, 
    Trash2, 
    Filter, 
    X, 
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight 
} from 'lucide-react';

interface InvoicesViewProps {
    invoices: Invoice[];
    onNewInvoice: () => void;
    onViewInvoice: (invoice: Invoice) => void;
    onEditInvoice?: (invoice: Invoice) => void;
    onDeleteInvoice?: (invoiceId: number) => void;
    onPrintInvoice?: (invoice: Invoice) => void;
    currency: string;
}

export default function InvoicesView({
    invoices,
    onNewInvoice,
    onViewInvoice,
    onEditInvoice,
    onDeleteInvoice,
    onPrintInvoice,
    currency,
}: InvoicesViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);

    // Delete modal
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            const q = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !q ||
                inv.invoice_number.toLowerCase().includes(q) ||
                inv.client_name.toLowerCase().includes(q) ||
                inv.client_email.toLowerCase().includes(q);

            const matchesStatus =
                statusFilter === 'all' || inv.payment_status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchQuery, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, pageSize]);

    const totalItems = filteredInvoices.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

    const handleConfirmDelete = () => {
        if (invoiceToDelete && onDeleteInvoice) {
            onDeleteInvoice(invoiceToDelete.id);
            if (paginatedInvoices.length === 1 && safeCurrentPage > 1) {
                setCurrentPage(safeCurrentPage - 1);
            }
        }
        setInvoiceToDelete(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        Factures & Règlements
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                            Règlements intégrés
                        </span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Consultez vos factures, imprimez les PDF et enregistrez les encaissements reçus.
                    </p>
                </div>

                <button
                    onClick={onNewInvoice}
                    className="px-5 py-2.5 rounded-xl bg-[#ff6b52] hover:bg-[#f05a41] text-white text-xs font-extrabold shadow-md shadow-orange-500/20 transition flex items-center gap-2"
                >
                    <Plus size={16} />
                    <span>Créer une Facture</span>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher par N°, client..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1 mr-1">
                        <Filter size={13} /> Filtrer :
                    </span>
                    {[
                        { id: 'all', label: 'Toutes' },
                        { id: 'non_payée', label: 'Non Payées' },
                        { id: 'partiellement_payée', label: 'Partiellement Payées' },
                        { id: 'payée', label: 'Payées' },
                        { id: 'en_retard', label: 'En Retard' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setStatusFilter(f.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                                statusFilter === f.id
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices List Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                                <th className="p-4">CLIENT</th>
                                <th className="p-4 text-center whitespace-nowrap">ÉMISSION / ÉCHÉANCE</th>
                                <th className="p-4 text-center whitespace-nowrap">STATUTS</th>
                                <th className="p-4 text-right whitespace-nowrap">TOTAL TTC</th>
                                <th className="p-4 text-right whitespace-nowrap">SOLDE DÛ</th>
                                <th className="p-4 text-center whitespace-nowrap w-px">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedInvoices.length > 0 ? (
                                paginatedInvoices.map((inv) => {
                                    const docBadge = getDocumentStatusBadge(inv.document_status);
                                    const pmtBadge = getPaymentStatusBadge(inv.payment_status);

                                    return (
                                        <tr
                                            key={inv.id}
                                            className="hover:bg-indigo-50/30 transition cursor-pointer group"
                                            onClick={() => onViewInvoice(inv)}
                                        >
                                            <td className="p-4 font-bold text-slate-900 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                                                        {inv.client_name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-extrabold text-slate-900 truncate max-w-[260px]">{inv.client_name}</div>
                                                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-[260px]">{inv.client_email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4 text-slate-500 text-center whitespace-nowrap align-middle">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="font-semibold text-slate-800 whitespace-nowrap">{formatDate(inv.issue_date)}</div>
                                                    <div className="text-[10px] text-slate-400 whitespace-nowrap">Échéance : {formatDate(inv.due_date)}</div>
                                                </div>
                                            </td>

                                            <td className="p-4 text-center whitespace-nowrap align-middle">
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${pmtBadge.className}`}>
                                                        {pmtBadge.label}
                                                    </span>
                                                    {inv.document_status === 'brouillon' && (
                                                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold border whitespace-nowrap ${docBadge.className}`}>
                                                            Brouillon
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-4 text-right font-extrabold text-slate-900 font-mono text-xs whitespace-nowrap align-middle">
                                                {formatCurrency(inv.total, currency)}
                                            </td>

                                            <td className="p-4 text-right font-bold font-mono text-xs whitespace-nowrap align-middle">
                                                <span className={inv.balance_due > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                                                    {inv.balance_due > 0 ? formatCurrency(inv.balance_due, currency) : 'Soldé'}
                                                </span>
                                            </td>

                                            {/* Actions : Uniquement les icônes (Vue, Modifier, Impression, Supprimer) */}
                                            <td className="p-4 text-center whitespace-nowrap w-px align-middle">
                                                <div 
                                                    className="flex items-center justify-center gap-1.5"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* 1. Vue */}
                                                    <button
                                                        onClick={() => onViewInvoice(inv)}
                                                        title="Voir les détails"
                                                        className="w-8 h-8 rounded-xl  bg-indigo-50 hover:bg-indigo-600  hover:text-white transition flex items-center justify-center border border-indigo-200/60 shadow-2xs cursor-pointer"
                                                    >
                                                        <Eye size={15} />
                                                    </button>

                                                    {/* 2. Modifier */}
                                                    <button
                                                        onClick={() => onEditInvoice ? onEditInvoice(inv) : null}
                                                        title="Modifier la facture"
                                                        className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-600  hover:text-white transition flex items-center justify-center border border-amber-200/60 shadow-2xs cursor-pointer"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>

                                                    {/* 3. Impression */}
                                                    <button
                                                        onClick={() => onPrintInvoice ? onPrintInvoice(inv) : onViewInvoice(inv)}
                                                        title="Imprimer la facture (PDF)"
                                                        className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-600  hover:text-white transition flex items-center justify-center border border-emerald-200/60 shadow-2xs cursor-pointer"
                                                    >
                                                        <Printer size={15} />
                                                    </button>

                                                    {/* 4. Supprimer */}
                                                    <button
                                                        onClick={() => setInvoiceToDelete(inv)}
                                                        title="Supprimer la facture"
                                                        className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-600  hover:text-white transition flex items-center justify-center border border-rose-200/60 shadow-2xs cursor-pointer"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 px-4 text-center">
                                        <div className="max-w-sm mx-auto space-y-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                                <Receipt size={24} />
                                            </div>
                                            <div className="text-sm font-bold text-slate-800">
                                                Aucune facture trouvée
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                Aucun document ne correspond à vos filtres actuels.
                                            </p>
                                            {(searchQuery || statusFilter !== 'all') && (
                                                <button
                                                    onClick={() => {
                                                        setSearchQuery('');
                                                        setStatusFilter('all');
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition"
                                                >
                                                    <RotateCcw size={13} />
                                                    <span>Réinitialiser les filtres</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <div>
                            Affichage de <strong className="text-slate-800 font-bold">{totalItems === 0 ? 0 : startIndex + 1}</strong> à{' '}
                            <strong className="text-slate-800 font-bold">{endIndex}</strong> sur{' '}
                            <strong className="text-slate-800 font-bold">{totalItems}</strong> factures
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-medium text-[11px]">Par page :</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1.5 self-center sm:self-auto">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={safeCurrentPage === 1}
                                title="Première page"
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition"
                            >
                                <ChevronsLeft size={15} />
                            </button>

                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safeCurrentPage === 1}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold transition"
                            >
                                <ChevronLeft size={15} />
                                <span className="hidden sm:inline">Précédent</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                                            safeCurrentPage === page
                                                ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safeCurrentPage === totalPages}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold transition"
                            >
                                <span className="hidden sm:inline">Suivant</span>
                                <ChevronRight size={15} />
                            </button>

                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={safeCurrentPage === totalPages}
                                title="Dernière page"
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition"
                            >
                                <ChevronsRight size={15} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {invoiceToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900">Confirmer la suppression</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Êtes-vous sûr de vouloir supprimer la facture{' '}
                                <strong className="text-slate-900 font-mono">{invoiceToDelete.invoice_number}</strong> ({invoiceToDelete.client_name}) d'un montant de{' '}
                                <strong className="text-slate-900">{formatCurrency(invoiceToDelete.total, currency)}</strong> ?
                            </p>
                            <p className="text-[11px] text-rose-500 font-medium mt-1">
                                Cette action est irréversible.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setInvoiceToDelete(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition flex items-center gap-1.5"
                            >
                                <Trash2 size={14} />
                                <span>Supprimer définitivement</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
