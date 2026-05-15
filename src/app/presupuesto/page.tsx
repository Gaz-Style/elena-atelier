'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, CreditCard, Store, ExternalLink, Calendar, MapPin, Check } from 'lucide-react';
import Link from 'next/link';

function BudgetContent() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<any>(null);
    const [status, setStatus] = useState<'viewing' | 'accepted' | 'paying'>('viewing');
    const [paymentMethod, setPaymentMethod] = useState<'web' | 'presencial' | null>(null);

    useEffect(() => {
        const encodedData = searchParams.get('d');
        if (encodedData) {
            try {
                const decoded = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
                setData(decoded);
            } catch (e) {
                console.error("Error decoding budget data", e);
            }
        }
    }, [searchParams]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
    };

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-brand-sand/10">
                <div className="text-center space-y-4">
                    <h1 className="font-serif text-3xl">Presupuesto no encontrado</h1>
                    <p className="text-gray-500">El link parece ser inválido o ha expirado.</p>
                    <Link href="/" className="inline-block px-8 py-3 bg-brand-charcoal text-white text-xs uppercase tracking-widest font-bold">Volver al sitio</Link>
                </div>
            </div>
        );
    }

    if (status === 'paying' && paymentMethod === 'presencial') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-brand-sand/10">
                <div className="max-w-md w-full bg-white p-12 text-center shadow-xl rounded-sm space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="font-serif text-3xl">¡Presupuesto Aceptado!</h1>
                        <p className="text-gray-500">Hemos recibido tu confirmación. Te esperamos en nuestro Atelier para dar inicio a tu proyecto.</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-sm text-left space-y-4">
                        <div className="flex items-start gap-4 text-sm">
                            <MapPin className="w-5 h-5 text-brand-terracotta shrink-0" />
                            <p>Tabancura 1515, Vitacura<br/>Santiago, Chile</p>
                        </div>
                        <div className="flex items-start gap-4 text-sm">
                            <Calendar className="w-5 h-5 text-brand-terracotta shrink-0" />
                            <p>Horario: Lun - Vie de 10:00 a 19:00</p>
                        </div>
                    </div>
                    <button onClick={() => window.close()} className="w-full py-4 bg-brand-charcoal text-white text-xs uppercase tracking-widest font-bold">Cerrar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-sand/10 pb-24 md:pb-32 font-sans overflow-x-hidden">
            {/* Header / Brand */}
            <header className="bg-white border-b border-gray-100 p-8 md:p-12">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="font-serif text-4xl md:text-5xl tracking-tighter text-brand-charcoal">ELENA ATELIER</h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-terracotta mt-2 font-bold">Alta Costura & Sastrería a Medida</p>
                    </div>
                    <div className="hidden md:block text-right text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                        <p>Santiago, Chile</p>
                        <p className="mt-1">elenalacosturera.com</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto mt-12 p-4 md:p-0">
                <div className="bg-white shadow-2xl rounded-sm overflow-hidden">
                    {/* Document Info Bar */}
                    <div className="bg-brand-charcoal text-white p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
                        <div className="flex items-center gap-4">
                            <span className="opacity-50">Documento:</span>
                            <span>Presupuesto Formal de Trabajo</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="opacity-50">Fecha:</span>
                            <span>{new Date().toLocaleDateString('es-CL')}</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 md:p-16 space-y-16">
                        <div className="space-y-4">
                            <h2 className="font-serif text-2xl border-b border-gray-100 pb-4">Detalle de tu Proyecto</h2>
                            <p className="text-sm text-gray-500">Estimada clienta, a continuación presentamos la propuesta formal para el trabajo solicitado en nuestro atelier.</p>
                        </div>

                        <div className="space-y-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-[10px] uppercase tracking-widest text-gray-400">
                                        <th className="py-4">Servicio / Prenda</th>
                                        <th className="py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.cart.map((item: any, i: number) => (
                                        <tr key={i} className="group">
                                            <td className="py-6">
                                                <p className="font-serif text-lg text-brand-charcoal">{item.name}</p>
                                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">{item.category}</p>
                                                {item.costBreakdown && (
                                                    <div className="mt-4 flex gap-2">
                                                        <span className="inline-flex items-center gap-1 bg-brand-sand/30 text-brand-terracotta px-2 py-1 rounded-sm text-[8px] font-bold uppercase tracking-tighter">
                                                            <CheckCircle className="w-2 h-2" /> Alta Costura
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 bg-brand-sand/30 text-brand-terracotta px-2 py-1 rounded-sm text-[8px] font-bold uppercase tracking-tighter">
                                                            Diseño Personalizado
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-6 text-right font-serif text-xl font-medium">
                                                {formatCurrency(item.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Section */}
                        <div className="flex justify-end pt-12 border-t border-gray-100">
                            <div className="w-full md:w-80 space-y-6">
                                <div className="space-y-3 text-sm text-gray-500">
                                    <div className="flex justify-between">
                                        <span>Subtotal Neto</span>
                                        <span>{formatCurrency(Math.round(data.total / 1.19))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Impuestos (IVA 19%)</span>
                                        <span>{formatCurrency(Math.round(data.total - (data.total / 1.19)))}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end pt-6 border-t-2 border-brand-charcoal">
                                    <span className="font-serif text-xl font-bold uppercase tracking-tighter">Total Presupuesto</span>
                                    <span className="font-serif text-4xl font-bold">{formatCurrency(data.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Terms Section */}
                        <div className="bg-brand-sand/10 p-8 rounded-sm space-y-4">
                            <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-terracotta flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Términos y Condiciones
                            </h3>
                            <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4 leading-relaxed">
                                <li>Este presupuesto tiene una validez de 15 días a contar de hoy.</li>
                                <li>Para iniciar el trabajo de confección o ajuste, se requiere el pago del **50% del total** como abono.</li>
                                <li>Las fechas de fitting (prueba) se agendarán una vez confirmado el primer pago.</li>
                                <li>Precios expresados en pesos chilenos (CLP) con IVA incluido.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Interaction Bar (Stick to bottom on mobile) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-white/80 backdrop-blur-lg border-t border-gray-100 z-50">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    {status === 'viewing' ? (
                        <>
                            <div className="text-center md:text-left">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">¿Deseas confirmar este presupuesto?</p>
                                <p className="text-sm text-gray-600 mt-1">Haz clic para aceptar y elegir tu método de pago.</p>
                            </div>
                            <button 
                                onClick={() => setStatus('accepted')}
                                className="w-full md:w-auto px-12 py-5 bg-brand-charcoal text-white text-xs uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all shadow-xl hover:scale-105 transform duration-300 rounded-sm"
                            >
                                Aceptar Presupuesto
                            </button>
                        </>
                    ) : status === 'accepted' ? (
                        <div className="w-full space-y-6 animate-in slide-in-from-bottom duration-500">
                            <div className="text-center">
                                <h4 className="font-serif text-2xl text-brand-charcoal">Selecciona tu método de pago</h4>
                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Confirmación de Orden</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setPaymentMethod('web')}
                                    className="flex flex-col items-center gap-4 p-8 border-2 border-gray-100 hover:border-brand-terracotta rounded-sm transition-all group"
                                >
                                    <div className="bg-brand-sand/30 p-4 rounded-full group-hover:scale-110 transition-transform">
                                        <CreditCard className="w-8 h-8 text-brand-terracotta" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Pago Online Web</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Mercado Pago / Tarjetas / Transferencia</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => {
                                        setPaymentMethod('presencial');
                                        setStatus('paying');
                                    }}
                                    className="flex flex-col items-center gap-4 p-8 border-2 border-gray-100 hover:border-brand-terracotta rounded-sm transition-all group"
                                >
                                    <div className="bg-brand-sand/30 p-4 rounded-full group-hover:scale-110 transition-transform">
                                        <Store className="w-8 h-8 text-brand-terracotta" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Pagar en Atelier</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Confirmar ahora y pagar presencialmente</p>
                                    </div>
                                </button>
                            </div>
                            <button onClick={() => setStatus('viewing')} className="w-full text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta">Volver al detalle</button>
                        </div>
                    ) : (
                        <div className="w-full text-center py-4 space-y-4">
                            <div className="inline-flex items-center gap-4 px-8 py-3 bg-blue-50 text-blue-700 rounded-full text-sm font-bold animate-pulse">
                                <RefreshCw className="w-4 h-4 animate-spin" /> Redirigiendo a pasarela Mercado Pago...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}

export default function BudgetPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif text-2xl">Cargando Presupuesto...</div>}>
            <BudgetContent />
        </Suspense>
    );
}
