'use client';

import React, { useState } from 'react';
import { loginAction } from './actions';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-sand/30 font-sans flex flex-col justify-center items-center p-6">
      {/* Back to Site Link */}
      <Link href="/" className="absolute top-8 left-8 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-brand-terracotta transition-colors flex items-center gap-2">
        ← Volver al sitio público
      </Link>

      <div className="w-full max-w-md bg-white p-10 md:p-12 rounded-sm shadow-2xl border border-gray-100">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-12 h-12 bg-brand-charcoal text-white rounded-full flex items-center justify-center font-serif text-2xl mb-6">
            E
          </div>
          <h1 className="font-serif text-3xl text-brand-charcoal mb-2">Acceso Restringido</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-terracotta" />
            Consola Administrativa
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-4 rounded-sm border border-red-100 font-bold uppercase tracking-wide text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
              Usuario o Correo
            </label>
            <input 
              type="text" 
              name="email"
              placeholder="ejemplo@correo.com"
              required
              className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors bg-white text-brand-charcoal"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
              Contraseña de Acceso
            </label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••"
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
                Iniciar Sesión
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Sistema Encriptado &bull; EA v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
