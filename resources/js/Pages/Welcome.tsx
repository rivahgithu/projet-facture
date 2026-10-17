import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    FileText,
    Receipt,
    BarChart3,
    Users,
    Package,
    Sparkles,
    Star,
    Building2,
    Printer,
    Clock,
    ArrowUpRight,
    Menu,
    X,
    Wallet,
    Check,
    ChevronDown,
    Zap,
    Send,
    Mail,
    User,
    HelpCircle,
    Phone,
    MapPin
} from 'lucide-react';

export default function Welcome() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    // Formulaire de contact
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [contactLoading, setContactLoading] = useState(false);
    const [contactSuccess, setContactSuccess] = useState(false);
    const [contactError, setContactError] = useState('');

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setContactError('');

        if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.subject.trim() || !contactForm.message.trim()) {
            setContactError('Veuillez renseigner tous les champs obligatoires.');
            return;
        }

        setContactLoading(true);

        router.post('/contact', contactForm, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                if (page?.props?.flash?.error) {
                    setContactError(page.props.flash.error);
                } else {
                    setContactSuccess(true);
                    setContactForm({ name: '', email: '', subject: '', message: '' });
                }
                setContactLoading(false);
            },
            onError: (errors) => {
                const firstErr = Object.values(errors)[0] as string;
                setContactError(firstErr || "Une erreur s'est produite lors de l'envoi.");
                setContactLoading(false);
            },
            onFinish: () => {
                setContactLoading(false);
            },
        });
    };

    const features = [
        {
            icon: FileText,
            color: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50 text-blue-600',
            title: 'Devis Commerciaux & Conversion',
            description:
                'Émettez des devis conformes avec TVA 18% et remises. Transformez un devis accepté en facture officielle en un clic sans ressaisie.',
        },
        {
            icon: Receipt,
            color: 'from-orange-500 to-rose-500',
            bg: 'bg-orange-50 text-orange-600',
            title: 'Factures & Règlements Intégrés',
            description:
                'Gérez les acomptes et le solde restant directement dans la fiche de la facture. Pas de menu bancaire complexe : suivez espèces, chèques, virements et Mobile Money.',
        },
        {
            icon: Printer,
            color: 'from-emerald-500 to-teal-600',
            bg: 'bg-emerald-50 text-emerald-600',
            title: 'PDF & Reçus Haute Fidélité',
            description:
                'Générez des documents imprimables au format A4 avec en-tête d\'agence, mentions légales, conditions de paiement et cadre de signature.',
        },
        {
            icon: Users,
            color: 'from-violet-500 to-purple-600',
            bg: 'bg-violet-50 text-violet-600',
            title: 'Fichier Clients & Historique',
            description:
                'Centralisez vos clients avec leur N° CC/IFU et coordonnées. Consultez l\'encours, le total facturé et le solde dû pour chacun d\'eux.',
        },
        {
            icon: Package,
            color: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50 text-amber-600',
            title: 'Catalogue Produits & Services',
            description:
                'Gagnez un temps précieux en pré-enregistrant vos prestations, forfaits et taux horaires en FCFA. Les documents émis conservent leurs tarifs figés.',
        },
        {
            icon: BarChart3,
            color: 'from-cyan-500 to-blue-600',
            bg: 'bg-cyan-50 text-cyan-600',
            title: 'Tableau de Bord & Trésorerie',
            description:
                'Indicateurs en temps réel : total facturé, montants encaissés, créances en retard et comparatifs mensuels pour maîtriser votre trésorerie.',
        },
    ];

    const faqs = [
        {
            q: 'Pourquoi Rivah Facture n\'a-t-il pas de menu "Paiements" autonome ?',
            a: 'C\'est un choix d\'ergonomie pensé pour les freelances et PME : dans la réalité des affaires, chaque règlement (acompte, virement, Mobile Money) s\'attache directement à une facture précise. Vous enregistrez et visualisez vos encaissements au cœur de chaque facture sans jongler entre des menus superflus.',
        },
        {
            q: 'La devise par défaut est-elle adaptée à la zone Afrique de l\'Ouest ?',
            a: 'Oui, l\'application est nativement paramétrée en Francs CFA (XOF / FCFA), avec gestion des mentions légales locales (N° CC, IFU, TVA 18%). Les formats de montants et dates respectent les normes d\'usage.',
        },
        {
            q: 'Puis-je imprimer directement mes devis et factures ?',
            a: 'Absolument. Chaque document dispose d\'un mode d\'impression haute définition au format A4 avec logo d\'entreprise, coordonnées, tableau détaillé des prestations, totaux arrêtés et bloc de signature/cachet client.',
        },
        {
            q: 'Puis-je tester l\'application sans engagement ?',
            a: 'Oui, vous pouvez explorer la démo interactive immédiatement ou créer un compte gratuitement en quelques secondes sans carte bancaire.',
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fd] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
            <Head title="Facturation et Devis pour Freelances et PME en FCFA" />

            {/* Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 font-black text-white text-2xl tracking-wider group-hover:scale-105 transition-transform duration-200">
                            R
                        </div>
                        <div>
                            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                                Rivah
                            </span>
                            <span className="text-xs text-indigo-600 font-bold ml-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 uppercase tracking-wide">
                                Facture
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#features" className="hover:text-indigo-600 transition">
                            Fonctionnalités
                        </a>
                        <a href="#workflow" className="hover:text-indigo-600 transition">
                            Cycle commercial
                        </a>
                        <a href="#contact" className="hover:text-indigo-600 transition">
                            Contact
                        </a>
                        <a href="#faq" className="hover:text-indigo-600 transition">
                            FAQ
                        </a>
                    </nav>

                    {/* Auth CTAs */}
                    <div className="hidden sm:flex items-center gap-3">
                        <Link
                            href="/login"
                            className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition"
                        >
                            Connexion
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold shadow-md shadow-indigo-500/25 transition"
                        >
                            <span>Créer un compte</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        aria-label="Menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
                        <a
                            href="#features"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 text-sm font-semibold text-slate-700"
                        >
                            Fonctionnalités
                        </a>
                        <a
                            href="#workflow"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 text-sm font-semibold text-slate-700"
                        >
                            Cycle commercial
                        </a>
                        <a
                            href="#contact"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 text-sm font-semibold text-slate-700"
                        >
                            Contact
                        </a>
                        <a
                            href="#faq"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 text-sm font-semibold text-slate-700"
                        >
                            FAQ
                        </a>
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <Link
                                href="/login"
                                className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100"
                            >
                                Connexion
                            </Link>
                            <Link
                                href="/register"
                                className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 shadow-md shadow-indigo-500/25"
                            >
                                Créer un compte
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* HERO SECTION */}
            <section className="relative overflow-hidden pt-16 pb-24 md:pt-28 md:pb-32">
                {/* Image d'arrière-plan de facturation visible et nette */}
                <img
                    src="/images/hero-invoice-light-bg.jpg"
                    alt="Application de Facturation et Devis en Ligne"
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
                />

                {/* Voile protecteur léger pour sublimer l'image tout en assurant une lisibilité parfaite */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/70 pointer-events-none z-0" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Top Announcement Tag */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold mb-6 shadow-xs animate-fade-in">
                        
                        <span>La solution de gestion commerciale conçue pour l'Afrique de l'Ouest</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="text-slate-500 font-medium">100% FCFA</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
                        Facturez en <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent">FCFA</span>, encaissez sans délai, pilotez avec clarté.
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
                        Préparez vos devis, convertissez-les en factures en un clic et suivez vos règlements partiels directement sur chaque document. Fini la complexité, place à l'efficacité.
                    </p>

                    {/* CTAs */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition"
                        >
                            <span>Démarrer gratuitement</span>
                            <ArrowRight size={18} />
                        </Link>

                    </div>

                    {/* Reassurance Badges */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>Aucune carte bancaire requise</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>Devise FCFA & TVA 18% pré-configurées</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>Impression PDF prête pour A4</span>
                        </div>
                    </div>

                  
            </div>
            </section>

            {/* TRUST & AUDIENCE BAR */}
            <section className="py-12 border-y border-slate-200/80 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                        Pensé pour les professionnels et entreprises en croissance
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-700 font-bold text-sm">
                        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <Users size={18} className="text-indigo-600" />
                            <span>Développeurs & Freelances</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <Building2 size={18} className="text-indigo-600" />
                            <span>Agences Digitales & Com</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <Sparkles size={18} className="text-indigo-600" />
                            <span>Consultants & Prestataires</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <ShieldCheck size={18} className="text-indigo-600" />
                            <span>PME & TPE de Services</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-4">
                            Fonctionnalités Clés
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Tout ce dont vous avez besoin pour structurer votre facturation
                        </h2>
                        <p className="mt-4 text-base sm:text-lg text-slate-600">
                            Une interface simple et rapide, pensée sans surcharge inutile, centrée sur le cycle commercial réel.
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feat, idx) => {
                            const Icon = feat.icon;
                            return (
                                <div
                                    key={idx}
                                    className="bg-white p-7 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 group"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feat.bg} group-hover:scale-110 transition-transform duration-200`}>
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        {feat.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {feat.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* WORKFLOW SECTION */}
            <section id="workflow" className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-4">
                            Cycle Commercial Sans Friction
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                            De la proposition au paiement en 4 étapes fluides
                        </h2>
                        <p className="mt-4 text-slate-300 text-base">
                            Comment Rivah Facture transforme la paperasse en une expérience professionnelle et rassurante.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Créez votre client & devis',
                                desc: 'Renseignez les coordonnées du client et composez le devis avec vos articles et TVA 18%.',
                            },
                            {
                                step: '02',
                                title: 'Obtenez l\'accord & signature',
                                desc: 'Imprimez ou exportez en PDF le document haute qualité avec le cadre légal « Bon pour accord ».',
                            },
                            {
                                step: '03',
                                title: 'Convertissez en facture',
                                desc: 'En un clic, le devis accepté devient une facture numérotée selon vos préfixes définis.',
                            },
                            {
                                step: '04',
                                title: 'Enregistrez les règlements',
                                desc: 'Ajoutez les acomptes (virement, chèque, Mobile Money) directement sur la facture. Le solde s\'ajuste seul.',
                            },
                        ].map((item, i) => (
                            <div key={i} className="relative bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80">
                                <div className="text-3xl font-black text-indigo-400/50 mb-3">{item.step}</div>
                                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CONTACT SECTION (Remplace Tarifs) */}
            <section id="contact" className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-white via-[#f8f9fd] to-white border-t border-slate-200/80">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute bottom-10 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-4">
                            <Mail size={14} className="text-indigo-600" />
                            <span>Contact & Échange</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Une question ? Parlons de votre facturation
                        </h2>
                        <p className="mt-4 text-base sm:text-lg text-slate-600">
                            Notre équipe est à votre disposition pour vous assister, vous présenter l'application ou recueillir vos suggestions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">
                        {/* Coordonnées / Colonne d'information */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-[#f8f9fd] border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
                                <h3 className="text-xl font-black text-slate-900">
                                    Restons en contact
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Freelances, agences et PME en Afrique de l'Ouest : nous simplifions la vie de votre entreprise avec des outils adaptés au marché local.
                                </p>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email support & commercial</div>
                                            <a href="mailto:rivahfacture@gmail.com" className="text-sm font-bold text-slate-800 hover:text-indigo-600 transition">
                                                rivahfacture@gmail.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Téléphone & WhatsApp</div>
                                            <div className="text-sm font-bold text-slate-800">
                                                +225 05 96 68 88 03
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Localisation</div>
                                            <div className="text-sm font-bold text-slate-800">
                                                Abidjan, Côte d'Ivoire
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200/80">
                                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>Réponse garantie sous 24h ouvrées</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Colonne Formulaire */}
                        <div className="lg:col-span-7">
                            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/40">
                                {contactSuccess ? (
                                    <div className="py-8 text-center space-y-4">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                                            <CheckCircle2 size={36} />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900">
                                            Message envoyé avec succès !
                                        </h3>
                                        <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                                            Merci de nous avoir écrit. Notre équipe commerciale et support a bien reçu votre demande et vous répondra sous 24h ouvrées.
                                        </p>
                                        <div className="pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setContactSuccess(false)}
                                                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition"
                                            >
                                                Envoyer un autre message
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleContactSubmit} className="space-y-5">
                                        <h3 className="text-lg font-black text-slate-900 mb-1">
                                            Envoyez-nous un message
                                        </h3>
                                        <p className="text-xs text-slate-500 mb-4">
                                            Tous les champs marqués d'un astérisque (<span className="text-rose-500">*</span>) sont obligatoires.
                                        </p>

                                        {contactError && (
                                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                                                {contactError}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            {/* Nom */}
                                            <div>
                                                <label className="block text-xs font-bold  tracking-wider text-slate-700 mb-2">
                                                    Nom <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                        <User size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={contactForm.name}
                                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                                        placeholder="Ex: Kouamé Jean-Marc"
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="block text-xs font-bold  tracking-wider text-slate-700 mb-2">
                                                    Email <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                        <Mail size={18} />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        value={contactForm.email}
                                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                                        placeholder="jean.kouame@entreprise.ci"
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sujet */}
                                        <div>
                                            <label className="block text-xs font-bold  tracking-wider text-slate-700 mb-2">
                                                Sujet <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                    <HelpCircle size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={contactForm.subject}
                                                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                                    placeholder="Ex: Demande de démonstration, question sur la TVA..."
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block text-xs font-bold  tracking-wider text-slate-700 mb-2">
                                                Message <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={contactForm.message}
                                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                                placeholder="Expliquez-nous brièvement votre besoin ou posez votre question..."
                                                className="w-full p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition resize-none"
                                                required
                                            />
                                        </div>

                                        {/* Bouton Envoyer */}
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={contactLoading}
                                                className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 disabled:pointer-events-none"
                                            >
                                                {contactLoading ? (
                                                    <span>Envoi en cours...</span>
                                                ) : (
                                                    <>
                                                        <span>Envoyer</span>
                                                        <Send size={16} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section id="faq" className="py-16 bg-white border-t border-slate-200/80">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                            Foire aux questions
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Tout ce que vous devez savoir pour démarrer sereinement avec Rivah Facture.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="border border-slate-200/90 rounded-2xl p-5 bg-[#f8f9fd] cursor-pointer transition hover:bg-white"
                                onClick={() => toggleFaq(idx)}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-slate-900 pr-4">
                                        {faq.q}
                                    </h3>
                                    <ChevronDown
                                        size={18}
                                        className={`text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-indigo-600' : ''}`}
                                    />
                                </div>
                                {activeFaq === idx && (
                                    <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                                        {faq.a}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA BANNER */}
            <section className="py-20 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-600 text-white text-center relative">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                        Prêt à faire passer votre facturation au niveau supérieur ?
                    </h2>
                    <p className="mt-4 text-indigo-100 text-base max-w-2xl mx-auto">
                        Rejoignez Rivah Facture dès aujourd'hui. Émettez votre premier devis ou votre première facture en moins de 2 minutes.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-indigo-700 font-extrabold text-sm shadow-xl transition"
                        >
                            Créer un compte maintenant
                        </Link>
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-500/40 hover:bg-indigo-500/60 text-white font-bold text-sm border border-white/20 transition"
                        >
                            Se connecter
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                            R
                        </div>
                        <div>
                            <span className="font-extrabold text-white text-base">Rivah Facture</span>
                            <span className="text-[10px] text-slate-500 block">Gestion commerciale & facturation en FCFA</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 font-semibold">
                        <Link href="/login" className="hover:text-white transition">Connexion</Link>
                        <Link href="/register" className="hover:text-white transition">Inscription</Link>
                       
                    </div>

                    <div className="text-slate-500">
                        © 2026 Rivah Facture. Tous droits réservés. Abidjan, Côte d'Ivoire.
                    </div>
                </div>
            </footer>
        </div>
    );
}
