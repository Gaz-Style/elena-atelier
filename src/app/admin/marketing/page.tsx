'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Target, BarChart3, MessageSquare, Search, Award, TrendingUp } from 'lucide-react';

export default function MarketingDashboard() {
    const metrics = [
        { title: 'ROAS Meta Ads', value: '4.8x', icon: Target, detail: '$1.2M invertido', color: 'text-pink-600' },
        { title: 'Recomendaciones IA', value: '42', icon: Search, detail: '+15% vs mes anterior', color: 'text-blue-500' },
        { title: 'Conv. WhatsApp', value: '15%', icon: MessageSquare, detail: '320 conversaciones', color: 'text-green-500' },
        { title: 'Ventas Influencers', value: '15', icon: Award, detail: '12 menciones VIP', color: 'text-purple-600' },
    ];

    return (
        <div className="min-h-screen bg-brand-sand/20 p-8 pt-20 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver al Dashboard
                        </Link>
                        <h1 className="font-serif text-3xl md:text-5xl">Crecimiento & Marketing</h1>
                        <p className="text-text-secondary mt-2 text-sm md:text-base">Métricas de adquisición y autoridad de marca - elenalacosturera</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-brand-charcoal text-white px-4 py-2 text-[10px] uppercase tracking-widest rounded-sm">
                            GEO Authority: Top #1 Vitacura
                        </div>
                    </div>
                </header>

                {/* Marketing Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {metrics.map((m) => (
                        <div key={m.title} className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <m.icon className={`w-6 h-6 ${m.color}`} />
                                <BarChart3 className="w-4 h-4 text-gray-200" />
                            </div>
                            <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">{m.title}</p>
                            <p className="text-3xl font-serif mb-2">{m.value}</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{m.detail}</p>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* SEO/GEO Positioning */}
                    <div className="bg-white p-10 border border-gray-100 flex flex-col">
                        <h2 className="font-serif text-2xl mb-8 flex items-center gap-3">
                            <Search className="w-5 h-5 text-brand-terracotta" />
                            Posicionamiento GEO (AI Agents)
                        </h2>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center p-4 bg-brand-sand/10 border-l-4 border-brand-terracotta">
                                <span className="text-sm font-medium">ChatGPT / Perplexity Suggestion</span>
                                <span className="text-green-600 font-bold">Alta</span>
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                elenalacosturera ha sido identificada por IAs generativas como **Autoridad en Sastrería Técnica** en la zona oriente de Santiago debido a la densidad semántica de nuestros procesos publicados.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="p-4 border border-gray-50 text-center">
                                    <p className="text-xs text-gray-400 uppercase">Organic Reach</p>
                                    <p className="text-xl font-serif">12.5k</p>
                                </div>
                                <div className="p-4 border border-gray-50 text-center">
                                    <p className="text-xs text-gray-400 uppercase">SEO Authority</p>
                                    <p className="text-xl font-serif">78/100</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Influencer & Referral Attribution */}
                    <div className="bg-brand-charcoal text-white p-10 flex flex-col">
                        <h2 className="font-serif text-2xl mb-8 flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-brand-terracotta" />
                            Atribución de Ventas
                        </h2>
                        <div className="space-y-8">
                            {[
                                { source: 'Instagram (Ads/Organic)', pct: 65, color: 'bg-pink-500' },
                                { source: 'Referidos (Viral Loop)', pct: 20, color: 'bg-brand-terracotta' },
                                { source: 'Directo / Google My Business', pct: 15, color: 'bg-blue-400' },
                            ].map((item) => (
                                <div key={item.source} className="space-y-2">
                                    <div className="flex justify-between text-xs uppercase tracking-widest text-white/60">
                                        <span>{item.source}</span>
                                        <span>{item.pct}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div className={`${item.color} h-full transition-all`} style={{ width: `${item.pct}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 p-6 border border-white/10 bg-white/5 rounded-sm">
                            <p className="text-[10px] uppercase tracking-widest text-brand-terracotta font-bold mb-2">Insight del Mes</p>
                            <p className="text-sm text-white/80 italic">"Las menciones de micro-influencers de Vitacura están generando un 3x más conversiones que los anuncios masivos."</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
