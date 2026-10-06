'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Wand2, ArrowRight, X, Sparkles, Scissors, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function AiStudioClient() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<any>(null);

  // Utilidad para convertir archivo a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStep(2);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      let imageBase64 = null;
      if (selectedFile) {
        imageBase64 = await fileToBase64(selectedFile);
      }

      const res = await fetch('/api/estudio-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, imageBase64 })
      });

      const data = await res.json();
      
      if (data.success) {
        if (data.imageUrl) setGeneratedImageUrl(data.imageUrl);
        if (data.quote) setQuoteData(data.quote);
        setStep(3);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Falla al conectar con IA", error);
      alert("Hubo un problema al generar el diseño.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-brand-sand/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center">
        <Link href="/" className="font-serif text-xl tracking-widest uppercase">
          ELENA<span className="text-brand-sand">.</span>
        </Link>
        <span className="text-[10px] border border-white/20 px-3 py-1 rounded-full uppercase tracking-widest text-white/70">
          Beta / AI Studio
        </span>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-6 relative z-10 w-full max-w-6xl mx-auto">
        
        {/* TITLES */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] font-semibold text-brand-sand mb-4">
            <Sparkles size={12} />
            Co-creación Digital
          </span>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-tight">
            Diseña el vestido de <br className="hidden md:block"/>tus sueños <span className="italic text-brand-sand">con IA</span>
          </h1>
          <p className="text-white/60 mt-4 max-w-xl mx-auto text-sm md:text-base">
            Sube una foto tuya o de una prenda de referencia, cuéntanos qué te gustaría cambiar o agregar, y nuestro sistema diseñará un boceto junto con un presupuesto estimado.
          </p>
        </div>

        {/* WORKSPACE */}
        <div className="w-full max-w-4xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-10 backdrop-blur-md shadow-2xl relative">
          
          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="border-2 border-dashed border-white/20 hover:border-brand-sand/50 transition-colors rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer group relative overflow-hidden bg-black/20">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-brand-sand/10 flex items-center justify-center mb-4 transition-colors">
                <Upload className="w-8 h-8 text-white/50 group-hover:text-brand-sand transition-colors" />
              </div>
              <h3 className="font-serif text-2xl mb-2">Sube tu inspiración</h3>
              <p className="text-white/50 text-sm max-w-sm">
                Arrastra una foto tuya para probar diseños o una imagen de referencia que quieras modificar.
              </p>
            </div>
          )}

          {/* STEP 2: PROMPT */}
          {step === 2 && previewUrl && (
            <div className="flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
              <div className="w-full md:w-1/2 relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                <button 
                  onClick={() => setStep(1)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 hover:text-white border border-white/20 transition-all z-10"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
                <div>
                  <h3 className="font-serif text-3xl mb-2">¿Qué diseñamos hoy?</h3>
                  <p className="text-white/60 text-sm">
                    Describe en detalle cómo te gustaría transformar esta imagen. Nuestro modelo de IA entenderá tus ideas.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ej: Conviértelo en un vestido de novia de corte sirena, agrega mangas de encaje, y cambia el color a blanco perlado..."
                      className="w-full bg-black/40 border border-white/20 rounded-xl p-4 text-white placeholder-white/30 h-32 focus:outline-none focus:border-brand-sand/50 transition-colors resize-none text-sm"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {['Agregar encaje', 'Acortar basta', 'Cambiar a rojo', 'Estilo princesa'].map((suggestion) => (
                      <button 
                        key={suggestion}
                        onClick={() => setPrompt((prev) => prev ? prev + ', ' + suggestion : suggestion)}
                        className="text-[10px] uppercase tracking-wider px-3 py-1.5 border border-white/10 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/70"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={!prompt || isGenerating}
                  className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 border border-brand-sand/30 bg-brand-sand/10 hover:bg-brand-sand hover:border-brand-sand transition-all duration-500 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin text-brand-sand group-hover:text-black" />
                  ) : (
                    <Wand2 className="w-5 h-5 text-brand-sand group-hover:text-black transition-colors" />
                  )}
                  <span className="font-sans text-xs uppercase tracking-widest font-semibold text-brand-sand group-hover:text-black transition-colors">
                    {isGenerating ? 'El Atelier está diseñando...' : 'Generar Boceto IA'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RESULT & QUOTE */}
          {step === 3 && (
            <div className="animate-in fade-in zoom-in-95 duration-700">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                
                {/* Result Image */}
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-brand-sand/40 shadow-[0_0_40px_rgba(193,127,95,0.15)] group">
                    {/* Generated Image */}
                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                        {generatedImageUrl ? (
                          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${generatedImageUrl})` }}></div>
                        ) : (
                          <div className="absolute inset-0 bg-[url('/trabajos/novia%202.jpeg')] bg-cover bg-center"></div>
                        )}
                        {/* Pequeño gradiente solo abajo para que se lea el texto */}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                       <span className="text-[10px] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-widest text-brand-sand border border-brand-sand/30 flex items-center gap-2">
                           <Sparkles size={12}/> Boceto IA Terminado
                       </span>
                    </div>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-6 md:p-8 flex flex-col h-full">
                  <h3 className="font-serif text-2xl mb-1">Evaluación del Atelier</h3>
                  <p className="text-white/50 text-xs mb-6 uppercase tracking-wider">Presupuesto Estimado IA</p>
                  
                  <div className="space-y-4 flex-grow">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <Scissors className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/80">Complejidad del diseño</span>
                      </div>
                      <span className="text-sm font-medium">{quoteData?.complexity || 'Alta / A Medida'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <Upload className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/80">Tiempo estimado</span>
                      </div>
                      <span className="text-sm font-medium">{quoteData?.estimatedDays || '15 - 20 días hábiles'}</span>
                    </div>

                    <div className="pt-4 pb-2">
                      <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Valor Referencial desde</p>
                      <p className="font-serif text-4xl text-brand-sand">
                        ${(quoteData?.estimatedPrice || 280000).toLocaleString('es-CL')} <span className="text-sm text-white/30 font-sans">CLP</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <button className="w-full group relative flex items-center justify-center gap-3 px-6 py-4 border border-brand-sand/50 bg-brand-sand hover:bg-white transition-colors duration-500 rounded-sm">
                      <span className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-black">
                        Enviar a Elena para confeccionar
                      </span>
                      <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button 
                      onClick={() => setStep(1)}
                      className="w-full text-center py-3 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                    >
                      Intentar otro diseño
                    </button>
                  </div>

                  <p className="text-center text-[9px] text-white/30 mt-4 leading-relaxed">
                    *El valor es una estimación generada por Inteligencia Artificial basada en tu petición. El precio final y la viabilidad técnica serán confirmados por Elena y su equipo en el taller.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
