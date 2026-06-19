'use client';

import React, { useState, useTransition } from 'react';
import { cobrarEnCajaAction } from '../actions';
import { useRouter } from 'next/navigation';
import { Banknote, ArrowRight, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

type PayMethod = 'mercadopago_point' | 'cash';

const METHODS: { key: PayMethod; label: string; icon: string }[] = [
    { key: 'mercadopago_point', label: 'Pago Máquina',   icon: '💳' },
    { key: 'cash',              label: 'Efectivo / Mixto', icon: '💵 💳' },
];


interface Props {
    saleId: string;
    internalId: string;
    totalAmount: number;
    currentStatus: string;
}

export default function CobrarEnCajaButton({ saleId, internalId, totalAmount, currentStatus }: Props) {
    const [open, setOpen] = useState(false);
    const [method, setMethod] = useState<PayMethod>('mercadopago_point');
    const [result, setResult] = useState<'success' | 'error' | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Only show for pending sales
    if (currentStatus !== 'pending') return null;

    function handleCobrar() {
        startTransition(async () => {
            const res = await cobrarEnCajaAction({
                saleId,
                internalId,
                totalAmount,
                paymentMethod: method,
            });
            if (res.success) {
                setResult('success');
                setTimeout(() => {
                    setOpen(false);
                    router.refresh();
                }, 1800);
            } else {
                setResult('error');
                setErrorMsg(res.error || 'Error desconocido');
            }
        });
    }

    return (
        <>
            {/* ── TRIGGER BUTTON ─────────────────────────────────────────── */}
            <button
                onClick={() => { setOpen(true); setResult(null); setMethod('mercadopago_point'); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all shadow-sm hover:shadow-md group"
            >
                <Banknote className="w-3.5 h-3.5" />
                Cobrar en Caja
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* ── MODAL ──────────────────────────────────────────────────── */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden">

                        {/* Header */}
                        <div className="bg-emerald-700 px-5 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-base flex items-center gap-2">
                                    <Banknote className="w-4 h-4" />
                                    Cobrar en Caja
                                </h3>
                                <p className="text-emerald-200 text-xs mt-0.5">{internalId}</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5">
                            {/* Total */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center mb-5">
                                <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold mb-1">Total a cobrar</p>
                                <p className="text-3xl font-serif text-emerald-800 font-bold">
                                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalAmount)}
                                </p>
                            </div>

                            {/* Payment method */}
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">Método de pago presencial</p>
                            <div className="grid grid-cols-2 gap-2 mb-5">
                                {METHODS.map(m => (
                                    <button
                                        key={m.key}
                                        onClick={() => setMethod(m.key)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                            method === m.key
                                                ? 'bg-emerald-700 text-white border-emerald-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span>{m.icon}</span> {m.label}
                                    </button>
                                ))}
                            </div>

                            {/* Info note */}
                            <p className="text-[11px] text-gray-400 bg-gray-50 rounded-lg p-3 leading-relaxed mb-4">
                                ✅ Esto marcará la venta como <strong>Pagada</strong>, cambiará el método a <strong>{METHODS.find(m => m.key === method)?.label}</strong> y registrará el ingreso en la caja abierta automáticamente.
                            </p>

                            {/* Result feedback */}
                            {result === 'success' && (
                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
                                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <p className="text-sm text-emerald-700 font-medium">¡Cobro registrado! Actualizando...</p>
                                </div>
                            )}
                            {result === 'error' && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <p className="text-sm text-red-600">{errorMsg}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setOpen(false)}
                                    disabled={isPending}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCobrar}
                                    disabled={isPending || result === 'success'}
                                    className="flex-1 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isPending ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                                    ) : (
                                        <><Banknote className="w-3.5 h-3.5" /> Confirmar Cobro</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
