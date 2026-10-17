import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Users, 
    Package, 
    FileText, 
    Receipt, 
    BarChart3, 
    Settings, 
    Bell, 
    Search, 
    Plus, 
    Building2, 
    Menu, 
    X,
    LogOut,
    Sparkles,
    Sun
} from 'lucide-react';
import AppLoader from '../Components/AppLoader';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onNewInvoice: () => void;
    companyName: string;
    userName?: string;
    companyLogo?: string | null;
}

export default function AuthenticatedLayout({
    children,
    activeTab,
    onTabChange,
    onNewInvoice,
    companyName,
    userName,
    companyLogo,
}: AuthenticatedLayoutProps) {
    const { auth } = usePage<{ auth?: { user?: { id: number; name: string; email: string } | null } }>().props;
    const name = userName || auth?.user?.name || 'Utilisateur';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'clients', label: 'Clients', icon: Users },
        { id: 'products', label: 'Produits & Services', icon: Package },
        { id: 'quotes', label: 'Devis', icon: FileText },
        { id: 'invoices', label: 'Factures', icon: Receipt },
        { id: 'reports', label: 'Rapports', icon: BarChart3 },
        { id: 'settings', label: 'Paramètres', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fd] text-slate-800 flex flex-col font-sans">
            <AppLoader />
            {/* Top Navigation Bar */}
            <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-xs">
                {/* Mobile Menu Toggle & Logo */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/20 font-black text-white text-xl tracking-wider">
                            R
                        </div>
                        <div>
                            <span className="font-extrabold text-xl tracking-tight text-slate-900">
                                Rivah
                            </span>
                            <span className="text-xs text-indigo-600 font-bold ml-1.5 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">
                                FACTURE
                            </span>
                        </div>
                    </div>
                </div>


                {/* Right Profile & Create Invoice Coral Button */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onNewInvoice}
                        className="inline-flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl bg-[#ff6b52] hover:bg-[#f05a41] active:scale-95 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition"
                    >
                        <Plus size={16} />
                        <span>Créer une Facture</span>
                    </button>

                    

                    <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

                    <div
                        onClick={() => onTabChange('settings')}
                        className="flex items-center gap-2.5 pl-1 cursor-pointer group"
                        title="Paramètres de l'entreprise"
                    >
                        {companyLogo ? (
                            <img
                                src={companyLogo}
                                alt={companyName}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-white shadow-xs group-hover:ring-2 group-hover:ring-indigo-500/25 transition"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-indigo-200 transition">
                                {companyName ? companyName.slice(0, 2).toUpperCase() : name.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div className="hidden md:block text-left">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                Entreprise
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Building2 size={10} />
                                {companyName}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 relative">
                {/* Sidebar Navigation (White Clean Light theme matching reference UI) */}
                <aside
                    className={`
                        w-64 border-r border-slate-200/80 bg-white flex flex-col justify-between py-6 px-3 fixed md:sticky top-16 h-[calc(100vh-4rem)] z-20 transition-transform duration-300 shadow-xs
                        ${mobileMenuOpen ? 'translate-x-0 bg-white' : '-translate-x-full md:translate-x-0'}
                    `}
                >
                    <div className="space-y-6">
                        {/* Company Badge Header */}
                        <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                                {companyLogo ? (
                                    <img
                                        src={companyLogo}
                                        alt={companyName}
                                        className="w-7 h-7 rounded-lg object-cover border border-slate-200 bg-white shrink-0 shadow-xs"
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                        <Building2 size={14} />
                                    </div>
                                )}
                                <div className="truncate">
                                    <div className="text-xs font-bold text-slate-900 truncate">{name}</div>
                                    <div className="text-[10px] text-slate-500 font-medium">Nom utilisateur </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Navigation Menu */}
                        <nav className="space-y-1">
                            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Navigation principale
                            </div>

                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            onTabChange(item.id);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`
                                            w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs transition-all group
                                            ${
                                                isActive
                                                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                                                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 font-medium'
                                            }
                                        `}
                                    >
                                        <Icon
                                            size={18}
                                            className={`transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}
                                        />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom Sidebar Info & Logout */}
                    <div className="space-y-3 px-1">

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-[#ff6b52] font-semibold text-white hover:bg-[#f05a41] transition cursor-pointer text-left"
                        >
                            <LogOut size={16} />
                            <span>Déconnexion</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 min-w-0 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
