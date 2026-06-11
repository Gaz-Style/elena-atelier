'use client';

import { useState } from 'react';
import { CreditCard, Globe, Loader2 } from 'lucide-react';
import { createWebpayTransaction } from '@/lib/transbank';
import { createPaymentPreference } from '@/lib/payments';

export default function PaymentClient({ orderId, total }: { orderId: string; total: number }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
    };

    const processPayment = async (method: 'transbank' | 'mercadopago') => {
        setIsProcessing(true);
        try {
            const cleanOrderId = orderId.replace(/[^a-zA-Z0-9_]/g, '');
            const buyOrder = cleanOrderId.startsWith('order_') ? cleanOrderId : `order_${cleanOrderId}`;

            if (method === 'transbank') {
                const sessionId = `session_online_${Date.now()}`;
                const callbackUrl = `${window.location.origin}/admin/pos/webpay-callback`;
                
                const tbkRes = await createWebpayTransaction(buyOrder, sessionId, total, callbackUrl);
                if (tbkRes.success && tbkRes.url && tbkRes.token) {
                    window.location.href = `${tbkRes.url}?token_ws=${tbkRes.token}`;
                } else {
                    alert('Error al iniciar Webpay. Inténtalo más tarde.');
                    setIsProcessing(false);
                }
            } else if (method === 'mercadopago') {
                const cart = [{ name: `Pago Orden ${orderId}`, price: total, category: 'Orden de Trabajo' }];
                const customPath = `/pagar/${orderId}/callback-mp`;
                const mpRes = await createPaymentPreference(cart, buyOrder, window.location.origin, customPath);
                if (mpRes && mpRes.id !== 'error') {
                    window.location.href = mpRes.init_point;
                } else {
                    alert('Error al iniciar Mercado Pago. Inténtalo más tarde.');
                    setIsProcessing(false);
                }
            }
        } catch (err) {
            console.error('Error procesando pago:', err);
            alert('Error inesperado al procesar el pago.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="relative group overflow-hidden w-full max-w-md mx-auto">
            {/* Glass panel container */}
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 border-t-white/20 border-l-white/20 border-b-white/5 border-r-white/5 rounded-[1px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-10 w-full animate-in fade-in zoom-in duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                
                <div className="text-center mb-10">
                    <p className="text-[#f5f2eb]/60 text-[10px] uppercase tracking-[0.45em] font-semibold mb-4">Pago en Línea</p>
                    <h2 className="text-[#f5f2eb] text-4xl font-serif font-light tracking-widest mb-8">
                        #{orderId.replace('order_', '')}
                    </h2>
                    
                    <div className="inline-block border border-white/10 border-t-white/20 border-l-white/20 px-6 py-3 bg-white/[0.02]">
                        <p className="text-white/80 text-xs font-sans tracking-[0.2em] uppercase">
                            Total <span className="font-serif text-[#f5f2eb] text-lg ml-2">{formatCurrency(total)}</span>
                        </p>
                    </div>
                </div>

                <div className="pt-2">
                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-6">
                            <Loader2 className="w-8 h-8 animate-spin text-[#f5f2eb]/70" />
                            <p className="text-[#f5f2eb]/50 text-[10px] uppercase tracking-[0.3em] animate-pulse">Conectando pasarela...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {/* Transbank Glass Button */}
                            <button
                                onClick={() => processPayment('transbank')}
                                disabled={isProcessing}
                                className="group relative w-full inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:text-[#121212] hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] disabled:opacity-50 disabled:cursor-not-allowed rounded-[1px]"
                            >
                                <div className="flex items-center justify-center gap-3 relative z-10 transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-[#121212]">
                                    <CreditCard className="w-4 h-4 transition-colors duration-[600ms]" />
                                    <span>Pagar con Webpay</span>
                                </div>
                            </button>

                            {/* Mercado Pago Glass Button */}
                            <button
                                onClick={() => processPayment('mercadopago')}
                                disabled={isProcessing}
                                className="group relative w-full inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/10 border-t-white/20 border-l-white/20 border-b-white/5 border-r-white/5 text-white/80 font-sans text-[10px] uppercase tracking-[0.25em] font-semibold bg-white/[0.04] backdrop-blur-[5px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:text-[#121212] hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] disabled:opacity-50 disabled:cursor-not-allowed rounded-[1px]"
                            >
                                <div className="flex items-center justify-center gap-3 relative z-10 transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-[#121212]">
                                    <Globe className="w-4 h-4 transition-colors duration-[600ms]" />
                                    <span>Mercado Pago</span>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
