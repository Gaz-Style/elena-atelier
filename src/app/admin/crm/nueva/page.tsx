'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, User, Ruler } from 'lucide-react';
import { createCustomerAction } from './actions';

export default function NewCustomerPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await createCustomerAction(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-8 pt-32 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
          <div>
            <Link href="/admin/crm" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
              <ArrowLeft className="w-3 h-3" /> Volver al Directorio
            </Link>
            <h1 className="font-serif text-4xl text-brand-charcoal">Ficha de Clienteling</h1>
            <p className="text-gray-500 mt-2">Registro de nueva clienta y medidas corporales maestras.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-100 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Perfil */}
          <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 text-brand-charcoal border-b border-gray-100 pb-4 mb-6">
              <User className="w-5 h-5 text-brand-terracotta" />
              <h2 className="font-serif text-2xl">Perfil General</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Nombre Completo *</label>
                <input required type="text" name="full_name" className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Correo Electrónico *</label>
                <input required type="email" name="email" className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Teléfono (WhatsApp)</label>
                <input type="tel" name="phone" className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Estilo Preferente</label>
                <select name="style_preference" className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors bg-white">
                  <option value="">Seleccionar...</option>
                  <option value="Clásico">Clásico</option>
                  <option value="Minimalista">Minimalista / Lujo Silencioso</option>
                  <option value="Vanguardista">Vanguardista</option>
                  <option value="Romántico">Romántico</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Ocasión Típica de Uso</label>
                <input type="text" name="typical_occasion" placeholder="Ej: Eventos de gala, reuniones ejecutivas, uso diario..." className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" />
              </div>
            </div>
          </div>

          {/* Section 2: Medidas */}
          <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 text-brand-charcoal border-b border-gray-100 pb-4 mb-6">
              <Ruler className="w-5 h-5 text-brand-terracotta" />
              <h2 className="font-serif text-2xl">Medidas Corporales (cm)</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Hombros</label>
                <input type="number" step="0.1" name="shoulder_width" className="w-full border border-gray-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Pecho</label>
                <input type="number" step="0.1" name="chest_circumference" className="w-full border border-gray-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Cintura</label>
                <input type="number" step="0.1" name="waist_circumference" className="w-full border border-gray-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Caderas</label>
                <input type="number" step="0.1" name="hip_circumference" className="w-full border border-gray-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Largo Manga</label>
                <input type="number" step="0.1" name="sleeve_length" className="w-full border border-gray-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Notas Anatómicas o de Postura</label>
              <textarea name="notes" rows={3} className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors resize-none"></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/admin/crm" className="px-8 py-4 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-brand-charcoal transition-colors">
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-brand-charcoal text-white hover:bg-brand-terracotta px-8 py-4 text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Clienta
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
