'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, Target, BarChart3, MessageSquare, Search, Award, TrendingUp, 
    CheckCircle2, Circle, Clock, Check, ListTodo, SlidersHorizontal, BookOpen,
    Sparkles, Smartphone, Layers, Plus, Calendar, ShieldCheck, HelpCircle
} from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description: string;
    category: 'SEO & GEO' | 'Meta Ads' | 'Influencer Loop' | 'Automatización CRM' | 'Viral Loop (Referidos)';
    status: 'completed' | 'in_progress' | 'pending';
    date: string;
    impact: 'Alto' | 'Medio' | 'Bajo';
}

import { getMarketingTasks, updateMarketingTaskStatus, getMarketingMetrics } from './actions';

export default function MarketingDashboard() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'plan' | 'ai-content' | 'newsletter'>('dashboard');
    const [copiedLink, setCopiedLink] = useState(false);
    
    const [tasks, setTasks] = useState<Task[]>([]);
    const [metricsData, setMetricsData] = useState<{ whatsappConversion: number, chatsTotal: number }>({ whatsappConversion: 0, chatsTotal: 0 });

    useEffect(() => {
        const loadData = async () => {
            const [tasksData, metrics] = await Promise.all([
                getMarketingTasks(),
                getMarketingMetrics()
            ]);
            setTasks(tasksData.map((t: any) => ({
                id: t.id,
                title: t.title,
                description: t.description,
                category: t.category,
                status: t.status,
                date: t.target_date,
                impact: t.impact
            })));
            setMetricsData(metrics);
        };
        loadData();
    }, []);

    const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
    const [selectedStatus, setSelectedStatus] = useState<string>('Todos');

    const handleToggleStatus = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        let newStatus: 'completed' | 'in_progress' | 'pending';
        if (task.status === 'pending') newStatus = 'in_progress';
        else if (task.status === 'in_progress') newStatus = 'completed';
        else newStatus = 'pending';
        
        const newDate = newStatus === 'completed' ? 'Hoy' : newStatus === 'in_progress' ? 'En Curso' : 'Pendiente';
        
        // Optimistic update
        setTasks(prevTasks => prevTasks.map(t => {
            if (t.id === taskId) {
                return { ...t, status: newStatus, date: newDate };
            }
            return t;
        }));

        await updateMarketingTaskStatus(taskId, newStatus, newDate);
    };

    const totalTasks = tasks.length || 1; // Prevent div by 0 initially
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const categories = ['Todas', 'SEO & GEO', 'Meta Ads', 'Influencer Loop', 'Automatización CRM', 'Viral Loop (Referidos)'];
    
    const categoryProgress = categories.filter(c => c !== 'Todas').map(cat => {
        const catTasks = tasks.filter(t => t.category === cat);
        const catCompleted = catTasks.filter(t => t.status === 'completed').length;
        const total = catTasks.length || 1;
        const rate = catTasks.length > 0 ? Math.round((catCompleted / total) * 100) : 0;
        return { name: cat, completed: catCompleted, total: catTasks.length, rate };
    });
    const filteredTasks = tasks.filter(t => {
        const categoryMatch = selectedCategory === 'Todas' || t.category === selectedCategory;
        const statusMatch = selectedStatus === 'Todos' || 
            (selectedStatus === 'Logrados' && t.status === 'completed') ||
            (selectedStatus === 'En Curso' && t.status === 'in_progress') ||
            (selectedStatus === 'Pendientes' && t.status === 'pending');
        return categoryMatch && statusMatch;
    });

    const metrics = [
        { title: 'ROAS Meta Ads', value: '4.8x', icon: Target, detail: '$1.2M invertido', color: 'text-pink-600' },
        { title: 'Recomendaciones IA', value: '42', icon: Search, detail: '+15% vs mes anterior', color: 'text-blue-500' },
        { title: 'Conv. WhatsApp', value: `${metricsData.whatsappConversion}%`, icon: MessageSquare, detail: `${metricsData.chatsTotal} conversaciones`, color: 'text-green-500' },
        { title: 'Ventas Influencers', value: '15', icon: Award, detail: '12 menciones VIP', color: 'text-purple-600' },
    ];

    const marketingPillars = [
        {
            title: '1. SEO & GEO (Generative Engine)',
            focus: 'Que los LLMs (ChatGPT, Gemini, Perplexity) y Google Maps recomienden a Elena de forma orgánica.',
            metrics: 'Top #1 Vitacura, Schema JSON-LD indexado, Autocompletado local.',
            icon: Search,
            color: 'border-blue-200 bg-blue-50/30'
        },
        {
            title: '2. Meta Ads & Storytelling ASMR',
            focus: 'Pautas geolocalizadas a 5km a la redonda y videos inmersivos de confección artesanal.',
            metrics: '4.8x ROAS promedio, retargeting a visitas del Pasaporte Digital.',
            icon: Target,
            color: 'border-pink-200 bg-pink-50/30'
        },
        {
            title: '3. Influencer Loop & Red VIP',
            focus: 'Kits de costura y rescate de prendas de gala enviados a influencers del sector oriente de Santiago.',
            metrics: 'UGC orgánico de alta conversión, micro-atribución por cupones QR.',
            icon: Award,
            color: 'border-purple-200 bg-purple-50/30'
        },
        {
            title: '4. Automatización de CRM',
            focus: 'Fidelización mediante alertas automáticas de trazabilidad digital y encuestas de calce post-venta.',
            metrics: '15% de conversión de lead-a-cita, flujos automatizados activos.',
            icon: MessageSquare,
            color: 'border-green-200 bg-green-50/30'
        },
        {
            title: '5. Viral Loop (Referidos)',
            focus: 'Estrategia "Cofre Atelier" para incentivar la recomendación boca a boca entre clientas exclusivas.',
            metrics: '20% de la adquisición mensual proyectada a través de círculos VIP.',
            icon: TrendingUp,
            color: 'border-amber-200 bg-amber-50/30'
        }
    ];

    return (
        <div className="min-h-screen bg-brand-sand/15 p-8 pt-20 font-sans text-brand-charcoal">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Back button */}
                <div className="flex items-center justify-between">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-text-secondary hover:text-brand-charcoal transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver al ERP
                    </Link>
                    <span className="text-[10px] bg-brand-charcoal text-brand-sand px-3 py-1 rounded-full uppercase tracking-widest font-mono">
                        Elena Atelier v2.4
                    </span>
                </div>

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <h1 className="font-serif text-3xl md:text-5xl tracking-tight text-brand-charcoal">Crecimiento & Marketing</h1>
                        <p className="text-text-secondary mt-2 text-sm md:text-base">Métricas de adquisición y plan de expansión estratégica - elenalacosturera</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-brand-charcoal text-white px-4 py-2.5 text-[10px] uppercase tracking-widest rounded-sm font-medium">
                            GEO Authority: Top #1 Vitacura
                        </div>
                    </div>
                </header>

                {/* Custom Styled Premium Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`py-4 px-6 font-medium text-xs uppercase tracking-widest border-b-2 transition-all duration-300 flex items-center gap-2 ${
                            activeTab === 'dashboard'
                                ? 'border-brand-terracotta text-brand-charcoal font-bold'
                                : 'border-transparent text-gray-400 hover:text-brand-charcoal hover:border-gray-300'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" /> Métricas & Atribución
                    </button>
                    <button
                        onClick={() => setActiveTab('plan')}
                        className={`py-4 px-6 font-medium text-xs uppercase tracking-widest border-b-2 transition-all duration-300 flex items-center gap-2 ${
                            activeTab === 'plan'
                                ? 'border-brand-terracotta text-brand-charcoal font-bold'
                                : 'border-transparent text-gray-400 hover:text-brand-charcoal hover:border-gray-300'
                        }`}
                    >
                        <ListTodo className="w-4 h-4" /> Plan de Marketing & Checklist
                    </button>
                    <button
                        onClick={() => setActiveTab('ai-content')}
                        className={`py-4 px-6 font-medium text-xs uppercase tracking-widest border-b-2 transition-all duration-300 flex items-center gap-2 ${
                            activeTab === 'ai-content'
                                ? 'border-brand-terracotta text-brand-charcoal font-bold'
                                : 'border-transparent text-gray-400 hover:text-brand-charcoal hover:border-gray-300'
                        }`}
                    >
                        <Sparkles className="w-4 h-4" /> Asistente IA
                    </button>
                    <button
                        onClick={() => setActiveTab('newsletter')}
                        className={`py-4 px-6 font-medium text-xs uppercase tracking-widest border-b-2 transition-all duration-300 flex items-center gap-2 ${
                            activeTab === 'newsletter'
                                ? 'border-brand-terracotta text-brand-charcoal font-bold'
                                : 'border-transparent text-gray-400 hover:text-brand-charcoal hover:border-gray-300'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4" /> Newsletter
                    </button>
                </div>

                {activeTab === 'dashboard' ? (
                    <div className="space-y-12 animate-fadeIn">
                        {/* Marketing Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {metrics.map((m) => (
                                <div key={m.title} className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
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
                            <div className="bg-white p-10 border border-gray-100 flex flex-col justify-between hover:shadow-sm transition-shadow">
                                <div>
                                    <h2 className="font-serif text-2xl mb-6 flex items-center gap-3 text-brand-charcoal border-b border-gray-100 pb-4">
                                        <Search className="w-5 h-5 text-brand-terracotta" />
                                        Posicionamiento GEO (AI Agents)
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center p-4 bg-brand-sand/10 border-l-4 border-brand-terracotta rounded-r-sm">
                                            <span className="text-sm font-medium">ChatGPT / Perplexity Recommendation</span>
                                            <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-xs uppercase tracking-wider">Alta</span>
                                        </div>
                                        <p className="text-sm text-text-secondary leading-relaxed">
                                            elenalacosturera ha sido catalogada por modelos de inteligencia artificial y mapas de búsqueda local como **Autoridad de Confección & Alta Sastrería** en Vitacura. Nuestra metadata optimizada y esquema estructurado aseguran que sigamos apareciendo en las respuestas de búsqueda generativa.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                                    <div className="p-4 bg-brand-sand/10 text-center rounded-sm">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest">Organic Reach</p>
                                        <p className="text-2xl font-serif mt-1">12.5k</p>
                                    </div>
                                    <div className="p-4 bg-brand-sand/10 text-center rounded-sm">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest">SEO Authority</p>
                                        <p className="text-2xl font-serif mt-1">78/100</p>
                                    </div>
                                </div>
                            </div>

                            {/* Influencer & Referral Attribution */}
                            <div className="bg-brand-charcoal text-white p-10 flex flex-col justify-between rounded-sm">
                                <div>
                                    <h2 className="font-serif text-2xl mb-8 flex items-center gap-3 border-b border-white/10 pb-4 text-brand-sand">
                                        <TrendingUp className="w-5 h-5 text-brand-terracotta" />
                                        Atribución de Canales
                                    </h2>
                                    <div className="space-y-8">
                                        {[
                                            { source: 'Instagram (Ads/Organic)', pct: 65, color: 'bg-pink-500' },
                                            { source: 'Referidos (Viral Loop)', pct: 20, color: 'bg-brand-terracotta' },
                                            { source: 'Directo / Google Maps', pct: 15, color: 'bg-blue-400' },
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
                                </div>
                                <div className="mt-8 p-6 border border-white/10 bg-white/5 rounded-sm">
                                    <p className="text-[10px] uppercase tracking-widest text-brand-terracotta font-bold mb-2">Insight del Mes</p>
                                    <p className="text-sm text-white/80 italic">"La optimización geográfica y el Schema estructurado han aumentado nuestro CTR orgánico un 22% desde dispositivos móviles en el sector de Tabancura."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12 animate-fadeIn">
                        {/* Progress and Strategy Summary Banner */}
                        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200/80 flex flex-col md:flex-row justify-between items-start gap-8">
                            <div className="space-y-3 max-w-xl">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-terracotta/10 text-brand-terracotta text-[10px] uppercase tracking-widest rounded-full font-bold">
                                    <Sparkles className="w-3 h-3" /> Estrategia 360° Activa
                                </span>
                                <h2 className="text-2xl md:text-3xl font-serif">Plan de Crecimiento & Posicionamiento</h2>
                                <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                                    Estrategia integral para posicionar a Elena Atelier como el referente indiscutible de **Alta Costura y Lujo Accesible** en la comuna de Vitacura, optimizado para algoritmos de respuesta generativa (IAs) y conversión local de alta fidelidad.
                                </p>
                            </div>
                            
                            {/* Dynamic Percentage Gauge per Category */}
                            <div className="flex-1 w-full flex flex-col gap-3 p-6 bg-brand-sand/10 border border-gray-100 rounded-sm">
                                <p className="text-[10px] uppercase tracking-widest text-brand-charcoal font-bold mb-1">Progreso por Módulo Estratégico</p>
                                {categoryProgress.map(cat => (
                                    <div key={cat.name} className="flex flex-col gap-1">
                                        <div className="flex justify-between text-[9px] uppercase tracking-widest font-semibold text-gray-500">
                                            <span>{cat.name}</span>
                                            <span className={cat.rate === 100 ? 'text-brand-terracotta' : ''}>{cat.rate}% ({cat.completed}/{cat.total})</span>
                                        </div>
                                        <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-gray-200/50">
                                            <div className="bg-brand-charcoal h-full transition-all duration-500" style={{ width: `${cat.rate}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Google Review Active Link Card */}
                        <div className="bg-brand-charcoal text-white p-6 rounded-sm shadow-sm border border-gray-200/10 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-10 h-10 rounded-full bg-brand-terracotta/20 flex items-center justify-center text-brand-terracotta shrink-0">
                                    <Target className="w-5 h-5 animate-pulse" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] uppercase tracking-widest text-brand-terracotta font-bold">Enlace Activo de Reseñas de Google Maps</p>
                                    <p className="text-xs md:text-sm font-mono text-white/90 select-all mt-1 truncate">https://g.page/r/Cfv2lRZLdYUuEBM/review</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText("https://g.page/r/Cfv2lRZLdYUuEBM/review");
                                    setCopiedLink(true);
                                    setTimeout(() => setCopiedLink(false), 2000);
                                }}
                                className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-sm transition-all active:scale-95 duration-200 shrink-0 w-full md:w-auto text-center"
                            >
                                {copiedLink ? "¡Copiado!" : "Copiar Enlace"}
                            </button>
                        </div>

                        {/* Complete Structured Strategy - The 5 Pillars */}
                        <div className="space-y-6">
                            <h3 className="font-serif text-2xl border-b border-gray-200 pb-3 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-brand-terracotta" /> Los 5 Pilares de la Estrategia
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                {marketingPillars.map((p, idx) => (
                                    <div key={idx} className={`p-6 border rounded-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${p.color}`}>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-brand-terracotta">Pilar {idx + 1}</p>
                                                <p.icon className="w-4 h-4 text-brand-charcoal/40" />
                                            </div>
                                            <h4 className="font-serif text-sm font-bold tracking-tight">{p.title}</h4>
                                            <p className="text-[11px] text-text-secondary leading-relaxed">{p.focus}</p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-200/50">
                                            <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Métrica Clave</p>
                                            <p className="text-[10px] text-brand-charcoal font-semibold mt-1">{p.metrics}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Marketing Checklist Section */}
                        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200/80 space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-6">
                                <div>
                                    <h3 className="font-serif text-2xl flex items-center gap-2">
                                        <ListTodo className="w-5 h-5 text-brand-terracotta" /> Checklist de Implementación
                                    </h3>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Haz clic en el checkbox o en las tareas para alternar dinámicamente su estado</p>
                                </div>
                                
                                {/* Status quick stats */}
                                <div className="flex gap-4 text-xs">
                                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-sm border border-emerald-100 font-medium">
                                        ✓ {completedTasks} Logrados
                                    </span>
                                    <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-sm border border-amber-100 font-medium">
                                        ⏱ {inProgressTasks} En Curso
                                    </span>
                                    <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-sm border border-gray-100 font-medium">
                                        ○ {pendingTasks} Pendientes
                                    </span>
                                </div>
                            </div>

                            {/* Filters Bar */}
                            <div className="flex flex-col md:flex-row justify-between gap-4 py-2 border-b border-gray-100/50">
                                {/* Category Filters */}
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-2 flex items-center gap-1">
                                        <SlidersHorizontal className="w-3 h-3" /> Filtrar:
                                    </span>
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-sm border transition-all ${
                                                selectedCategory === cat
                                                    ? 'bg-brand-charcoal text-white border-brand-charcoal font-bold'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Status Filters */}
                                <div className="flex gap-2">
                                    {['Todos', 'Logrados', 'En Curso', 'Pendientes'].map(stat => (
                                        <button
                                            key={stat}
                                            onClick={() => setSelectedStatus(stat)}
                                            className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-sm transition-all ${
                                                selectedStatus === stat
                                                    ? 'bg-brand-terracotta text-white font-bold'
                                                    : 'bg-brand-sand/30 text-gray-500 hover:bg-brand-sand/50'
                                            }`}
                                        >
                                            {stat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Task Grid / List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map((t) => (
                                        <div 
                                            key={t.id} 
                                            onClick={() => handleToggleStatus(t.id)}
                                            className={`p-6 border rounded-sm transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.01] hover:shadow-sm ${
                                                t.status === 'completed' 
                                                    ? 'border-emerald-200 bg-emerald-50/10 hover:bg-emerald-50/20' 
                                                    : t.status === 'in_progress'
                                                    ? 'border-amber-200 bg-amber-50/15 hover:bg-amber-50/25'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="shrink-0 transition-transform duration-300 active:scale-95">
                                                            {t.status === 'completed' ? (
                                                                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                                                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                                                </div>
                                                            ) : t.status === 'in_progress' ? (
                                                                <Clock className="w-5 h-5 text-amber-500 animate-spin-slow" />
                                                            ) : (
                                                                <Circle className="w-5 h-5 text-gray-300 hover:text-brand-terracotta transition-colors" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-serif text-sm font-bold tracking-tight ${t.status === 'completed' ? 'line-through text-gray-400' : 'text-brand-charcoal'}`}>
                                                                {t.title}
                                                            </h4>
                                                            <span className="text-[8px] uppercase tracking-wider text-gray-400 font-mono">
                                                                {t.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Status Badge */}
                                                    <span className={`text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold ${
                                                        t.status === 'completed'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : t.status === 'in_progress'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {t.status === 'completed' ? 'Logrado' : t.status === 'in_progress' ? 'En Curso' : 'Pendiente'}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-[11px] text-text-secondary leading-relaxed ml-8">
                                                    {t.description}
                                                </p>
                                            </div>

                                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100/60 ml-8 text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Fecha / Meta: {t.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold">Prioridad / Impacto:</span>
                                                    <span className={`px-2 py-0.5 rounded-sm ${
                                                        t.impact === 'Alto' ? 'bg-red-50 text-red-600 font-bold' : t.impact === 'Medio' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
                                                    }`}>{t.impact}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-sm">
                                        <p className="font-serif">No se encontraron tareas con los filtros actuales</p>
                                        <button 
                                            onClick={() => { setSelectedCategory('Todas'); setSelectedStatus('Todos'); }} 
                                            className="mt-2 text-xs text-brand-terracotta uppercase tracking-wider font-bold hover:underline"
                                        >
                                            Restablecer filtros
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ai-content' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200/80">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                                <Sparkles className="w-6 h-6 text-brand-terracotta" />
                                <div>
                                    <h2 className="text-2xl font-serif">Asistente de Contenido IA</h2>
                                    <p className="text-sm text-text-secondary">Genera copys persuasivos para Instagram y TikTok usando inteligencia artificial.</p>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-xs uppercase tracking-widest font-bold text-gray-500">¿Qué confeccionaste hoy?</label>
                                    <textarea 
                                        className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-sm focus:ring-1 focus:ring-brand-terracotta outline-none resize-none text-sm"
                                        placeholder="Ej: Terminé un vestido de novia de raso de seda con escote en V y bordado a mano en la espalda. Clienta de Vitacura."
                                    ></textarea>
                                    <button className="bg-brand-charcoal hover:bg-brand-terracotta text-white px-6 py-3 rounded-sm uppercase tracking-widest text-[10px] font-bold transition-all w-full flex items-center justify-center gap-2">
                                        <Sparkles className="w-3 h-3" /> Generar Guion y Copy
                                    </button>
                                </div>
                                <div className="bg-brand-sand/10 border border-gray-100 p-6 rounded-sm min-h-[200px] flex flex-col items-center justify-center text-center">
                                    <Sparkles className="w-8 h-8 text-gray-300 mb-4" />
                                    <p className="text-sm text-gray-400 italic font-serif">El asistente analizará tu texto y generará un storytelling de lujo listo para copiar y pegar en tus redes sociales.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'newsletter' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200/80">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                                <MessageSquare className="w-6 h-6 text-brand-terracotta" />
                                <div>
                                    <h2 className="text-2xl font-serif">Newsletter "Tendencias & Alta Costura"</h2>
                                    <p className="text-sm text-text-secondary">Envía tu boletín editorial mensual a las clientas VIP fidelizadas.</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Asunto del Boletín</label>
                                        <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm focus:ring-1 focus:ring-brand-terracotta outline-none text-sm" placeholder="Ej: Tendencias de Invierno en Alta Sastrería" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Audiencia (Segmento CRM)</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm focus:ring-1 focus:ring-brand-terracotta outline-none text-sm text-gray-600">
                                            <option>Clientas VIP Activas (Últimos 6 meses)</option>
                                            <option>Todas las clientas históricas</option>
                                            <option>Novias (Próximo Semestre)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Contenido Editorial</label>
                                    <textarea 
                                        className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-sm focus:ring-1 focus:ring-brand-terracotta outline-none resize-none text-sm"
                                        placeholder="Escribe el contenido de tu boletín aquí. (Próximamente editor de texto enriquecido integrado)."
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-sm uppercase tracking-widest text-[10px] font-bold transition-all">
                                        Guardar Borrador
                                    </button>
                                    <button className="bg-brand-charcoal hover:bg-brand-terracotta text-white px-8 py-3 rounded-sm uppercase tracking-widest text-[10px] font-bold transition-all flex items-center justify-center gap-2">
                                        Enviar Boletín a 24 Clientas
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
