'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Trash2, AlertCircle, Loader2, DollarSign, Activity, Clock, Wallet, Calendar } from 'lucide-react';
import { 
    requestSaleDeletionAuthorizationAction, 
    deleteSaleAction, 
    updateSaleStatusAction, 
    requestSaleStatusAuthorizationAction 
} from './actions';

interface Sale {
    id: string;
    internal_id: string;
    created_at: string;
    seller_id?: string;
    total_amount: number;
    paid_amount: number;
    status: string;
    payment_method?: string;
    customer_id?: string;
}

interface SalesLedgerTableProps {
    sales: Sale[];
}

export default function SalesLedgerTable({ sales }: SalesLedgerTableProps) {
    const [salesList, setSalesList] = useState<Sale[]>(sales);
    
    // Filters State
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = (new Date().getMonth() + 1).toString();
    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

    // Auth Modal State
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const [authMode, setAuthMode] = useState<'delete' | 'status'>('delete');
    
    // Delete states
    const [pendingDeleteSale, setPendingDeleteSale] = useState<Sale | null>(null);
    
    // Status update states
    const [pendingStatusChange, setPendingStatusChange] = useState<{ sale: Sale; newStatus: string } | null>(null);
    
    const [authPinInput, setAuthPinInput] = useState('');
    const [expectedPin, setExpectedPin] = useState('');

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('es-CL', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
            timeZone: 'America/Santiago'
        });
    };

    // Filter sales based on selected period
    const filteredSales = salesList.filter(s => {
        const date = new Date(s.created_at);
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString();

        if (selectedYear && year !== selectedYear) return false;
        if (selectedMonth && month !== selectedMonth) return false;
        return true;
    });

    // Separate main orders from balance payment entries for UI table rendering
    const mainSales = filteredSales.filter(s => !s.internal_id.includes('_balance_'));

    // Recalculate KPIs based on filtered results
    const totalRevenue = mainSales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysSales = salesList.filter(s => s.created_at.startsWith(todayStr) && !s.internal_id.includes('_balance_'));
    const todayRevenue = todaysSales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
    
    const pendingSales = mainSales.filter(s => s.status === 'pending' || s.status === 'pending_terminal').length;

    // Handler when user selects a new status in the dropdown
    async function handleStatusChange(sale: Sale, newStatus: string) {
        setPendingStatusChange({ sale, newStatus });
        setAuthMode('status');
        setIsAuthorizing(true);
        setShowAuthModal(true);

        const res = await requestSaleStatusAuthorizationAction({
            internalId: sale.internal_id,
            totalAmount: sale.total_amount,
            currentStatus: sale.status,
            newStatus: newStatus
        });

        setIsAuthorizing(false);
        if (res.success && res.pin) {
            setExpectedPin(res.pin);
        } else {
            alert(res.error || 'Error enviando solicitud de autorización.');
            setShowAuthModal(false);
            setPendingStatusChange(null);
        }
    }

    // Handler when user clicks "Eliminar"
    async function handleDeleteClick(sale: Sale) {
        setPendingDeleteSale(sale);
        setAuthMode('delete');
        setIsAuthorizing(true);
        setShowAuthModal(true);

        const res = await requestSaleDeletionAuthorizationAction({
            internalId: sale.internal_id,
            totalAmount: sale.total_amount,
            paymentMethod: sale.payment_method || 'no_registrado'
        });

        setIsAuthorizing(false);
        if (res.success && res.pin) {
            setExpectedPin(res.pin);
        } else {
            alert(res.error || 'Error enviando solicitud de autorización.');
            setShowAuthModal(false);
            setPendingDeleteSale(null);
        }
    }

    // Handler to confirm action after correct PIN is input
    async function handleAuthorize() {
        const masterPin = '2026';
        const isAuthorized = authPinInput === expectedPin || authPinInput === masterPin;

        if (!isAuthorized) {
            alert('PIN incorrecto. Intente nuevamente.');
            setAuthPinInput('');
            return;
        }

        setIsAuthorizing(true);

        if (authMode === 'delete') {
            if (!pendingDeleteSale) return;
            const deleteRes = await deleteSaleAction(pendingDeleteSale.id);
            setIsAuthorizing(false);

            if (deleteRes.success) {
                setSalesList(prev => prev.filter(s => s.id !== pendingDeleteSale.id));
                alert('Venta eliminada exitosamente.');
                setShowAuthModal(false);
                setPendingDeleteSale(null);
                setAuthPinInput('');
                setExpectedPin('');
            } else {
                alert('Error al eliminar venta: ' + deleteRes.error);
            }
        } else if (authMode === 'status') {
            if (!pendingStatusChange) return;
            const statusRes = await updateSaleStatusAction(pendingStatusChange.sale.id, pendingStatusChange.newStatus);
            setIsAuthorizing(false);

            if (statusRes.success) {
                setSalesList(prev => prev.map(s => s.id === pendingStatusChange.sale.id ? { ...s, status: pendingStatusChange.newStatus } : s));
                alert('Estado actualizado exitosamente.');
                setShowAuthModal(false);
                setPendingStatusChange(null);
                setAuthPinInput('');
                setExpectedPin('');
            } else {
                alert('Error al actualizar el estado: ' + statusRes.error);
            }
        }
    }

    const monthNames = [
        { val: '1', label: 'Enero' },
        { val: '2', label: 'Febrero' },
        { val: '3', label: 'Marzo' },
        { val: '4', label: 'Abril' },
        { val: '5', label: 'Mayo' },
        { val: '6', label: 'Junio' },
        { val: '7', label: 'Julio' },
        { val: '8', label: 'Agosto' },
        { val: '9', label: 'Septiembre' },
        { val: '10', label: 'Octubre' },
        { val: '11', label: 'Noviembre' },
        { val: '12', label: 'Diciembre' }
    ];

    const years = ['2024', '2025', '2026', '2027'];

    return (
        <div className="space-y-10">
            {/* Filters Board */}
            <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Año Fiscal</label>
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full bg-gray-50 p-3 text-xs outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Mes Contable</label>
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full bg-gray-50 p-3 text-xs outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm font-bold text-brand-terracotta"
                    >
                        <option value="">-- Todo el Año (Histórico) --</option>
                        {monthNames.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                    </select>
                </div>

                <div className="bg-brand-sand/15 p-4 rounded-sm border border-brand-sand/30 flex items-center">
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                        Filtro rápido del registro de operaciones y calibrador de métricas en tiempo real.
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                            {selectedMonth ? `Ingresos del Mes (${monthNames.find(m => m.val === selectedMonth)?.label})` : 'Ingresos Totales (Histórico)'}
                        </h3>
                        <DollarSign className="w-4 h-4 text-brand-terracotta" />
                    </div>
                    <p className="text-3xl font-serif text-brand-charcoal">{formatCurrency(totalRevenue)}</p>
                </div>

                <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Ingresos de Hoy</h3>
                        <Activity className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-3xl font-serif text-brand-charcoal">{formatCurrency(todayRevenue)}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{todaysSales.length} transacciones hoy</p>
                </div>

                <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Ventas Pendientes</h3>
                        <Clock className="w-4 h-4 text-orange-400" />
                    </div>
                    <p className="text-3xl font-serif text-brand-charcoal">{pendingSales}</p>
                    <p className="text-[10px] text-gray-400 mt-2">Esperando confirmación de pago</p>
                </div>

                <div className="bg-brand-charcoal p-6 rounded-sm border border-gray-800 shadow-sm flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Conciliación Bancaria</h3>
                        <Wallet className="w-4 h-4 text-brand-sand" />
                    </div>
                    <p className="text-sm font-light text-gray-300">Las transferencias deben ser conciliadas manualmente.</p>
                    <button className="mt-4 text-[10px] uppercase tracking-widest font-bold text-brand-sand hover:text-white transition-colors text-left">
                        Exportar Libro Diario →
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-serif text-xl text-brand-charcoal">Registro de Transacciones</h2>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-sm text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:border-brand-terracotta hover:text-brand-terracotta transition-colors">
                            Filtrar
                        </button>
                        <button className="px-4 py-2 bg-brand-charcoal border border-brand-charcoal rounded-sm text-[10px] font-bold uppercase tracking-widest text-white hover:bg-brand-terracotta hover:border-brand-terracotta transition-colors">
                            Reporte Mensual
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500">
                                <th className="p-4 font-bold">ID Transacción</th>
                                <th className="p-4 font-bold">Fecha</th>
                                <th className="p-4 font-bold">Cliente</th>
                                <th className="p-4 font-bold">Monto Total</th>
                                <th className="p-4 font-bold">Medio de Pago</th>
                                <th className="p-4 font-bold">Estado</th>
                                <th className="p-4 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-600">
                            {mainSales.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                                        No hay registros de ventas para el período seleccionado.
                                    </td>
                                </tr>
                            ) : (
                                mainSales.map((sale) => (
                                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                                        <td className="p-4">
                                            <span className="font-bold text-brand-charcoal">{sale.internal_id}</span>
                                        </td>
                                        <td className="p-4 text-xs" suppressHydrationWarning>
                                            {formatDate(sale.created_at)}
                                        </td>
                                        <td className="p-4 font-serif text-brand-charcoal">
                                            {sale.customer_id ? `Cliente (${sale.customer_id.substring(0,6)})` : 'Cliente General'}
                                        </td>
                                        <td className="p-4 font-bold text-brand-terracotta">
                                            {formatCurrency(sale.total_amount)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-3 h-3 text-gray-400" />
                                                <span className="capitalize">{sale.payment_method?.replace(/_/g, ' ') || 'No registrado'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={sale.status}
                                                onChange={(e) => handleStatusChange(sale, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider outline-none border border-transparent cursor-pointer transition-all ${
                                                    sale.status === 'completed' 
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                        : sale.status === 'pending' || sale.status === 'pending_terminal'
                                                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                                                            : sale.status === 'partial'
                                                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                <option value="pending" className="bg-white text-orange-700 font-bold">Pendiente</option>
                                                <option value="partial" className="bg-white text-blue-700 font-bold">Abono</option>
                                                <option value="completed" className="bg-white text-green-700 font-bold">Pagado</option>
                                                <option value="cancelled" className="bg-white text-gray-600 font-bold">Cancelada</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-right space-x-3">
                                            <button 
                                                onClick={() => handleDeleteClick(sale)}
                                                className="text-[10px] uppercase font-bold text-rose-500 hover:text-rose-700 transition-colors inline-flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3 h-3" /> Eliminar
                                            </button>
                                            <Link href={`/admin/sales/${sale.id}`} className="text-[10px] uppercase font-bold text-gray-400 hover:text-brand-terracotta transition-colors">
                                                Ver Detalle
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Authorization Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white max-w-sm w-full shadow-2xl rounded-sm overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-[#f8d7da] p-6 text-center border-b border-[#f5c6cb]">
                            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                                <AlertCircle className="w-6 h-6 text-[#721c24]" />
                            </div>
                            <h3 className="font-serif text-lg text-[#721c24] mb-1">Autorización Requerida</h3>
                            <p className="text-xs text-[#721c24]/80">Se ha solicitado autorización vía Email/WhatsApp.</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Ingresar PIN del Supervisor</label>
                                <input 
                                    type="text" 
                                    maxLength={4}
                                    value={authPinInput}
                                    onChange={(e) => setAuthPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="••••"
                                    className="w-full text-center text-3xl font-mono p-3 border border-gray-200 rounded-sm outline-none focus:border-brand-charcoal tracking-[10px]"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button 
                                    onClick={() => {
                                        setShowAuthModal(false);
                                        setPendingDeleteSale(null);
                                        setPendingStatusChange(null);
                                        setAuthPinInput('');
                                        setExpectedPin('');
                                    }}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-600 transition-colors rounded-sm"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleAuthorize}
                                    disabled={isAuthorizing}
                                    className="flex-1 py-3 bg-brand-charcoal hover:bg-brand-terracotta text-[10px] font-bold uppercase tracking-widest text-white transition-colors rounded-sm flex items-center justify-center gap-1"
                                >
                                    {isAuthorizing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
