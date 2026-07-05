'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BridalInductionPage() {
    const params = useParams();
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

            {/* Video Container - formato vertical 9:16 */}
            <div className="w-full max-w-sm mx-auto rounded-xl overflow-hidden shadow-2xl shadow-[#C17F5F]/10 border border-white/10 bg-black mt-20 relative z-20 group">
                <video 
                    controls
                    className="w-full aspect-[9/16] object-contain bg-black"
                    poster="/trabajos/novia 2.jpeg"
                    onPlay={(e) => {
                        const target = e.target as HTMLVideoElement;
                        const overlay = target.nextElementSibling as HTMLElement;
                        if (overlay) overlay.style.opacity = '0';
                    }}
                    onPause={(e) => {
                        const target = e.target as HTMLVideoElement;
                        const overlay = target.nextElementSibling as HTMLElement;
                        if (overlay) overlay.style.opacity = '1';
                    }}
                    onEnded={(e) => {
                        const target = e.target as HTMLVideoElement;
                        const overlay = target.nextElementSibling as HTMLElement;
                        target.load(); // Resets the video to show the poster again
                        if (overlay) overlay.style.opacity = '1';
                    }}
                >
                    <source src="/Induccion portal novias.mp4" type="video/mp4" />
                    Tu navegador no soporta la etiqueta de video.
                </video>
                
                {/* Text Overlay on Poster */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px] transition-opacity duration-500">
                    <div className="border border-white/20 bg-[#0A0A0A]/60 p-6 rounded-lg backdrop-blur-md shadow-2xl text-center max-w-[90%] transform transition-transform">
                        <h3 className="font-serif italic text-xl text-white/90 mb-3">Tu Vestido Soñado</h3>
                        <p className="text-zinc-300 font-light text-xs leading-relaxed tracking-wide">
                            Como parte del proceso, hemos preparado este breve video donde te explicamos el paso a paso que seguiremos. 
                            Te pedimos revisarlo para saber qué es lo que viene a continuación y guiarte fácilmente dentro de tu portal.
                        </p>
                        <p className="text-[#C17F5F] text-[9px] uppercase tracking-[3px] font-bold mt-5">
                            Toca para reproducir
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-12 mb-8 z-10 flex flex-col items-center text-center">
                
                <Link 
                    href={`/portal-novias/${params.id}`}
                    className="inline-flex items-center gap-3 bg-transparent border border-[#C17F5F] text-[#C17F5F] hover:bg-[#C17F5F] hover:text-white px-8 py-4 rounded text-xs font-bold uppercase tracking-[0.2em] transition-all group"
                >
                    Ir a mi Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            
            {/* Decorative background gradients */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#C17F5F]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#C17F5F]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
        </div>
    );
}
