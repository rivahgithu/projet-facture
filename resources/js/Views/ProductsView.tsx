import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils';
import {
    Search,
    PackagePlus,
    Pencil,
    Trash2,
    X,
    Package,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

interface ProductsViewProps {
    products: Product[];
    onNewProduct: () => void;
    onEditProduct?: (product: Product) => void;
    onDeleteProduct?: (productId: number) => void;
    currency: string;
}

export default function ProductsView({
    products,
    onNewProduct,
    onEditProduct,
    onDeleteProduct,
    currency,
}: ProductsViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    // Pagination : 6 produits par page (2 lignes × 3 colonnes)
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(6);

    const filteredProducts = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return products.filter((p) => {
            if (!q) return true;
            return (
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                (p.reference && p.reference.toLowerCase().includes(q))
            );
        });
    }, [products, searchQuery]);

    // Réinitialiser la pagination lors d'une recherche ou d'un changement de taille
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, pageSize]);

    // Calculs de pagination
    const totalItems = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const handleConfirmDelete = () => {
        if (productToDelete && onDeleteProduct) {
            onDeleteProduct(productToDelete.id);
        }
        setProductToDelete(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Catalogue Produits &amp; Services</h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Gérez vos prestations, forfaits et articles réutilisables dans les devis et factures.
                    </p>
                </div>

                <button
                    onClick={onNewProduct}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer"
                >
                    <PackagePlus size={16} />
                    <span>Nouveau Service / Produit</span>
                </button>
            </div>

            {/* Search Bar & Total Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher un service par nom, référence..."
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
                    <Package size={15} className="text-slate-400" />
                    <span>
                        <strong className="text-slate-900 font-bold">{totalItems}</strong> produit{totalItems > 1 ? 's' : ''} au total
                    </span>
                </div>
            </div>

            {/* Grid Catalog */}
            {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProducts.map((prod) => (
                        <div
                            key={prod.id}
                            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                        >
                            <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-sm">{prod.name}</h3>
                                        {prod.reference && (
                                            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-bold mt-1 inline-block">
                                                {prod.reference}
                                            </span>
                                        )}
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                        Actif
                                    </span>
                                </div>

                                <p className="text-xs text-slate-500 line-clamp-2 font-medium">{prod.description}</p>
                            </div>

                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Prix Unitaire HT</span>
                                        <span className="font-black text-slate-900 font-mono text-sm">
                                            {formatCurrency(prod.unit_price, currency)} <span className="text-[10px] text-slate-400 font-sans font-normal">/ {prod.unit}</span>
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">TVA</span>
                                        <span className="text-xs font-bold text-slate-700 font-mono">
                                            {prod.tax_rate}%
                                        </span>
                                    </div>
                                </div>

                                {/* Action buttons: Edit and Delete */}
                                <div className="pt-2 border-t border-slate-100/70 flex items-center justify-end gap-2">
                                    {onEditProduct && (
                                        <button
                                            onClick={() => onEditProduct(prod)}
                                            title="Modifier la prestation"
                                            className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-600  hover:text-white transition flex items-center justify-center border border-amber-200/60 shadow-2xs cursor-pointer"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    )}

                                    {onDeleteProduct && (
                                        <button
                                            onClick={() => setProductToDelete(prod)}
                                            title="Supprimer la prestation"
                                            className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-600  hover:text-white transition flex items-center justify-center border border-rose-200/60 shadow-2xs cursor-pointer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
            				</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-xs">
                    <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                            <Package size={24} />
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                            Aucun service ou produit trouvé
                        </div>
                        <p className="text-xs text-slate-500">
                            {searchQuery
                                ? 'Aucun résultat ne correspond à votre recherche.'
                                : 'Votre catalogue est actuellement vide. Ajoutez votre premier produit ou service !'}
                        </p>
                        {searchQuery ? (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition cursor-pointer"
                            >
                                <X size={13} />
                                <span>Effacer la recherche</span>
                            </button>
                        ) : (
                            <button
                                onClick={onNewProduct}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                                <PackagePlus size={14} />
                                <span>Ajouter un premier produit</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {totalItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 text-xs bg-white p-5 rounded-3xl shadow-xs">
                    {/* Left: Info & Row count selector */}
                    <div className="flex flex-wrap items-center gap-3 text-slate-500">
                        <span>
                            Affichage de <strong className="text-slate-900 font-bold">{startIndex + 1}</strong> à{' '}
                            <strong className="text-slate-900 font-bold">{endIndex}</strong> sur{' '}
                            <strong className="text-slate-900 font-bold">{totalItems}</strong> produit{totalItems > 1 ? 's' : ''}
                        </span>

                        <div className="flex items-center gap-1.5 pl-2 sm:border-l border-slate-200">
                            <span className="text-[11px] text-slate-400 font-medium">Lignes :</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value={6}>6 produits (2 lignes)</option>
                                <option value={12}>12 produits (4 lignes)</option>
                                <option value={18}>18 produits (6 lignes)</option>
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

            {/* Delete Confirmation Modal */}
            {productToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900">Confirmer la suppression</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Êtes-vous sûr de vouloir supprimer{' '}
                                <strong className="text-slate-900">{productToDelete.name}</strong>{' '}
                                {productToDelete.reference && (
                                    <span className="font-mono text-indigo-600">({productToDelete.reference})</span>
                                )}{' '}
                                du catalogue ?
                            </p>
                            <p className="text-[11px] text-rose-500 font-medium mt-1">
                                Cet article sera archivé et ne sera plus proposé pour les nouveaux devis et factures.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setProductToDelete(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <Trash2 size={14} />
                                <span>Supprimer du catalogue</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
