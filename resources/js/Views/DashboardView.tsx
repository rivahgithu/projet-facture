import React, { useState, useEffect, useMemo } from 'react';
import { Invoice, Quote, Client } from '../types';
import { formatCurrency, formatDate, getPaymentStatusBadge, getDocumentStatusBadge } from '../utils';
import { 
    TrendingUp, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    ArrowUpRight, 
    Plus, 
    Users, 
    FileText, 
    Receipt,
    Calendar,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    Printer,
    Trash2,
    Search,
    Eye,
    Pencil,
    PlusCircle,
    X,
    RotateCcw
} from 'lucide-react';

interface DashboardViewProps {
    invoices: Invoice[];
    quotes: Quote[];
    clients: Client[];
    onNewInvoice: () => void;
    onViewInvoice: (invoice: Invoice) => void;
    onEditInvoice?: (invoice: Invoice) => void;
    onDeleteInvoice?: (invoiceId: number) => void;
    onPrintInvoice?: (invoice: Invoice) => void;
    onTabChange: (tab: string) => void;
    currency: string;
}

export default function DashboardView({
    invoices,
    quotes,
    clients,
    onNewInvoice,
    onViewInvoice,
    onEditInvoice,
    onDeleteInvoice,
    onPrintInvoice,
    onTabChange,
    currency,
}: DashboardViewProps) {
    const [card1Tab, setCard1Tab] = useState<'total' | 'past'>('total');
    const [card2Tab, setCard2Tab] = useState<'total' | 'new'>('total');
    const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'due' | 'paid' | 'drafts'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);

    // Delete confirmation state
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

    // Statistics
    const totalFacture = invoices.reduce((acc, inv) => acc + (inv.document_status !== 'annulée' ? inv.total : 0), 0);
    const totalEncaisse = invoices.reduce((acc, inv) => acc + inv.amount_paid, 0);
    const soldeRestant = invoices.reduce((acc, inv) => acc + (inv.document_status !== 'annulée' ? inv.balance_due : 0), 0);
    const overdueInvoices = invoices.filter((inv) => inv.payment_status === 'en_retard');

    // Filter counts for pills
    const countAll = invoices.length;
    const countDue = invoices.filter((inv) => inv.balance_due > 0).length;
    const countPaid = invoices.filter((inv) => inv.payment_status === 'payée').length;
    const countDrafts = invoices.filter((inv) => inv.document_status === 'brouillon').length;

    // Filtered invoices
    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !query ||
                inv.invoice_number.toLowerCase().includes(query) ||
                inv.client_name.toLowerCase().includes(query) ||
                inv.client_email.toLowerCase().includes(query);

            if (invoiceFilter === 'due') return matchesSearch && inv.balance_due > 0;
            if (invoiceFilter === 'paid') return matchesSearch && inv.payment_status === 'payée';
            if (invoiceFilter === 'drafts') return matchesSearch && inv.document_status === 'brouillon';
            return matchesSearch;
        });
    }, [invoices, searchQuery, invoiceFilter]);

    // Reset pagination to page 1 on filter/search/pageSize changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, invoiceFilter, pageSize]);

    // Pagination calculations
    const totalItems = filteredInvoices.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

    const handleConfirmDelete = () => {
        if (invoiceToDelete && onDeleteInvoice) {
            onDeleteInvoice(invoiceToDelete.id);
            // If the deleted item was the only item on this page, move back one page if possible
            if (paginatedInvoices.length === 1 && safeCurrentPage > 1) {
                setCurrentPage(safeCurrentPage - 1);
            }
        }
        setInvoiceToDelete(null);
    };

    return (
        <div className="space-y-8">
            {/* Top Title & Quick Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Facture</h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Vue synthétique de la facturation et gestion commerciale.
                    </p>
                </div>
            </div>

            {/* Top 3 Cards Row matching Reference UI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Total due / Past due */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setCard1Tab('total')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                card1Tab === 'total' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Total dû
                        </button>
                        <button
                            onClick={() => setCard1Tab('past')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                card1Tab === 'past' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            En retard
                        </button>
                    </div>

                    <div>
                        <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                            {card1Tab === 'total' 
                                ? formatCurrency(soldeRestant, currency) 
                                : formatCurrency(overdueInvoices.reduce((a, b) => a + b.balance_due, 0), currency)}
                        </div>
                        <div className="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1">
                            <span>{overdueInvoices.length} factures en retard</span>
                        </div>
                    </div>
                </div>

                {/* Card 2: Total Clients / New Clients */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setCard2Tab('total')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                card2Tab === 'total' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Total Clients
                        </button>
                     
                    </div>

                    <div>
                        <div className="text-3xl font-black text-slate-900 tracking-tight font-mono flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Users size={20} />
                            </div>
                            <span>{clients.length}</span>
                        </div>
                        
                    </div>
                </div>

                {/* Card 3: Summary Doughnut Chart matching Reference UI */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Résumé</h3>

                        <div className="space-y-2 text-xs font-semibold">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#ff6b52]" />
                                <span className="text-slate-600">Encaissements :</span>
                                <span className="font-extrabold text-slate-900 ml-auto font-mono">
                                    {Math.round((totalEncaisse / (totalFacture || 1)) * 100)}%
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-indigo-600" />
                                <span className="text-slate-600">Factures :</span>
                                <span className="font-extrabold text-slate-900 ml-auto font-mono">{invoices.length}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-slate-600">Devis :</span>
                                <span className="font-extrabold text-slate-900 ml-auto font-mono">{quotes.length}</span>
                            </div>
                        </div>

                        <div className="text-[11px] text-slate-400 pt-1 font-medium">
                            Total {invoices.length} factures
                        </div>
                    </div>

                    {/* Donut Chart Ring Visual */}
                    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-100"
                                strokeWidth="4.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-[#ff6b52]"
                                strokeDasharray="45, 100"
                                strokeWidth="4.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-indigo-600"
                                strokeDasharray="30, 100"
                                strokeDashoffset="-45"
                                strokeWidth="4.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-emerald-500"
                                strokeDasharray="15, 100"
                                strokeDashoffset="-75"
                                strokeWidth="4.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Bottom Main Section: Manage Invoice (Full Width - Section 1 preserved, Section 2 removed) */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Gérer les Factures</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Liste complète et structurée de vos factures clients avec pagination et actions rapides.
                        </p>
                    </div>

                    <button
                        onClick={onNewInvoice}
                        className="px-5 py-2.5 rounded-xl bg-[#ff6b52] hover:bg-[#f05a41] text-white text-xs cursor-pointer font-extrabold shadow-md shadow-orange-500/20 transition flex items-center gap-2 self-start sm:self-auto"
                    >
                        <Plus size={16} />
                        <span>Créer une Facture</span>
                    </button>
                </div>

                {/* Filter Pills + Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                        <button
                            onClick={() => setInvoiceFilter('all')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                invoiceFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>Toutes</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                invoiceFilter === 'all' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                                {countAll}
                            </span>
                        </button>

                        <button
                            onClick={() => setInvoiceFilter('due')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                invoiceFilter === 'due' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>Non Payées (Dû)</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                invoiceFilter === 'due' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                                {countDue}
                            </span>
                        </button>

                        <button
                            onClick={() => setInvoiceFilter('paid')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                invoiceFilter === 'paid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>Payées</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                invoiceFilter === 'paid' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                                {countPaid}
                            </span>
                        </button>

                        <button
                            onClick={() => setInvoiceFilter('drafts')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                invoiceFilter === 'drafts' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>Brouillons</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                invoiceFilter === 'drafts' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                                {countDrafts}
                            </span>
                        </button>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            placeholder="Rechercher par client, n° facture..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
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
                </div>

                {/* Full Width Table Card */}
                <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold bg-slate-50/70">
                                    <th className="py-4 px-5">CLIENT</th>
                                    <th className="py-4 px-3 text-center whitespace-nowrap">ÉMISSION / ÉCHÉANCE</th>
                                    <th className="py-4 px-3 text-center whitespace-nowrap">STATUT</th>
                                    <th className="py-4 px-3 text-right whitespace-nowrap">MONTANTS</th>
                                    <th className="py-4 px-5 text-center whitespace-nowrap w-px">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedInvoices.length > 0 ? (
                                    paginatedInvoices.map((inv) => {
                                        const pmtBadge = getPaymentStatusBadge(inv.payment_status);
                                        const docBadge = getDocumentStatusBadge(inv.document_status);

                                        return (
                                            <tr
                                                key={inv.id}
                                                onClick={() => onViewInvoice(inv)}
                                                className="hover:bg-indigo-50/30 cursor-pointer transition group"
                                            >
                                                {/* Client */}
                                                <td className="py-4 px-5 font-bold text-slate-900 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-2xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200/50 group-hover:bg-indigo-600 group-hover:text-white transition">
                                                            {inv.client_name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-extrabold text-slate-900 text-xs truncate max-w-[260px]">
                                                                {inv.client_name}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 font-normal truncate max-w-[260px]">
                                                                {inv.client_email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Date */}
                                                <td className="py-4 px-3 text-center whitespace-nowrap align-middle">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="text-slate-800 font-semibold text-xs whitespace-nowrap">
                                                            {formatDate(inv.issue_date)}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                            Échéance : {formatDate(inv.due_date)}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Statut */}
                                                <td className="py-4 px-3 text-center whitespace-nowrap align-middle">
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

                                                {/* Montants */}
                                                <td className="py-4 px-3 text-right whitespace-nowrap align-middle">
                                                    <div className="flex flex-col items-end justify-center gap-0.5">
                                                        <div className="font-black text-slate-900 font-mono text-xs whitespace-nowrap">
                                                            {formatCurrency(inv.total, currency)}
                                                        </div>
                                                        <div className="text-[10px] font-mono whitespace-nowrap">
                                                            {inv.balance_due > 0 ? (
                                                                <span className="text-amber-600 font-bold whitespace-nowrap">
                                                                    Dû : {formatCurrency(inv.balance_due, currency)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-emerald-600 font-bold whitespace-nowrap">Soldé</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-5 text-center whitespace-nowrap w-px align-middle">
                                                    <div 
                                                        className="flex items-center justify-center gap-1.5"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {/* 1. Vue */}
                                                        <button
                                                            onClick={() => onViewInvoice(inv)}
                                                            title="Voir les détails"
                                                            className="w-8 h-8 rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-600 hover:text-white transition flex items-center justify-center border border-indigo-200/60 shadow-2xs"
                                                        >
                                                            <Eye size={15} />
                                                        </button>

                                                        {/* 2. Modifier */}
                                                        <button
                                                            onClick={() => onEditInvoice ? onEditInvoice(inv) : null}
                                                            title="Modifier la facture"
                                                            className="w-8 h-8 rounded-xl cursor-pointer bg-amber-50 hover:bg-amber-600 hover:text-white transition flex items-center justify-center border border-amber-200/60 shadow-2xs"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>

                                                        {/* 3. Impression */}
                                                        <button
                                                            onClick={() => onPrintInvoice ? onPrintInvoice(inv) : onViewInvoice(inv)}
                                                            title="Imprimer la facture (PDF)"
                                                            className="w-8 h-8 rounded-xl cursor-pointer bg-emerald-50 hover:bg-emerald-600 hover:text-white transition flex items-center justify-center border border-emerald-200/60 shadow-2xs"
                                                        >
                                                            <Printer size={15} />
                                                        </button>

                                                        {/* 4. Supprimer */}
                                                        <button
                                                            onClick={() => setInvoiceToDelete(inv)}
                                                            title="Supprimer la facture"
                                                            className="w-8 h-8 rounded-xl cursor-pointer bg-rose-50 hover:bg-rose-600 hover:text-white transition flex items-center justify-center border border-rose-200/60 shadow-2xs"
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
                                        <td colSpan={5} className="py-12 px-4 text-center">
                                            <div className="max-w-sm mx-auto space-y-3">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                                    <Receipt size={24} />
                                                </div>
                                                <div className="text-sm font-bold text-slate-800">
                                                    Aucune facture trouvée
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Aucun document ne correspond à vos critères de recherche ou de filtre actuels.
                                                </p>
                                                {(searchQuery || invoiceFilter !== 'all') && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setInvoiceFilter('all');
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

                    {/* Pagination Bar */}
                    <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left: Info & Page Size */}
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

                        {/* Right: Page Navigation Buttons */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5 self-center sm:self-auto">
                                {/* First page */}
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={safeCurrentPage === 1}
                                    title="Première page"
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition"
                                >
                                    <ChevronsLeft size={15} />
                                </button>

                                {/* Prev page */}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={safeCurrentPage === 1}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold transition"
                                >
                                    <ChevronLeft size={15} />
                                    <span className="hidden sm:inline">Précédent</span>
                                </button>

                                {/* Numbered Pages */}
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

                                {/* Next page */}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safeCurrentPage === totalPages}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold transition"
                                >
                                    <span className="hidden sm:inline">Suivant</span>
                                    <ChevronRight size={15} />
                                </button>

                                {/* Last page */}
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
                                <strong className="text-slate-900 font-mono">{invoiceToDelete.invoice_number}</strong> du client{' '}
                                <strong className="text-slate-900">{invoiceToDelete.client_name}</strong> d'un montant de{' '}
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
