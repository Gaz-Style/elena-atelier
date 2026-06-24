'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Printer, ShoppingBag, CreditCard } from 'lucide-react';
import { commitWebpayTransaction } from '@/lib/transbank';
import { updateOrderStatusToPaidAction } from '@/app/admin/pos/actions';

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const token_ws = searchParams.get('token_ws');
    const tbk_token = searchParams.get('TBK_TOKEN');

    useEffect(() => {
        if (tbk_token) {
            setError('La compra fue anulada por el usuario en el portal de Webpay (no se realizó ningún cargo).');
            setLoading(false);
            return;
        }

        if (!token_ws) {
            setError('No se recibió el token de confirmación de Webpay.');
            setLoading(false);
            return;
        }

        // Llamar al commit de Webpay
        commitWebpayTransaction(token_ws)
            .then(async (res) => {
                if (res.success && res.data && res.data.response_code === 0) {
                    setPaymentData(res.data);
                    // Actualizar orden a pagada
                    await updateOrderStatusToPaidAction(res.data.buy_order);
                } else {
                    if (res.success && res.data) {
                        setPaymentData(res.data);
                    }
                    setError(res.error || 'La transacción no pudo ser autorizada.');
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error al confirmar transacción:', err);
                setError('Ocurrió un error inesperado al procesar el pago.');
                setLoading(false);
            });
    }, [token_ws]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-[#EAEAEA]">
                <Loader2 className="w-12 h-12 animate-spin text-[#C5A880]" />
                <div className="text-center space-y-2">
                    <h2 className="font-serif text-2xl font-light tracking-wide text-white">Confirmando Pago con Transbank</h2>
                    <p className="text-sm font-light text-gray-400 max-w-md">
                        Por favor, no cierres la ventana. Estamos procesando la autorización de tu pago seguro...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !paymentData || paymentData.response_code !== 0) {
        return (
            <div className="max-w-md mx-auto bg-[#12131C] border border-red-950/60 rounded-lg overflow-hidden shadow-2xl p-8 text-center space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center mx-auto text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <XCircle className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                    <h2 className="font-serif text-2xl font-light text-white">Pago Rechazado o Fallido</h2>
                    <p className="text-xs font-mono uppercase tracking-widest text-red-400">
                        Código de respuesta: {paymentData?.response_code ?? 'Error de sistema'}
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed pt-2">
                        {error || 'La transacción bancaria fue rechazada por el emisor de la tarjeta o cancelada por el usuario.'}
                    </p>
                </div>

                <div className="pt-4 border-t border-gray-800 space-y-3">
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full bg-[#1A1C28] hover:bg-white/5 border border-gray-800 text-gray-300 py-3 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 text-[#C5A880]" />
                        Volver a Inicio
                    </button>
                </div>
            </div>
        );
    }

    // Traducir tipo de pago
    const getPaymentType = (code: string) => {
        const types: Record<string, string> = {
            VD: 'Débito (Redcompra)',
            VN: 'Crédito Sin Cuotas',
            VC: 'Crédito en Cuotas',
            SI: 'Cuotas Sin Interés',
            S2: 'Cuotas Sin Interés'
        };
        return types[code] || 'Tarjeta Bancaria';
    };

    return (
        <div className="relative group overflow-hidden w-full max-w-md mx-auto">
            {/* Glass panel container */}
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 border-t-white/20 border-l-white/20 border-b-white/5 border-r-white/5 rounded-[1px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 md:p-10 w-full animate-in fade-in zoom-in duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                
                {/* Header decorativo de éxito */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <p className="text-[#f5f2eb]/60 text-[10px] uppercase tracking-[0.45em] font-semibold mb-4">Transacción Autorizada</p>
                    <h2 className="text-[#f5f2eb] text-3xl md:text-4xl font-serif font-light tracking-widest mb-3">
                        ¡Pago Exitoso!
                    </h2>
                    <p className="text-white/40 text-[10px] font-sans tracking-widest uppercase">
                        Ref: {paymentData.buy_order}
                    </p>
                </div>

                {/* Detalles del Comprobante */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-white/5 pb-3">
                        <span className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Monto Autorizado</span>
                        <span className="font-serif text-[#f5f2eb] text-xl">{formatCurrency(paymentData.amount)}</span>
                    </div>
                    
                    <div className="flex justify-between items-end border-b border-white/5 pb-3">
                        <span className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Cód. Autorización</span>
                        <span className="font-sans text-white/90 text-xs tracking-widest">{paymentData.authorization_code}</span>
                    </div>

                    <div className="flex justify-between items-end border-b border-white/5 pb-3">
                        <span className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Método de Pago</span>
                        <span className="font-sans text-white/90 text-xs tracking-widest">{getPaymentType(paymentData.payment_type_code)}</span>
                    </div>

                    {paymentData.installments_number > 0 && (
                        <div className="flex justify-between items-end border-b border-white/5 pb-3">
                            <span className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Cuotas</span>
                            <span className="font-sans text-white/90 text-xs tracking-widest">{paymentData.installments_number}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-end border-b border-white/5 pb-3">
                        <span className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Tarjeta</span>
                        <span className="font-sans text-white/90 text-xs tracking-widest">•••• {paymentData.card_detail?.card_number || 'XXXX'}</span>
                    </div>
                </div>

                {/* Mensaje de confirmación del taller */}
                <div className="mt-8 mb-8 bg-white/[0.02] border border-white/5 p-5 text-center">
                    <p className="text-[#f5f2eb]/80 text-[10px] uppercase tracking-[0.2em] mb-2 font-semibold">Su orden está en el taller</p>
                    <p className="text-white/40 text-[11px] leading-relaxed">Las costureras del atelier han recibido las especificaciones y se han programado las fechas del proyecto.</p>
                </div>

                {/* Botón Volver a Inicio */}
                <div className="pt-2">
                    <button 
                        onClick={() => router.push('/')}
                        className="group relative w-full inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:text-[#121212] hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] rounded-[1px]"
                    >
                        <span className="relative z-10 transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-[#121212] flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Volver a Inicio
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function WebpayCallbackPage() {
    return (
        <div className="min-h-screen bg-[#0B0C10] text-[#EAEAEA] font-sans antialiased selection:bg-brand-sand selection:text-brand-charcoal relative overflow-hidden py-24 px-4 flex items-center justify-center">
            {/* Background elements for premium aesthetic */}
            <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[60%] rounded-full bg-brand-terracotta/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[50%] rounded-full bg-brand-sand/5 blur-[120px] pointer-events-none" />

            <div className="max-w-2xl w-full z-10">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-[#EAEAEA]">
                        <Loader2 className="w-12 h-12 animate-spin text-[#C5A880]" />
                        <h2 className="font-serif text-2xl font-light tracking-wide text-white">Cargando...</h2>
                    </div>
                }>
                    <CallbackContent />
                </Suspense>
            </div>
        </div>
    );
}
