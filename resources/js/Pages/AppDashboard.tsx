import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import DashboardView from '../Views/DashboardView';
import ClientsView from '../Views/ClientsView';
import ProductsView from '../Views/ProductsView';
import QuotesView from '../Views/QuotesView';
import InvoicesView from '../Views/InvoicesView';
import ReportsView from '../Views/ReportsView';
import SettingsView from '../Views/SettingsView';

import InvoiceDetailModal from '../Components/InvoiceDetailModal';
import InvoiceFormModal from '../Components/InvoiceFormModal';
import QuoteFormModal from '../Components/QuoteFormModal';
import ClientFormModal from '../Components/ClientFormModal';
import ProductFormModal from '../Components/ProductFormModal';


import { Invoice, Client, Product, Quote, Company, Payment, User } from '../types';

interface AppDashboardProps {
    user?: User;
    company?: Company;
    clients?: Client[];
    products?: Product[];
    invoices?: Invoice[];
    quotes?: Quote[];
    initialTab?: string;
}

const VALID_TABS = ['dashboard', 'clients', 'products', 'quotes', 'invoices', 'reports', 'settings'];

function resolveInitialTab(fallback: string = 'dashboard'): string {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && VALID_TABS.includes(tabParam)) {
            return tabParam;
        }

        const hash = window.location.hash.replace('#', '');
        if (hash && VALID_TABS.includes(hash)) {
            return hash;
        }

        const storedTab = localStorage.getItem('rivah_active_tab');
        if (storedTab && VALID_TABS.includes(storedTab)) {
            return storedTab;
        }
    }

    if (fallback && VALID_TABS.includes(fallback)) {
        return fallback;
    }

    return 'dashboard';
}

export default function AppDashboard({
    user,
    company: serverCompany,
    clients: serverClients = [],
    products: serverProducts = [],
    invoices: serverInvoices = [],
    quotes: serverQuotes = [],
    initialTab = 'dashboard',
}: AppDashboardProps) {
    const page = usePage();
    const flash = (page.props.flash as { success?: string; error?: string }) || {};

    const [activeTab, setActiveTab] = useState<string>(() => resolveInitialTab(initialTab));

    const handleTabChange = (tab: string) => {
        if (!VALID_TABS.includes(tab)) return;
        setActiveTab(tab);

        if (typeof window !== 'undefined') {
            localStorage.setItem('rivah_active_tab', tab);
            const url = new URL(window.location.href);
            if (tab === 'dashboard') {
                url.searchParams.delete('tab');
            } else {
                url.searchParams.set('tab', tab);
            }
            window.history.pushState({ tab }, '', url.toString());
        }
    };

    // Listen to browser Back/Forward navigation
    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab') || 'dashboard';
            if (VALID_TABS.includes(tabParam)) {
                setActiveTab(tabParam);
                localStorage.setItem('rivah_active_tab', tabParam);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Ensure URL matches current activeTab on initial load if not already set
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            const currentParam = url.searchParams.get('tab');
            if (activeTab !== 'dashboard' && currentParam !== activeTab) {
                url.searchParams.set('tab', activeTab);
                window.history.replaceState({ tab: activeTab }, '', url.toString());
            }
        }
    }, [activeTab]);

    // Synchronized state with server data
    const [company, setCompany] = useState<Company>(serverCompany );
    const [clients, setClients] = useState<Client[]>(serverClients);
    const [products, setProducts] = useState<Product[]>(serverProducts);
    const [invoices, setInvoices] = useState<Invoice[]>(serverInvoices);
    const [quotes, setQuotes] = useState<Quote[]>(serverQuotes);

    // Sync whenever server props update from an Inertia visit
    useEffect(() => {
        if (serverCompany) {
            setCompany(serverCompany);
        }
    }, [serverCompany]);

    useEffect(() => {
        setClients(serverClients);
    }, [serverClients]);

    useEffect(() => {
        setProducts(serverProducts);
    }, [serverProducts]);

    useEffect(() => {
        setInvoices(serverInvoices);
        if (viewedInvoice && serverInvoices) {
            const refreshed = serverInvoices.find((i) => i.id === viewedInvoice.id);
            if (refreshed) {
                setViewedInvoice(refreshed);
            }
        }
    }, [serverInvoices]);

    useEffect(() => {
        setQuotes(serverQuotes);
    }, [serverQuotes]);

    // Modals state
    const [viewedInvoice, setViewedInvoice] = useState<Invoice | null>(null);
    const [isPrintOpen, setIsPrintOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Handlers
    const handleNewInvoice = () => {
        setEditingInvoice(null);
        setIsInvoiceModalOpen(true);
    };

    const handleEditInvoice = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setIsInvoiceModalOpen(true);
    };

    const handleDeleteInvoice = (invoiceId: number) => {
        router.delete(`/invoices/${invoiceId}`, {
            preserveScroll: true,
            onSuccess: (pageProps) => {
                const refreshedInvoices = (pageProps.props.invoices as Invoice[]) || [];
                setInvoices(refreshedInvoices);
                if (viewedInvoice && viewedInvoice.id === invoiceId) {
                    const stillExists = refreshedInvoices.find((i) => i.id === invoiceId);
                    setViewedInvoice(stillExists || null);
                }
            },
        });
    };

    const handleViewInvoice = (invoice: Invoice) => {
        setIsPrintOpen(false);
        setViewedInvoice(invoice);
    };

    const handlePrintInvoice = (invoice: Invoice) => {
        setIsPrintOpen(true);
        setViewedInvoice(invoice);
    };

    const handleSaveInvoice = (
        invoiceData: Omit<Invoice, 'id' | 'amount_paid' | 'balance_due' | 'payments'>,
        editingId?: number
    ) => {
        const payload = {
            client_id: invoiceData.client_id,
            quote_id: invoiceData.quote_id || null,
            invoice_number: invoiceData.invoice_number,
            document_status: invoiceData.document_status,
            issue_date: invoiceData.issue_date,
            due_date: invoiceData.due_date || null,
            notes: invoiceData.notes || null,
            items: invoiceData.items.map((item, idx) => ({
                product_id: item.product_id || null,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unit_price: item.unit_price,
                discount_rate: item.discount_rate || 0,
                tax_rate: item.tax_rate || 18,
                position: idx + 1,
            })),
        };

        if (editingId) {
            router.put(`/invoices/${editingId}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsInvoiceModalOpen(false);
                    setEditingInvoice(null);
                },
            });
        } else {
            router.post('/invoices', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsInvoiceModalOpen(false);
                },
            });
        }
    };

    const handleAddPayment = (
        invoiceId: number,
        paymentData: Omit<Payment, 'id' | 'invoice_id' | 'recorded_by'>
    ) => {
        router.post(`/invoices/${invoiceId}/payments`, {
            amount: paymentData.amount,
            payment_date: paymentData.payment_date,
            method: paymentData.method,
            reference: paymentData.reference || null,
            notes: paymentData.notes || null,
        }, {
            preserveScroll: true,
            onSuccess: (pageProps) => {
                const refreshedInvoices = (pageProps.props.invoices as Invoice[]) || [];
                const target = refreshedInvoices.find((i) => i.id === invoiceId);
                if (target) {
                    setViewedInvoice(target);
                }
            },
        });
    };

    const handleSaveClient = (clientData: Omit<Client, 'id' | 'created_at' | 'total_invoiced' | 'total_paid' | 'balance_due'>) => {
        router.post('/clients', clientData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsClientModalOpen(false);
            },
        });
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleDeleteProduct = (productId: number) => {
        router.delete(`/products/${productId}`, {
            preserveScroll: true,
        });
    };

    const handleSaveProduct = (productData: Omit<Product, 'id'>, editingId?: number) => {
        if (editingId) {
            router.put(`/products/${editingId}`, productData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                },
            });
        } else {
            router.post('/products', productData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsProductModalOpen(false);
                },
            });
        }
    };

    const handleNewQuote = () => {
        setEditingQuote(null);
        setIsQuoteModalOpen(true);
    };

    const handleEditQuote = (quote: Quote) => {
        setEditingQuote(quote);
        setIsQuoteModalOpen(true);
    };

    const handleSaveQuote = (
        quoteData: Omit<Quote, 'id' | 'converted_invoice_id'>,
        editingId?: number
    ) => {
        const payload = {
            client_id: quoteData.client_id,
            quote_number: quoteData.quote_number,
            status: quoteData.status,
            issue_date: quoteData.issue_date,
            valid_until: quoteData.valid_until || null,
            notes: quoteData.notes || null,
            items: quoteData.items.map((item, idx) => ({
                product_id: item.product_id || null,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unit_price: item.unit_price,
                discount_rate: item.discount_rate || 0,
                tax_rate: item.tax_rate || 18,
                position: idx + 1,
            })),
        };

        if (editingId) {
            router.put(`/quotes/${editingId}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsQuoteModalOpen(false);
                    setEditingQuote(null);
                },
            });
        } else {
            router.post('/quotes', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsQuoteModalOpen(false);
                },
            });
        }
    };

    const handleConvertQuoteToInvoice = (quoteId: number) => {
        router.post(`/quotes/${quoteId}/convert`, {}, {
            preserveScroll: true,
            onSuccess: (pageProps) => {
                handleTabChange('invoices');
                const refreshedInvoices = (pageProps.props.invoices as Invoice[]) || [];
                if (refreshedInvoices.length > 0) {
                    setViewedInvoice(refreshedInvoices[0]);
                }
            },
        });
    };

    const handleSaveCompany = (updated: Company, logoFile?: File | null) => {
        const payload: Record<string, any> = {
            _method: 'PUT',
            name: updated.name,
            legal_name: updated.legal_name || null,
            email: updated.email || null,
            phone: updated.phone || null,
            address: updated.address || null,
            currency: updated.currency,
            payment_terms: updated.payment_terms,
            invoice_prefix: updated.invoice_prefix,
            quote_prefix: updated.quote_prefix,
            tax_id: updated.tax_id || null,
        };

        if (logoFile) {
            payload.logo = logoFile;
        }

        router.post('/settings/company', payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const refreshedCompany = (page.props as any)?.company;
                setCompany(refreshedCompany || updated);
            },
        });
    };

    return (
        <AuthenticatedLayout
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onNewInvoice={handleNewInvoice}
            companyName={company.name}
            userName={user?.name}
            companyLogo={company.logo_url}
        >
            <Head title={`RIVAH FACTURE - ${company.name}`} />

            {/* Flash Feedback Banner */}
            {flash.success && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in">
                    <span>{flash.success}</span>
                </div>
            )}
            {flash.error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in">
                    <span>{flash.error}</span>
                </div>
            )}

            {/* MAIN TAB CONTENT CONTAINER WITH SMOOTH ANIMATION */}
            <div key={activeTab} className="animate-fade-in-fast">
                {/* TAB 1: DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <DashboardView
                        invoices={invoices}
                        quotes={quotes}
                        clients={clients}
                        onNewInvoice={handleNewInvoice}
                        onViewInvoice={handleViewInvoice}
                        onEditInvoice={handleEditInvoice}
                        onDeleteInvoice={handleDeleteInvoice}
                        onPrintInvoice={handlePrintInvoice}
                        onTabChange={handleTabChange}
                        currency={company.currency}
                    />
                )}

            {/* TAB 2: CLIENTS */}
            {activeTab === 'clients' && (
                <ClientsView
                    clients={clients}
                    onNewClient={() => setIsClientModalOpen(true)}
                    currency={company.currency}
                />
            )}

            {/* TAB 3: PRODUCTS */}
            {activeTab === 'products' && (
                <ProductsView
                    products={products}
                    onNewProduct={() => {
                        setEditingProduct(null);
                        setIsProductModalOpen(true);
                    }}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteProduct}
                    currency={company.currency}
                />
            )}

            {/* TAB 4: QUOTES */}
            {activeTab === 'quotes' && (
                <QuotesView
                    quotes={quotes}
                    onNewQuote={handleNewQuote}
                    onEditQuote={handleEditQuote}
                    onConvertQuoteToInvoice={handleConvertQuoteToInvoice}
                    currency={company.currency}
                    clients={clients}
                    companyName={company.name}
                    company={company}
                />
            )}

            {/* TAB 5: INVOICES (Integrated Payments view) */}
            {activeTab === 'invoices' && (
                <InvoicesView
                    invoices={invoices}
                    onNewInvoice={handleNewInvoice}
                    onViewInvoice={handleViewInvoice}
                    onEditInvoice={handleEditInvoice}
                    onDeleteInvoice={handleDeleteInvoice}
                    onPrintInvoice={handlePrintInvoice}
                    currency={company.currency}
                />
            )}

            {/* TAB 6: REPORTS */}
            {activeTab === 'reports' && (
                <ReportsView
                    invoices={invoices}
                    quotes={quotes}
                    currency={company.currency}
                />
            )}

                {/* TAB 7: SETTINGS */}
                {activeTab === 'settings' && (
                    <SettingsView
                        company={company}
                        onSaveCompany={handleSaveCompany}
                    />
                )}
            </div>

            {/* MODALS */}
            {/* Invoice Detail & Integrated Payment Drawer */}
            <InvoiceDetailModal
                invoice={viewedInvoice}
                onClose={() => {
                    setViewedInvoice(null);
                    setIsPrintOpen(false);
                }}
                onAddPayment={handleAddPayment}
                companyName={company.name}
                initialShowPrint={isPrintOpen}
            />

            {/* Invoice Form Builder */}
            <InvoiceFormModal
                isOpen={isInvoiceModalOpen}
                onClose={() => {
                    setIsInvoiceModalOpen(false);
                    setEditingInvoice(null);
                }}
                onSave={handleSaveInvoice}
                clients={clients}
                products={products}
                currency={company.currency}
                invoiceToEdit={editingInvoice}
            />

            {/* Quote Form Builder */}
            <QuoteFormModal
                isOpen={isQuoteModalOpen}
                onClose={() => {
                    setIsQuoteModalOpen(false);
                    setEditingQuote(null);
                }}
                onSave={handleSaveQuote}
                clients={clients}
                products={products}
                currency={company.currency}
                quoteToEdit={editingQuote}
            />

            {/* Client Form */}
            <ClientFormModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                onSave={handleSaveClient}
            />

            {/* Product Form */}
            <ProductFormModal
                isOpen={isProductModalOpen}
                onClose={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                }}
                onSave={handleSaveProduct}
                currency={company.currency}
                initialProduct={editingProduct}
            />
        </AuthenticatedLayout>
    );
}
