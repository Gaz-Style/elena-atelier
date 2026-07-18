'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, Loader2, Lock, ArrowRight, Wallet, Building, Copy, Check } from 'lucide-react';

export default function PortalNoviasPagarPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [links, setLinks] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (params?.id) {
            loadLinks(params.id as string);
        }
    }, [params]);

    async function loadLinks(id: string) {
        try {
            const { generateBridalPaymentLinksAction } = await import('@/app/admin/novias/actions');
            const res = await generateBridalPaymentLinksAction(id);
            if (res.success) {
                setLinks(res);
            } else {
                setErrorMsg(res.error || 'No se pudieron generar los links de pago.');
            }
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setLoading(false);
        }
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);

    const handleCopy = async () => {
        const text = `Destinatario: ATELIER HORTENSIA SPA\nRUT: 78.158.853-9\nBanco: Banco Bci / Mach\nTipo de cuenta: Cuenta corriente\nNº de cuenta: 77180795\nCorreo: pagos@elenalacosturera.cl`;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#C17F5F]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F0] font-sans text-[#4A4A4A] flex flex-col relative overflow-hidden">
            {/* Elegant Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C17F5F]/5 rounded-full blur-3xl z-0 pointer-events-none"></div>
            
            <main className="flex-1 w-full max-w-xl mx-auto px-6 py-12 md:py-24 relative z-10 flex flex-col items-center">
                
                {/* Logo & Header */}
                <div className="text-center mb-12 w-full">
                    <div className="flex flex-col items-stretch justify-center w-max mx-auto">
                        <div className="flex justify-between w-full font-serif text-2xl md:text-3xl font-black uppercase text-[#1A1A1A] leading-none drop-shadow-sm">
                            <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
                        </div>
                        <div
                            className="font-sans text-[0.65rem] md:text-[0.75rem] font-bold uppercase text-[#1A1A1A]/70 mt-1 text-center"
                            style={{ letterSpacing: '0.35em', marginRight: '-0.35em' }}
                        >
                            La Costurera
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-[#F5F5F0]/80 border border-[#C17F5F]/20 backdrop-blur-sm rounded-sm shadow-[0_20px_60px_rgba(193,127,95,0.08)] p-8 md:p-12 relative w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#F5F5F0] border border-[#C17F5F]/20 rounded-full flex items-center justify-center shadow-inner">
                        <div className="w-12 h-12 rounded-full bg-[#1A1A1A] text-[#C17F5F] flex items-center justify-center">
                            <Lock className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="text-center mt-6 mb-10 border-b border-[#C17F5F]/20 pb-8">
                        <h2 className="font-serif text-2xl text-[#1A1A1A] mb-3 tracking-wide">Pago de Reserva</h2>
                        <p className="text-xs text-gray-600 font-light leading-relaxed">
                            Abono del 50% para dar inicio al proyecto y asegurar tu cupo de producción.
                        </p>
                    </div>

                    {errorMsg ? (
                        <div className="mb-8 p-4 bg-red-950/30 border border-red-900/50 text-red-400 rounded-sm text-xs text-center flex items-center justify-center gap-2">
                            <span>⚠</span> {errorMsg}
                        </div>
                    ) : links ? (
                        <div className="space-y-10">
                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-widest text-[#C17F5F] font-bold mb-2">Monto a pagar</p>
                                <p className="text-5xl font-serif text-[#1A1A1A] tracking-wider">{formatCurrency(links.amount)}</p>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold text-center mb-6">
                                    Selecciona tu método de pago
                                </h3>

                                {/* Transbank Button */}
                                {links.tbkLink && links.tbkToken && (
                                    <form action={links.tbkLink} method="POST" className="w-full">
                                        <input type="hidden" name="token_ws" value={links.tbkToken} />
                                        <button 
                                            type="submit"
                                            className="w-full bg-[#F5F5F0]/80 border border-[#C17F5F]/20 hover:bg-[#C17F5F]/10 text-[#1A1A1A] p-5 rounded-sm transition-all duration-300 flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <CreditCard className="w-6 h-6 text-[#1A1A1A]/80" />
                                                <span className="font-bold text-sm tracking-widest uppercase">Webpay Plus</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-[#C17F5F] group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </form>
                                )}

                                {/* MercadoPago Button */}
                                {links.mpLink && (
                                    <a 
                                        href={links.mpLink}
                                        className="w-full bg-[#F5F5F0]/80 border border-[#C17F5F]/20 hover:bg-[#C17F5F]/10 text-[#1A1A1A] p-5 rounded-sm transition-all duration-300 flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Wallet className="w-6 h-6 text-[#1A1A1A]/80" />
                                            <div className="text-left">
                                                <span className="font-bold text-sm tracking-widest uppercase block">Mercado Pago</span>
                                                <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-1 block">Tarjetas o Dinero en cuenta</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-[#C17F5F] group-hover:translate-x-1 transition-transform" />
                                    </a>
                                )}
                                
                                {/* Bank Transfer */}
                                <div className="mt-8 border border-[#C17F5F]/20 rounded-sm overflow-hidden bg-[#F5F5F0]/80 group transition-all duration-300 hover:border-[#C17F5F]/30">
                                    <div className="p-5 border-b border-[#C17F5F]/10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Building className="w-6 h-6 text-[#1A1A1A]/80" />
                                            <div className="text-left">
                                                <span className="font-bold text-sm tracking-widest uppercase block text-[#1A1A1A]">Transferencia Bancaria</span>
                                                <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-1 block">Datos para abono directo</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleCopy}
                                            className="flex items-center justify-center p-2 rounded-sm bg-[#F5F5F0]/80 hover:bg-[#C17F5F]/10 text-gray-600 hover:text-[#C17F5F] transition-colors border border-[#C17F5F]/10"
                                            title="Copiar datos bancarios"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4 bg-black/20 text-xs text-gray-600 font-light">
                                        <div className="flex justify-between items-center border-b border-[#C17F5F]/10 pb-3">
                                            <span className="uppercase tracking-widest text-[9px] font-bold">Destinatario</span>
                                            <span className="text-[#1A1A1A] font-medium">ATELIER HORTENSIA SPA</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-[#C17F5F]/10 pb-3">
                                            <span className="uppercase tracking-widest text-[9px] font-bold">RUT</span>
                                            <span className="text-[#1A1A1A] font-medium">78.158.853-9</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-[#C17F5F]/10 pb-3">
                                            <span className="uppercase tracking-widest text-[9px] font-bold">Banco</span>
                                            <span className="text-[#1A1A1A] font-medium">Banco Bci / Mach</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-[#C17F5F]/10 pb-3">
                                            <span className="uppercase tracking-widest text-[9px] font-bold">Tipo de cuenta</span>
                                            <span className="text-[#1A1A1A] font-medium">Cuenta corriente</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-[#C17F5F]/10 pb-3">
                                            <span className="uppercase tracking-widest text-[9px] font-bold">Nº de cuenta</span>
                                            <span className="text-[#1A1A1A] font-medium">77180795</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="uppercase tracking-widest text-[9px] font-bold">Correo</span>
                                            <span className="text-[#1A1A1A] font-medium">pagos@elenalacosturera.cl</span>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-[#C17F5F]/20 text-center">
                                            <p className="text-[9px] uppercase tracking-wider text-[#C17F5F]">Por favor, enviar comprobante a pagos@elenalacosturera.cl</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[9px] uppercase tracking-widest text-center text-gray-600 pt-6 border-t border-[#C17F5F]/10 flex items-center justify-center gap-2">
                                <Lock className="w-3 h-3" /> Transacciones seguras encriptadas
                            </p>
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
}
