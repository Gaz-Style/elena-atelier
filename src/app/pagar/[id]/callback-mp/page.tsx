'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { updateOrderStatusToPaidAction } from '@/app/admin/pos/actions';

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const status = searchParams.get('status');
    const payment_id = searchParams.get('payment_id');
    const statusFromUrl = searchParams.get('error') ? 'error' : searchParams.get('pending') ? 'pending' : 'approved';

    useEffect(() => {
        const processPayment = async () => {
            if (status === 'approved' || statusFromUrl === 'approved') {
                const buyOrder = `order_${orderId.replace(/[^a-zA-Z0-9_]/g, '')}`;
                try {
                    await updateOrderStatusToPaidAction(buyOrder);
                    setLoading(false);
                } catch (err) {
                    console.error('Error actualizando orden:', err);
                    setLoading(false);
                }
            } else if (status === 'rejected' || statusFromUrl === 'error') {
                setError('El pago fue rechazado por Mercado Pago.');
                setLoading(false);
            } else {
                setError('Estado de pago no confirmado o pendiente.');
                setLoading(false);
            }
        };

        processPayment();
    }, [status, statusFromUrl, orderId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-[#EAEAEA]">
                <Loader2 className="w-12 h-12 animate-spin text-[#009EE3]" />
                <div className="text-center space-y-2">
                    <h2 className="font-serif text-2xl font-light tracking-wide text-white">Verificando Pago</h2>
                    <p className="text-sm font-light text-gray-400 max-w-md">
                        Estamos confirmando tu pago con Mercado Pago...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto bg-[#12131C] border border-red-950/60 rounded-lg overflow-hidden shadow-2xl p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
                    <XCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="font-serif text-2xl font-light text-white">Pago Rechazado</h2>
                    <p className="text-sm text-gray-400 leading-relaxed pt-2">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto bg-[#12131C] border border-gray-800 rounded-lg overflow-hidden shadow-2xl animate-in fade-in duration-500">
            <div className="bg-gradient-to-b from-[#009EE3]/20 to-transparent p-8 text-center space-y-4 border-b border-gray-850">
                <div className="w-16 h-16 rounded-full bg-[#009EE3]/30 border border-[#009EE3]/50 flex items-center justify-center mx-auto text-[#009EE3] shadow-[0_0_25px_rgba(0,158,227,0.15)]">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#009EE3] tracking-[0.25em]">Pago Aprobado</span>
                    <h2 className="font-serif text-3xl font-light text-white tracking-wide">¡Pago Recibido con Éxito!</h2>
                    <p className="text-xs text-gray-400 font-light">Elena Atelier agradece tu preferencia.</p>
                </div>
            </div>
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-800">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#009EE3]">Comprobante Mercado Pago</span>
                    <span className="text-[10px] font-mono text-gray-500">ID: {payment_id}</span>
                </div>
                <div className="bg-[#1A1C28]/80 border border-gray-800/80 p-4 rounded-sm text-center text-xs leading-relaxed text-gray-400">
                    <p className="font-semibold text-white">✨ Su orden se encuentra confirmada y pagada.</p>
                </div>
            </div>
        </div>
    );
}

export default function MercadoPagoCallbackPage() {
    return (
        <div className="min-h-screen bg-[#0B0C10] text-[#EAEAEA] font-sans flex items-center justify-center p-4">
            <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-[#009EE3]" />}>
                <CallbackContent />
            </Suspense>
        </div>
    );
}
