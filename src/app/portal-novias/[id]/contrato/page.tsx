'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckSquare, Square, FileText, Calendar, DollarSign, ShieldAlert, ArrowRight } from 'lucide-react';

export default function PortalNoviasContratoPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

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
                router.push(`/portal-novias/${params.id}/pagar`);
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

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        
        let dateObj: Date;

        // Handle ISO format (e.g. 2027-03-20T16:00:00+00:00)
        if (dateStr.includes('T')) {
            dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
                return dateObj.toLocaleDateString('es-CL', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                });
            }
        }
        
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts[0].length === 2 && parts[2].length === 4) {
                dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 12, 0, 0);
            } else if (parts[0].length === 4 && parts[2].length === 2) {
                dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
            } else {
                dateObj = new Date(dateStr + 'T12:00:00');
            }
        } else if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts[0].length === 2 && parts[2].length === 4) {
                dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 12, 0, 0);
            } else if (parts[0].length === 4 && parts[2].length === 2) {
                dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
            } else {
                dateObj = new Date(dateStr + 'T12:00:00');
            }
        } else {
            dateObj = new Date(dateStr + 'T12:00:00');
        }

        if (isNaN(dateObj.getTime())) {
            const cleanStr = dateStr.replace(/-/g, '/');
            const fallbackObj = new Date(cleanStr);
            if (!isNaN(fallbackObj.getTime())) {
                return fallbackObj.toLocaleDateString('es-CL', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                });
            }
            return dateStr;
        }

        return dateObj.toLocaleDateString('es-CL', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const serviceTypeLabel: Record<string, string> = {
        modificacion_tienda: 'Modificación de vestido adquirido en tienda',
        vestido_propio: 'Ajuste de vestido propio de la clienta',
        bespoke: 'Confección a medida (Bespoke)',
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#C17F5F]" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="font-serif text-3xl text-white mb-2">Proyecto no encontrado</h1>
                <p className="text-gray-400">El enlace al que intentas acceder no es válido o ha expirado.</p>
            </div>
        );
    }

    const isVestidoPropio = project.service_type === 'vestido_propio';

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans py-12 px-4 md:px-6 relative overflow-hidden" style={{ backgroundImage: "radial-gradient(circle at center, #1A1A1A 0%, #0A0A0A 100%)" }}>
            
            <div className="w-full max-w-3xl mx-auto relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl md:text-4xl font-black text-white tracking-[0.3em] mb-2">ELENA</h1>
                    <p className="text-[9px] uppercase tracking-[0.5em] text-white/70 font-bold ml-1">LA COSTURERA</p>
                </div>

                <div className="text-center mb-8">
                    <h2 className="font-serif text-2xl text-white mb-2 italic">Propuesta y Presupuesto</h2>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                        Por favor revisa detenidamente el presupuesto, cronograma y condiciones del servicio a continuación. Debe aceptar los términos para proceder a la reserva de su cupo.
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded text-xs text-center">
                        {errorMsg}
                    </div>
                )}

                {/* Proposal Document Card */}
                <div className="bg-[#111111] rounded border border-white/10 shadow-2xl p-6 md:p-10 mb-8 space-y-8 max-w-3xl mx-auto">
                    
                    {/* Header Details */}
                    <div className="text-center border-b border-white/10 pb-6">
                        <h2 className="font-serif text-xl text-[#C17F5F] tracking-wider uppercase">PROPUESTA DE SERVICIO</h2>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Elena Atelier — Vitacura, Chile</p>
                    </div>

                    {/* Section 1: Parties */}
                    <div>
                        <h3 className="text-xs font-bold text-[#C17F5F] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> 1. Partes Contratantes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white/5 border border-white/5 rounded p-4">
                            <div>
                                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">Prestador del Servicio</p>
                                <p className="font-bold text-white">ATELIER HORTENSIA SPA</p>
                                <p className="text-gray-400">RUT: 78.158.853-9</p>
                                <p className="text-gray-400">Av. Tabancura 1091, Of. 319</p>
                                <p className="text-gray-400">Vitacura, Santiago de Chile</p>
                                <p className="text-gray-400">Contacto@elenalacosturera.cl</p>
                            </div>
                            <div className="border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
                                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">Clienta</p>
                                <p className="font-bold text-white">{project.customers?.full_name}</p>
                                <p className="text-gray-400">RUT: {project.customers?.rut || '—'}</p>
                                <p className="text-gray-400">Tel: {project.customers?.phone || '—'}</p>
                                <p className="text-gray-400">Email: {project.customers?.email || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Service Description */}
                    <div>
                        <h3 className="text-xs font-bold text-[#C17F5F] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> 2. Descripción del Servicio
                        </h3>
                        <div className="text-xs space-y-3 bg-white/5 border border-white/5 rounded p-4">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-gray-400">Servicio:</span>
                                <span className="font-bold text-white">{serviceTypeLabel[project.service_type] || project.service_type}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-gray-400">Fecha del Evento:</span>
                                <span className="font-bold text-[#C17F5F]">{formatDate(project.event_date)}</span>
                            </div>
                            {project.event_venue && (
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-400">Lugar del Evento:</span>
                                    <span className="font-bold text-white">{project.event_venue}</span>
                                </div>
                            )}
                            {project.description && (
                                <div className="pt-2">
                                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">Detalles del Diseño:</p>
                                    <p className="italic text-gray-300 font-light whitespace-pre-wrap">{project.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Economics */}
                    <div>
                        <h3 className="text-xs font-bold text-[#C17F5F] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> 3. Condiciones Económicas
                        </h3>
                        <div className="overflow-x-auto border border-white/10 rounded">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10 text-gray-400 font-bold">
                                        <th className="p-3">Concepto</th>
                                        <th className="p-3 text-center">Porcentaje</th>
                                        <th className="p-3 text-right">Monto</th>
                                        <th className="p-3 text-right">Plazo de Pago</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr>
                                        <td className="p-3 font-semibold text-white">Abono Inicial (Reserva)</td>
                                        <td className="p-3 text-center">50%</td>
                                        <td className="p-3 text-right font-bold text-[#C17F5F]">{formatCurrency(project.payment_1_amount)}</td>
                                        <td className="p-3 text-right text-gray-400">Al firmar propuesta</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-gray-300">Segundo Pago</td>
                                        <td className="p-3 text-center">25%</td>
                                        <td className="p-3 text-right text-white">{formatCurrency(project.payment_2_amount)}</td>
                                        <td className="p-3 text-right text-gray-400">En prueba intermedia</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-gray-300">Pago Final</td>
                                        <td className="p-3 text-center">25%</td>
                                        <td className="p-3 text-right text-white">{formatCurrency(project.payment_3_amount)}</td>
                                        <td className="p-3 text-right text-gray-400">Contra entrega del vestido</td>
                                    </tr>
                                    <tr className="bg-white/5 font-bold border-t border-white/10 text-white">
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
                                    <div key={m.id || i} className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-3 rounded">
                                        <div className="flex items-center gap-3">
                                            <span className="w-5 h-5 rounded-full bg-[#C17F5F] text-white text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                                            <span className="font-semibold text-white">{m.title}</span>
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
                        <div className="text-[11px] text-gray-400 space-y-4 pr-2 bg-white/5 border border-white/5 rounded p-4">
                            <div>
                                <h4 className="font-bold text-white mb-1">1. Tiempo de Fabricación</h4>
                                <p>Se tiene en conocimiento que cualquier vestido diseñado y fabricado a la medida conlleva un proceso prolongado. ATELIER HORTENSIA SPA se hace responsable mediante el reemplazo de la prenda por otra similar dentro del stock existente en caso fortuito imputable al taller.</p>
                            </div>

                            {project.service_type === 'bespoke' && (
                                <div>
                                    <h4 className="font-bold text-white mb-1">2. Diseño</h4>
                                    <p>ATELIER HORTENSIA SPA se compromete a asesorar en todo el proceso de la búsqueda del diseño óptimo para la novia. La novia puede escoger el diseño, color, materiales y tela de fabricación del vestido. Si los materiales en la fábrica no se encuentran en stock, se buscarán los más similares a lo que el cliente quiere (Encajes, bordados, pedrería, flores, macramé, colores, etc.) previa aprobación.</p>
                                    <p className="mt-1"><strong>Posterior al proceso de diseño y solicitud de fabricación, no se pueden hacer cambios estructurales en el diseño del vestido.</strong></p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-bold text-white mb-1">3. Solicitud y Pago</h4>
                                <p>Al momento de la firma del contrato y confirmación del servicio, se debe cancelar el <strong>50%</strong> del valor total (Reserva). El <strong>25%</strong> restante se cancelará en la prueba intermedia y el último <strong>25%</strong> contra entrega. El vestido debe estar pagado en su totalidad (100%) al momento de retirarlo.</p>
                                <p className="mt-1"><strong>Formas de Pago:</strong> Efectivo, Tarjetas de Crédito/Débito y Transferencias Bancarias.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-white mb-1">4. Ajustes y Protocolo de Pruebas</h4>
                                <p>Se realizarán pruebas calendarizadas previas a la entrega final para lograr el calce perfecto del vestido, aproximadamente un mes antes del día del matrimonio. Para ello debes asistir a la hora y fecha coordinada. <strong>Importante:</strong> Debes asistir sin maquillaje y con los accesorios, ropa interior y zapatos definitivos que usarás ese día para resguardar la pulcritud de los tejidos.</p>
                                {(project.service_type === 'modificacion_tienda' || project.service_type === 'vestido_propio') && (
                                    <p className="mt-1 text-gray-400">Al comenzar a realizar las modificaciones y cortes correspondientes, el vestido no podrá ser cambiado ni devuelto.</p>
                                )}
                            </div>

                            <div>
                                <h4 className="font-bold text-white mb-1">5. Cancelaciones, Suspensiones y Devoluciones</h4>
                                <p>ATELIER HORTENSIA SPA <strong>NO HACE DEVOLUCIÓN DE DINERO</strong> bajo ningún concepto. No se hace responsable en caso de suspensión o cancelación del matrimonio o evento, arrepentimiento de compra o embarazo.</p>
                                <p className="mt-1">Si se suspende, cancela o cambia la fecha del evento, nos comprometemos a mantener el vestido resguardado en el atelier por un período <strong>máximo de 6 meses</strong>. Si cumplido este plazo el vestido no ha sido pagado en su 100% y/o no es retirado en dicha fecha, pasará a formar parte del stock de la tienda, perdiendo la clienta el derecho a reclamo o reembolso.</p>
                            </div>

                            {isVestidoPropio && (
                                <div className="border border-[#C17F5F]/30 bg-[#C17F5F]/5 p-4 rounded text-[11px]">
                                    <h4 className="font-bold text-[#C17F5F] mb-3 uppercase tracking-wider text-[10px]">⚠ Estado del Vestido, Aceptación de Riesgos y Exención de Responsabilidad por Upcycling</h4>
                                    <p className="mb-2"><strong>6.1. Declaración del Estado del Producto:</strong> El Cliente declara y reconoce de forma expresa que el vestido de novia entregado para la prestación del servicio de Upcycling es una prenda usada y presenta, al momento de su recepción, desgastes naturales por el uso, detalles estructurales y/o manchas preexistentes (de origen orgánico, químico o sintético).</p>
                                    
                                    <p className="mb-2"><strong>6.2. Exención de Responsabilidad:</strong> La Empresa deja constancia de que los procesos de transformación, confección y limpieza necesarios para el Upcycling pueden reaccionar de manera imprevista ante dichas condiciones preexistentes. Por lo tanto, la Empresa queda totalmente exenta de cualquier responsabilidad civil, comercial o de cualquier otra índole por:</p>
                                    <ul className="list-disc pl-5 mb-2 space-y-1 text-gray-300">
                                        <li>El empeoramiento, fijación o alteración de las manchas ya existentes durante los procesos técnicos de costura o tratamiento.</li>
                                        <li>El comportamiento o resistencia de las telas, encajes o pedrería que ya presentaran desgaste o fatiga material previa.</li>
                                        <li>Los resultados estéticos finales que se deriven directamente de las condiciones iniciales en que fue entregada la prenda.</li>
                                    </ul>

                                    <p><strong>6.3. Conformidad del Cliente:</strong> Al aceptar esta propuesta, el Cliente acepta recibir el servicio bajo estas condiciones, asumiendo el riesgo inherente a la transformación de una prenda con detalles previos, y renuncia expresamente a ejercer cualquier tipo de acción legal, reclamación o solicitud de indemnización en contra de la Empresa por los conceptos antes mencionados.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    {project.contract_notes && (
                        <div className="bg-amber-950/20 border border-amber-900/30 rounded p-4 text-xs text-amber-200">
                            <p className="font-bold mb-1">Acuerdos Adicionales:</p>
                            <p className="italic whitespace-pre-wrap font-light">{project.contract_notes}</p>
                        </div>
                    )}

                </div>

                {/* Acceptance and Signature Area */}
                <div className="max-w-xl mx-auto text-center space-y-6">
                    
                    {project.contract_accepted ? (
                        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 rounded text-xs">
                            ✓ Propuesta y contrato aceptados formalmente el {formatDate(project.contract_accepted_at)}.
                        </div>
                    ) : (
                        <button 
                            type="button"
                            onClick={() => setAccepted(!accepted)}
                            className="flex items-center justify-center gap-3 mx-auto text-xs text-gray-300 hover:text-white cursor-pointer select-none"
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
                        <button
                            type="button"
                            onClick={handleAccept}
                            disabled={submitting || (!accepted && !project.contract_accepted)}
                            className="w-full bg-[#C17F5F] text-[#120F0D] hover:bg-[#a96e51] py-4 rounded text-xs font-bold uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Procesando Firma...</>
                            ) : project.contract_accepted ? (
                                <>
                                    Proceder al Pago
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Aceptar Propuesta y Firmar Contrato
                                    <ArrowRight className="w-4 h-4" />
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
    );
}
