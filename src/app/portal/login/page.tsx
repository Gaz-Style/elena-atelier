'use client';

import React, { useState } from 'react';
import { requestOTPAction } from './actions';
import { Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ClientPortalLogin() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    const formData = new FormData(e.currentTarget);
    const result = await requestOTPAction(formData);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F0EDE8] font-sans flex flex-col justify-center items-center p-6">
      <Link href="/" className="absolute top-8 left-8 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-brand-terracotta transition-colors flex items-center gap-2">
        ← Volver al inicio
      </Link>

      <div className="w-full max-w-md bg-white p-10 md:p-12 rounded-sm shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-12 h-12 bg-brand-sand rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 text-brand-charcoal" />
          </div>
          <h1 className="font-serif text-3xl text-brand-charcoal mb-2">Portal de Clientas</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
            Acceso Exclusivo
          </p>
          <p className="text-sm text-gray-500 mt-4 leading-relaxed">
            Ingresa tu correo para recibir un enlace de acceso seguro a tu pasaporte de costura.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-brand-charcoal mb-2">Enlace Enviado</h3>
              <p className="text-sm text-gray-500">
                Hemos enviado un enlace mágico a tu correo. Haz clic en él para acceder a tu historial y seguimiento de prendas.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-4 rounded-sm border border-red-100 font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
                Correo Registrado
              </label>
              <input 
                type="email" 
                name="email"
                placeholder="tu@correo.com"
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors bg-white text-brand-charcoal"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-charcoal text-white hover:bg-brand-terracotta py-4 text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Recibir Enlace Mágico
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Elena Atelier &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
