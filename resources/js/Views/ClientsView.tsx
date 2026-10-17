import React, { useState, useEffect, useMemo } from 'react';
import { Client } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { 
    Search, 
    UserPlus, 
    Phone, 
    Mail, 
    MapPin, 
    Building, 
    X, 
    ChevronLeft, 
    ChevronRight, 
    ChevronsLeft, 
    ChevronsRight, 
    Users, 
    RotateCcw 
} from 'lucide-react';

interface ClientsViewProps {
    clients: Client[];
    onNewClient: () => void;
    currency: string;
}

export default function ClientsView({ clients, onNewClient, currency }: ClientsViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Pagination: 2 rows of 3 columns = 6 clients per page
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(6);

    const filteredClients = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return clients.filter((c) => {
            if (!query) return true;
            return (
                c.name.toLowerCase().includes(query) ||
                (c.company_name && c.company_name.toLowerCase().includes(query)) ||
                c.email.toLowerCase().includes(query) ||
                c.phone.toLowerCase().includes(query) ||
                (c.address && c.address.toLowerCase().includes(query))
            );
        });
    }, [clients, searchQuery]);

    // Reset pagination to page 1 on search or page size change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, pageSize]);

    // Pagination calculations
    const totalItems = filteredClients.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedClients = filteredClients.slice(startIndex, endIndex);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestion des Clients</h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Centralisez le répertoire de vos clients et suivez leurs montants restant dus.
                    </p>
                </div>

                <button
                    onClick={onNewClient}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                    <UserPlus size={16} />
                    <span>Nouveau Client</span>
                </button>
            </div>

            {/* Search Bar & Total Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, entreprise, email, téléphone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 shadow-xs transition"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"
                            title="Effacer la recherche"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <Users size={15} className="text-slate-400" />
                    <span>
                        <strong className="text-slate-900 font-bold">{totalItems}</strong> client{totalItems > 1 ? 's' : ''} au total
                    </span>
                </div>
            </div>

            {/* Clients Cards Grid (2 rows of 3 columns max per page) */}
            {paginatedClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedClients.map((client) => (
                        <div
                            key={client.id}
                            onClick={() => setSelectedClient(client)}
                            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer space-y-4 flex flex-col justify-between group hover:border-indigo-200"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-0.5 min-w-0">
                                        <h3 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition text-sm truncate">
                                            {client.company_name || client.name}
                                        </h3>
                                        {client.company_name && (
                                            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium truncate">
                                                <Building size={12} className="text-slate-400 shrink-0" />
                                                <span>Contact : {client.name}</span>
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 shrink-0">
                                        Depuis {formatDate(client.created_at)}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs text-slate-600 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-slate-400 shrink-0" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-slate-400 shrink-0" />
                                        <span>{client.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-slate-400 shrink-0" />
                                        <span className="truncate">{client.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial summary for client */}
                            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Facturé</span>
                                    <span className="font-mono font-extrabold text-slate-900">
                                        {formatCurrency(client.total_invoiced, currency)}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Solde Dû</span>
                                    <span className={`font-mono font-extrabold ${client.balance_due > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {client.balance_due > 0 ? formatCurrency(client.balance_due, currency) : 'Soldé'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty state */
                <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-extrabold text-slate-900">Aucun client trouvé</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Aucun résultat ne correspond à votre recherche "{searchQuery}".
                        </p>
                    </div>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <RotateCcw size={14} />
                        <span>Réinitialiser la recherche</span>
                    </button>
                </div>
            )}

            {/* Pagination Controls Directly After The 2nd Line */}
            {totalItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 text-xs bg-white p-5 rounded-3xl shadow-xs">
                    {/* Left: Info & Row count selector */}
                    <div className="flex flex-wrap items-center gap-3 text-slate-500">
                        <span>
                            Affichage de <strong className="text-slate-900 font-bold">{startIndex + 1}</strong> à{' '}
                            <strong className="text-slate-900 font-bold">{endIndex}</strong> sur{' '}
                            <strong className="text-slate-900 font-bold">{totalItems}</strong> client{totalItems > 1 ? 's' : ''}
                        </span>

                        <div className="flex items-center gap-1.5 pl-2 sm:border-l border-slate-200">
                            <span className="text-[11px] text-slate-400 font-medium">Lignes :</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value={6}>6 clients (2 lignes)</option>
                                <option value={12}>12 clients (4 lignes)</option>
                                <option value={18}>18 clients (6 lignes)</option>
                            </select>
                        </div>
                    </div>

                    {/* Right: Page Buttons */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={safeCurrentPage === 1}
                                title="Première page"
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer"
                            >
                                <ChevronsLeft size={15} />
                            </button>

                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safeCurrentPage === 1}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold transition cursor-pointer"
                            >
                                <ChevronLeft size={15} />
                                <span className="hidden sm:inline">Précédent</span>
                            </button>

                            {/* Page numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
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
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold transition cursor-pointer"
                            >
                                <span className="hidden sm:inline">Suivant</span>
                                <ChevronRight size={15} />
                            </button>

                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={safeCurrentPage === totalPages}
                                title="Dernière page"
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer"
                            >
                                <ChevronsRight size={15} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Client Detail Modal */}
            {selectedClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900">{selectedClient.company_name || selectedClient.name}</h2>
                                <p className="text-xs text-slate-500 font-medium">Fiche détaillée du client</p>
                            </div>
                            <button
                                onClick={() => setSelectedClient(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs text-slate-700">
                            <div><strong className="text-slate-900">Nom du contact :</strong> {selectedClient.name}</div>
                            <div><strong className="text-slate-900">Email :</strong> {selectedClient.email}</div>
                            <div><strong className="text-slate-900">Téléphone :</strong> {selectedClient.phone}</div>
                            <div><strong className="text-slate-900">Adresse :</strong> {selectedClient.address}</div>
                            {selectedClient.tax_id && <div><strong className="text-slate-900">N° Compte Contribuable (NCC) :</strong> {selectedClient.tax_id}</div>}
                        </div>

                        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Facturé</div>
                                <div className="text-xs font-black text-slate-900 font-mono">{formatCurrency(selectedClient.total_invoiced, currency)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Réglé</div>
                                <div className="text-xs font-black text-emerald-600 font-mono">{formatCurrency(selectedClient.total_paid, currency)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Solde Dû</div>
                                <div className="text-xs font-black text-amber-600 font-mono">{formatCurrency(selectedClient.balance_due, currency)}</div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setSelectedClient(null)}
                                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl transition cursor-pointer"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
