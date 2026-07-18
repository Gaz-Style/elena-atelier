'use client';

import { useState } from 'react';
import { CreditCard, Globe, Loader2, Lock, ArrowRight, Wallet, Building, Copy, Check } from 'lucide-react';
import { createWebpayTransaction } from '@/lib/transbank';
import { createPaymentPreference } from '@/lib/payments';

export default function PaymentClient({ orderId, total }: { orderId: string; total: number }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);

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
                const callbackUrl = `${window.location.origin}/pagar/webpay-callback`;
                
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

    return (
        <div className="relative group overflow-hidden w-full max-w-md mx-auto">
            {/* Glass panel container matching bridal style */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-sm shadow-2xl p-8 md:p-10 relative w-full">
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#0B0C10] border border-white/10 rounded-full flex items-center justify-center shadow-inner">
                    <div className="w-12 h-12 rounded-full bg-[#1A1A1A] text-[#C17F5F] flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                    </div>
                </div>

                <div className="text-center mt-6 mb-10 border-b border-white/10 pb-8">
                    <p className="text-[#f5f2eb]/60 text-[9px] uppercase tracking-[0.45em] font-bold mb-3">Pago en Línea</p>
                    <h2 className="font-serif text-3xl text-white tracking-widest mb-1">
                        #{orderId.replace('order_', '')}
                    </h2>
                </div>

                {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-6">
                        <Loader2 className="w-8 h-8 animate-spin text-[#C17F5F]" />
                        <p className="text-[#f5f2eb]/50 text-[10px] uppercase tracking-[0.3em] animate-pulse">Conectando pasarela...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-widest text-[#C17F5F] font-bold mb-2">Monto a pagar</p>
                            <p className="text-4xl font-serif text-white tracking-wider">{formatCurrency(total)}</p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold text-center mb-6">
                                Selecciona tu método de pago
                            </h3>

                            {/* Transbank Webpay Button */}
                            <button
                                onClick={() => processPayment('transbank')}
                                disabled={isProcessing}
                                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white p-5 rounded-sm transition-all duration-300 flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <CreditCard className="w-6 h-6 text-white/80" />
                                    <span className="font-bold text-sm tracking-widest uppercase">Webpay Plus</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-[#C17F5F] group-hover:translate-x-1 transition-transform" />
                            </button>

                            {/* Mercado Pago Button */}
                            <button
                                onClick={() => processPayment('mercadopago')}
                                disabled={isProcessing}
                                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white p-5 rounded-sm transition-all duration-300 flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <Wallet className="w-6 h-6 text-white/80" />
                                    <div className="text-left">
                                        <span className="font-bold text-sm tracking-widest uppercase block">Mercado Pago</span>
                                        <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-1 block">Tarjetas o Dinero en cuenta</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-[#C17F5F] group-hover:translate-x-1 transition-transform" />
                            </button>

                            {/* Bank Transfer */}
                            <div className="mt-8 border border-white/10 rounded-sm overflow-hidden bg-white/5 group transition-all duration-300 hover:border-white/20">
                                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Building className="w-6 h-6 text-white/80" />
                                        <div className="text-left">
                                            <span className="font-bold text-sm tracking-widest uppercase block text-white">Transferencia Bancaria</span>
                                            <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-1 block">Datos para abono directo</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleCopy}
                                        className="flex items-center justify-center p-2 rounded-sm bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5 cursor-pointer"
                                        title="Copiar datos bancarios"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="p-6 space-y-4 bg-black/20 text-xs text-gray-400 font-light">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                        <span className="uppercase tracking-widest text-[9px] font-bold">Destinatario</span>
                                        <span className="text-white font-medium">ATELIER HORTENSIA SPA</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                        <span className="uppercase tracking-widest text-[9px] font-bold">RUT</span>
                                        <span className="text-white font-medium">78.158.853-9</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                        <span className="uppercase tracking-widest text-[9px] font-bold">Banco</span>
                                        <span className="text-white font-medium">Banco Bci / Mach</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                        <span className="uppercase tracking-widest text-[9px] font-bold">Tipo de cuenta</span>
                                        <span className="text-white font-medium">Cuenta corriente</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                        <span className="uppercase tracking-widest text-[9px] font-bold">Nº de cuenta</span>
                                        <span className="text-white font-medium">77180795</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="uppercase tracking-widest text-[9px] font-bold">Correo</span>
                                        <span className="text-white font-medium">pagos@elenalacosturera.cl</span>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                                        <p className="text-[9px] uppercase tracking-wider text-[#C17F5F]">Por favor, enviar comprobante a pagos@elenalacosturera.cl</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-[9px] uppercase tracking-widest text-center text-gray-600 pt-6 border-t border-white/5 flex items-center justify-center gap-2">
                            <Lock className="w-3 h-3" /> Transacciones seguras encriptadas
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
