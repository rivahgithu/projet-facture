import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Building2,
    Phone,
    ArrowRight,
    ArrowLeft,
    Upload,
    Image as ImageIcon,
    X
} from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoError, setLogoError] = useState<string>('');
    const [agreeTerms, setAgreeTerms] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setLogoError('');
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setLogoError('Le fichier sélectionné doit être une image (PNG, JPG, SVG, WEBP).');
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            setLogoError('La taille de l\'image ne doit pas dépasser 4 Mo.');
            return;
        }

        setLogoFile(file);
        const previewUrl = URL.createObjectURL(file);
        setLogoPreview(previewUrl);
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        if (logoPreview) {
            URL.revokeObjectURL(logoPreview);
            setLogoPreview(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!name || !companyName || !email || !password || !passwordConfirmation) {
            setErrorMessage('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        if (password.length < 8) {
            setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
            return;
        }

        if (password !== passwordConfirmation) {
            setErrorMessage('Les deux mots de passe ne correspondent pas.');
            return;
        }

        if (!agreeTerms) {
            setErrorMessage('Veuillez accepter les conditions d\'utilisation.');
            return;
        }

        setIsLoading(true);

        router.post('/register', {
            name,
            company_name: companyName,
            email,
            phone,
            password,
            password_confirmation: passwordConfirmation,
            logo: logoFile,
        }, {
            forceFormData: true,
            onError: (errors) => {
                setIsLoading(false);
                const firstError = Object.values(errors)[0] as string;
                setErrorMessage(firstError || 'Erreur lors de la création du compte.');
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#f8f9fd] flex flex-col justify-center items-center selection:bg-indigo-500 selection:text-white font-sans py-12 px-4 sm:px-6">
            <Head title="Créer un compte - Rivah Facture" />

            {/* Top Return to Home Button */}
            <div className="absolute top-6 left-6 z-20">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 shadow-xs transition"
                >
                    <ArrowLeft size={14} />
                    <span>Retour à l'accueil</span>
                </Link>
            </div>

            <div className="w-full max-w-xl mx-auto">
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-indigo-500/5 p-6 sm:p-10">
                    {/* Centered Brand Logo & Title */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 font-black text-white text-2xl tracking-wider group-hover:scale-105 transition-transform duration-200">
                                R
                            </div>
                            <div className="text-left">
                                <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                                    Rivah
                                </span>
                                <span className="text-xs text-indigo-600 font-bold ml-1.5 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 uppercase tracking-wide">
                                    FACTURE
                                </span>
                            </div>
                        </Link>

                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Créer votre compte
                        </h1>
                        
                    </div>

                    {/* Error Alert */}
                    {errorMessage && (
                        <div className="p-3 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                            {errorMessage}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* Full Name */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Nom complet *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Yves Kouakou"
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Company Name */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Nom de l'entreprise / Agence *
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Rivah Digital Agency"
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Company Logo Upload */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-[11px] font-bold text-slate-700">
                                    Logo de l'entreprise <span className="text-slate-400 font-normal">(Optionnel)</span>
                                </label>
                                <span className="text-[10px] text-slate-400 font-medium">PNG, JPG, WEBP jusqu'à 4 Mo</span>
                            </div>

                            {logoPreview ? (
                                <div className="p-3 bg-slate-50 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-fade-in-fast">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                                            <img
                                                src={logoPreview}
                                                alt="Aperçu logo"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="truncate">
                                            <div className="text-xs font-bold text-slate-900 truncate">
                                                {logoFile?.name}
                                            </div>
                                            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1.5 mt-0.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                                <span>{(logoFile ? logoFile.size / 1024 : 0).toFixed(0)} Ko • Prêt pour votre navigation & factures</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveLogo}
                                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                        title="Supprimer ce logo"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="group relative flex flex-col sm:flex-row items-center justify-center gap-3 p-3.5 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl bg-slate-50/60 hover:bg-indigo-50/30 cursor-pointer transition text-center sm:text-left">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                        onChange={handleLogoChange}
                                        className="sr-only"
                                    />
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 group-hover:border-indigo-300 group-hover:scale-105 shadow-xs transition shrink-0">
                                        <Upload size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition">
                                            Cliquez pour importer le logo de votre entreprise
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            Il s'affichera dans la barre de navigation et sur tous vos devis / factures
                                        </div>
                                    </div>
                                </label>
                            )}
                            {logoError && (
                                <p className="text-[10px] text-rose-600 font-medium mt-1">
                                    {logoError}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* Email */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Adresse e-mail *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="contact@agence.ci"
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Téléphone
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+225 07 00 11 22 33"
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Mot de passe (8 caractères min.) *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Password Confirmation */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Confirmer le mot de passe *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* Terms agreement */}
                        <div className="pt-1">
                            <label className="flex items-start gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
                                />
                                <span className="text-[11px] text-slate-600 leading-tight">
                                    J'accepte les conditions d'utilisation et la politique de confidentialité de Rivah Facture.
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-3 py-3.5 cursor-pointer rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <span>Création de votre espace...</span>
                            ) : (
                                <>
                                    <span>Créer mon compte</span>
                                    <ArrowRight size={15} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Link to Login */}
                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-600">
                            Vous avez déjà un compte ?{' '}
                            <Link
                                href="/login"
                                className="font-bold text-indigo-600 hover:text-indigo-800 transition"
                            >
                                Connectez-vous
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
