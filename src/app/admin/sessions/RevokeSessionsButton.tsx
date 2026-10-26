'use client';

import React, { useState } from 'react';
import { LogOut, Loader2, AlertTriangle, X } from 'lucide-react';
import { revokeAllSessionsAction } from './actions';
import { useRouter } from 'next/navigation';

export default function RevokeSessionsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRevokeAll = async () => {
    setIsLoading(true);
    try {
      const res = await revokeAllSessionsAction();
      if (res.success) {
        setIsOpen(false);
        // Redirigir al login ya que la sesión actual también fue invalidada
        router.push('/admin/login');
      } else {
        alert(res.error || 'No se pudieron cerrar las sesiones.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al cerrar sesiones.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/80 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
        title="Desconectar todos los dispositivos"
      >
        <LogOut className="w-4 h-4 text-red-600" />
        <span>Cerrar todas las sesiones</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => !isLoading && setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900">
                  ¿Cerrar todas las sesiones del sistema?
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Esta acción desconectará inmediatamente todos los dispositivos conectados (teléfonos, tablets y computadoras). Cualquier usuario activo deberá ingresar nuevamente sus credenciales.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRevokeAll}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Cerrando sesiones...
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    Confirmar y cerrar todo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
