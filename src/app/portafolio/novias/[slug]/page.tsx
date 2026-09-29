import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BackLink from '@/components/BackLink';
import LocationMap from '@/components/LocationMap';
import { historiasNovias } from '@/lib/historias-novias-data';
import { ArrowLeft, Sparkles, CheckCircle2, Calendar, Heart, ShieldCheck } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const historia = historiasNovias.find((h) => h.slug === slug);
  if (!historia) return {};

  return {
    title: `Historia de Novia: ${historia.novia} | Elena Atelier Las Condes`,
    description: `Descubre la historia de ${historia.novia} y sus 3 vestidos a medida (Civil, Iglesia y Fiesta) confeccionados en Elena Atelier en Las Condes, Santiago.`,
  };
}

export default async function HistoriaNoviaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const historia = historiasNovias.find((h) => h.slug === slug);

  if (!historia) {
    notFound();
  }

  const whatsappMessage = encodeURIComponent(
    `Hola Elena, leí la historia de ${historia.novia} en su portafolio y me gustaría agendar una cita para diseñar la propuesta integral de mi matrimonio (Civil, Iglesia, Fiesta y Madrinas).`
  );
  const whatsappUrl = `https://wa.me/56937667709?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-brand-sand selection:text-black">
      <Navbar />
      <BackLink />

      {/* HERO EEDITORIAL NARRATIVO */}
      <section className="relative pt-32 pb-20 px-6 max-w-6xl mx-auto border-b border-white/10">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-sand/10 border border-brand-sand/30 text-brand-sand text-xs font-semibold uppercase tracking-[0.3em]">
            <Sparkles className="w-3.5 h-3.5" /> Producción Editorial • Colaboración con Marcas & Modelos
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal text-white tracking-tight leading-tight">
            Editorial Nupcial: <span className="italic text-brand-sand">Trilogía de Vestuario</span>
          </h1>
          <p className="font-sans text-white/60 text-sm md:text-base max-w-2xl mx-auto tracking-wide">
            {historia.ubicacion} • {historia.fecha}
          </p>

          <blockquote className="font-serif text-lg sm:text-2xl italic text-white/90 max-w-3xl mx-auto pt-6 border-t border-white/10 leading-relaxed">
            {historia.citaEmocional}
          </blockquote>
        </div>
      </section>

      {/* CÓMO RESOLVIMOS EL CICLO DE LA NOVIA: 3 INSTANCIAS DE VESTIDO */}
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-24">
        
        {/* INTRODUCCIÓN DEL PROCESO EN ATELIER CON MAMA Y MADRINAS */}
        <section className="grid md:grid-cols-2 gap-12 items-center bg-white/[0.02] border border-white/10 p-8 sm:p-12 rounded-sm">
          <div className="space-y-6">
            <span className="text-[10px] uppercase tracking-[0.4em] text-brand-sand font-bold block">
              Behind The Scenes • El Taller & La Familia
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal leading-snug">
              {historia.etapaAtelier.titulo}
            </h2>
            <p className="font-sans text-white/70 text-sm sm:text-base leading-relaxed">
              {historia.etapaAtelier.descripcion}
            </p>
            <div className="p-4 bg-brand-sand/10 border-l-2 border-brand-sand text-white/90 text-xs sm:text-sm">
              <strong className="block text-brand-sand mb-1 font-semibold">Diseño Coordinado de Familia:</strong>
              {historia.etapaAtelier.mamaYMadrinas}
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-sm overflow-hidden border border-white/15">
            <Image
              src={historia.etapaAtelier.imagen}
              alt="Pruebas de vestido en Elena Atelier con Mamá y Madrinas"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* LAS 3 INSTANCIAS DE VESTIDOS DE SOFÍA */}
        <section className="space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal">
              Tres Instancias, Tres Respuestas de Vestuario
            </h2>
            <p className="font-sans text-white/60 text-sm sm:text-base">
              Una novia no vive el día de su matrimonio como un bloque estático. Elena Atelier concibió tres piezas adaptadas al protocolo, movimiento y emoción de cada momento.
            </p>
          </div>

          {/* INSTANCIA 1: CIVIL */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="relative aspect-[3/4] rounded-sm overflow-hidden border border-white/15">
              <Image
                src={historia.instancias.civil.imagen}
                alt={historia.instancias.civil.subtitulo}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.3em] text-brand-sand font-bold">
                {historia.instancias.civil.titulo}
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl text-white">
                {historia.instancias.civil.subtitulo}
              </h3>
              <p className="font-sans text-white/70 text-sm sm:text-base leading-relaxed">
                {historia.instancias.civil.descripcion}
              </p>
              <ul className="space-y-2 pt-2">
                {historia.instancias.civil.detallesTecnicos.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-brand-sand flex-none" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* INSTANCIA 2: IGLESIA (REVERSO) */}
          <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
            <div className="space-y-6 md:order-1 order-2">
              <span className="text-xs uppercase tracking-[0.3em] text-brand-sand font-bold">
                {historia.instancias.iglesia.titulo}
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl text-white">
                {historia.instancias.iglesia.subtitulo}
              </h3>
              <p className="font-sans text-white/70 text-sm sm:text-base leading-relaxed">
                {historia.instancias.iglesia.descripcion}
              </p>
              <ul className="space-y-2 pt-2">
                {historia.instancias.iglesia.detallesTecnicos.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-brand-sand flex-none" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-[3/4] rounded-sm overflow-hidden border border-white/15 md:order-2 order-1">
              <Image
                src={historia.instancias.iglesia.imagen}
                alt={historia.instancias.iglesia.subtitulo}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* INSTANCIA 3: FIESTA & BAILAN */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="relative aspect-[3/4] rounded-sm overflow-hidden border border-white/15">
              <Image
                src={historia.instancias.fiesta.imagen}
                alt={historia.instancias.fiesta.subtitulo}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.3em] text-brand-sand font-bold">
                {historia.instancias.fiesta.titulo}
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl text-white">
                {historia.instancias.fiesta.subtitulo}
              </h3>
              <p className="font-sans text-white/70 text-sm sm:text-base leading-relaxed">
                {historia.instancias.fiesta.descripcion}
              </p>
              <ul className="space-y-2 pt-2">
                {historia.instancias.fiesta.detallesTecnicos.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-brand-sand flex-none" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* LLAMADO A LA ACCIÓN & AGENDAMIENTO */}
        <section className="bg-gradient-to-br from-[#181818] via-[#141414] to-[#0a0a0a] p-8 sm:p-14 rounded-sm border border-brand-sand/30 text-center space-y-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <ShieldCheck className="w-10 h-10 text-brand-sand mx-auto" />
            <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal">
              Diseña la Trilogía de tu Matrimonio
            </h2>
            <p className="font-sans text-white/70 text-sm sm:text-base leading-relaxed">
              En Elena Atelier no vendemos vestidos preconfeccionados. Diseñamos junto a ti, tu madre y tus madrinas la propuesta integral para que vivas tu matrimonio con elegancia y total libertad.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-brand-sand text-black font-semibold text-xs uppercase tracking-[0.25em] rounded-sm hover:bg-white transition-all shadow-lg text-center"
            >
              Agendar Cita de Autor con Elena
            </a>
            <Link
              href="/portafolio"
              className="w-full sm:w-auto px-8 py-4 border border-white/30 text-white font-semibold text-xs uppercase tracking-[0.25em] rounded-sm hover:bg-white/10 transition-all text-center"
            >
              Volver al Portafolio
            </Link>
          </div>

          <p className="text-[11px] text-white/40 uppercase tracking-widest pt-2">
            Garantía de Por Vida en Calce y Ajustes de Alta Costura • Atelier Las Condes
          </p>
        </section>

        {/* UBICACIÓN OFICIAL DE GOOGLE MAPS */}
        <section className="space-y-6 pt-10 border-t border-white/10">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.4em] text-brand-sand font-bold block mb-2">Visítanos en Santiago</span>
            <h3 className="font-serif text-2xl sm:text-3xl text-white">Atelier Elena La Costurera & Alta Costura</h3>
          </div>
          <LocationMap />
        </section>
      </main>
    </div>
  );
}
