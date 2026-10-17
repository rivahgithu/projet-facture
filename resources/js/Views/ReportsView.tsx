import React, { useState, useMemo } from 'react';
import { Invoice, Quote } from '../types';
import { formatCurrency } from '../utils';
import { 
    FileSpreadsheet, 
    BarChart3, 
    LineChart, 
    TrendingUp, 
    CheckCircle2, 
    Clock, 
    Percent, 
    Calendar,
    ArrowUpRight,
    Sparkles,
    Layers
} from 'lucide-react';

interface ReportsViewProps {
    invoices: Invoice[];
    quotes: Quote[];
    currency: string;
}

export default function ReportsView({ invoices, quotes, currency }: ReportsViewProps) {
    const [chartType, setChartType] = useState<'bars' | 'line'>('bars');
    const [hoveredMonthKey, setHoveredMonthKey] = useState<string | null>(null);

    // Global Financial Metrics
    const totalFacture = invoices.reduce((acc, inv) => acc + (inv.document_status !== 'annulée' ? inv.total : 0), 0);
    const totalEncaisse = invoices.reduce((acc, inv) => acc + inv.amount_paid, 0);
    const totalImpaye = invoices.reduce((acc, inv) => acc + (inv.document_status !== 'annulée' ? inv.balance_due : 0), 0);
    const collectionRate = Math.round((totalEncaisse / (totalFacture || 1)) * 100);

    // 12 Calendar Months Definitions
    const MONTH_DEFINITIONS = [
        { num: '01', name: 'Janvier', short: 'Janv' },
        { num: '02', name: 'Février', short: 'Févr' },
        { num: '03', name: 'Mars', short: 'Mars' },
        { num: '04', name: 'Avril', short: 'Avr' },
        { num: '05', name: 'Mai', short: 'Mai' },
        { num: '06', name: 'Juin', short: 'Juin' },
        { num: '07', name: 'Juillet', short: 'Juil' },
        { num: '08', name: 'Août', short: 'Août' },
        { num: '09', name: 'Septembre', short: 'Sept' },
        { num: '10', name: 'Octobre', short: 'Oct' },
        { num: '11', name: 'Novembre', short: 'Nov' },
        { num: '12', name: 'Décembre', short: 'Déc' },
    ];

    // Determine current active year
    const currentYear = useMemo(() => {
        const found = invoices.find((inv) => inv.issue_date)?.issue_date?.split('-')[0];
        return found || new Date().getFullYear().toString();
    }, [invoices]);

    // Full 12 Months Aggregation (Janvier à Décembre)
    const monthlyData = useMemo(() => {
        return MONTH_DEFINITIONS.map((def) => {
            const key = `${currentYear}-${def.num}`;
            const monthInvoices = invoices.filter((inv) => {
                if (!inv.issue_date || inv.document_status === 'annulée') return false;
                const [year, month] = inv.issue_date.split('-');
                return year === currentYear && month === def.num;
            });

            const invoiced = monthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
            const paid = monthInvoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
            const due = monthInvoices.reduce((sum, inv) => sum + (inv.balance_due || 0), 0);
            const recoveryRate = invoiced > 0 ? Math.round((paid / invoiced) * 100) : 0;

            return {
                key,
                monthNum: def.num,
                label: `${def.name} ${currentYear}`,
                name: def.name,
                short: def.short,
                invoiced,
                paid,
                due,
                count: monthInvoices.length,
                recoveryRate,
            };
        });
    }, [invoices, currentYear]);

    // Performance Highlights
    const bestMonth = useMemo(() => {
        return [...monthlyData].filter((m) => m.invoiced > 0).sort((a, b) => b.invoiced - a.invoiced)[0] || null;
    }, [monthlyData]);

    const bestRecoveryMonth = useMemo(() => {
        return [...monthlyData].filter((m) => m.invoiced > 0).sort((a, b) => b.recoveryRate - a.recoveryRate)[0] || null;
    }, [monthlyData]);

    // Maximum value for scale
    const maxVal = Math.max(...monthlyData.map((m) => Math.max(m.invoiced, m.paid)), 1000000);
    // Round to next nice upper bound (multiples of 1M)
    const niceMax = Math.max(Math.ceil(maxVal / 1000000) * 1000000, 4000000);

    const handleExportCSV = () => {
        const headers = ['N Facture', 'Client', 'Statut Document', 'Statut Reglement', 'Date Emission', 'Total TTC FCFA', 'Encaisse FCFA', 'Solde Du FCFA'];
        const rows = invoices.map((i) => [
            i.invoice_number,
            `"${i.client_name}"`,
            i.document_status,
            i.payment_status,
            i.issue_date,
            i.total,
            i.amount_paid,
            i.balance_due,
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Rapport_Factures_Rivah_2026.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Vector SVG Exact Chart Geometry for 12 months
    const svgWidth = 920;
    const svgHeight = 290;
    const paddingLeft = 85;
    const paddingRight = 20;
    const paddingTop = 28;
    const paddingBottom = 48;
    const innerWidth = svgWidth - paddingLeft - paddingRight;
    const innerHeight = svgHeight - paddingTop - paddingBottom;
    const baselineY = paddingTop + innerHeight;

    const count = monthlyData.length;
    const slotWidth = innerWidth / Math.max(count, 1);
    const barWidth = 14;
    const barGap = 4;

    // Monthly coordinates calculation
    const calculatedMonths = monthlyData.map((m, idx) => {
        const centerX = paddingLeft + (idx + 0.5) * slotWidth;
        const hFacture = m.invoiced > 0 ? Math.max(4, (m.invoiced / niceMax) * innerHeight) : 0;
        const yFacture = baselineY - hFacture;

        const hEncaisse = m.paid > 0 ? Math.max(4, (m.paid / niceMax) * innerHeight) : 0;
        const yEncaisse = baselineY - hEncaisse;

        const xFacture = centerX - barWidth - barGap / 2;
        const xEncaisse = centerX + barGap / 2;

        const yLineFacture = baselineY - (m.invoiced / niceMax) * innerHeight;
        const yLineEncaisse = baselineY - (m.paid / niceMax) * innerHeight;

        return {
            ...m,
            centerX,
            hFacture,
            yFacture,
            xFacture,
            hEncaisse,
            yEncaisse,
            xEncaisse,
            yLineFacture,
            yLineEncaisse,
            barWidth,
        };
    });

    // Spline path builder for line chart
    const getCurvedPath = (points: { x: number; y: number }[]): string => {
        if (points.length === 0) return '';
        if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
        if (points.length === 2) {
            return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
        }
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i === 0 ? 0 : i - 1];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
        }
        return d;
    };

    const pointsFacture = calculatedMonths.map((m) => ({ x: m.centerX, y: m.yLineFacture, data: m }));
    const pointsEncaisse = calculatedMonths.map((m) => ({ x: m.centerX, y: m.yLineEncaisse, data: m }));

    const pathFacture = getCurvedPath(pointsFacture);
    const pathEncaisse = getCurvedPath(pointsEncaisse);

    const areaFacture = pointsFacture.length > 0
        ? `${pathFacture} L ${pointsFacture[pointsFacture.length - 1].x} ${baselineY} L ${pointsFacture[0].x} ${baselineY} Z`
        : '';
    const areaEncaisse = pointsEncaisse.length > 0
        ? `${pathEncaisse} L ${pointsEncaisse[pointsEncaisse.length - 1].x} ${baselineY} L ${pointsEncaisse[0].x} ${baselineY} Z`
        : '';

    // Active tooltip data
    const activeHoveredMonth = calculatedMonths.find((m) => m.key === hoveredMonthKey) || null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rapports & Analyses Commerciales</h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Consultez l'évolution de votre facturation, vos encaissements et exportez vos données financières.
                    </p>
                </div>

        
            </div>

            {/* Metrics Top Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Facturé */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Volume Facturé</span>
                        <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                            {formatCurrency(totalFacture, currency)}
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 mt-1">
                            {invoices.length} factures générées
                        </div>
                    </div>
                </div>

                {/* 2. Encaissé */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Volume Encaissé</span>
                        <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
                            {formatCurrency(totalEncaisse, currency)}
                        </div>
                        <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                            <ArrowUpRight size={13} />
                            <span>Règlements effectifs perçus</span>
                        </div>
                    </div>
                </div>

                {/* 3. Impayés */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Créances En Souffrance</span>
                        <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock size={18} />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
                            {formatCurrency(totalImpaye, currency)}
                        </div>
                        <div className="text-[11px] font-bold text-amber-600 mt-1">
                            Solde total restant dû
                        </div>
                    </div>
                </div>

                {/* 4. Taux */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Taux de Recouvrement</span>
                        <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Percent size={18} />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-indigo-600 font-mono tracking-tight">
                            {collectionRate}%
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                            <div 
                                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(collectionRate, 100)}%` }} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* REAL GRAPHICAL CHART SECTION */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
                {/* Chart Header with Controls & Legend */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                                Évolution Mensuelle : Factures vs Encaissé
                            </h2>
                            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                                Année {currentYear}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Comparaison graphique de Janvier à Décembre entre le chiffre d'affaires facturé et les encaissements réels en FCFA.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* 12 Months Period Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                            <Calendar size={14} className="text-indigo-600" />
                            <span>Janvier – Décembre</span>
                        </div>

                        {/* Chart Legend */}
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/70">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-md bg-indigo-600 shrink-0" />
                                <span>Facturé</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
                                <span>Encaissé</span>
                            </div>
                        </div>

                        {/* Chart Type Toggle */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setChartType('bars')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                    chartType === 'bars' 
                                        ? 'bg-white text-indigo-600 shadow-xs' 
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Afficher en graphique de barres comparatives"
                            >
                                <BarChart3 size={15} />
                                <span className="hidden sm:inline">Histogramme</span>
                            </button>
                            <button
                                onClick={() => setChartType('line')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                    chartType === 'line' 
                                        ? 'bg-white text-indigo-600 shadow-xs' 
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                                title="Afficher en graphique courbe de tendance"
                            >
                                <LineChart size={15} />
                                <span className="hidden sm:inline">Courbe</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* CHART CANVAS */}
                <div className="relative w-full overflow-hidden bg-slate-50/50 rounded-2xl p-2 sm:p-4 border border-slate-100">
                    {/* Floating Tooltip Displayed Over Hovered Column */}
                    {activeHoveredMonth && (
                        <div
                            className="absolute z-30 pointer-events-none transition-all duration-150 ease-out hidden sm:block"
                            style={{
                                left: `${Math.min(Math.max((activeHoveredMonth.centerX / svgWidth) * 100, 16), 84)}%`,
                                top: '14px',
                                transform: 'translateX(-50%)',
                            }}
                        >
                            <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 min-w-[220px] animate-in fade-in zoom-in-95 duration-150">
                                <div className="font-extrabold text-[12px] text-slate-200 pb-2 border-b border-slate-800 flex justify-between items-center">
                                    <span>{activeHoveredMonth.label}</span>
                                    <span className="text-indigo-400 font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded-md">
                                        {activeHoveredMonth.count} facture{activeHoveredMonth.count > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="space-y-1.5 pt-2 text-[11px]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                            Volume Facturé :
                                        </span>
                                        <span className="font-bold font-mono text-indigo-300">
                                            {formatCurrency(activeHoveredMonth.invoiced, currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                            Volume Encaissé :
                                        </span>
                                        <span className="font-bold font-mono text-emerald-400">
                                            {formatCurrency(activeHoveredMonth.paid, currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-800/80">
                                        <span className="text-slate-400">Solde restant dû :</span>
                                        <span className={`font-mono font-bold ${activeHoveredMonth.due > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                                            {activeHoveredMonth.due > 0 ? formatCurrency(activeHoveredMonth.due, currency) : 'Soldé (0 FCFA)'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 text-[10px]">
                                        <span className="text-slate-400">Taux Recouvrement :</span>
                                        <span className={`font-black px-1.5 py-0.5 rounded ${
                                            activeHoveredMonth.recoveryRate >= 80 
                                                ? 'bg-emerald-500/20 text-emerald-300' 
                                                : activeHoveredMonth.recoveryRate > 0 
                                                ? 'bg-amber-500/20 text-amber-300' 
                                                : 'bg-rose-500/20 text-rose-300'
                                        }`}>
                                            {activeHoveredMonth.recoveryRate}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SVG GRAPHIC */}
                    <div className="w-full">
                        <svg 
                            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                            className="w-full h-64 sm:h-80 select-none overflow-visible"
                        >
                            <defs>
                                {/* Bar Gradients */}
                                <linearGradient id="barFactureGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#4338ca" />
                                </linearGradient>
                                <linearGradient id="barEncaisseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>

                                {/* Area Fill Gradients */}
                                <linearGradient id="areaFactureGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.32" />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                                </linearGradient>
                                <linearGradient id="areaEncaisseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                </linearGradient>

                                {/* Shadow Filter */}
                                <filter id="barShadow" x="-10%" y="-10%" width="120%" height="120%">
                                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.15" />
                                </filter>
                            </defs>

                            {/* Horizontal Y-Axis Grid Lines & Values */}
                            {[1, 0.75, 0.5, 0.25, 0].map((ratio) => {
                                const y = paddingTop + (1 - ratio) * innerHeight;
                                const isBaseline = ratio === 0;

                                return (
                                    <g key={ratio}>
                                        <text
                                            x={paddingLeft - 14}
                                            y={y + 4}
                                            textAnchor="end"
                                            className="text-[11px] font-mono fill-slate-400 font-bold"
                                        >
                                            {formatCurrency(niceMax * ratio, currency)}
                                        </text>
                                        <line
                                            x1={paddingLeft}
                                            y1={y}
                                            x2={svgWidth - paddingRight}
                                            y2={y}
                                            stroke={isBaseline ? '#cbd5e1' : '#e2e8f0'}
                                            strokeWidth={isBaseline ? 1.5 : 1}
                                            strokeDasharray={isBaseline ? 'none' : '4 4'}
                                        />
                                    </g>
                                );
                            })}

                            {/* Column Hover Interactive Hit Areas & Highlight */}
                            {calculatedMonths.map((m) => {
                                const isHovered = hoveredMonthKey === m.key;

                                return (
                                    <g key={`hit-${m.key}`}>
                                        {/* Translucent Highlight Column */}
                                        <rect
                                            x={m.centerX - slotWidth / 2 + 4}
                                            y={paddingTop}
                                            width={slotWidth - 8}
                                            height={innerHeight}
                                            rx="12"
                                            fill={isHovered ? '#6366f1' : 'transparent'}
                                            fillOpacity={isHovered ? 0.06 : 0}
                                            className="transition-all duration-200"
                                        />

                                        {/* Transparent Mouse Area */}
                                        <rect
                                            x={m.centerX - slotWidth / 2}
                                            y={paddingTop}
                                            width={slotWidth}
                                            height={innerHeight + paddingBottom}
                                            fill="transparent"
                                            className="cursor-pointer"
                                            onMouseEnter={() => setHoveredMonthKey(m.key)}
                                            onMouseLeave={() => setHoveredMonthKey(null)}
                                        />
                                    </g>
                                );
                            })}

                            {/* VIEW 1: GROUPED BAR CHART */}
                            {chartType === 'bars' && (
                                <g>
                                    {calculatedMonths.map((m) => {
                                        const isHovered = hoveredMonthKey === m.key;

                                        return (
                                            <g key={`bars-${m.key}`} className="transition-all duration-300">
                                                {/* Bar 1: Facturé (Indigo) */}
                                                {m.invoiced > 0 && (
                                                    <g>
                                                        <rect
                                                            x={m.xFacture}
                                                            y={m.yFacture}
                                                            width={m.barWidth}
                                                            height={m.hFacture}
                                                            rx="4"
                                                            fill="url(#barFactureGrad)"
                                                            filter="url(#barShadow)"
                                                            className={`transition-all duration-200 ${
                                                                isHovered ? 'brightness-110' : 'opacity-95'
                                                            }`}
                                                        />
                                                        {/* Invoiced Top Amount on Hover */}
                                                        {isHovered && (
                                                            <text
                                                                x={m.xFacture + m.barWidth / 2}
                                                                y={m.yFacture - 6}
                                                                textAnchor="middle"
                                                                className="text-[10px] font-mono font-black fill-indigo-600 animate-in fade-in"
                                                            >
                                                                {(m.invoiced / 1000000).toFixed(1)}M
                                                            </text>
                                                        )}
                                                    </g>
                                                )}

                                                {/* Bar 2: Encaissé (Emerald) */}
                                                {m.paid > 0 && (
                                                    <g>
                                                        <rect
                                                            x={m.xEncaisse}
                                                            y={m.yEncaisse}
                                                            width={m.barWidth}
                                                            height={m.hEncaisse}
                                                            rx="4"
                                                            fill="url(#barEncaisseGrad)"
                                                            filter="url(#barShadow)"
                                                            className={`transition-all duration-200 ${
                                                                isHovered ? 'brightness-110' : 'opacity-95'
                                                            }`}
                                                        />
                                                        {/* Paid Top Amount on Hover */}
                                                        {isHovered && (
                                                            <text
                                                                x={m.xEncaisse + m.barWidth / 2}
                                                                y={m.yEncaisse - 6}
                                                                textAnchor="middle"
                                                                className="text-[10px] font-mono font-black fill-emerald-600 animate-in fade-in"
                                                            >
                                                                {(m.paid / 1000000).toFixed(1)}M
                                                            </text>
                                                        )}
                                                    </g>
                                                )}
                                            </g>
                                        );
                                    })}
                                </g>
                            )}

                            {/* VIEW 2: SPLINE / AREA CURVE CHART */}
                            {chartType === 'line' && (
                                <g>
                                    {/* Area Translucent Fills */}
                                    {areaFacture && <path d={areaFacture} fill="url(#areaFactureGrad)" />}
                                    {areaEncaisse && <path d={areaEncaisse} fill="url(#areaEncaisseGrad)" />}

                                    {/* Spline Strokes */}
                                    {pathFacture && (
                                        <path
                                            d={pathFacture}
                                            fill="none"
                                            stroke="#6366f1"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                        />
                                    )}
                                    {pathEncaisse && (
                                        <path
                                            d={pathEncaisse}
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                        />
                                    )}

                                    {/* Interactive Dots for Facturé */}
                                    {pointsFacture.map((p, i) => {
                                        const isHovered = hoveredMonthKey === p.data.key;
                                        return (
                                            <g key={`dot-facture-${i}`}>
                                                <circle
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r={isHovered ? 7 : 5}
                                                    fill="#ffffff"
                                                    stroke="#6366f1"
                                                    strokeWidth={isHovered ? 4 : 3}
                                                    className="transition-all duration-200"
                                                />
                                            </g>
                                        );
                                    })}

                                    {/* Interactive Dots for Encaissé */}
                                    {pointsEncaisse.map((p, i) => {
                                        const isHovered = hoveredMonthKey === p.data.key;
                                        return (
                                            <g key={`dot-encaisse-${i}`}>
                                                <circle
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r={isHovered ? 7 : 5}
                                                    fill="#ffffff"
                                                    stroke="#10b981"
                                                    strokeWidth={isHovered ? 4 : 3}
                                                    className="transition-all duration-200"
                                                />
                                            </g>
                                        );
                                    })}
                                </g>
                            )}

                            {/* X-Axis Month Labels & Recovery Rate Badges */}
                            {calculatedMonths.map((m) => {
                                const isHovered = hoveredMonthKey === m.key;

                                return (
                                    <g key={`label-${m.key}`}>
                                        {/* Month Title */}
                                        <text
                                            x={m.centerX}
                                            y={baselineY + 20}
                                            textAnchor="middle"
                                            className={`text-[11px] font-bold transition-all ${
                                                isHovered ? 'fill-indigo-600 font-extrabold' : 'fill-slate-700'
                                            }`}
                                        >
                                            {m.short}
                                        </text>

                                        {/* Recovery Rate Subtitle */}
                                        <text
                                            x={m.centerX}
                                            y={baselineY + 34}
                                            textAnchor="middle"
                                            className={`text-[9px] font-semibold transition-all ${
                                                isHovered 
                                                    ? 'fill-slate-900 font-bold' 
                                                    : m.invoiced > 0 && m.recoveryRate >= 80 
                                                    ? 'fill-emerald-600 font-bold' 
                                                    : m.invoiced > 0 && m.recoveryRate > 0 
                                                    ? 'fill-amber-600 font-bold' 
                                                    : m.invoiced > 0 
                                                    ? 'fill-rose-500 font-bold' 
                                                    : 'fill-slate-300'
                                            }`}
                                        >
                                            {m.invoiced > 0 ? `${m.recoveryRate}%` : '-'}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* Performance Insight Highlights Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bestMonth && (
                        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider">
                                        Pic de Facturation
                                    </div>
                                    <div className="text-sm font-extrabold text-indigo-900">
                                        {bestMonth.label} : <span className="font-mono">{formatCurrency(bestMonth.invoiced, currency)}</span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-100">
                                {bestMonth.count} factures
                            </span>
                        </div>
                    )}

                    {bestRecoveryMonth && (
                        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                                        Meilleur Recouvrement
                                    </div>
                                    <div className="text-sm font-extrabold text-emerald-900">
                                        {bestRecoveryMonth.label} : <span className="font-mono">{bestRecoveryMonth.recoveryRate}% encaissé</span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-100 font-mono">
                                {formatCurrency(bestRecoveryMonth.paid, currency)}
                            </span>
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
}
