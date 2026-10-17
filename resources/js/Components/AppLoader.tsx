import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

interface AppLoaderProps {
    isManualLoading?: boolean;
    loadingText?: string;
}

export default function AppLoader({
    isManualLoading = false,
    loadingText = 'Chargement en cours...',
}: AppLoaderProps) {
    const [isInertiaLoading, setIsInertiaLoading] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', () => setIsInertiaLoading(true));
        const removeFinish = router.on('finish', () => setIsInertiaLoading(false));

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    const isLoading = isManualLoading || isInertiaLoading;

    if (!isLoading) {
        return null;
    }

    return (
        <aside aria-label="État de chargement">
            {/* Top indeterminate animated progress bar */}
            <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-indigo-100/60 overflow-hidden pointer-events-none">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-[#ff6b52] animate-indeterminate" />
            </div>

            {/* Bottom-right floating badge */}
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white backdrop-blur-md shadow-xl border border-slate-700/60 text-xs font-semibold animate-fade-in-fast pointer-events-none">
                <Loader2 size={16} className="animate-spin text-indigo-400" />
                <span className="tracking-wide">{loadingText}</span>
            </div>
        </aside>
    );
}
