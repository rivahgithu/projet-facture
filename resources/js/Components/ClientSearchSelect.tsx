import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Client } from '../types';
import { Search, ChevronDown, Check, X, User, Building2 } from 'lucide-react';

interface ClientSearchSelectProps {
    clients: Client[];
    selectedClientId: number;
    onChange: (clientId: number) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
}

export default function ClientSearchSelect({
    clients,
    selectedClientId,
    onChange,
    label = 'Client destinataire *',
    required = true,
    disabled = false,
}: ClientSearchSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Trouver le client actuellement sélectionné
    const currentClient = useMemo(() => {
        return clients.find((c) => c.id === selectedClientId) || clients[0];
    }, [clients, selectedClientId]);

    const formatClientDisplay = (client?: Client) => {
        if (!client) return '';
        if (client.company_name && client.company_name.trim().length > 0) {
            return `${client.company_name} (${client.name})`;
        }
        return client.name;
    };

    // Synchroniser la valeur affichée avec le client sélectionné quand le dropdown n'est pas actif
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm(formatClientDisplay(currentClient));
        }
    }, [currentClient, isOpen]);

    // Fermer le menu lors d'un clic en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsFocused(false);
                setSearchTerm(formatClientDisplay(currentClient));
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [currentClient]);

    // Filtrer les clients selon la saisie
    const filteredClients = useMemo(() => {
        if (!searchTerm.trim() || searchTerm === formatClientDisplay(currentClient)) {
            return clients;
        }

        const query = searchTerm.toLowerCase().trim();
        return clients.filter((c) => {
            const nameMatch = c.name?.toLowerCase().includes(query);
            const companyMatch = c.company_name?.toLowerCase().includes(query);
            const emailMatch = c.email?.toLowerCase().includes(query);
            const phoneMatch = c.phone?.toLowerCase().includes(query);
            return nameMatch || companyMatch || emailMatch || phoneMatch;
        });
    }, [clients, searchTerm, currentClient]);

    const handleInputFocus = () => {
        setIsFocused(true);
        setIsOpen(true);
        // Si l'input contient le nom déjà sélectionné, on le sélectionne tout pour faciliter la saisie
        if (inputRef.current) {
            inputRef.current.select();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (!isOpen) {
            setIsOpen(true);
        }
    };

    const handleSelectClient = (client: Client) => {
        onChange(client.id);
        setSearchTerm(formatClientDisplay(client));
        setIsOpen(false);
        setIsFocused(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchTerm('');
        setIsOpen(true);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {label && (
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>{label}</span>
                    {isOpen && (
                        <span className="text-[10px] text-indigo-600 font-semibold">
                            {filteredClients.length} résultat{filteredClients.length > 1 ? 's' : ''}
                        </span>
                    )}
                </label>
            )}

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={14} />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder="Tapez le nom ou l'entreprise du client..."
                    disabled={disabled}
                    required={required}
                    className={`w-full pl-9 pr-16 py-2 bg-white border rounded-xl text-xs font-semibold text-slate-900 transition-all focus:outline-none ${
                        isOpen
                            ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                    }`}
                />

                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
                    {searchTerm && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                            title="Effacer la recherche"
                        >
                            <X size={12} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            if (!disabled) {
                                setIsOpen(!isOpen);
                                if (!isOpen && inputRef.current) {
                                    inputRef.current.focus();
                                }
                            }
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
                    >
                        <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
                        />
                    </button>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                        {filteredClients.length > 0 ? (
                            filteredClients.slice(0, 50).map((c) => {
                                const isSelected = c.id === selectedClientId;
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => handleSelectClient(c)}
                                        className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-colors ${
                                            isSelected
                                                ? 'bg-indigo-50/70 text-indigo-900 font-bold'
                                                : 'hover:bg-slate-50 text-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                                                    isSelected
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}
                                            >
                                                {c.company_name ? <Building2 size={13} /> : <User size={13} />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs truncate font-semibold">
                                                    {c.company_name ? (
                                                        <>
                                                            <span className="font-bold text-slate-900">{c.company_name}</span>
                                                            <span className="text-slate-500 font-normal ml-1.5">
                                                                ({c.name})
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="font-bold text-slate-900">{c.name}</span>
                                                    )}
                                                </div>
                                                {(c.email || c.phone) && (
                                                    <div className="text-[11px] text-slate-400 truncate font-normal">
                                                        {[c.phone, c.email].filter(Boolean).join(' • ')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="shrink-0 text-indigo-600 pl-2">
                                                <Check size={14} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center">
                                <p className="text-xs font-semibold text-slate-600">Aucun client trouvé</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Aucun résultat ne correspond à « {searchTerm} »
                                </p>
                            </div>
                        )}

                        {filteredClients.length > 50 && (
                            <div className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-500 text-center font-medium">
                                Affichage des 50 premiers résultats sur {filteredClients.length}. Affinez votre recherche.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
