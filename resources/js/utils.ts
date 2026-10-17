export function formatCurrency(amount: number, currency: string = 'FCFA'): string {
    const formatted = new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted} ${currency}`;
}

export function formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function getPaymentStatusBadge(status: string) {
    switch (status) {
        case 'payée':
            return {
                label: 'Payée',
                className: 'bg-emerald-100/70 text-emerald-700 border-emerald-200',
            };
        case 'partiellement_payée':
            return {
                label: 'Partiellement Payée',
                className: 'bg-amber-100/70 text-amber-700 border-amber-200',
            };
        case 'en_retard':
            return {
                label: 'En Retard',
                className: 'bg-rose-100/70 text-rose-700 border-rose-200',
            };
        case 'non_payée':
        default:
            return {
                label: 'Non Payée',
                className: 'bg-rose-50 text-rose-600 border-rose-200',
            };
    }
}

export function getDocumentStatusBadge(status: string) {
    switch (status) {
        case 'émise':
            return {
                label: 'Émise',
                className: 'bg-indigo-50 text-indigo-600 border-indigo-200',
            };
        case 'annulée':
            return {
                label: 'Annulée',
                className: 'bg-slate-100 text-slate-600 border-slate-200',
            };
        case 'brouillon':
        default:
            return {
                label: 'Brouillon',
                className: 'bg-purple-50 text-purple-600 border-purple-200',
            };
    }
}

export function getQuoteStatusBadge(status: string) {
    switch (status) {
        case 'accepté':
            return {
                label: 'Accepté',
                className: 'bg-emerald-100/70 text-emerald-700 border-emerald-200',
            };
        case 'converti':
            return {
                label: 'Converti en Facture',
                className: 'bg-indigo-50 text-indigo-600 border-indigo-200',
            };
        case 'envoyé':
            return {
                label: 'Envoyé',
                className: 'bg-sky-50 text-sky-600 border-sky-200',
            };
        case 'expiré':
            return {
                label: 'Expiré',
                className: 'bg-amber-50 text-amber-700 border-amber-200',
            };
        case 'refusé':
            return {
                label: 'Refusé',
                className: 'bg-rose-50 text-rose-600 border-rose-200',
            };
        case 'brouillon':
        default:
            return {
                label: 'Brouillon',
                className: 'bg-purple-50 text-purple-600 border-purple-200',
            };
    }
}
