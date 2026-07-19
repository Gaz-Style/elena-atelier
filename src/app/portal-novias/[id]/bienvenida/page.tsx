'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Mail, CheckCircle2, ArrowRight, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function BridalWelcomePage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const { getBridalProjectById } = await import('@/app/admin/novias/actions');
                const data = await getBridalProjectById(params.id as string);
                if (data) {
                    setProject(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [params.id]);

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
                <h1 className="text-2xl font-serif text-[#1A1A1A] mb-2">Proyecto no encontrado</h1>
                <p className="text-zinc-600">No hemos podido encontrar la información de tu proyecto.</p>
            </div>
        );
    }

    const customerName = project.customers?.full_name?.split(' ')[0] || 'Futura Novia';

    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden" style={{ backgroundImage: "radial-gradient(circle at center, #FFFFFF 0%, #F5F5F0 100%)" }}>
            
            {/* Elegant Header */}
            <div className="absolute top-12 left-0 w-full text-center z-10 px-4">
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

            <div className="w-full max-w-lg mx-auto relative z-20 text-center mt-20">
                
                <div className="mb-10 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-[#C17F5F]/10 border border-[#C17F5F]/30 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-[#C17F5F]" strokeWidth={1.5} />
                    </div>
                </div>

                <p className="text-[#C17F5F] text-[10px] uppercase tracking-[4px] font-bold mb-6">
                    CONTRATO FIRMADO CON ÉXITO
                </p>
                
                <h2 className="font-serif text-3xl md:text-4xl italic text-[#1A1A1A]/90 leading-tight mb-8">
                    Aquí comienza una experiencia exclusiva para ti y tu vestido, {customerName}
                </h2>
                
                <p className="text-[#4A4A4A] font-light text-sm leading-relaxed mb-8 max-w-md mx-auto">
                    Nos llena de alegría acompañarte en este viaje. Tu contrato formal ha sido firmado con éxito.
                </p>

                {/* Primary Call to Action Button */}
                <div className="mb-10 max-w-sm mx-auto">
                    <Link
                        href={`/portal-novias/${params.id}/pagar`}
                        className="w-full bg-[#C17F5F] border border-[#C17F5F] text-[#1A1A1A] hover:bg-[#a96e51] hover:border-[#a96e51] py-4 rounded text-xs font-bold uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 shadow-lg hover:shadow-xl"
                    >
                        <CreditCard className="w-4 h-4 text-[#1A1A1A]" />
                        Proceder al Pago de Reserva
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Mail Confirmation Card */}
                <div className="bg-white/95 backdrop-blur-md rounded-lg border border-[#C17F5F]/20 p-5 flex items-start gap-4 text-left max-w-sm mx-auto shadow-[0_20px_40px_rgba(193,127,95,0.05)]">
                    <Mail className="w-5 h-5 text-[#C17F5F] flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-[#1A1A1A] text-[11px] font-bold uppercase tracking-wider mb-1">Copia digital en camino</h4>
                        <p className="text-gray-500 text-[10px] leading-relaxed font-light">
                            Hemos enviado una copia digital en PDF del contrato firmado a tu correo para tus registros personales.
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Decorative background gradients */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#C17F5F]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#C17F5F]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
        </div>
    );
}
