'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Activity,
    Calendar,
    Wallet,
    DollarSign,
    Package,
    Settings,
    ChevronLeft,
    ChevronRight,
    Scissors,
    Receipt,
    BrainCircuit
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sidebarItems = [
    { name: 'Dashboard Central', href: '/admin', icon: LayoutDashboard },
    { name: 'Punto de Venta', href: '/admin/pos', icon: ShoppingBag },
    { name: 'Caja Diaria', href: '/admin/caja', icon: Wallet },
    { name: 'Planilla Ventas', href: '/admin/sales', icon: DollarSign },
    { name: 'CRM & WhatsApp', href: '/admin/crm', icon: Users },
    { name: 'Orquestador IA', href: '/admin/ai-agents', icon: BrainCircuit },
    { name: 'Agenda & Citas', href: '/admin/agenda', icon: Calendar },
    { name: 'Producción', href: '/admin/production', icon: Scissors },
    { name: 'Catálogo', href: '/admin/catalog', icon: Package },
    { name: 'Contabilidad ERP', href: '/admin/accounting', icon: Receipt },
    { name: 'Sistema y Logs', href: '/admin/logs', icon: Settings },
];

export default function Sidebar({ 
    isCollapsed, 
    setIsCollapsed 
}: { 
    isCollapsed: boolean, 
    setIsCollapsed: (v: boolean) => void 
}) {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="hidden lg:flex h-screen bg-white border-r border-zinc-200/80 flex-col fixed left-0 top-0 z-50 shadow-sm"
        >
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 h-[80px]">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex flex-col overflow-hidden whitespace-nowrap"
                        >
                            <span className="font-serif text-xl text-zinc-900 font-bold tracking-tight">ELENA</span>
                            <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-widest mt-0.5">OS System</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-colors ml-auto flex-shrink-0"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-hide">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
                    
                    return (
                        <Link key={item.href} href={item.href} className="block">
                            <div className={cn(
                                "flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 group cursor-pointer relative overflow-hidden",
                                isActive ? "text-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-zinc-100/50" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                            )}>
                                <item.icon size={18} className={cn("flex-shrink-0 transition-colors relative z-10", isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-700")} />
                                
                                <AnimatePresence mode="wait">
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="text-[13px] font-medium whitespace-nowrap relative z-10"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {isActive && (
                                    <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-zinc-100/60 z-0 rounded-xl" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
                    <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 border border-zinc-200/60 shadow-sm">
                        <span className="text-[11px] font-serif font-bold text-zinc-700">EA</span>
                    </div>
                    {!isCollapsed && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col overflow-hidden"
                        >
                            <span className="text-xs font-semibold text-zinc-800">Administrador</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span> 
                                <span className="text-[10px] text-emerald-600 font-medium">Conectado</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.aside>
    );
}
