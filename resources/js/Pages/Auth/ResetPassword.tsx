import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    KeyRound
} from 'lucide-react';

interface ResetPasswordProps {
    token: string;
    email?: string;
}

export default function ResetPassword({ token, email: initialEmail = '' }: ResetPasswordProps) {
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        if (!email.trim() || !password || !passwordConfirmation) {
            setErrorMessage('Veuillez remplir tous les champs obligatoires.');
            setIsLoading(false);
            return;
        }

        if (password.length < 8) {
            setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
            setIsLoading(false);
            return;
        }

        if (password !== passwordConfirmation) {
            setErrorMessage('Les deux mots de passe ne correspondent pas.');
            setIsLoading(false);
            return;
        }

        router.post('/reset-password', {
            token,
            email,
            password,
            password_confirmation: passwordConfirmation,
        }, {
            onError: (errors) => {
                setIsLoading(false);
                const firstError = Object.values(errors)[0] as string;
                setErrorMessage(firstError || "Impossible de réinitialiser le mot de passe. Le lien est peut-être expiré.");
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#f8f9fd] flex flex-col justify-center items-center selection:bg-indigo-500 selection:text-white font-sans py-12 px-4 sm:px-6">
            <Head title="Nouveau mot de passe - Rivah Facture" />

            {/* Top Return to Login Button */}
            <div className="absolute top-6 left-6 z-20">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 shadow-xs transition"
                >
                    <ArrowLeft size={14} />
                    <span>Retour à la connexion</span>
                </Link>
            </div>

            <div className="w-full max-w-md mx-auto">
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

                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2">
                            Définir un nouveau mot de passe
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                            Choisissez un nouveau mot de passe d'au moins 8 caractères pour accéder à votre espace.
                        </p>
                    </div>

                    {/* Error Alert */}
                    {errorMessage && (
                        <div className="p-3 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                            {errorMessage}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Adresse e-mail
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nom@entreprise.ci"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* New Password Field */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Au moins 8 caractères"
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                    aria-label="Afficher ou masquer"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Confirmer le nouveau mot de passe
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    placeholder="Retapez le mot de passe"
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                    aria-label="Afficher ou masquer"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            >
                                {isLoading ? (
                                    <span>Mise à jour en cours...</span>
                                ) : (
                                    <>
                                        <span>Enregistrer le nouveau mot de passe</span>
                                        <ArrowRight size={15} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Return to Login */}
                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                        <Link
                            href="/login"
                            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition inline-flex items-center gap-1.5"
                        >
                            <ArrowLeft size={13} />
                            <span>Revenir à la page de connexion</span>
                        </Link>
                    </div>
                </div>

                <div className="text-center mt-6 text-xs text-slate-400">
                    © 2026 Rivah Facture. Tous droits réservés.
                </div>
            </div>
        </div>
    );
}
