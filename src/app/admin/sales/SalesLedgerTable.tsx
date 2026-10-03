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
import AccountingBreakdownModal from './AccountingBreakdownModal';

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
    customers?: {
        full_name: string;
    } | null;
}

interface SalesLedgerTableProps {
    sales: Sale[];
    bridalProjects?: any[];
    prodOrders?: any[];
}

export default function SalesLedgerTable({ sales, bridalProjects = [], prodOrders = [] }: SalesLedgerTableProps) {
    const [salesList, setSalesList] = useState<Sale[]>(sales);
    
    // Filters State
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = (new Date().getMonth() + 1).toString();
    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
    const [selectedView, setSelectedView] = useState<'real' | 'cuotas' | 'caja' | 'pendientes'>('cuotas');

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

    const getChileDateParts = (dateInput: string | Date) => {
        const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Santiago',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
        const parts = formatter.formatToParts(d);
        const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
        return {
            year: map.year,
            month: map.month,
            day: map.day.padStart(2, '0'),
            dateStr: `${map.year}-${map.month.padStart(2, '0')}-${map.day.padStart(2, '0')}`
        };
    };

    const todayChileStr = getChileDateParts(new Date()).dateStr;

    // Base ID Helper to group related transactions
    const getBaseId = (internalId: string) => {
        if (internalId.startsWith('bridal_')) {
            let base = internalId.replace('bridal_', '').split('_balance_')[0];
            if (base.includes('_custom')) base = base.split('_custom')[0];
            else if (base.includes('_p')) base = base.split('_p')[0];
            else base = base.split('_')[0]; // Safely remove any other suffix for UUIDs
            return base;
        } else {
            // For order_52210, pos_123, etc., just remove the balance suffix
            return internalId.split('_balance_')[0];
        }
    };

    // Find original date for each project
    const projectOriginalDates: Record<string, ReturnType<typeof getChileDateParts>> = {};
    
    // 1. Use absolute creation date from the actual project/order if available
    bridalProjects.forEach(p => {
        if (p.created_at) projectOriginalDates[p.id] = getChileDateParts(p.created_at);
    });
    prodOrders.forEach(p => {
        if (p.created_at) {
            projectOriginalDates[p.pos_order_id] = getChileDateParts(p.created_at);
            projectOriginalDates[`order_${p.pos_order_id}`] = getChileDateParts(p.created_at);
        }
    });

    // 2. Fallback to the first transaction date ONLY if it's a loose sale without a project
    salesList.forEach(s => {
        if (s.status === 'cancelled') return;
        const baseId = getBaseId(s.internal_id);
        const sParts = getChileDateParts(s.created_at);
        if (!projectOriginalDates[baseId]) {
            projectOriginalDates[baseId] = sParts;
        } else if (!bridalProjects.some(p => p.id === baseId) && !prodOrders.some(p => p.pos_order_id === baseId || `order_${p.pos_order_id}` === baseId)) {
             // For general loose sales not tied to a project, find earliest transaction
             if (new Date(s.created_at).getTime() < new Date(projectOriginalDates[baseId].dateStr).getTime()) {
                 projectOriginalDates[baseId] = sParts;
             }
        }
    });

    const getCategory = (s: Sale) => {
        if (s.internal_id.startsWith('bridal_')) return 'Alta Costura';
        const baseId = s.internal_id.split('_balance_')[0];
        const prod = prodOrders.find((p: any) => p.pos_order_id === baseId || `order_${p.pos_order_id}` === baseId || p.pos_order_id === baseId.replace('order_', ''));
        if (prod) {
            const desc = (prod.description || '').toLowerCase();
            if (desc.includes('arreglo') || desc.includes('basta') || desc.includes('acortar') || desc.includes('ajuste') || desc.includes('entallar') || desc.includes('achicar') || desc.includes('cambio') || desc.includes('cierre') || prod.order_type === 'b2b_batch') {
                return 'Arreglos';
            }
            return 'Confección';
        }
        return 'Venta General';
    };

    // 1. Volumen Comercial Real (Filtrado por fecha original del proyecto)
    let trueCommercialVolume = 0;
    const realViewSalesProcessed: any[] = [];
    const seenBaseIdsForReal = new Set();
    
    // Agrupar todos los pagos históricos por proyecto para calcular saldo real
    const allPaymentsByBaseId: Record<string, number> = {};
    salesList.forEach(s => {
        if (s.status === 'cancelled') return;
        const baseId = getBaseId(s.internal_id);
        if (s.status === 'completed' || s.status === 'paid' || s.status === 'partial') {
            allPaymentsByBaseId[baseId] = (allPaymentsByBaseId[baseId] || 0) + (Number(s.paid_amount) || 0);
        }
    });

    salesList.forEach(s => {
        if (s.status === 'cancelled') return;
        if (s.internal_id.includes('_balance_')) return;
        
        const baseId = getBaseId(s.internal_id);
        if (seenBaseIdsForReal.has(baseId)) return;
        
        const origDate = projectOriginalDates[baseId];
        if (!origDate) return;

        // Apply month/year filter based on PROJECT creation date for this view
        if (selectedYear && origDate.year !== selectedYear) return;
        if (selectedMonth && origDate.month !== selectedMonth) return;
        
        seenBaseIdsForReal.add(baseId);
        
        const project = bridalProjects.find(p => p.id === baseId);
        const realTotal = project && s.internal_id.startsWith('bridal_') ? Number(project.total_amount) : Number(s.total_amount);
        const totalAbono = allPaymentsByBaseId[baseId] || 0;
        
        trueCommercialVolume += realTotal;
        
        realViewSalesProcessed.push({
            ...s,
            id: baseId,
            real_total: realTotal,
            abono: totalAbono,
            saldo_pendiente: Math.max(0, realTotal - totalAbono),
            category: getCategory(s),
            created_at: s.created_at // Mantener fecha de la cuota principal para render
        });
    });
    
    const realViewSales = realViewSalesProcessed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 2. Caja Real Cobrada (Filtrado por fecha exacta del pago/transacción)
    const cajaViewSalesProcessed: any[] = [];
    let cashCollected = 0;
    
    const baseIdGroupsForCaja: Record<string, Sale[]> = {};
    salesList.forEach(s => {
        if (s.status === 'cancelled') return;
        const sParts = getChileDateParts(s.created_at);
        if (selectedYear && sParts.year !== selectedYear) return;
        if (selectedMonth && sParts.month !== selectedMonth) return;
        
        const baseId = s.internal_id.split('_balance_')[0];
        if (!baseIdGroupsForCaja[baseId]) baseIdGroupsForCaja[baseId] = [];
        baseIdGroupsForCaja[baseId].push({ ...s });
    });

    for (const baseId in baseIdGroupsForCaja) {
        const group = baseIdGroupsForCaja[baseId];
        const mainRow = group.find(s => !s.internal_id.includes('_balance_'));
        const balanceRows = group.filter(s => s.internal_id.includes('_balance_'));

        if (mainRow && balanceRows.length > 0) {
            const balancePaid = balanceRows.reduce((sum, s) => sum + (Number(s.paid_amount) || 0), 0);
            const totalAllowed = Number(mainRow.total_amount) || 0;
            if (balancePaid >= totalAllowed) {
                mainRow.paid_amount = 0;
            } else if ((Number(mainRow.paid_amount) || 0) + balancePaid > totalAllowed) {
                mainRow.paid_amount = totalAllowed - balancePaid;
            }
        }

        group.forEach(s => {
            if ((s.status === 'completed' || s.status === 'paid' || s.status === 'partial') && Number(s.paid_amount) > 0) {
                cashCollected += Number(s.paid_amount);
                cajaViewSalesProcessed.push({ ...s, category: getCategory(s) });
            }
        });
    }
    const cajaViewSales = cajaViewSalesProcessed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 3. Ventas Registradas (Cuotas del mes)
    const mainSales = salesList.filter(s => {
        if (s.status === 'cancelled' || s.internal_id.includes('_balance_')) return false;
        const sParts = getChileDateParts(s.created_at);
        if (selectedYear && sParts.year !== selectedYear) return false;
        if (selectedMonth && sParts.month !== selectedMonth) return false;
        return true;
    });
    const cuotasVolume = mainSales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);

    // 4. Ventas de Hoy
    const todaysMainSales = salesList.filter(s => {
        if (s.status === 'cancelled') return false;
        if (s.internal_id.includes('_balance_')) return false;
        const sParts = getChileDateParts(s.created_at);
        return sParts.dateStr === todayChileStr;
    });
    const todaySalesVolume = todaysMainSales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);

    // 5. Ventas Pendientes de Pago (ALL TIME)
    const pendingSalesListAllTime = salesList.filter(s => !s.internal_id.includes('_balance_') && (s.status === 'pending' || s.status === 'pending_terminal'));
    const pendientesViewSales = pendingSalesListAllTime.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(s => ({...s, category: getCategory(s)}));
    const pendingCount = pendingSalesListAllTime.length;
    const pendingAmountToCollect = pendingSalesListAllTime.reduce((sum, s) => sum + (Math.max(0, (Number(s.total_amount) || 0) - (Number(s.paid_amount) || 0))), 0);

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

                <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Ventas de Hoy</h3>
                        <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-serif text-brand-charcoal">{formatCurrency(todaySalesVolume)}</p>
                    <p className="text-[9px] text-gray-400 mt-1">{todaysMainSales.length} transacciones hoy (Hora Chile)</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div onClick={() => setSelectedView('real')} className={`cursor-pointer bg-white p-6 rounded-sm border ${selectedView === 'real' ? 'border-brand-terracotta ring-1 ring-brand-terracotta' : 'border-gray-100'} shadow-sm flex flex-col justify-between transition-all hover:border-brand-terracotta/50`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                            Volumen Comercial Real
                        </h3>
                        <DollarSign className="w-4 h-4 text-brand-terracotta" />
                    </div>
                    <p className="text-3xl font-serif text-brand-charcoal">{formatCurrency(trueCommercialVolume)}</p>
                    <p className="text-[10px] text-gray-400 mt-2">Valor total de proyectos creados</p>
                </div>

                <div onClick={() => setSelectedView('cuotas')} className={`cursor-pointer bg-white p-6 rounded-sm border ${selectedView === 'cuotas' ? 'border-brand-sand ring-1 ring-brand-sand' : 'border-gray-100'} shadow-sm flex flex-col justify-between transition-all hover:border-brand-sand/50`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                            Ventas Registradas (Cuotas)
                        </h3>
                        <DollarSign className="w-4 h-4 text-brand-sand" />
                    </div>
                    <p className="text-3xl font-serif text-brand-charcoal">{formatCurrency(cuotasVolume)}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{mainSales.length} órdenes (Pendientes + Pagadas)</p>
                </div>

                <div onClick={() => setSelectedView('caja')} className={`cursor-pointer bg-white p-6 rounded-sm border ${selectedView === 'caja' ? 'border-green-600 ring-1 ring-green-600' : 'border-gray-100'} shadow-sm flex flex-col justify-between transition-all hover:border-green-600/50`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Caja Real Cobrada</h3>
                        <Wallet className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-3xl font-serif text-brand-charcoal">{formatCurrency(cashCollected)}</p>
                    <p className="text-[10px] text-gray-400 mt-2">Pagos de las ventas de este período</p>
                </div>

                <div onClick={() => setSelectedView('pendientes')} className={`cursor-pointer bg-white p-6 rounded-sm border ${selectedView === 'pendientes' ? 'border-orange-400 ring-1 ring-orange-400' : 'border-gray-100'} shadow-sm flex flex-col justify-between transition-all hover:border-orange-400/50`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Ventas Pendientes</h3>
                        <Clock className="w-4 h-4 text-orange-400" />
                    </div>
                    <p className="text-3xl font-serif text-brand-charcoal">{pendingCount}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{formatCurrency(pendingAmountToCollect)} por cobrar histórico</p>
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
                        <AccountingBreakdownModal 
                            salesList={salesList} 
                            selectedYear={selectedYear} 
                            selectedMonth={selectedMonth} 
                        />
                        <button className="px-4 py-2 bg-brand-charcoal border border-brand-charcoal rounded-sm text-[10px] font-bold uppercase tracking-widest text-white hover:bg-brand-terracotta hover:border-brand-terracotta transition-colors">
                            Reporte Mensual
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {selectedView === 'real' ? (
                                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500">
                                    <th className="p-4 font-bold">Fecha</th>
                                    <th className="p-4 font-bold">Cliente</th>
                                    <th className="p-4 font-bold">Categoría</th>
                                    <th className="p-4 font-bold">Venta</th>
                                    <th className="p-4 font-bold">Abono (Total Pagado)</th>
                                    <th className="p-4 font-bold">Saldo Pendiente</th>
                                </tr>
                            ) : selectedView === 'caja' ? (
                                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500">
                                    <th className="p-4 font-bold">Fecha</th>
                                    <th className="p-4 font-bold">Cliente</th>
                                    <th className="p-4 font-bold">Categoría</th>
                                    <th className="p-4 font-bold">Abono / Pago Recibido</th>
                                    <th className="p-4 font-bold">Medio de Pago</th>
                                </tr>
                            ) : (
                                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500">
                                    <th className="p-4 font-bold">ID Transacción</th>
                                    <th className="p-4 font-bold">Fecha</th>
                                    <th className="p-4 font-bold">Cliente</th>
                                    <th className="p-4 font-bold">Monto</th>
                                    <th className="p-4 font-bold">Medio de Pago</th>
                                    <th className="p-4 font-bold">Estado</th>
                                    <th className="p-4 font-bold text-right">Acciones</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="text-sm text-gray-600">
                            {selectedView === 'real' ? (
                                realViewSales.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-gray-400 italic">No hay proyectos registrados en este período.</td></tr>
                                ) : (
                                    realViewSales.map((sale) => (
                                        <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                                            <td className="p-4 text-xs" suppressHydrationWarning>{formatDate(sale.created_at)}</td>
                                            <td className="p-4 font-serif text-brand-charcoal">{sale.customers?.full_name ? sale.customers.full_name : sale.customer_id ? `Cliente (${sale.customer_id.substring(0,6)})` : 'Cliente General'}</td>
                                            <td className="p-4"><span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-gray-100 rounded-sm">{sale.category}</span></td>
                                            <td className="p-4 font-bold text-brand-charcoal">{formatCurrency(sale.real_total)}</td>
                                            <td className="p-4 font-bold text-green-600">{formatCurrency(sale.abono)}</td>
                                            <td className="p-4 font-bold text-orange-500">{formatCurrency(sale.saldo_pendiente)}</td>
                                        </tr>
                                    ))
                                )
                            ) : selectedView === 'caja' ? (
                                cajaViewSales.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">No hay pagos registrados en este período.</td></tr>
                                ) : (
                                    cajaViewSales.map((sale) => (
                                        <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                                            <td className="p-4 text-xs" suppressHydrationWarning>{formatDate(sale.created_at)}</td>
                                            <td className="p-4 font-serif text-brand-charcoal">{sale.customers?.full_name ? sale.customers.full_name : sale.customer_id ? `Cliente (${sale.customer_id.substring(0,6)})` : 'Cliente General'}</td>
                                            <td className="p-4"><span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-gray-100 rounded-sm">{sale.category}</span></td>
                                            <td className="p-4 font-bold text-green-600">{formatCurrency(sale.paid_amount)}</td>
                                            <td className="p-4 capitalize"><div className="flex items-center gap-2"><CreditCard className="w-3 h-3 text-gray-400" />{sale.payment_method?.replace(/_/g, ' ') || 'No registrado'}</div></td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                (selectedView === 'pendientes' ? pendientesViewSales : mainSales).length === 0 ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-gray-400 italic">No hay registros para mostrar.</td></tr>
                                ) : (
                                    (selectedView === 'pendientes' ? pendientesViewSales : mainSales).map((sale) => (
                                        <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                                            <td className="p-4"><span className="font-bold text-brand-charcoal">{sale.internal_id}</span></td>
                                            <td className="p-4 text-xs" suppressHydrationWarning>{formatDate(sale.created_at)}</td>
                                            <td className="p-4 font-serif text-brand-charcoal">{sale.customers?.full_name ? sale.customers.full_name : sale.customer_id ? `Cliente (${sale.customer_id.substring(0,6)})` : 'Cliente General'}</td>
                                            <td className="p-4 font-bold text-brand-terracotta">{formatCurrency(sale.total_amount)}</td>
                                            <td className="p-4"><div className="flex items-center gap-2"><CreditCard className="w-3 h-3 text-gray-400" /><span className="capitalize">{sale.payment_method?.replace(/_/g, ' ') || 'No registrado'}</span></div></td>
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
                                                <button onClick={() => handleDeleteClick(sale)} className="text-[10px] uppercase font-bold text-rose-500 hover:text-rose-700 transition-colors inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Eliminar</button>
                                                <Link href={`/admin/sales/${sale.id}`} className="text-[10px] uppercase font-bold text-gray-400 hover:text-brand-terracotta transition-colors">Ver Detalle</Link>
                                            </td>
                                        </tr>
                                    ))
                                )
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
