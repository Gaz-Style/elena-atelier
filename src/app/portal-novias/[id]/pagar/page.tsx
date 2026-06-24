'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, Loader2, Lock, ArrowRight, Wallet } from 'lucide-react';

export default function PortalNoviasPagarPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [links, setLinks] = useState<any>(null);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#C17F5F]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F6F0] font-sans text-[#1A1A1A] flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-[#1A1A1A] z-0"></div>
            
            <main className="flex-1 w-full max-w-xl mx-auto px-6 py-12 md:py-24 relative z-10 flex flex-col items-center">
                
                {/* Logo & Header */}
                <div className="text-center mb-10 w-full">
                    <h1 className="font-serif text-3xl md:text-4xl font-light text-white tracking-[0.2em] mb-2">ELENA</h1>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/70 font-bold">LA COSTURERA</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-sm shadow-2xl p-8 md:p-12 relative w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#F8F6F0] rounded-full flex items-center justify-center shadow-inner">
                        <div className="w-12 h-12 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center">
                            <Lock className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="text-center mt-6 mb-10">
                        <h2 className="font-serif text-2xl text-[#1A1A1A] mb-2">Pago de Reserva</h2>
                        <p className="text-sm text-gray-500">
                            Abono del 50% para dar inicio al proyecto y reservar tu cupo de producción.
                        </p>
                    </div>

                    {errorMsg ? (
                        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-sm text-sm text-center">
                            {errorMsg}
                        </div>
                    ) : links ? (
                        <div className="space-y-8">
                            <div className="bg-[#F8F6F0] p-6 rounded-sm text-center">
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Monto a pagar</p>
                                <p className="text-4xl font-serif text-[#1A1A1A]">{formatCurrency(links.amount)}</p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold text-center mb-4">
                                    Selecciona tu método de pago
                                </h3>

                                {/* Transbank Button */}
                                {links.tbkLink && links.tbkToken && (
                                    <form action={links.tbkLink} method="POST" className="w-full">
                                        <input type="hidden" name="token_ws" value={links.tbkToken} />
                                        <button 
                                            type="submit"
                                            className="w-full bg-[#1A1A1A] hover:bg-black text-white p-4 rounded-sm transition-colors flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="w-5 h-5 text-[#C17F5F]" />
                                                <span className="font-bold text-sm tracking-wide">Webpay Plus</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </form>
                                )}

                                {/* MercadoPago Button */}
                                {links.mpLink && (
                                    <a 
                                        href={links.mpLink}
                                        className="w-full border border-gray-200 hover:border-[#1A1A1A] bg-white text-[#1A1A1A] p-4 rounded-sm transition-colors flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Wallet className="w-5 h-5 text-sky-500" />
                                            <div className="text-left">
                                                <span className="font-bold text-sm tracking-wide block">Mercado Pago</span>
                                                <span className="text-[10px] text-gray-500 uppercase">Tarjetas o Dinero en cuenta</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                )}
                            </div>

                            <p className="text-[10px] text-center text-gray-400 pt-4 border-t border-gray-100">
                                Transacciones seguras y encriptadas de extremo a extremo.
                            </p>
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
}
