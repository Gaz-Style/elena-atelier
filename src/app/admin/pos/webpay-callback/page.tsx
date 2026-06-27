'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Printer, ShoppingBag, CreditCard } from 'lucide-react';
import { commitWebpayTransaction } from '@/lib/transbank';
import { updateOrderStatusToPaidAction } from '../actions';

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
                    await updateOrderStatusToPaidAction(res.data.buy_order, res.data.amount);
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
                        onClick={() => router.push('/admin/pos')}
                        className="w-full bg-[#1A1C28] hover:bg-white/5 border border-gray-800 text-gray-300 py-3 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 text-[#C5A880]" />
                        Volver al Punto de Venta
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
        <div className="max-w-xl mx-auto bg-[#12131C] border border-gray-800 rounded-lg overflow-hidden shadow-2xl animate-in fade-in duration-500 print:border-0 print:bg-white print:text-black print:shadow-none">
            {/* Header decorativo de éxito */}
            <div className="bg-gradient-to-b from-emerald-950/20 to-transparent p-8 text-center space-y-4 border-b border-gray-850 print:hidden">
                <div className="w-16 h-16 rounded-full bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-[0.25em]">Transacción Autorizada</span>
                    <h2 className="font-serif text-3xl font-light text-white tracking-wide">¡Pago Recibido con Éxito!</h2>
                    <p className="text-xs text-gray-400 font-light">
                        Elena Atelier agradece tu preferencia en servicios de alta costura
                    </p>
                </div>
            </div>

            {/* Comprobante de Venta */}
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-800">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">Comprobante Webpay Plus</span>
                    <span className="text-[10px] font-mono text-gray-500">REF: {paymentData.buy_order}</span>
                </div>

                <div className="space-y-4 text-sm text-gray-300">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Monto Autorizado:</span>
                        <strong className="text-white font-serif text-lg">{formatCurrency(paymentData.amount)}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Orden de Compra:</span>
                        <span className="font-mono text-white text-xs">{paymentData.buy_order}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Código de Autorización:</span>
                        <span className="font-mono text-white font-bold">{paymentData.authorization_code}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Método de Pago:</span>
                        <span className="text-white font-medium flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-[#C5A880]" />
                            {getPaymentType(paymentData.payment_type_code)}
                        </span>
                    </div>
                    {paymentData.installments_number > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Cuotas Pactadas:</span>
                            <span className="text-[#C5A880] font-bold">{paymentData.installments_number} cuotas</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Tarjeta Terminada en:</span>
                        <span className="font-mono text-white font-bold">•••• •••• •••• {paymentData.card_detail?.card_number || 'XXXX'}</span>
                    </div>
                </div>

                <div className="bg-[#1A1C28]/80 border border-gray-800/80 p-4 rounded-sm space-y-1.5 text-center text-xs leading-relaxed text-gray-400">
                    <p className="font-semibold text-white">✨ Su orden ya ha sido registrada en el taller.</p>
                    <p>Las costureras del atelier han recibido las especificaciones y se han programado las fechas estimadas del proyecto.</p>
                </div>

                {/* Acciones */}
                <div className="pt-6 border-t border-gray-850 flex flex-col sm:flex-row gap-4 print:hidden">
                    <button 
                        onClick={handlePrint}
                        className="flex-1 bg-[#1A1C28] hover:bg-white/5 border border-gray-800 text-gray-300 py-3.5 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                        <Printer className="w-4 h-4 text-[#C5A880]" />
                        Imprimir Recibo
                    </button>
                    <button 
                        onClick={() => router.push('/admin/pos')}
                        className="flex-1 bg-[#C5A880] hover:bg-[#B3966D] text-brand-charcoal py-3.5 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#C5A880]/15"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Nueva Orden POS
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
