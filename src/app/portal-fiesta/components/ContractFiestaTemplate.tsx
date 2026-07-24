'use client';

import React from 'react';

interface ContractData {
    customerName: string;
    customerRut: string;
    customerPhone: string;
    customerEmail: string;
    projectType: string;
    serviceType: string;
    description: string;
    eventDate: string;
    eventVenue: string;
    totalAmount: number;
    payment1: number;
    payment2: number;
    payment3: number;
    milestones: { title: string; scheduledDate: string }[];
    contractNotes: string;
    materialsNotes?: string;
    paymentPlan?: {
        cuotas: { name: string; amount: number; status: string; date?: string; moment?: string; monto?: number }[];
    } | null;
    contractAcceptedAt?: string | null;
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return null;
    const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = cleanStr.split(/[-/]/);
    if (parts.length === 3) {
        let year, month, day;
        if (parts[0].length === 4) {
            year = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
            day = parseInt(parts[2]);
        } else {
            day = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
            year = parseInt(parts[2]);
        }
        return new Date(year, month, day, 12, 0, 0);
    }
    return new Date(dateStr);
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const dateObj = parseLocalDate(dateStr);
    if (!dateObj || isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('es-CL', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
};

const formatSimpleDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const dateObj = parseLocalDate(dateStr);
    if (!dateObj || isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('es-CL', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
};

const projectTypeLabel: Record<string, string> = {
    fiesta: 'Vestido de Fiesta / Gala',
    madrina: 'Vestido de Madrina',
    graduacion: 'Vestido de Graduación',
};

const serviceTypeLabel: Record<string, string> = {
    modificacion_tienda: 'Modificación de vestido adquirido en tienda',
    vestido_propio: 'Ajuste de vestido propio de la clienta',
    bespoke: 'Confección a medida (Bespoke)',
};

export default function ContractFiestaTemplate({ data }: { data: ContractData }) {
    const isVestidoPropio = data.serviceType === 'vestido_propio';

    return (
        <div id="contract-content" className="bg-white text-gray-800 font-sans max-w-3xl mx-auto" style={{ fontSize: '13px', lineHeight: '1.6' }}>
            {/* Header */}
            <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
                <h1 className="font-serif text-3xl tracking-widest mb-1">ELENA ATELIER</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">La Costurera · Vitacura, Chile</p>
                <h2 className="font-serif text-xl mt-4">TÉRMINOS Y CONDICIONES (FIESTA & GALA)</h2>
                <p className="text-sm text-gray-500 mt-1">{projectTypeLabel[data.projectType] || data.projectType}</p>
            </div>

            {/* Section 1: Parties */}
            <section className="mb-8">
                <h3 className="font-bold text-sm uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">1. PARTES CONTRATANTES</h3>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Prestador del Servicio</p>
                        <p className="font-bold">ATELIER HORTENSIA SPA</p>
                        <p>RUT: 78.158.853-9</p>
                        <p>Av. Tabancura 1091, Of. 319</p>
                        <p>Vitacura, Santiago de Chile</p>
                        <p>Contacto@elenalacosturera.cl</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Clienta</p>
                        <p className="font-bold">{data.customerName || '________________________'}</p>
                        <p>RUT: {data.customerRut || '________________________'}</p>
                        <p>Tel: {data.customerPhone || '________________________'}</p>
                        <p>Email: {data.customerEmail || '________________________'}</p>
                    </div>
                </div>
            </section>

            {/* Section 2: Service Description */}
            <section className="mb-8">
                <h3 className="font-bold text-sm uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">2. DESCRIPCIÓN DEL SERVICIO</h3>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Tipo de Servicio:</span>
                        <span className="font-bold">{serviceTypeLabel[data.serviceType] || data.serviceType}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Fecha del Evento:</span>
                        <span className="font-bold">{formatDate(data.eventDate)}</span>
                    </div>
                    {data.eventVenue && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Lugar del Evento:</span>
                            <span className="font-bold">{data.eventVenue}</span>
                        </div>
                    )}
                    {data.description && (
                        <div className="pt-2 border-t border-gray-200">
                            <p className="text-gray-500 text-xs mb-1">Descripción del Trabajo:</p>
                            <p className="italic">{data.description}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Section 3: Payments */}
            <section className="mb-8">
                <h3 className="font-bold text-sm uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">3. CONDICIONES ECONÓMICAS</h3>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b-2 border-gray-300">
                            <th className="text-left py-2 font-bold">Concepto</th>
                            <th className="text-center py-2 font-bold">Porcentaje</th>
                            <th className="text-right py-2 font-bold">Monto</th>
                            <th className="text-right py-2 font-bold">Momento de Pago</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.paymentPlan && data.paymentPlan.cuotas && data.paymentPlan.cuotas.length > 0 ? (
                            data.paymentPlan.cuotas.map((cuota, index) => (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="py-2">{cuota.name}</td>
                                    <td className="py-2 text-center">
                                        {(((cuota.amount || cuota.monto || 0) / data.totalAmount) * 100).toFixed(1)}%
                                    </td>
                                    <td className="py-2 text-right font-bold">{formatCurrency(cuota.amount || cuota.monto || 0)}</td>
                                    <td className="py-2 text-right text-gray-500">
                                        {cuota.date ? formatSimpleDate(cuota.date) : (cuota.moment || `Cuota ${index + 1}`)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <>
                                <tr className="border-b border-gray-200">
                                    <td className="py-2">Abono Inicial (Reserva)</td>
                                    <td className="py-2 text-center">50%</td>
                                    <td className="py-2 text-right font-bold">{formatCurrency(data.payment1)}</td>
                                    <td className="py-2 text-right text-gray-500">Al aceptar los términos</td>
                                    <td></td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-2">Pago Final</td>
                                    <td className="py-2 text-center">50%</td>
                                    <td className="py-2 text-right font-bold">{formatCurrency(data.payment3)}</td>
                                    <td className="py-2 text-right text-gray-500">Contra entrega</td>
                                    <td></td>
                                </tr>
                            </>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-gray-800">
                            <td className="py-3 font-bold text-base" colSpan={2}>TOTAL</td>
                            <td className="py-3 text-right font-bold text-base">{formatCurrency(data.totalAmount)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </section>

            {/* Section 4: Timeline */}
            {data.milestones.length > 0 && (
                <section className="mb-8">
                    <h3 className="font-bold text-sm uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">4. CRONOGRAMA DE PRUEBAS</h3>
                    <div className="space-y-2">
                        {data.milestones.map((m, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 border border-gray-200 px-4 py-3 rounded-sm">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                    <span className="font-medium">{m.title}</span>
                                </div>
                                <span className="text-gray-500 text-sm">{formatDate(m.scheduledDate)}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Section 5: Terms */}
            <section className="mb-8">
                <h3 className="font-bold text-sm uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">
                    {data.milestones.length > 0 ? '5' : '4'}. TÉRMINOS Y CONDICIONES
                </h3>
                
                <div className="space-y-4 text-[12px]">
                    <div>
                        <h4 className="font-bold text-gray-700">1. Proceso de Ajuste y Confección</h4>
                        <p>Los tiempos de avance y entrega final dependerán estrictamente del cumplimiento del cronograma de pruebas y la puntual asistencia a las citas.</p>
                    </div>

                    {data.serviceType === 'bespoke' && (
                        <div>
                            <h4 className="font-bold text-gray-700">2. Diseño y Telas</h4>
                            <p>El diseño y los materiales son aprobados por la clienta al inicio del servicio. Cambios de diseño posteriores a la compra están sujetos a factibilidad técnica y costos adicionales.</p>
                        </div>
                    )}

                    <div>
                        <h4 className="font-bold text-gray-700">3. Pagos</h4>
                        <p>Para dar inicio al trabajo, los abonos acordados deben estar al día. La prenda será entregada única y exclusivamente una vez cancelado el 100% de la orden.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-700">4. Pruebas y Modificaciones</h4>
                        <p>La clienta debe asistir a las pruebas con los zapatos y ropa interior que planea utilizar el día de su evento para resguardar la pulcritud y el correcto calce del vestido.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-700">5. Cancelaciones y Retiros</h4>
                        <p>La empresa no realiza devoluciones de dinero. Si se cancela el evento, la empresa mantendrá la prenda resguardada por un máximo de 6 meses desde la fecha del evento original.</p>
                    </div>

                    {data.projectType === 'graduacion' && (
                        <div className="border border-[#C17F5F]/30 bg-[#C17F5F]/5 p-3 rounded-sm mt-3">
                            <h4 className="font-bold text-[#C17F5F] mb-1">6. Representación Adulto Responsable y Aceptación de Condiciones</h4>
                            <p>En caso de que la graduada sea menor de edad, el padre, madre o tutor legal mayor de edad asume de forma solidaria la total responsabilidad por la aceptación de este contrato, así como del cumplimiento del plan de pagos. Se deja expresa constancia de que <strong>al realizar el primer abono inicial de reserva (pago inicial), se dan por aceptadas formal, íntegra y plenamente todas las condiciones</strong> estipuladas en este documento.</p>
                        </div>
                    )}
                </div>

                {data.materialsNotes && (
                    <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-sm">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Materiales Comprometidos / Notas de Diseño</p>
                        <p className="text-gray-700 text-[12px] whitespace-pre-wrap font-light">
                            {data.materialsNotes.replace(/!\[Referencia(?: \d+)?\]\((data:image\/[^;]+;base64,[^\)]+)\)/g, '').trim()}
                        </p>
                        {Array.from(data.materialsNotes.matchAll(/!\[Referencia(?: \d+)?\]\((data:image\/[^;]+;base64,[^\)]+)\)/g)).length > 0 && (
                            <div className="flex flex-wrap gap-4 mt-4">
                                {Array.from(data.materialsNotes.matchAll(/!\[Referencia(?: \d+)?\]\((data:image\/[^;]+;base64,[^\)]+)\)/g)).map((match: any, idx) => (
                                    <img key={idx} src={match[1]} className="max-w-[250px] max-h-[300px] object-contain border border-gray-300 rounded-sm shadow-sm" alt="Foto de Referencia" />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Signatures */}
            <section className="mt-12 pt-8 border-t-2 border-gray-800">
                <div className="grid grid-cols-2 gap-16">
                    <div className="text-center">
                        <div className="border-b border-gray-400 mb-2 h-16 flex items-end justify-center">
                            <span className="font-serif italic text-gray-500 text-sm pb-1">Elena Rojas B.</span>
                        </div>
                        <p className="font-bold text-sm">Elena Rojas Bustamante</p>
                        <p className="text-xs text-gray-500">Elena Atelier</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-gray-400 mb-2 h-16"></div>
                        <p className="font-bold text-sm">{data.customerName?.toUpperCase() || 'CLIENTA'}</p>
                        <p className="text-xs text-gray-500">Clienta</p>
                    </div>
                </div>
                {data.contractAcceptedAt ? (
                    <p className="text-center text-xs text-[#C17F5F] font-semibold mt-8 bg-[#C17F5F]/5 py-2 rounded-sm border border-[#C17F5F]/10">
                        Términos y condiciones aceptados digitalmente el {formatDate(data.contractAcceptedAt)}
                    </p>
                ) : (
                    <p className="text-center text-xs text-gray-400 mt-8">
                        Fecha de firma: _________________ de _________________ de _________
                    </p>
                )}
            </section>
        </div>
    );
}
