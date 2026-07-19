'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckSquare, Square, FileText, Calendar, DollarSign, ShieldAlert, ArrowRight, Printer, X } from 'lucide-react';
import ContractTemplate from '@/app/admin/novias/ContractTemplate';

export default function PortalNoviasContratoPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showContractPrint, setShowContractPrint] = useState(false);

    useEffect(() => {
        if (params?.id) {
            loadProject(params.id as string);
        }
    }, [params]);

    async function loadProject(id: string) {
        try {
            const { getBridalProjectById } = await import('@/app/admin/novias/actions');
            const data = await getBridalProjectById(id);
            if (data) {
                setProject(data);
                if (data.contract_accepted) {
                    setAccepted(true);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleAccept() {
        if (!project) return;
        
        // If contract is already accepted, just proceed to payment
        if (project.contract_accepted) {
            router.push(`/portal-novias/${params.id}/pagar`);
            return;
        }

        setSubmitting(true);
        setErrorMsg('');
        try {
            const { acceptContract } = await import('@/app/admin/novias/actions');
            const res = await acceptContract(params.id as string);
            if (res.success) {
                router.push(`/portal-novias/${params.id}/bienvenida`);
            } else {
                setErrorMsg(res.error || 'Ocurrió un error al aceptar el contrato.');
            }
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setSubmitting(false);
        }
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);

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

    function handlePrintContract() {
        setShowContractPrint(true);
        setTimeout(() => {
            window.print();
        }, 500);
    }

    const contractData = project ? {
        customerName: project.customers?.full_name || '',
        customerRut: project.customers?.rut || '',
        customerPhone: project.customers?.phone || '',
        customerEmail: project.customers?.email || '',
        projectType: project.project_type,
        serviceType: project.service_type,
        description: project.description || '',
        eventDate: project.event_date || '',
        eventVenue: project.event_venue || '',
        totalAmount: project.total_amount,
        payment1: project.payment_1_amount,
        payment2: project.payment_2_amount,
        payment3: project.payment_3_amount,
        milestones: (project.milestones || []).map((m: any) => ({ title: m.title, scheduledDate: m.scheduled_date })),
        contractNotes: project.contract_notes || '',
        materialsNotes: project.materials_notes || '',
        paymentPlan: project.work_order?.payment_plan || null,
    } : null;

    const serviceTypeLabel: Record<string, string> = {
        modificacion_tienda: 'Modificación de vestido adquirido en tienda',
        vestido_propio: 'Ajuste de vestido propio de la clienta',
        bespoke: 'Confección a medida (Bespoke)',
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#C17F5F]" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="font-serif text-3xl text-[#1A1A1A] mb-2">Proyecto no encontrado</h1>
                <p className="text-gray-600">El enlace al que intentas acceder no es válido o ha expirado.</p>
            </div>
        );
    }

    const isVestidoPropio = project.service_type === 'vestido_propio';

    return (
        <>
            {/* Print-only contract view */}
            {showContractPrint && contractData && (
                <div className="fixed inset-0 bg-white z-50 overflow-auto print:static print:z-auto p-8 text-black">
                    <button onClick={() => setShowContractPrint(false)} className="print:hidden fixed top-4 right-4 bg-zinc-200 text-[#1A1A1A] p-2 rounded-full z-50">
                        <X className="w-5 h-5" />
                    </button>
                    <div>
                        <ContractTemplate data={contractData} />
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans py-12 px-4 md:px-6 relative overflow-hidden print:hidden" style={{ backgroundImage: "url('/novia/Novia Elegante 1.png'), radial-gradient(circle at center, #FFFFFF 0%, #F5F5F0 100%)", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                
                <div className="w-full max-w-3xl mx-auto relative z-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="flex flex-col items-stretch justify-center w-max mx-auto">
                            <div className="flex justify-between w-full font-serif text-2xl md:text-3xl font-black uppercase text-[#1A1A1A] leading-none drop-shadow-sm">
                                <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
                            </div>
                            <div
                                className="font-sans text-[0.65rem] md:text-[0.75rem] font-bold uppercase text-[#1A1A1A]/70 mt-1 text-center"
                                style={{ letterSpacing: '0.35em', marginRight: '-0.35em' }}
                            >
                                La Costurera
                            </div>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="font-serif text-2xl text-[#1A1A1A] mb-2 italic">Propuesta y Presupuesto</h2>
                        <p className="text-xs text-gray-600 max-w-md mx-auto mb-6">
                            Por favor revisa detenidamente el presupuesto, cronograma y condiciones del servicio a continuación. Debes aceptar los términos para proceder a la reserva de tu cupo.
                        </p>
                        <button
                            type="button"
                            onClick={handlePrintContract}
                            className="inline-flex items-center gap-2 text-[10px] text-[#C17F5F] hover:text-[#a96e51] font-bold uppercase tracking-[0.15em] border border-[#C17F5F]/30 hover:border-[#C17F5F] px-5 py-2.5 rounded transition-all"
                        >
                            <Printer className="w-3.5 h-3.5" /> Descargar Contrato en PDF
                        </button>
                    </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded text-xs text-center">
                        {errorMsg}
                    </div>
                )}

                {/* Proposal Document Container */}
                <div className="mb-8 space-y-8 max-w-3xl mx-auto w-full">
                    
                    {/* Header Details */}
                    <div className="text-center border-b border-[#C17F5F]/20 pb-6">
                        <h2 className="font-serif text-xl text-[#C17F5F] tracking-wider uppercase">PROPUESTA DE SERVICIO</h2>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Elena Atelier — Vitacura, Chile</p>
                    </div>

                    {/* Section 1: Parties */}
                    <div>
                        <h3 className="text-xs font-bold text-[#C17F5F] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> 1. Partes Contratantes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#FCFAF7]/50 backdrop-blur-sm border border-[#C17F5F]/15 rounded p-4">
                            <div>
                                <p className="text-[9px] uppercase tracking-wider text-gray-600 font-bold mb-1">Prestador del Servicio</p>
                                <p className="font-bold text-[#1A1A1A]">ATELIER HORTENSIA SPA</p>
                                <p className="text-gray-600">RUT: 78.158.853-9</p>
                                <p className="text-gray-600">Av. Tabancura 1091, Of. 319</p>
                                <p className="text-gray-600">Vitacura, Santiago de Chile</p>
                                <p className="text-gray-600">Contacto@elenalacosturera.cl</p>
                            </div>
                            <div className="border-t md:border-t-0 md:border-l border-[#C17F5F]/20 pt-3 md:pt-0 md:pl-4">
                                <p className="text-[9px] uppercase tracking-wider text-gray-600 font-bold mb-1">Clienta</p>
                                <p className="font-bold text-[#1A1A1A]">{project.customers?.full_name}</p>
                                <p className="text-gray-600">RUT: {project.customers?.rut || '—'}</p>
                                <p className="text-gray-600">Tel: {project.customers?.phone || '—'}</p>
                                <p className="text-gray-600">Email: {project.customers?.email || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Service Description */}
                    <div>
                        <h3 className="text-xs font-bold text-[#C17F5F] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> 2. Descripción del Servicio
                        </h3>
                        <div className="text-xs space-y-3 bg-[#FCFAF7]/50 backdrop-blur-sm border border-[#C17F5F]/15 rounded p-4">
                            <div className="flex justify-between border-b border-[#C17F5F]/10 pb-2">
                                <span className="text-gray-600">Servicio:</span>
                                <span className="font-bold text-[#1A1A1A]">{serviceTypeLabel[project.service_type] || project.service_type}</span>
                            </div>
                            <div className="flex justify-between border-b border-[#C17F5F]/10 pb-2">
                                <span className="text-gray-600">Fecha del Evento:</span>
                                <span className="font-bold text-[#C17F5F]">{formatDate(project.event_date)}</span>
                            </div>
                            {project.event_venue && (
                                <div className="flex justify-between border-b border-[#C17F5F]/10 pb-2">
                                    <span className="text-gray-600">Lugar del Evento:</span>
                                    <span className="font-bold text-[#1A1A1A]">{project.event_venue}</span>
                                </div>
                            )}
                            {project.description && (
                                <div className="pt-2">
                                    <p className="text-[9px] uppercase tracking-wider text-gray-600 font-bold mb-1">Detalles del Diseño:</p>
                                    <p className="italic text-[#4A4A4A] font-light whitespace-pre-wrap">{project.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Economics */}
                    <div>
                        <h3 className="text-xs font-bold text-[#C17F5F] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> 3. Condiciones Económicas
                        </h3>
                        <div className="overflow-x-auto border border-[#C17F5F]/20 rounded bg-[#FCFAF7]/50 backdrop-blur-sm">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="bg-[#FCFAF7]/60 border-b border-[#C17F5F]/20 text-gray-600 font-bold">
                                        <th className="p-3">Concepto</th>
                                        <th className="p-3 text-center">Porcentaje</th>
                                        <th className="p-3 text-right">Monto</th>
                                        <th className="p-3 text-right">Plazo de Pago</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {project.payment_plan?.cuotas && project.payment_plan.cuotas.length > 0 ? (
                                        project.payment_plan.cuotas.map((cuota: any, index: number) => (
                                            <tr key={index}>
                                                <td className="p-3 font-semibold text-[#1A1A1A]">{cuota.name}</td>
                                                <td className="p-3 text-center">{(((cuota.amount || cuota.monto || 0) / project.total_amount) * 100).toFixed(1)}%</td>
                                                <td className="p-3 text-right font-bold text-[#C17F5F]">{formatCurrency(cuota.amount || cuota.monto || 0)}</td>
                                                <td className="p-3 text-right text-gray-600">
                                                    {cuota.date ? formatSimpleDate(cuota.date) : (cuota.moment || `Cuota ${index + 1}`)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : project.work_order?.payment_plan?.cuotas && project.work_order.payment_plan.cuotas.length > 0 ? (
                                        project.work_order.payment_plan.cuotas.map((cuota: any, index: number) => (
                                            <tr key={index}>
                                                <td className="p-3 font-semibold text-[#1A1A1A]">{cuota.name}</td>
                                                <td className="p-3 text-center">{(((cuota.amount || cuota.monto || 0) / project.total_amount) * 100).toFixed(1)}%</td>
                                                <td className="p-3 text-right font-bold text-[#C17F5F]">{formatCurrency(cuota.amount || cuota.monto || 0)}</td>
                                                <td className="p-3 text-right text-gray-600">
                                                    {cuota.date ? formatSimpleDate(cuota.date) : (cuota.moment || `Cuota ${index + 1}`)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <>
                                            <tr>
                                                <td className="p-3 font-semibold text-[#1A1A1A]">Abono Inicial (Reserva)</td>
                                                <td className="p-3 text-center">50%</td>
                                                <td className="p-3 text-right font-bold text-[#C17F5F]">{formatCurrency(project.payment_1_amount)}</td>
                                                <td className="p-3 text-right text-gray-600">Al firmar propuesta</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 text-[#4A4A4A]">Segundo Pago</td>
                                                <td className="p-3 text-center">25%</td>
                                                <td className="p-3 text-right text-[#1A1A1A]">{formatCurrency(project.payment_2_amount)}</td>
                                                <td className="p-3 text-right text-gray-600">En prueba intermedia</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 text-[#4A4A4A]">Pago Final</td>
                                                <td className="p-3 text-center">25%</td>
                                                <td className="p-3 text-right text-[#1A1A1A]">{formatCurrency(project.payment_3_amount)}</td>
                                                <td className="p-3 text-right text-gray-600">Contra entrega del vestido</td>
                                            </tr>
                                        </>
                                    )}
                                    <tr className="bg-[#FCFAF7]/60 font-bold border-t border-[#C17F5F]/20 text-[#1A1A1A]">
                                        <td className="p-3 text-sm" colSpan={2}>VALOR TOTAL</td>
                                        <td className="p-3 text-right text-sm text-[#C17F5F]">{formatCurrency(project.total_amount)}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 4: Milestones Timeline */}
                    {project.milestones && project.milestones.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-[#C17F5F] uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> 4. Cronograma Estimado de Pruebas
                            </h3>
                            <div className="space-y-2 text-xs">
                                {project.milestones.map((m: any, i: number) => (
                                    <div key={m.id || i} className="flex justify-between items-center bg-[#FCFAF7]/50 backdrop-blur-sm border border-[#C17F5F]/15 px-4 py-3 rounded">
                                        <div className="flex items-center gap-3">
                                            <span className="w-5 h-5 rounded-full bg-[#C17F5F] text-[#1A1A1A] text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                                            <span className="font-semibold text-[#1A1A1A]">{m.title}</span>
                                        </div>
                                        <span className="text-[#C17F5F] font-medium">{formatDate(m.scheduled_date)}</span>
                                    </div>
                                ))}
                                <p className="text-[10px] text-gray-500 italic mt-2">
                                    * Las fechas de las pruebas son tentativas y coordinables con el atelier con al menos 48 horas de anticipación.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Section 5: Terms and Conditions */}
                    <div>
                        <h3 className="text-xs font-bold text-[#C17F5F] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" /> {project.milestones && project.milestones.length > 0 ? '5' : '4'}. Términos y Condiciones
                        </h3>
                        <div className="text-[11px] text-gray-600 space-y-4 pr-2 bg-[#FCFAF7]/50 backdrop-blur-sm border border-[#C17F5F]/15 rounded p-4">
                            <div>
                                <h4 className="font-bold text-[#1A1A1A] mb-1">1. Tiempo de Fabricación</h4>
                                <p>Se tiene en conocimiento que el diseño, confección a medida y/o modificación de un vestido conlleva un proceso de meses y un trabajo artesanal meticuloso. Los tiempos de avance y entrega final dependerán estrictamente del cumplimiento del cronograma de pruebas establecido y de la puntual asistencia de la clienta a cada sesión.</p>
                            </div>

                            {project.service_type === 'bespoke' && (
                                <div>
                                    <h4 className="font-bold text-[#1A1A1A] mb-1">2. Diseño</h4>
                                    <p>ATELIER HORTENSIA SPA se compromete a asesorar en todo el proceso de la búsqueda del diseño óptimo para la novia. La novia puede escoger el diseño, color, materiales y tela de fabricación del vestido. Si los materiales en la fábrica no se encuentran en stock, se buscarán los más similares a lo que el cliente quiere (Encajes, bordados, pedrería, flores, macramé, colores, etc.) previa aprobación.</p>
                                    <p className="mt-1"><strong>Posterior al proceso de diseño y solicitud de fabricación, no se pueden hacer cambios estructurales en el diseño del vestido.</strong></p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-bold text-[#1A1A1A] mb-1">3. Solicitud y Pago</h4>
                                {(project.payment_plan?.cuotas || project.work_order?.payment_plan?.cuotas) ? (
                                    <>
                                        <p>Se acuerda con la clienta el pago del valor total contratado de <strong>{formatCurrency(project.total_amount)}</strong>, dividido en <strong>{(project.payment_plan?.cuotas || project.work_order?.payment_plan?.cuotas).length} {(project.payment_plan?.cuotas || project.work_order?.payment_plan?.cuotas).length === 1 ? 'pago' : 'pagos'}</strong>. El detalle del calendario de pagos es el especificado en la sección 3.</p>
                                        <p className="text-[11px] text-gray-600 italic mt-2">Para el inicio del trabajo (Toma de Medidas y Diseño), las cuotas deben estar al día. El vestido será entregado única y exclusivamente una vez que se haya cancelado el 100% del valor total acordado.</p>
                                    </>
                                ) : (
                                    <p>Al momento de la firma del contrato y confirmación del servicio, se debe cancelar el <strong>50%</strong> del valor total (Reserva). El <strong>25%</strong> restante se cancelará en la prueba intermedia y el último <strong>25%</strong> contra entrega. El vestido debe estar pagado en su totalidad (100%) al momento de retirarlo.</p>
                                )}
                                <p className="mt-1"><strong>Formas de Pago:</strong> Efectivo, Tarjetas de Crédito/Débito y Transferencias Bancarias.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-[#1A1A1A] mb-1">4. Ajustes y Protocolo de Pruebas</h4>
                                <p>Se realizarán pruebas calendarizadas previas a la entrega final para lograr el calce perfecto del vestido, aproximadamente un mes antes del día del matrimonio. Para ello debes asistir a la hora y fecha coordinada. <strong>Importante:</strong> Debes asistir sin maquillaje y con los accesorios, ropa interior y zapatos definitivos que usarás ese día para resguardar la pulcritud de los tejidos.</p>
                                {(project.service_type === 'modificacion_tienda' || project.service_type === 'vestido_propio') && (
                                    <p className="mt-1 text-gray-600">Al comenzar a realizar las modificaciones y cortes correspondientes, el vestido no podrá ser cambiado ni devuelto.</p>
                                )}
                            </div>

                            <div>
                                <h4 className="font-bold text-[#1A1A1A] mb-1">5. Cancelaciones, Suspensiones y Devoluciones</h4>
                                <p>ATELIER HORTENSIA SPA <strong>NO HACE DEVOLUCIÓN DE DINERO</strong> bajo ningún concepto. No se hace responsable en caso de suspensión o cancelación del matrimonio o evento, arrepentimiento de compra o embarazo.</p>
                                <p className="mt-1">Si se suspende, cancela o cambia la fecha del evento, nos comprometemos a mantener el vestido resguardado en el atelier por un período <strong>máximo de 6 meses</strong>. Si cumplido este plazo el vestido no ha sido pagado en su 100% y/o no es retirado en dicha fecha, pasará a formar parte del stock de la tienda, perdiendo la clienta el derecho a reclamo o reembolso.</p>
                            </div>

                            {isVestidoPropio && (
                                <div className="border border-[#C17F5F]/30 bg-[#C17F5F]/5 p-4 rounded text-[11px]">
                                    <h4 className="font-bold text-[#C17F5F] mb-3 uppercase tracking-wider text-[10px]">⚠ Estado del Vestido, Aceptación de Riesgos y Exención de Responsabilidad por Upcycling</h4>
                                    <p className="mb-2"><strong>6.1. Declaración del Estado del Producto:</strong> El Cliente declara y reconoce de forma expresa que el vestido de novia entregado para la prestación del servicio de Upcycling es una prenda usada y presenta, al momento de su recepción, desgastes naturales por el uso, detalles estructurales y/o manchas preexistentes (de origen orgánico, químico o sintético).</p>
                                    
                                    <p className="mb-2"><strong>6.2. Exención de Responsabilidad:</strong> La Empresa deja constancia de que los procesos de transformación, confección y limpieza necesarios para el Upcycling pueden reaccionar de manera imprevista ante dichas condiciones preexistentes. Por lo tanto, la Empresa queda totalmente exenta de cualquier responsabilidad civil, comercial o de cualquier otra índole por:</p>
                                    <ul className="list-disc pl-5 mb-2 space-y-1 text-[#4A4A4A]">
                                        <li>El empeoramiento, fijación o alteración de las manchas ya existentes durante los procesos técnicos de costura o tratamiento.</li>
                                        <li>El comportamiento o resistencia de las telas, encajes o pedrería que ya presentaran desgaste o fatiga material previa.</li>
                                        <li>Los resultados estéticos finales que se deriven directamente de las condiciones iniciales en que fue entregada la prenda.</li>
                                    </ul>

                                    <p><strong>6.3. Conformidad del Cliente:</strong> Al aceptar esta propuesta, el Cliente acepta recibir el servicio bajo estas condiciones, asumiendo el riesgo inherente a la transformación de una prenda con detalles previos, y renuncia expresamente a ejercer cualquier tipo de acción legal, reclamación o solicitud de indemnización en contra de la Empresa por los conceptos antes mencionados.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Materials Notes */}
                    {project.materials_notes && (
                        <div className="bg-[#F5F5F0]/80 border border-[#C17F5F]/20 rounded p-4 text-xs text-[#4A4A4A]">
                            <p className="font-bold text-[#C17F5F] mb-1.5 uppercase tracking-wider text-[10px]">Materiales Comprometidos / Detalles de Diseño:</p>
                            <p className="whitespace-pre-wrap font-light leading-relaxed">
                                {project.materials_notes.replace(/!\[Referencia(?: \d+)?\]\((data:image\/[^;]+;base64,[^\)]+)\)/g, '').trim()}
                            </p>
                            {Array.from(project.materials_notes.matchAll(/!\[Referencia(?: \d+)?\]\((data:image\/[^;]+;base64,[^\)]+)\)/g)).length > 0 && (
                                <div className="flex flex-wrap gap-4 mt-4">
                                    {Array.from(project.materials_notes.matchAll(/!\[Referencia(?: \d+)?\]\((data:image\/[^;]+;base64,[^\)]+)\)/g)).map((match: any, idx) => (
                                        <img key={idx} src={match[1]} className="max-w-[250px] max-h-[300px] object-contain border border-[#C17F5F]/30 rounded shadow-sm" alt="Foto de Referencia" />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Additional Notes */}
                    {project.contract_notes && (
                        <div className="bg-amber-50 border border-amber-200 rounded p-4 text-xs text-amber-900">
                            <p className="font-bold mb-1">Acuerdos Adicionales:</p>
                            <p className="italic whitespace-pre-wrap font-light">{project.contract_notes}</p>
                        </div>
                    )}

                </div>

                {/* Acceptance and Signature Area */}
                <div className="max-w-xl mx-auto text-center space-y-6">
                    
                    {project.contract_accepted ? (
                        <div className="p-4 bg-[#C17F5F]/5 border border-[#C17F5F]/20 text-zinc-700 rounded text-xs tracking-wide">
                            <span className="text-[#C17F5F] font-bold mr-2">✓</span>
                            Propuesta y contrato aceptados formalmente el {formatDate(project.contract_accepted_at)}.
                        </div>
                    ) : (
                        <button 
                            type="button"
                            onClick={() => setAccepted(!accepted)}
                            className="flex items-center justify-center gap-3 mx-auto text-xs text-[#4A4A4A] hover:text-[#C17F5F] cursor-pointer select-none"
                        >
                            {accepted ? (
                                <CheckSquare className="w-5 h-5 text-[#C17F5F]" />
                            ) : (
                                <Square className="w-5 h-5 text-gray-500" />
                            )}
                            <span>Declaro que he leído la propuesta, el presupuesto y acepto las condiciones del servicio.</span>
                        </button>
                    )}

                    <div className="pt-2">
                        {!project.contract_accepted && (
                            <div className="mb-8 p-4 border border-[#C17F5F]/20 bg-gradient-to-br from-[#C17F5F]/10 to-transparent rounded text-left shadow-lg">
                                <p className="text-[10px] text-[#4A4A4A] font-light leading-relaxed">
                                    <span className="font-bold text-[#C17F5F] uppercase tracking-[0.15em] block mb-1.5 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C17F5F]"></span>
                                        Confirmación y Exclusividad de Agenda
                                    </span>
                                    Al presionar el botón de aceptación y proceder con el pago, usted ratifica su plena conformidad con las condiciones de este contrato. En ese mismo acto, el sistema <strong>agendará automáticamente sus fechas de prueba</strong> y <strong>bloqueará tiempos de producción exclusivos</strong> en nuestro atelier, garantizando la dedicación absoluta y artesanal que su vestido requiere.
                                </p>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={handleAccept}
                            disabled={submitting || (!accepted && !project.contract_accepted)}
                            className={`w-full py-4 rounded text-xs font-bold uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 group ${
                                submitting || (!accepted && !project.contract_accepted)
                                    ? 'bg-gray-200 border border-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                                    : 'bg-[#C17F5F] border border-[#C17F5F] text-[#1A1A1A] hover:bg-[#a96e51] hover:border-[#a96e51] shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {submitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Procesando Firma...</>
                            ) : project.contract_accepted ? (
                                <>
                                    Proceder al Pago
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            ) : (
                                <>
                                    Aceptar Propuesta y Firmar Contrato
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                </div>

                <div className="text-center mt-12">
                    <p className="text-[#C17F5F] font-serif italic text-lg mb-1">Con cariño,</p>
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest">Elena La Costurera | Atelier</p>
                </div>
            </div>
        </div>
        </>
    );
}
