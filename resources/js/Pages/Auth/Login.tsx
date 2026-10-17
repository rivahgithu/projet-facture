import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Sparkles,
    ArrowLeft
} from 'lucide-react';

export default function Login({ status }: { status?: string }) {
    const page = usePage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        if (!email || !password) {
            setErrorMessage('Veuillez renseigner votre email et mot de passe.');
            setIsLoading(false);
            return;
        }

        router.post('/login', {
            email,
            password,
            remember,
        }, {
            onError: (errors) => {
                setIsLoading(false);
                setErrorMessage(errors.email || errors.password || 'Erreur lors de la connexion.');
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    const handleFillDemo = () => {
        setEmail('contact@rivah.ci');
        setPassword('password123');
        setErrorMessage('');
    };

    return (
        <div className="min-h-screen bg-[#f8f9fd] flex flex-col justify-center items-center selection:bg-indigo-500 selection:text-white font-sans py-12 px-4 sm:px-6">
            <Head title="Connexion - Rivah Facture" />

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

                       
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Connectez-vous à votre compte.
                        </p>
                    </div>

                   
                   

                    {/* Success / Status Alert */}
                    {(status || (page?.props as any)?.flash?.success) && (
                        <div className="p-3 mb-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                            <span>{status || (page?.props as any)?.flash?.success}</span>
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

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-slate-700">
                                    Mot de passe
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className="text-xs text-slate-600 font-medium">
                                    Se souvenir de moi pendant 30 jours
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 cursor-pointer text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <span>Connexion en cours...</span>
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <ArrowRight size={15} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Link to Register */}
                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-600">
                            Vous n'avez pas encore de compte ?{' '}
                            <Link
                                href="/register"
                                className="font-bold text-indigo-600 hover:text-indigo-800 transition"
                            >
                                Créer un compte 
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
