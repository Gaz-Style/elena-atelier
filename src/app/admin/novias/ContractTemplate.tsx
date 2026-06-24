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
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CL', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
};

const projectTypeLabel: Record<string, string> = {
    novia: 'Vestido de Novia',
    madrina: 'Vestido de Madrina',
    graduacion: 'Vestido de Graduación',
};

const serviceTypeLabel: Record<string, string> = {
    modificacion_tienda: 'Modificación de vestido adquirido en tienda',
    vestido_propio: 'Ajuste de vestido propio de la clienta',
    bespoke: 'Confección a medida (Bespoke)',
};

export default function ContractTemplate({ data }: { data: ContractData }) {
    const isVestidoPropio = data.serviceType === 'vestido_propio';

    return (
        <div id="contract-content" className="bg-white text-gray-800 font-sans max-w-3xl mx-auto" style={{ fontSize: '13px', lineHeight: '1.6' }}>
            {/* Header */}
            <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
                <h1 className="font-serif text-3xl tracking-widest mb-1">ELENA ATELIER</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">La Costurera · Vitacura, Chile</p>
                <h2 className="font-serif text-xl mt-4">CONTRATO DE SERVICIO</h2>
                <p className="text-sm text-gray-500 mt-1">{projectTypeLabel[data.projectType] || data.projectType}</p>
            </div>

            {/* Section 1: Parties */}
            <section className="mb-8">
                <h3 className="font-bold text-sm uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">1. PARTES CONTRATANTES</h3>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Prestador del Servicio</p>
                        <p className="font-bold">ELENA ATELIER — La Costurera</p>
                        <p>Vitacura, Santiago de Chile</p>
                        <p>elenaatalier@gmail.com</p>
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
                        <tr className="border-b border-gray-200">
                            <td className="py-2">Abono Inicial (Reserva)</td>
                            <td className="py-2 text-center">50%</td>
                            <td className="py-2 text-right font-bold">{formatCurrency(data.payment1)}</td>
                            <td className="py-2 text-right text-gray-500">Al firmar contrato</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                            <td className="py-2">Segundo Pago</td>
                            <td className="py-2 text-center">25%</td>
                            <td className="py-2 text-right font-bold">{formatCurrency(data.payment2)}</td>
                            <td className="py-2 text-right text-gray-500">En prueba intermedia</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                            <td className="py-2">Pago Final</td>
                            <td className="py-2 text-center">25%</td>
                            <td className="py-2 text-right font-bold">{formatCurrency(data.payment3)}</td>
                            <td className="py-2 text-right text-gray-500">Contra entrega</td>
                        </tr>
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
                    <p className="text-xs text-gray-400 mt-3 italic">
                        * Las fechas de prueba son estimadas y pueden ajustarse de mutuo acuerdo con al menos 48 horas de anticipación.
                    </p>
                </section>
            )}

            {/* Section 5: Terms */}
            <section className="mb-8">
                <h3 className="font-bold text-sm uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">
                    {data.milestones.length > 0 ? '5' : '4'}. TÉRMINOS Y CONDICIONES
                </h3>
                <div className="space-y-3 text-[12px]">
                    <p><strong>a)</strong> El abono inicial del 50% es condición necesaria para reservar el cupo de producción. Sin este pago, el taller no iniciará ningún trabajo.</p>
                    <p><strong>b)</strong> La clienta se compromete a asistir a las pruebas programadas en las fechas acordadas. La reprogramación debe solicitarse con al menos 48 horas de anticipación.</p>
                    <p><strong>c)</strong> La inasistencia a una prueba sin aviso previo no constituye motivo para extender los plazos de entrega.</p>
                    <p><strong>d)</strong> El vestido se entregará únicamente una vez completado el 100% del pago total.</p>
                    
                    {isVestidoPropio && (
                        <>
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm mt-4">
                                <p className="font-bold text-amber-800 uppercase text-xs tracking-widest mb-2">⚠ Cláusula Especial — Vestido Propio</p>
                                <p><strong>e)</strong> Al tratarse de un vestido proporcionado por la clienta, ELENA ATELIER no se responsabiliza por defectos preexistentes en la tela, incluyendo pero no limitado a: desgaste, decoloración, fragilidad de fibras o daños previos no visibles a simple inspección.</p>
                                <p className="mt-2"><strong>f)</strong> ELENA ATELIER garantiza exclusivamente la calidad de la mano de obra aplicada sobre la prenda. Cualquier daño derivado de la condición original de la tela no será cubierto por esta garantía.</p>
                            </div>
                        </>
                    )}

                    <p><strong>{isVestidoPropio ? 'g' : 'e'})</strong> <strong>Política de Cancelación:</strong> En caso de cancelación antes del corte de tela, se retendrá un 20% del abono por concepto de diseño y patronaje. Posterior al corte, no habrá devolución del abono.</p>
                </div>
                
                {data.contractNotes && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 p-4 rounded-sm">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Notas Adicionales</p>
                        <p className="italic text-gray-600 whitespace-pre-wrap">{data.contractNotes}</p>
                    </div>
                )}
            </section>

            {/* Signatures */}
            <section className="mt-12 pt-8 border-t-2 border-gray-800">
                <div className="grid grid-cols-2 gap-16">
                    <div className="text-center">
                        <div className="border-b border-gray-400 mb-2 h-16"></div>
                        <p className="font-bold text-sm">ELENA ATELIER</p>
                        <p className="text-xs text-gray-500">Prestador del Servicio</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-gray-400 mb-2 h-16"></div>
                        <p className="font-bold text-sm">{data.customerName?.toUpperCase() || 'CLIENTA'}</p>
                        <p className="text-xs text-gray-500">Clienta</p>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-8">
                    Fecha de firma: _________________ de _________________ de _________
                </p>
            </section>
        </div>
    );
}
