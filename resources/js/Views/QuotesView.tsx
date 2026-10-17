import React, { useState, useMemo, useEffect } from 'react';
import { Quote, Client } from '../types';
import { formatCurrency, formatDate, getQuoteStatusBadge } from '../utils';
import {
    Plus,
    ArrowRightLeft,
    Eye,
    X,
    Printer,
    Pencil,
    Trash2,
    Search,
    Filter,
    FileText,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
} from 'lucide-react';

interface QuotesViewProps {
    quotes: Quote[];
    onNewQuote: () => void;
    onEditQuote?: (quote: Quote) => void;
    onDeleteQuote?: (quoteId: number) => void;
    onConvertQuoteToInvoice: (quoteId: number) => void;
    currency: string;
    clients?: Client[];
    companyName?: string;
    company?: {
        id?: number;
        name: string;
        legal_name?: string;
        email?: string;
        phone?: string;
        address?: string;
        logo_url?: string | null;
        tax_id?: string;
        currency?: string;
    };
}

export default function QuotesView({
    quotes,
    onNewQuote,
    onEditQuote,
    onDeleteQuote,
    onConvertQuoteToInvoice,
    currency,
    clients = [],
    companyName = 'Rivah Digital Agency',
    company,
}: QuotesViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);

    // Modals
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [printingQuote, setPrintingQuote] = useState<Quote | null>(null);
    const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

    // Filtered quotes based on search and status
    const filteredQuotes = useMemo(() => {
        return quotes.filter((q) => {
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !query ||
                q.quote_number.toLowerCase().includes(query) ||
                q.client_name.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === 'all' || q.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [quotes, searchQuery, statusFilter]);

    // Reset pagination to page 1 on search or filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, pageSize]);

    // Pagination calculations
    const totalItems = filteredQuotes.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);

    const handleConfirmDelete = () => {
        if (quoteToDelete && onDeleteQuote) {
            onDeleteQuote(quoteToDelete.id);
            if (paginatedQuotes.length === 1 && safeCurrentPage > 1) {
                setCurrentPage(safeCurrentPage - 1);
            }
        }
        setQuoteToDelete(null);
    };

    // Get client details for printable document
    const getQuoteClient = (quote: Quote) => {
        return clients.find((c) => c.id === quote.client_id) || {
            name: quote.client_name,
            company_name: quote.client_name,
            email: 'client@domain.ci',
            phone: '+225 07 00 00 00 00',
            address: 'Abidjan, Côte d\'Ivoire',
            tax_id: 'Non renseigné',
        };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        Gestion des Devis Commerciaux
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                            Conversion en 1 clic
                        </span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Préparez vos propositions commerciales, imprimez les PDF et convertissez-les en factures.
                    </p>
                </div>

                <button
                    onClick={onNewQuote}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer"
                >
                    <Plus size={16} />
                    <span>Créer un Devis</span>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher par N° devis, client..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-9 py-2 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
                        { id: 'all', label: 'Tous' },
                        { id: 'brouillon', label: 'Brouillons' },
                        { id: 'envoyé', label: 'Envoyés' },
                        { id: 'accepté', label: 'Acceptés' },
                        { id: 'converti', label: 'Convertis' },
                        { id: 'refusé', label: 'Refusés' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setStatusFilter(f.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
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

            {/* Quotes Table */}
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                                <th className="p-4">N° Devis</th>
                                <th className="p-4">Client</th>
                                <th className="p-4 whitespace-nowrap">Date Émission</th>
                                <th className="p-4 whitespace-nowrap">Date Validité</th>
                                <th className="p-4 text-center whitespace-nowrap">Statut</th>
                                <th className="p-4 text-right whitespace-nowrap">Montant Total TTC</th>
                                <th className="p-4 text-center whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedQuotes.length > 0 ? (
                                paginatedQuotes.map((q) => {
                                    const badge = getQuoteStatusBadge(q.status);
                                    return (
                                        <tr key={q.id} className="hover:bg-indigo-50/30 transition">
                                            <td className="p-4 font-bold text-indigo-600 font-mono align-middle">{q.quote_number}</td>
                                            <td className="p-4 font-bold text-slate-900 align-middle">{q.client_name}</td>
                                            <td className="p-4 text-slate-500 whitespace-nowrap align-middle">{formatDate(q.issue_date)}</td>
                                            <td className="p-4 text-slate-500 whitespace-nowrap align-middle">{formatDate(q.valid_until)}</td>
                                            <td className="p-4 text-center whitespace-nowrap align-middle">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-black text-slate-900 font-mono whitespace-nowrap align-middle">
                                                {formatCurrency(q.total, currency)}
                                            </td>
                                            <td className="p-4 text-center whitespace-nowrap align-middle">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Aperçu du Devis */}
                                                    <button
                                                        onClick={() => setSelectedQuote(q)}
                                                        className="w-8 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-600  hover:text-white flex items-center justify-center transition border border-indigo-200/60 shadow-2xs cursor-pointer"
                                                        title="Aperçu du Devis"
                                                    >
                                                        <Eye size={15} />
                                                    </button>

                                                    {/* Modifier le Devis */}
                                                    {onEditQuote && (
                                                        <button
                                                            onClick={() => onEditQuote(q)}
                                                            className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-600  hover:text-white flex items-center justify-center transition border border-amber-200/60 shadow-2xs cursor-pointer"
                                                            title="Modifier le Devis"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                    )}

                                                    {/* Téléchargement PDF officiel (Dompdf) */}
                                                   

                                                    {/* Impression / Aperçu du Devis */}
                                                    <button
                                                        onClick={() => setPrintingQuote(q)}
                                                        className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition border border-emerald-200/60 shadow-2xs cursor-pointer"
                                                        title="Aperçu du Devis"
                                                    >
                                                        <Printer size={15} />
                                                    </button>

                                                    {/* Supprimer le Devis */}
                                                    {onDeleteQuote && (
                                                        <button
                                                            onClick={() => setQuoteToDelete(q)}
                                                            className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-600  hover:text-white flex items-center justify-center transition border border-rose-200/60 shadow-2xs cursor-pointer"
                                                            title="Supprimer le Devis"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}

                                                    {/* Convertir en Facture */}
                                                    {q.status !== 'converti' && (
                                                        <button
                                                            onClick={() => onConvertQuoteToInvoice(q.id)}
                                                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold transition flex items-center gap-1 cursor-pointer"
                                                            title="Convertir en Facture"
                                                        >
                                                            <ArrowRightLeft size={13} />
                                                            <span>Convertir</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 px-4 text-center">
                                        <div className="max-w-sm mx-auto space-y-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                                <FileText size={24} />
                                            </div>
                                            <div className="text-sm font-bold text-slate-800">
                                                Aucun devis trouvé
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
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition cursor-pointer"
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
                            <strong className="text-slate-800 font-bold">{totalItems}</strong> devis
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-medium text-[11px]">Par page :</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer disabled:cursor-not-allowed"
                            >
                                <ChevronsLeft size={15} />
                            </button>

                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safeCurrentPage === 1}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={15} />
                                <span className="hidden sm:inline">Précédent</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                                            safeCurrentPage === page
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safeCurrentPage === totalPages}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed"
                            >
                                <span className="hidden sm:inline">Suivant</span>
                                <ChevronRight size={15} />
                            </button>

                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={safeCurrentPage === totalPages}
                                title="Dernière page"
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer disabled:cursor-not-allowed"
                            >
                                <ChevronsRight size={15} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Quote Confirmation Modal */}
            {quoteToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900">Confirmer la suppression</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Êtes-vous sûr de vouloir supprimer le devis{' '}
                                <strong className="text-slate-900 font-mono">{quoteToDelete.quote_number}</strong> ({quoteToDelete.client_name}) d'un montant de{' '}
                                <strong className="text-slate-900">{formatCurrency(quoteToDelete.total, currency)}</strong> ?
                            </p>
                            <p className="text-[11px] text-rose-500 font-medium mt-1">
                                Cette action est irréversible.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setQuoteToDelete(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <Trash2 size={14} />
                                <span>Supprimer définitivement</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Preview Modal */}
            {selectedQuote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-6 space-y-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                    <span>Devis {selectedQuote.quote_number}</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getQuoteStatusBadge(selectedQuote.status).className}`}>
                                        {getQuoteStatusBadge(selectedQuote.status).label}
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">Client : {selectedQuote.client_name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedQuote(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Date d'émission</span>
                                    <span className="font-extrabold text-slate-900">{formatDate(selectedQuote.issue_date)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Date de validité</span>
                                    <span className="font-extrabold text-slate-900">{formatDate(selectedQuote.valid_until)}</span>
                                </div>
                            </div>

                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                                        <th className="py-2">Prestation</th>
                                        <th className="py-2 text-center">Qté</th>
                                        <th className="py-2 text-right">P.U.</th>
                                        <th className="py-2 text-right">Total HT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedQuote.items.map((it) => (
                                        <tr key={it.id}>
                                            <td className="py-2.5 font-bold text-slate-800">{it.description}</td>
                                            <td className="py-2.5 text-center font-mono">{it.quantity}</td>
                                            <td className="py-2.5 text-right font-mono">{formatCurrency(it.unit_price, currency)}</td>
                                            <td className="py-2.5 text-right font-black text-slate-900 font-mono">{formatCurrency(it.unit_price * it.quantity, currency)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end pt-2 border-t border-slate-100">
                                <div className="w-60 space-y-1 text-right text-xs">
                                    <div className="flex justify-between text-slate-500 font-medium"><span>Sous-total:</span> <span className="font-mono font-bold text-slate-800">{formatCurrency(selectedQuote.subtotal, currency)}</span></div>
                                    <div className="flex justify-between text-slate-500 font-medium"><span>TVA (18%):</span> <span className="font-mono font-bold text-slate-800">{formatCurrency(selectedQuote.tax_total, currency)}</span></div>
                                    <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-slate-200">
                                        <span>TOTAL TTC:</span>
                                        <span className="font-mono text-indigo-600">{formatCurrency(selectedQuote.total, currency)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setSelectedQuote(null)}
                                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl transition cursor-pointer"
                            >
                                Fermer
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setPrintingQuote(selectedQuote);
                                        setSelectedQuote(null);
                                    }}
                                    className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-bold text-slate-700 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                                >
                                    <Printer size={14} />
                                    <span>Imprimer le Devis</span>
                                </button>
                                {selectedQuote.status !== 'converti' && (
                                    <button
                                        onClick={() => {
                                            onConvertQuoteToInvoice(selectedQuote.id);
                                            setSelectedQuote(null);
                                        }}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-extrabold text-white rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
                                    >
                                        <ArrowRightLeft size={14} />
                                        <span>Convertir directement en Facture</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* High-Fidelity Printable Quote PDF Modal */}
            {printingQuote && (() => {
                const client = getQuoteClient(printingQuote);
                const badge = getQuoteStatusBadge(printingQuote.status);

                return (
                    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-md flex flex-col p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
                        <div className="max-w-4xl w-full mx-auto bg-white text-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl my-auto space-y-8 border border-slate-200 print:border-none print:shadow-none print:p-0 print:my-0">
                            {/* Print Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6">
                                <div>
                                    {company?.logo_url && (
                                        <img
                                            src={company.logo_url}
                                            alt={company.name || companyName}
                                            className="h-12 w-auto object-contain mb-3"
                                        />
                                    )}
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Proposition Commerciale</span>
                                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">DEVIS</h1>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-600 uppercase">N° Devis :</span>
                                        <span className="text-base font-extrabold text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                                            {printingQuote.quote_number}
                                        </span>
                                    </div>
                                </div>
                                <div className="sm:text-right space-y-1">
                                    <div className="text-xl font-black text-slate-900">{company?.name || companyName}</div>
                                    <div className="text-xs text-slate-500 font-medium">{company?.address || 'Avenue Chardy, Plateau, Abidjan'}</div>
                                    {company?.tax_id && <div className="text-xs text-slate-500 font-medium">N° CC : {company.tax_id}</div>}
                                    {company?.email && <div className="text-xs text-slate-500 font-medium">Email : {company.email}</div>}
                                    {company?.phone && <div className="text-xs text-slate-500 font-medium">Tél : {company.phone}</div>}
                                </div>
                            </div>

                            {/* Dates & Client Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                                <div className="space-y-1 text-xs">
                                    <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Proposition émise pour :</div>
                                    <div className="text-sm font-extrabold text-slate-900">{printingQuote.client_name}</div>
                                    <div className="text-slate-600">{client.address || 'Abidjan, Côte d\'Ivoire'}</div>
                                    <div className="text-slate-500">{client.email}</div>
                                    {client.phone && <div className="text-slate-500 font-mono">{client.phone}</div>}
                                </div>
                                <div className="space-y-1.5 sm:text-right text-xs">
                                    <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Validité du Document :</div>
                                    <div>
                                        <span className="text-slate-500">Date d'émission : </span>
                                        <strong className="text-slate-900">{formatDate(printingQuote.issue_date)}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Date de validité : </span>
                                        <strong className="text-slate-900">{formatDate(printingQuote.valid_until)}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Statut de l'offre : </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                                            {badge.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                            <th className="p-3.5">Désignation de la prestation</th>
                                            <th className="p-3.5 text-center">Qté</th>
                                            <th className="p-3.5 text-right">Prix Unitaire</th>
                                            <th className="p-3.5 text-center">Taxe</th>
                                            <th className="p-3.5 text-right">Total HT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {printingQuote.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-3.5 font-bold text-slate-800">
                                                    {item.description}
                                                </td>
                                                <td className="p-3.5 text-center text-slate-600 font-mono">
                                                    {item.quantity} {item.unit || 'Prestation'}
                                                </td>
                                                <td className="p-3.5 text-right text-slate-600 font-mono">
                                                    {formatCurrency(item.unit_price, printingQuote.currency)}
                                                </td>
                                                <td className="p-3.5 text-center text-slate-500 font-mono">
                                                    {item.tax_rate}%
                                                </td>
                                                <td className="p-3.5 text-right font-black text-slate-900 font-mono">
                                                    {formatCurrency(item.unit_price * item.quantity, printingQuote.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Financial Totals & Acceptance Notes */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                                <div className="text-xs text-slate-500 max-w-sm space-y-1.5">
                                    <div className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Conditions de l'offre :</div>
                                    <p className="leading-relaxed">
                                        {printingQuote.notes || 'Proposition commerciale valable 30 jours à compter de la date d\'émission. Acompte de 40% au démarrage, solde à la livraison conforme.'}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        Réf. devis : <strong className="font-mono text-slate-700">{printingQuote.quote_number}</strong>
                                    </p>
                                </div>

                                <div className="w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-500 font-medium">
                                        <span>Sous-total HT</span>
                                        <span className="font-mono text-slate-900 font-bold">{formatCurrency(printingQuote.subtotal, printingQuote.currency)}</span>
                                    </div>
                                    {printingQuote.discount_total > 0 && (
                                        <div className="flex justify-between text-emerald-600 font-medium">
                                            <span>Remise commerciale</span>
                                            <span className="font-mono font-bold">-{formatCurrency(printingQuote.discount_total, printingQuote.currency)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-slate-500 font-medium">
                                        <span>TVA (18%)</span>
                                        <span className="font-mono text-slate-900 font-bold">{formatCurrency(printingQuote.tax_total, printingQuote.currency)}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                                        <span>TOTAL TTC</span>
                                        <span className="font-mono text-indigo-700 text-base">{formatCurrency(printingQuote.total, printingQuote.currency)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bon pour accord & Signature Box */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                                <div className="p-4 border border-dashed border-slate-300 rounded-2xl space-y-3 bg-slate-50/50">
                                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Pour acceptation et bon pour commande :
                                    </div>
                                    <p className="text-[11px] text-slate-500 italic">
                                        Mention manuscrite obligatoire : « Bon pour accord et validation de l'offre »
                                    </p>
                                    <div className="pt-6 text-[11px] text-slate-500 flex justify-between items-center">
                                        <span>Date &amp; Heure : <strong className="text-slate-700 font-semibold">{new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</strong></span>
                                        <span>Signature &amp; Cachet Client :</span>
                                    </div>
                                </div>

                                <div className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50 text-right">
                                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Pour l'agence {companyName} :
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        La Direction Commerciale & Technique
                                    </p>
                                    <div className="pt-8 text-xs font-extrabold text-indigo-700 font-serif italic">
                                        Cachet & Visa de validation
                                    </div>
                                </div>
                            </div>

                            {/* Print Footer Buttons */}
                            <div className="flex flex-wrap justify-between items-center gap-3 pt-6 border-t border-slate-200 print:hidden">
                                <button
                                    onClick={() => setPrintingQuote(null)}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl transition cursor-pointer"
                                >
                                    Fermer
                                </button>
                                <div className="flex flex-wrap items-center gap-2">
                                    <a
                                        href={`/quotes/${printingQuote.id}/pdf?download=1`}
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
                                    >
                                        <Download size={16} />
                                        <span>Télécharger PDF (Dompdf)</span>
                                    </a>
                                    <a
                                        href={`/quotes/${printingQuote.id}/pdf`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
                                    >
                                        <FileText size={16} />
                                        <span>Ouvrir PDF</span>
                                    </a>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
