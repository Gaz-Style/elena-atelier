'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Menu, ArrowLeft } from 'lucide-react';

const moduleNames: Record<string, string> = {
  '/admin': 'Dashboard Central',
  '/admin/pos': 'Punto de Venta',
  '/admin/caja': 'Caja Diaria',
  '/admin/sales': 'Planilla de Ventas',
  '/admin/crm': 'CRM & Clienteling',
  '/admin/ai-agents': 'Orquestador de IA',
  '/admin/agenda': 'Agenda & Citas',
  '/admin/production': 'Gob. Producción',
  '/admin/catalog': 'Catálogo',
  '/admin/accounting': 'Contabilidad ERP',
  '/admin/logs': 'Sistema',
  '/admin/finance': 'Finanzas',
  '/admin/inventory': 'Inventario',
  '/admin/marketing': 'Marketing',
  '/admin/hr': 'Recursos Humanos',
  '/admin/quotes': 'Presupuestos',
  '/admin/production-board': 'Live Board',
  '/admin/planificador': 'Planificador'
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isPlanificador = pathname?.startsWith('/admin/planificador');

  const currentModuleKey = Object.keys(moduleNames).find(key => 
    pathname === key || (key !== '/admin' && pathname?.startsWith(key))
  );
  const currentModuleName = currentModuleKey ? moduleNames[currentModuleKey] : 'Administración';
  
  return (
    <div className="flex min-h-screen w-full bg-zinc-50 text-zinc-800 font-sans selection:bg-zinc-200/60 lg:-mt-20">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200/80 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {pathname !== '/admin' && (
            <Link 
              href="/admin" 
              className="flex items-center justify-center p-2 -ml-2 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="flex flex-col">
            <span className="font-serif text-lg text-zinc-900 font-bold tracking-tight leading-none">ELENA</span>
            <span className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest mt-0.5">{currentModuleName}</span>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-md hover:bg-zinc-100 transition-colors"
        >
          <Menu size={24} className="text-zinc-700" />
        </button>
      </div>

      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div 
        className={cn(
            "flex-1 transition-all duration-300 relative flex flex-col min-h-screen overflow-x-hidden pt-16 lg:pt-0",
            isCollapsed ? "ml-0 lg:ml-[80px]" : "ml-0 lg:ml-[280px]"
        )}
      >
        {children}
      </div>
    </div>
  );
}
