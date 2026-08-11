'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, Star, Heart, TrendingUp, Scissors, MessageSquare, 
    Calendar, Users, DollarSign, Award, AlertTriangle, ShieldCheck,
    Search, Filter, Sparkles, HelpCircle, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticsClientProps {
    initialData: any;
}

export default function StatisticsClient({ initialData }: StatisticsClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const reviews = initialData?.reviews || {
        total: 0,
        average: 0,
        positivePct: 0,
        starsCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        positiveKpis: { quality: 0, service: 0, professionalism: 0 },
        negativeKpis: { fit: 0, deliveryTime: 0, service: 0, price: 0 },
        list: []
    };

    const general = initialData?.generalKpis || {
        salesThisMonth: 0,
        activeOrdersCount: 0,
        totalChats: 0,
        avgTicket: 0
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(val);
    };

    // Filter reviews list
    const filteredReviews = reviews.list.filter((rev: any) => {
        const matchesSearch = 
            rev.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rev.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRating = ratingFilter === 'all' || String(rev.rating) === ratingFilter;
        const matchesType = typeFilter === 'all' || rev.type === typeFilter;

        return matchesSearch && matchesRating && matchesType;
    });

    const getStarColor = (rating: number) => {
        if (rating >= 4) return 'text-[#C17F5F]';
        if (rating === 3) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="min-h-screen bg-zinc-50/40 p-6 pt-20 font-sans text-zinc-800">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver al ERP
                    </Link>
                    <span className="text-[10px] bg-zinc-900 text-zinc-100 px-3 py-1 rounded-full uppercase tracking-widest font-mono">
                        Métricas y Calidad v1.0
                    </span>
                </div>

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200/80 pb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5 text-[#C17F5F]">
                            <Award className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Métricas Generales & Satisfacción</span>
                        </div>
                        <h1 className="font-serif text-3xl md:text-5xl tracking-tight text-zinc-900 font-semibold">Estadísticas & Reseñas</h1>
                        <p className="text-zinc-500 mt-2 text-sm md:text-base">Análisis de calidad, auditoría de satisfacción del cliente y métricas del taller.</p>
                    </div>
                </header>

                {/* upper stat grid */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white border border-zinc-200 p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] relative overflow-hidden">
                        <span className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold block">Calificación Promedio</span>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-serif font-bold text-zinc-800">{reviews.average}</span>
                            <span className="text-xs text-zinc-400">/ 5.0 Estrellas</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    className={`w-3.5 h-3.5 ${star <= Math.round(reviews.average) ? 'fill-[#C17F5F] text-[#C17F5F]' : 'text-zinc-200'}`} 
                                />
                            ))}
                            <span className="text-[10px] text-zinc-400 font-medium ml-1">({reviews.total} opiniones)</span>
                        </div>
                    </Card>

                    <Card className="bg-white border border-zinc-200 p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                        <span className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold block">Tasa de Aprobación</span>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-serif font-bold text-[#C17F5F]">{reviews.positivePct}%</span>
                            <span className="text-xs text-zinc-400">Excelente (4-5★)</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-3.5">
                            <div className="bg-[#C17F5F] h-full rounded-full transition-all" style={{ width: `${reviews.positivePct}%` }}></div>
                        </div>
                    </Card>

                    <Card className="bg-white border border-zinc-200 p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                        <span className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold block">Ventas del Mes</span>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-2xl font-semibold text-zinc-800">{formatCurrency(general.salesThisMonth)}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-3 flex items-center gap-1 uppercase tracking-wider font-semibold">
                            <DollarSign className="w-3 h-3 text-[#C17F5F]" /> Ticket Prom: {formatCurrency(general.avgTicket)}
                        </p>
                    </Card>

                    <Card className="bg-white border border-zinc-200 p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                        <span className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold block">Operación Activa</span>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-serif font-bold text-zinc-800">{general.activeOrdersCount}</span>
                            <span className="text-xs text-zinc-400">Prendas en Taller</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-3 flex items-center gap-1 uppercase tracking-wider font-semibold">
                            <Users className="w-3 h-3 text-[#C17F5F]" /> Chats Activos: {general.totalChats}
                        </p>
                    </Card>
                </section>

                {/* Financial and Business KPIs */}
                <div className="space-y-4">
                    <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 font-sans flex items-center gap-2">
                        <span className="w-1 h-3 bg-[#C17F5F] rounded-full" />
                        Finanzas e Impuestos (Mes Actual)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card className="bg-white border border-zinc-200 p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <span className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold block">IVA Débito (Emitido)</span>
                            <div className="text-lg font-semibold text-zinc-800 mt-1">{formatCurrency(general.ivaDebito || 0)}</div>
                            <span className="text-[9px] text-zinc-400 mt-1 block">Débito Fiscal Ventas</span>
                        </Card>
                        <Card className="bg-white border border-zinc-200 p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <span className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold block">IVA Crédito (Compras)</span>
                            <div className="text-lg font-semibold text-zinc-800 mt-1">{formatCurrency(general.ivaCredito || 0)}</div>
                            <span className="text-[9px] text-zinc-400 mt-1 block">Crédito Fiscal Adquisiciones</span>
                        </Card>
                        <Card className="bg-white border border-zinc-200 p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <span className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold block">Impuesto F29 Estimado</span>
                            <div className="text-lg font-semibold text-[#C17F5F] mt-1">{formatCurrency(general.f29 || 0)}</div>
                            <span className="text-[9px] text-zinc-400 mt-1 block">Pago neto de IVA</span>
                        </Card>
                        <Card className="bg-white border border-zinc-200 p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <span className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold block">Costo Fijo Mensual</span>
                            <div className="text-lg font-semibold text-zinc-800 mt-1">{formatCurrency(general.totalFixedCosts || 0)}</div>
                            <span className="text-[9px] text-zinc-400 mt-1 block">Sueldos y arriendo base</span>
                        </Card>
                        <Card className="bg-white border border-zinc-200 p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <span className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold block">Tarifa Costura (Master)</span>
                            <div className="text-lg font-semibold text-emerald-600 mt-1">{formatCurrency(general.masterRate || 0)} / hr</div>
                            <span className="text-[9px] text-zinc-400 mt-1 block">Sugerida por costos: {formatCurrency(general.suggestedRate || 0)} / hr</span>
                        </Card>
                    </div>
                </div>

                {/* Review Analytics Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Stars Break Down */}
                    <Card className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
                        <h3 className="text-xs uppercase text-zinc-400 tracking-widest font-bold mb-4">Desglose de Calificaciones</h3>
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map((stars) => {
                                const count = reviews.starsCount[stars as 1|2|3|4|5] || 0;
                                const pct = reviews.total > 0 ? Math.round((count / reviews.total) * 100) : 0;
                                return (
                                    <div key={stars} className="flex items-center gap-3 text-xs">
                                        <div className="flex items-center gap-1 w-12 shrink-0">
                                            <span className="font-bold w-3 text-right">{stars}</span>
                                            <Star className="w-3.5 h-3.5 fill-[#C17F5F] text-[#C17F5F]" />
                                        </div>
                                        <div className="flex-grow bg-zinc-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-[#C17F5F] h-full rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 w-8 text-right font-medium">{count} ({pct}%)</span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Positive KPIs (What clients loved) */}
                    <Card className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
                        <h3 className="text-xs uppercase text-zinc-400 tracking-widest font-bold mb-4">Aspectos Más Valorados (4-5★)</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Calidad & Calce Final', count: reviews.positiveKpis.quality, desc: 'Excelencia y terminación de la prenda' },
                                { name: 'Atención Personalizada', count: reviews.positiveKpis.service, desc: 'Cariño y cercanía en el showroom' },
                                { name: 'Profesionalismo y Confianza', count: reviews.positiveKpis.professionalism, desc: 'Puntualidad en los plazos de entrega' }
                            ].map((kpi, idx) => {
                                const totalPositive = (reviews.starsCount[4] || 0) + (reviews.starsCount[5] || 0) || 1;
                                const pct = Math.round((kpi.count / totalPositive) * 100);
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between items-baseline text-xs font-semibold text-zinc-700">
                                            <span>{kpi.name}</span>
                                            <span className="text-emerald-600 font-bold">{pct}%</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400">{kpi.desc}</p>
                                        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                                            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Critical KPIs (Aspects to Improve) */}
                    <Card className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
                        <h3 className="text-xs uppercase text-zinc-400 tracking-widest font-bold mb-4 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            Aspectos a Mejorar (1-3★)
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Calce & Ajuste de Prenda', count: reviews.negativeKpis.fit, desc: 'Detalles en costura o entallado' },
                                { name: 'Tiempos de Entrega', count: reviews.negativeKpis.deliveryTime, desc: 'Retrasos o reprogramaciones' },
                                { name: 'Atención & Comunicación', count: reviews.negativeKpis.service, desc: 'Lentitud de respuesta en canales' },
                                { name: 'Claridad en Precios', count: reviews.negativeKpis.price, desc: 'Transparencia en los presupuestos' }
                            ].map((kpi, idx) => {
                                const totalNegative = (reviews.starsCount[1] || 0) + (reviews.starsCount[2] || 0) + (reviews.starsCount[3] || 0) || 1;
                                const pct = Math.round((kpi.count / totalNegative) * 100);
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between items-baseline text-xs font-semibold text-zinc-700">
                                            <span>{kpi.name}</span>
                                            <span className="text-rose-500 font-bold">{pct}%</span>
                                        </div>
                                        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                                            <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                </section>

                {/* Detailed Feedback Feed */}
                <Card className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50/50">
                        <div>
                            <h3 className="font-serif text-lg font-semibold text-zinc-800">Sugerencias y Comentarios Históricos</h3>
                            <p className="text-xs text-zinc-500 mt-1">Busca y filtra opiniones enviadas por las clientas.</p>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            {/* Search bar */}
                            <div className="relative flex-grow md:flex-grow-0">
                                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar comentario..."
                                    className="w-full md:w-48 pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#C17F5F]"
                                />
                            </div>

                            {/* Rating Selector */}
                            <select 
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                className="px-3 py-2 border border-zinc-200 rounded-lg text-xs bg-white text-zinc-600 focus:outline-none focus:border-[#C17F5F]"
                            >
                                <option value="all">Todas las Estrellas</option>
                                <option value="5">5 Estrellas</option>
                                <option value="4">4 Estrellas</option>
                                <option value="3">3 Estrellas</option>
                                <option value="2">2 Estrellas</option>
                                <option value="1">1 Estrella</option>
                            </select>

                            {/* Type Selector */}
                            <select 
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 border border-zinc-200 rounded-lg text-xs bg-white text-zinc-600 focus:outline-none focus:border-[#C17F5F]"
                            >
                                <option value="all">Todos los Tipos</option>
                                <option value="positivo">Solo Positivos</option>
                                <option value="crítico">Solo Críticos / Privados</option>
                            </select>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 font-bold bg-zinc-50/30">
                                    <th className="p-4 pl-6">Cliente</th>
                                    <th className="p-4">Calificación</th>
                                    <th className="p-4">Tipo</th>
                                    <th className="p-4 w-[40%]">Comentario / Sugerencia</th>
                                    <th className="p-4">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-xs">
                                {filteredReviews.length > 0 ? (
                                    filteredReviews.map((rev: any) => (
                                        <tr key={rev.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="p-4 pl-6 font-medium">
                                                <div className="font-semibold text-zinc-800">{rev.name}</div>
                                                <div className="text-[10px] text-zinc-400">{rev.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="flex items-center">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star 
                                                                key={star} 
                                                                className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-[#C17F5F] text-[#C17F5F]' : 'text-zinc-200'}`} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className={`font-bold ${getStarColor(rev.rating)}`}>{rev.rating}.0</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold ${
                                                    rev.type === 'positivo' 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                                                }`}>
                                                    {rev.type === 'positivo' ? 'Positivo' : 'Crítico / Privado'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-zinc-600 leading-relaxed max-w-[320px] truncate whitespace-normal font-sans">
                                                {rev.message}
                                            </td>
                                            <td className="p-4 text-zinc-400 font-mono text-[10px]">
                                                {new Date(rev.date).toLocaleDateString('es-CL', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-zinc-400 italic">
                                            No se encontraron opiniones con los filtros actuales.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
