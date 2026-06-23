'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ArrowLeft, Bell, Search, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { sidebarItems } from "./Sidebar";
import { cn } from "@/lib/utils";
import { logoutAction } from '@/app/admin/login/actions';

interface AdminHeaderProps {
  hasUser: boolean;
}

const moduleNames: Record<string, string> = {
  '/admin': 'Dashboard Central',
  '/admin/pos': 'Punto de Venta',
  '/admin/caja': 'Caja Diaria',
  '/admin/sales': 'Planilla de Ventas',
  '/admin/crm': 'CRM & Clienteling',
  '/admin/ai-agents': 'Orquestador de IA',
  '/admin/agenda': 'Agenda & Citas',
  '/admin/production': 'Gobernanza de Producción',
  '/admin/catalog': 'Catálogo de Servicios',
  '/admin/accounting': 'Contabilidad ERP',
  '/admin/logs': 'Sistema y Logs',
  '/admin/finance': 'Finanzas & Contabilidad',
  '/admin/inventory': 'Inventario General',
  '/admin/marketing': 'Crecimiento & Marketing',
  '/admin/hr': 'Recursos Humanos',
  '/admin/quotes': 'Presupuestos y Cotizaciones',
  '/admin/production-board': 'Live Production Board',
  '/admin/planificador': 'Planificador Semanal'
};

export default function AdminHeader({ hasUser }: AdminHeaderProps) {
  const pathname = usePathname();
  const isSubpage = pathname !== '/admin';
  const isPlanificador = pathname?.startsWith('/admin/planificador');

  // Find matching module name
  const currentModuleKey = Object.keys(moduleNames).find(key => 
    pathname === key || (key !== '/admin' && pathname?.startsWith(key))
  );
  const currentModuleName = currentModuleKey ? moduleNames[currentModuleKey] : 'Administración';

  if (isPlanificador) return null;

  return (
    <header className="sticky top-0 w-full h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 z-40 flex items-center justify-between px-6 md:px-8 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
      <div className="flex items-center gap-4">
        {/* Navigation Breadcrumb / Module Indicator */}
        <div className="flex items-center gap-2">
          <div className="block lg:hidden mr-2">
            <Sheet>
              <SheetTrigger>
                <div className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer">
                  <Menu className="w-5 h-5" />
                </div>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
                <div className="p-6 border-b border-zinc-100 flex flex-col">
                  <span className="font-serif text-xl text-zinc-900 font-bold tracking-tight">ELENA</span>
                  <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-widest mt-0.5">OS System</span>
                </div>
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
                  {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
                    return (
                        <Link key={item.href} href={item.href} className="block">
                            <div className={cn(
                                "flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 group cursor-pointer relative overflow-hidden",
                                isActive ? "text-zinc-900 bg-zinc-100/60 border border-zinc-100/50" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                            )}>
                                <item.icon size={18} className={cn("flex-shrink-0 transition-colors", isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-700")} />
                                <span className="text-[13px] font-medium whitespace-nowrap">{item.name}</span>
                            </div>
                        </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          {hasUser && isSubpage && (
            <Link 
              href="/admin" 
              className="flex items-center justify-center p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest">Elena Atalier</span>
            <span className="text-sm font-semibold text-zinc-800">{currentModuleName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {hasUser && (
          <>
            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-4">
                <button className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-colors shadow-sm">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-colors relative shadow-sm">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                </button>
                <div className="w-[1px] h-6 bg-zinc-200"></div>
            </div>

            <form action={logoutAction}>
              <button 
                type="submit" 
                className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-zinc-600 hover:text-zinc-950 transition-colors px-2 md:px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 shadow-sm"
              >
                <span className="hidden md:inline">Cerrar Sesión</span>
                <LogOut className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </form>
          </>
        )}
      </div>
    </header>
  );
}
