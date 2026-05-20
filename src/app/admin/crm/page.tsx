import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Users, Plus, ChevronRight, Search, MessageCircle } from 'lucide-react';

export const revalidate = 0; // Disable caching for CRM

export default async function CRMPage() {
  // Fetch customers from Supabase
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-20 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-rose-600">
              <Users className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Módulo Clienteling</span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl text-brand-charcoal">Directorio CRM</h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">Gestión de clientas, historial y registro de medidas corporales.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar clienta..." 
                className="w-full md:w-64 pl-10 pr-4 py-3 md:py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-brand-terracotta bg-white"
              />
            </div>
            <Link 
              href="/admin/crm/nueva" 
              className="bg-brand-charcoal text-white hover:bg-brand-terracotta px-6 py-3 md:py-2.5 text-xs uppercase tracking-widest font-bold rounded-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Nueva Clienta
            </Link>
          </div>
        </header>

        {error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-sm border border-red-100 text-sm">
            Error al conectar con la base de datos de Supabase. Por favor, verifica las variables de entorno.
            <br />
            <span className="font-mono text-xs mt-2 block">{error.message}</span>
          </div>
        ) : (
          <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                    <th className="py-4 px-6 font-medium whitespace-nowrap">Nombre Completo</th>
                    <th className="py-4 px-6 font-medium whitespace-nowrap">Contacto</th>
                    <th className="py-4 px-6 font-medium whitespace-nowrap">Estilo / Ocasión</th>
                    <th className="py-4 px-6 font-medium text-right whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!customers || customers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-gray-500 text-sm">
                        No hay clientas registradas aún en Supabase.
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="font-serif text-lg text-brand-charcoal">{customer.full_name}</div>
                          <div className="text-xs text-gray-400 font-mono mt-1">ID: {customer.id.split('-')[0]}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-brand-charcoal">{customer.email}</div>
                          <div className="text-sm text-gray-500">{customer.phone || 'Sin teléfono'}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-[10px] uppercase tracking-widest rounded-sm mb-1 mr-2 whitespace-nowrap">
                            {customer.style_preference || 'Sin definir'}
                          </span>
                          <div className="text-xs text-gray-500">{customer.typical_occasion}</div>
                        </td>
                        <td className="py-4 px-6 text-right space-x-4">
                          {customer.phone && (
                            <a 
                              href={`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=Hola%20${customer.full_name.split(' ')[0]},%20te%20saludamos%20de%20Elena%20Atelier...`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700 transition-colors inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                            >
                              <MessageCircle className="w-4 h-4" /> <span className="hidden md:inline">WhatsApp</span>
                            </a>
                          )}
                          <button className="text-xs font-bold uppercase tracking-widest text-brand-terracotta hover:text-brand-charcoal transition-colors inline-flex items-center gap-1">
                            Ver <span className="hidden md:inline">Perfil</span> <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
