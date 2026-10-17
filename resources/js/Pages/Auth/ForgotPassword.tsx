import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Mail,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Send
} from 'lucide-react';

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState(status || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);

        if (!email.trim()) {
            setErrorMessage('Veuillez renseigner votre adresse e-mail.');
            setIsLoading(false);
            return;
        }

        router.post('/forgot-password', { email }, {
            onSuccess: (page) => {
                setIsLoading(false);
                const flashStatus = (page.props as any)?.status || (page.props as any)?.flash?.status;
                setSuccessMessage(flashStatus || 'Un e-mail contenant le lien de réinitialisation vient de vous être envoyé.');
            },
            onError: (errors) => {
                setIsLoading(false);
                setErrorMessage(errors.email || "Une erreur s'est produite lors de l'envoi du lien.");
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#f8f9fd] flex flex-col justify-center items-center selection:bg-indigo-500 selection:text-white font-sans py-12 px-4 sm:px-6">
            <Head title="Mot de passe oublié - Rivah Facture" />

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
                            Mot de passe oublié ?
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                            Saisissez votre e-mail et nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.
                        </p>
                    </div>

                    {/* Success Alert */}
                    {successMessage && (
                        <div className="p-4 mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">E-mail envoyé avec succès</p>
                                <p className="mt-0.5 text-emerald-700">{successMessage}</p>
                            </div>
                        </div>
                    )}

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
                                Adresse e-mail du compte
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
                                    autoFocus
                                />
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
                                    <span>Envoi en cours...</span>
                                ) : (
                                    <>
                                        <span>Envoyer le lien de réinitialisation</span>
                                        <Send size={15} />
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
