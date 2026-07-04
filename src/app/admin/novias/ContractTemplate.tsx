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
                
                <p className="text-[12px] mb-3">El presente contrato tiene como objetivo dejar en conocimiento los términos y condiciones del servicio acordado.</p>
                
                <div className="space-y-4 text-[12px]">
                    <div>
                        <h4 className="font-bold text-gray-700">1. Tiempo de Fabricación</h4>
                        <p>Se tiene en conocimiento que el diseño, confección a medida y/o modificación de un vestido conlleva un proceso de meses y un trabajo artesanal meticuloso. Los tiempos de avance y entrega final dependerán estrictamente del cumplimiento del cronograma de pruebas establecido y de la puntual asistencia de la clienta a cada sesión.</p>
                    </div>

                    {data.serviceType === 'bespoke' && (
                        <div>
                            <h4 className="font-bold text-gray-700">2. Diseño</h4>
                            <p>ATELIER HORTENSIA SPA se compromete a asesorar en todo el proceso de la búsqueda del diseño óptimo para la novia. La novia puede escoger el diseño, color, materiales y tela de fabricación del vestido. Si los materiales en la fábrica no se encuentran en stock, se buscarán los más similares a lo que el cliente quiere (Encajes, bordados, pedrería, flores, macramé, colores, etc.) previa aprobación.</p>
                            <p className="mt-1"><strong>Posterior al proceso de diseño y solicitud de fabricación, no se pueden hacer cambios estructurales en el diseño del vestido.</strong></p>
                        </div>
                    )}

                    <div>
                        <h4 className="font-bold text-gray-700">3. Solicitud y Pago</h4>
                        <p>Al momento de la firma del contrato y confirmación del servicio, se debe cancelar el <strong>50%</strong> del valor total (Reserva). El <strong>25%</strong> restante se cancelará en la prueba intermedia y el último <strong>25%</strong> contra entrega. El vestido debe estar pagado en su totalidad (100%) al momento de retirarlo.</p>
                        <p className="mt-1"><strong>Formas de Pago:</strong> Efectivo, Tarjetas de Crédito/Débito y Transferencias Bancarias.</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-700">4. Ajustes y Protocolo de Pruebas</h4>
                        <p>Se realizarán pruebas calendarizadas previas a la entrega final para lograr el calce perfecto del vestido, aproximadamente un mes antes del día del matrimonio. Para ello debes asistir a la hora y fecha coordinada. <strong>Importante:</strong> Debes asistir sin maquillaje y con los accesorios, ropa interior y zapatos definitivos que usarás ese día para resguardar la pulcritud de los tejidos.</p>
                        {(data.serviceType === 'modificacion_tienda' || data.serviceType === 'vestido_propio') && (
                            <p className="mt-1 text-gray-600">Al comenzar a realizar las modificaciones y cortes correspondientes, el vestido no podrá ser cambiado ni devuelto.</p>
                        )}
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-700">5. Cancelaciones, Suspensiones y Devoluciones</h4>
                        <p>ATELIER HORTENSIA SPA <strong>NO HACE DEVOLUCIÓN DE DINERO</strong> bajo ningún concepto. No se hace responsable en caso de suspensión o cancelación del matrimonio o evento, arrepentimiento de compra o embarazo.</p>
                        <p className="mt-1">Si se suspende, cancela o cambia la fecha del evento, nos comprometemos a mantener el vestido resguardado en el atelier por un período <strong>máximo de 6 meses</strong>. Si cumplido este plazo el vestido no ha sido pagado en su 100% y/o no es retirado en dicha fecha, pasará a formar parte del stock de la tienda, perdiendo la clienta el derecho a reclamo o reembolso.</p>
                    </div>

                    {isVestidoPropio && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm mt-4 text-[11px]">
                            <p className="font-bold text-amber-800 uppercase tracking-widest mb-2">⚠ Estado del Vestido, Aceptación de Riesgos y Exención de Responsabilidad por Upcycling</p>
                            <p className="mb-2"><strong>6.1. Declaración del Estado del Producto:</strong> El Cliente declara y reconoce de forma expresa que el vestido de novia entregado para la prestación del servicio de Upcycling es una prenda usada y presenta, al momento de su recepción, desgastes naturales por el uso, detalles estructurales y/o manchas preexistentes (de origen orgánico, químico o sintético).</p>
                            
                            <p className="mb-2"><strong>6.2. Exención de Responsabilidad:</strong> La Empresa deja constancia de que los procesos de transformación, confección y limpieza necesarios para el Upcycling pueden reaccionar de manera imprevista ante dichas condiciones preexistentes. Por lo tanto, la Empresa queda totalmente exenta de cualquier responsabilidad civil, comercial o de cualquier otra índole por:</p>
                            <ul className="list-disc pl-5 mb-2 space-y-1 text-gray-600">
                                <li>El empeoramiento, fijación o alteración de las manchas ya existentes durante los procesos técnicos de costura o tratamiento.</li>
                                <li>El comportamiento o resistencia de las telas, encajes o pedrería que ya presentaran desgaste o fatiga material previa.</li>
                                <li>Los resultados estéticos finales que se deriven directamente de las condiciones iniciales en que fue entregada la prenda.</li>
                            </ul>

                            <p><strong>6.3. Conformidad del Cliente:</strong> Al firmar este documento, el Cliente acepta recibir el servicio bajo estas condiciones, asumiendo el riesgo inherente a la transformación de una prenda con detalles previos, y renuncia expresamente a ejercer cualquier tipo de acción legal, reclamación o solicitud de indemnización en contra de la Empresa por los conceptos antes mencionados.</p>
                        </div>
                    )}
                </div>
                
                {data.contractNotes && (
                    <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-sm">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Acuerdos Adicionales</p>
                        <p className="italic text-gray-600 text-[12px] whitespace-pre-wrap">{data.contractNotes}</p>
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
