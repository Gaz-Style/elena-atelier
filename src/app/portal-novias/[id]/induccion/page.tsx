'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, ArrowRight, Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function BridalInductionPage() {
    const params = useParams();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            const supabase = createClientComponentClient();
            const { data, error } = await supabase
                .from('bridal_projects')
                .select('*, customers(full_name)')
                .eq('id', params.id as string)
                .single();
                
            if (data) {
                setProject(data);
            }
            setLoading(false);
        };
        fetchProject();
    }, [params.id]);

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
                <h1 className="text-2xl font-serif text-white mb-2">Proyecto no encontrado</h1>
                <p className="text-zinc-400">No hemos podido encontrar la información de tu proyecto.</p>
            </div>
        );
    }

    const customerName = project.customers?.full_name?.split(' ')[0] || 'Futura Novia';

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4 sm:p-8 relative">
            
            {/* Elegant Header */}
            <div className="absolute top-8 left-0 w-full text-center z-10 px-4">
                <p className="text-[#C17F5F] text-[10px] uppercase tracking-[4px] font-bold mb-2">
                    BIENVENIDA A LA EXPERIENCIA
                </p>
                <h1 className="font-serif text-3xl md:text-4xl italic text-white/90">
                    Hola, {customerName}
                </h1>
            </div>

            {/* Video Container */}
            <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl shadow-[#C17F5F]/10 border border-white/5 bg-black mt-20 relative z-20">
                <video 
                    controls
                    autoPlay
                    className="w-full aspect-video object-cover"
                    poster="/trabajos/novia 2.jpeg"
                >
                    <source src="/Induccion portal novias.mp4" type="video/mp4" />
                    Tu navegador no soporta la etiqueta de video.
                </video>
            </div>

            {/* Actions */}
            <div className="mt-12 mb-8 z-10 flex flex-col items-center text-center">
                <p className="text-zinc-400 font-light max-w-md mb-8 text-sm leading-relaxed">
                    Tómate un momento para ver este video. Aquí Elena te explica personalmente 
                    cómo funcionará cada etapa de la confección de tu vestido soñado.
                </p>
                
                <Link 
                    href={`/portal-novias/${params.id}`}
                    className="inline-flex items-center gap-3 bg-[#C17F5F] hover:bg-[#A86F53] text-white px-8 py-4 rounded transition-all transform hover:scale-105 shadow-lg shadow-[#C17F5F]/20 text-xs tracking-widest uppercase font-bold"
                >
                    Ir a mi Portal <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            
            {/* Decorative background gradients */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#C17F5F]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#C17F5F]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
        </div>
    );
}
