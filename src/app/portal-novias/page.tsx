'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Sparkles, Lock, Heart, Crown, GraduationCap, PartyPopper, ChevronRight } from 'lucide-react';
import { loginBridalPortal } from './actions';

// Label config per project type
const projectTypeConfig: Record<string, { label: string; sublabel: string; icon: any; portal: string }> = {
    novia:      { label: 'Vestido de Novia',       sublabel: 'Portal Novias',        icon: Heart,          portal: 'portal-novias' },
    madrina:    { label: 'Vestido de Madrina',      sublabel: 'Portal Fiesta & Gala', icon: Crown,          portal: 'portal-fiesta' },
    graduacion: { label: 'Vestido de Graduación',   sublabel: 'Portal Fiesta & Gala', icon: GraduationCap,  portal: 'portal-fiesta' },
    fiesta:     { label: 'Prenda de Fiesta',        sublabel: 'Portal Fiesta & Gala', icon: PartyPopper,    portal: 'portal-fiesta' },
};

// Shared wrapper with background
function PageWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="min-h-screen text-white font-sans flex items-center justify-center py-12 px-4 relative overflow-hidden"
            style={{
                backgroundImage: "url('/novia/fondo_novia.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                backgroundColor: '#0d0d0d',
            }}
        >
            {/* Subtle dark scrim for legibility */}
            <div className="fixed inset-0 bg-black/30 z-0 pointer-events-none" />
            {children}
        </div>
    );
}

// Premium glass card
function GlassCard({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="relative z-10 w-full rounded-2xl p-8 md:p-10"
            style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
        >
            {children}
        </div>
    );
}

export default function BridalPortalLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [rut, setRut] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [projects, setProjects] = useState<{ id: string; project_type: string }[] | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const res = await loginBridalPortal(email, rut);
            if (res.success) {
                if (res.projects && res.projects.length > 1) {
                    setProjects(res.projects);
                    setLoading(false);
                } else if (res.projectId) {
                    if (res.projectType && ['madrina', 'graduacion', 'fiesta'].includes(res.projectType)) {
                        router.push(`/portal-fiesta/${res.projectId}`);
                    } else {
                        router.push(`/portal-novias/${res.projectId}`);
                    }
                }
            } else {
                setErrorMsg(res.error || 'Credenciales inválidas');
                setLoading(false);
            }
        } catch {
            setErrorMsg('Ocurrió un error inesperado');
            setLoading(false);
        }
    };

    // ─── Project Selector Screen ───────────────────────────────────────────────
    if (projects) {
        return (
            <PageWrapper>
                <div className="w-full max-w-md relative z-10">
                    {/* Logo */}
                    <div className="text-center mb-10">
                        <div className="flex flex-col items-stretch justify-center w-max mx-auto">
                            <div className="flex justify-between w-full font-serif text-3xl font-black uppercase text-white leading-none" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
                                <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
                            </div>
                            <div className="font-sans text-[0.75rem] font-bold uppercase text-white/70 mt-1 text-center" style={{ letterSpacing: '0.45em', marginRight: '-0.45em', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                                La Costurera
                            </div>
                        </div>
                    </div>

                    <GlassCard>
                        <div className="text-center mb-8">
                            <div className="text-[#e8b99a] mb-3 text-[10px] tracking-widest uppercase flex items-center justify-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" /> Múltiples Proyectos Activos
                            </div>
                            <h2 className="font-serif text-2xl text-white mb-2 italic" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>¿A qué portal deseas ingresar?</h2>
                            <p className="text-xs text-white/60 font-light">
                                Tienes {projects.length} proyectos activos. Selecciona el que quieras revisar.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {projects.map((p) => {
                                const config = projectTypeConfig[p.project_type] ?? {
                                    label: p.project_type,
                                    sublabel: 'Portal',
                                    icon: Heart,
                                    portal: 'portal-novias',
                                };
                                const Icon = config.icon;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => router.push(`/${config.portal}/${p.id}`)}
                                        className="w-full flex items-center gap-4 p-5 rounded-xl transition-all group text-left"
                                        style={{
                                            background: 'rgba(255,255,255,0.07)',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                        }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,185,154,0.5)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
                                    >
                                        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                                            style={{ background: 'rgba(193,127,95,0.2)', border: '1px solid rgba(193,127,95,0.4)' }}>
                                            <Icon className="w-5 h-5 text-[#e8b99a]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-white" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{config.label}</p>
                                            <p className="text-[10px] text-[#e8b99a] uppercase tracking-wider mt-0.5">{config.sublabel}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#e8b99a] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => { setProjects(null); setEmail(''); setRut(''); }}
                            className="mt-6 w-full text-center text-[9px] text-white/40 hover:text-[#e8b99a] uppercase tracking-widest transition-colors"
                        >
                            ← Volver al inicio de sesión
                        </button>
                    </GlassCard>
                </div>
            </PageWrapper>
        );
    }

    // ─── Login Screen ──────────────────────────────────────────────────────────
    return (
        <PageWrapper>
            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="flex flex-col items-stretch justify-center w-max mx-auto">
                        <div className="flex justify-between w-full font-serif text-3xl font-black uppercase text-white leading-none drop-shadow-lg" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
                            <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
                        </div>
                        <div
                            className="font-sans text-[0.75rem] font-bold uppercase text-white/70 mt-1 text-center"
                            style={{ letterSpacing: '0.45em', marginRight: '-0.45em', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
                        >
                            La Costurera
                        </div>
                    </div>
                </div>

                <GlassCard>
                    <div className="text-center mb-8">
                        <div className="text-[#e8b99a] mb-3 text-[10px] tracking-widest uppercase flex items-center justify-center gap-2">
                            <Lock className="w-3.5 h-3.5" /> Portal Privado
                        </div>
                        <h2 className="font-serif text-2xl text-white mb-2 italic" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>Acceso Exclusivo</h2>
                        <p className="text-xs text-white/60 font-light">
                            Ingresa tus datos para acceder al progreso de tu vestido y gestionar tus citas.
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 text-red-200 rounded-lg text-xs text-center backdrop-blur-sm">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-7">
                        {/* Email */}
                        <div className="space-y-1 relative group">
                            <label className="text-[9px] text-white/50 uppercase tracking-widest group-focus-within:text-[#e8b99a] transition-colors">Correo Electrónico</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent py-3 text-sm text-white outline-none transition-colors placeholder-white/25"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}
                                onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(232,185,154,0.8)')}
                                onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)')}
                                placeholder="tu@correo.com"
                            />
                        </div>

                        {/* RUT */}
                        <div className="space-y-1 relative group">
                            <label className="text-[9px] text-white/50 uppercase tracking-widest group-focus-within:text-[#e8b99a] transition-colors">RUT (Sin dígito verificador)</label>
                            <input
                                type="text"
                                required
                                value={rut}
                                onChange={(e) => setRut(e.target.value.replace(/[^0-9]/g, ''))}
                                maxLength={8}
                                className="w-full bg-transparent py-3 text-sm text-white outline-none transition-colors placeholder-white/25"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}
                                onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(232,185,154,0.8)')}
                                onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)')}
                                placeholder="Ej: 12345678"
                            />
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(193,127,95,0.9) 0%, rgba(168,100,68,0.95) 100%)',
                                    border: '1px solid rgba(232,185,154,0.4)',
                                    boxShadow: '0 4px 24px rgba(193,127,95,0.3)',
                                    color: '#fff',
                                }}
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                                ) : (
                                    <>
                                        Ingresar a mi Portal
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </GlassCard>

                <div className="text-center mt-8 relative z-10">
                    <p className="text-[9px] text-white/40 uppercase tracking-widest flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#e8b99a]/60" /> Elena Atelier &middot; Santiago de Chile
                    </p>
                </div>
            </div>
        </PageWrapper>
    );
}
