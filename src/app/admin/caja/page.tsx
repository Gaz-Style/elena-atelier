'use client';

import React, { useState, useEffect } from 'react';
import { 
    Wallet, Plus, Minus, Lock, Unlock, RefreshCw, 
    TrendingUp, TrendingDown, DollarSign, CreditCard, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { 
    getCurrentCashRegisterAction, 
    openCashRegisterAction, 
    closeCashRegisterAction, 
    addCashMovementAction,
    getCashRegisterHistoryAction,
    getAllPendingOrdersAction,
    payOrderBalanceAction
} from './actions';
import { Search } from 'lucide-react';

export default function CajaPage() {
    const [register, setRegister] = useState<any>(null);
    const [calculated, setCalculated] = useState<any>(null);
    const [movements, setMovements] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modals
    const [showOpenModal, setShowOpenModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [showMovementModal, setShowMovementModal] = useState(false);
    const [showPendingOrdersModal, setShowPendingOrdersModal] = useState(false);
    const [movementType, setMovementType] = useState<'in' | 'out'>('out');
    
    // Pending Orders States
    const [pendingSearchTerm, setPendingSearchTerm] = useState('');
    const [allPendingOrders, setAllPendingOrders] = useState<any[]>([]);
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [selectedOrderToPay, setSelectedOrderToPay] = useState<any>(null);
    const [payBalanceAmount, setPayBalanceAmount] = useState<string>('');
    const [payBalanceMethod, setPayBalanceMethod] = useState<'efectivo' | 'transbank'>('efectivo');
    
    // Form States
    const [openingAmount, setOpeningAmount] = useState<string>('');
    const [closingAmount, setClosingAmount] = useState<string>('');
    const [movAmount, setMovAmount] = useState<string>('');
    const [movReason, setMovReason] = useState<string>('');
    const [closeNotes, setCloseNotes] = useState<string>('');
    
    const [isProcessing, setIsProcessing] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        const [currentRes, historyRes, pendingRes] = await Promise.all([
            getCurrentCashRegisterAction(),
            getCashRegisterHistoryAction(),
            getAllPendingOrdersAction()
        ]);
        
        if (currentRes.success) {
            setRegister(currentRes.register);
            setCalculated(currentRes.calculated);
            setMovements(currentRes.movements || []);
        }
        
        if (historyRes.success) {
            setHistory(historyRes.history || []);
        }
        
        if (pendingRes.success) {
            setAllPendingOrders(pendingRes.orders || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);
    };

    const handleOpenRegister = async () => {
        setIsProcessing(true);
        const amount = Number(openingAmount.replace(/[^0-9]/g, '')) || 0;
        const res = await openCashRegisterAction(amount, 'Administrador');
        if (res.success) {
            setShowOpenModal(false);
            setOpeningAmount('');
            loadData();
        } else {
            alert('Error: ' + res.error);
        }
        setIsProcessing(false);
    };

    const handleCloseRegister = async () => {
        if (!register) return;
        setIsProcessing(true);
        const amount = Number(closingAmount.replace(/[^0-9]/g, '')) || 0;
        const res = await closeCashRegisterAction(register.id, amount, 'Administrador', closeNotes);
        if (res.success) {
            setShowCloseModal(false);
            setClosingAmount('');
            setCloseNotes('');
            loadData();
        } else {
            alert('Error: ' + res.error);
        }
        setIsProcessing(false);
    };

    const handleAddMovement = async () => {
        if (!register) return;
        setIsProcessing(true);
        const amount = Number(movAmount.replace(/[^0-9]/g, '')) || 0;
        if (amount <= 0 || !movReason.trim()) {
            alert('Ingresa un monto válido y un motivo.');
            setIsProcessing(false);
            return;
        }
        
        const res = await addCashMovementAction(register.id, movementType, amount, movReason, 'Administrador');
        if (res.success) {
            setShowMovementModal(false);
            setMovAmount('');
            setMovReason('');
            loadData();
        } else {
            alert('Error: ' + res.error);
        }
        setIsProcessing(false);
    };

    useEffect(() => {
        if (!pendingSearchTerm.trim()) {
            setPendingOrders([]);
            return;
        }
        const term = pendingSearchTerm.toLowerCase();
        const filtered = allPendingOrders.filter(o => 
            (o.pos_order_id && o.pos_order_id.toLowerCase().includes(term)) ||
            (o.customers?.full_name && o.customers.full_name.toLowerCase().includes(term)) ||
            (o.customers?.email && o.customers.email.toLowerCase().includes(term)) ||
            (o.customers?.phone && o.customers.phone.toLowerCase().includes(term))
        );
        setPendingOrders(filtered);
    }, [pendingSearchTerm, allPendingOrders]);

    const handlePayBalance = async () => {
        if (!selectedOrderToPay) return;
        setIsProcessing(true);
        const amount = Number(payBalanceAmount.replace(/[^0-9]/g, '')) || 0;
        const maxToPay = selectedOrderToPay.total_amount - (selectedOrderToPay.paid_amount || 0);
        
        if (amount <= 0 || amount > maxToPay) {
            alert(`Monto inválido. El monto máximo a pagar es ${formatCurrency(maxToPay)}`);
            setIsProcessing(false);
            return;
        }

        const res = await payOrderBalanceAction(selectedOrderToPay.pos_order_id, amount, payBalanceMethod);
        if (res.success) {
            alert(`Pago registrado exitosamente. ${res.isFullyPaid ? 'La orden está 100% pagada.' : 'Aún queda saldo pendiente.'}`);
            setSelectedOrderToPay(null);
            setPayBalanceAmount('');
            loadData(); // Refresh caja and all orders
        } else {
            alert('Error registrando pago: ' + res.error);
        }
        setIsProcessing(false);
    };

    return (
        <div className="p-8 bg-[#FAF9F6] min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-serif text-brand-charcoal mb-2">Caja Diaria</h1>
                    <p className="text-gray-500 font-sans text-sm uppercase tracking-widest">
                        Cuadratura y flujo de efectivo
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <a 
                        href="/admin/pos"
                        className="flex items-center gap-2 px-4 py-2 bg-brand-charcoal text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#2a2a2a] rounded-sm transition-colors"
                    >
                        ← Volver al POS
                    </a>
                    <button 
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 rounded-sm"
                    >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-terracotta"></div>
                </div>
            ) : register ? (
                // CAJA ABIERTA
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Status Card */}
                        <div className="bg-brand-charcoal text-white p-6 rounded-sm shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Estado Actual</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <h2 className="text-xl font-serif tracking-wider">Caja Abierta</h2>
                                    </div>
                                </div>
                                <Unlock className="text-brand-terracotta w-6 h-6" />
                            </div>
                            
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Efectivo Físico Esperado</p>
                                    <p className="text-3xl font-light font-mono text-[#f5f2eb]">{formatCurrency(calculated?.expectedCash)}</p>
                                </div>
                                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Pagos en Tarjeta</p>
                                        <p className="text-sm font-mono text-white/80">{formatCurrency(calculated?.expectedCard)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div>
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                    <Wallet className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Saldo Inicial (Sencillo)</p>
                                <p className="text-xl font-bold text-gray-800 font-mono">{formatCurrency(register.opening_amount)}</p>
                            </div>
                            <p className="text-xs text-gray-400 font-serif italic">Abierta a las {new Date(register.opened_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>

                        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div>
                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mb-4">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Ventas Totales Efectivo</p>
                                <p className="text-xl font-bold text-gray-800 font-mono">
                                    {formatCurrency(calculated?.expectedCash - register.opening_amount - (movements.reduce((acc, m) => acc + (m.type === 'in' ? m.amount : -m.amount), 0)))}
                                </p>
                            </div>
                            <p className="text-xs text-gray-400 font-serif italic">{calculated?.salesCount} órdenes registradas</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => { setMovementType('out'); setShowMovementModal(true); }}
                                className="flex-1 bg-white border border-gray-200 text-brand-charcoal hover:bg-gray-50 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all shadow-sm"
                            >
                                <Minus className="w-4 h-4 text-red-500" /> Retiro Manual (Egreso)
                            </button>
                            <button 
                                onClick={() => { setMovementType('in'); setShowMovementModal(true); }}
                                className="flex-1 bg-white border border-gray-200 text-brand-charcoal hover:bg-gray-50 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4 text-green-500" /> Ingreso Manual (Vuelto)
                            </button>
                            <button 
                                onClick={() => setShowCloseModal(true)}
                                className="flex-[1.5] bg-brand-terracotta text-white hover:bg-[#b05f42] flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all shadow-md"
                            >
                                <Lock className="w-4 h-4" /> Realizar Cierre de Caja
                            </button>
                            <button
                                onClick={() => {
                                    setShowPendingOrdersModal(true);
                                    setPendingOrders([]);
                                    setPendingSearchTerm('');
                                }}
                                className="flex-1 bg-brand-charcoal text-white hover:bg-[#2a2a2a] flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all shadow-sm mt-2"
                            >
                                <Search className="w-4 h-4" /> Cobrar Saldo Pendiente
                            </button>
                        </div>
                    </div>

                    {/* Movements Table */}
                    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600">Movimientos Manuales del Turno</h3>
                        </div>
                        {movements.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 font-serif italic">
                                No se han registrado movimientos manuales en este turno.
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm font-sans">
                                <thead className="bg-white text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Hora</th>
                                        <th className="px-6 py-3 font-medium">Tipo</th>
                                        <th className="px-6 py-3 font-medium">Motivo</th>
                                        <th className="px-6 py-3 font-medium text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {movements.map((mov) => (
                                        <tr key={mov.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                {new Date(mov.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${mov.type === 'in' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {mov.type === 'in' ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                                    {mov.type === 'in' ? 'Ingreso' : 'Retiro'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{mov.reason}</td>
                                            <td className={`px-6 py-4 text-right font-mono font-medium ${mov.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                                {mov.type === 'in' ? '+' : '-'}{formatCurrency(mov.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ) : (
                // CAJA CERRADA
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 border-dashed rounded-sm shadow-sm animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Lock className="w-8 h-8 text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-serif text-brand-charcoal mb-2">La caja está cerrada</h2>
                    <p className="text-gray-500 font-sans text-sm mb-8 text-center max-w-md">
                        Abre la caja ingresando el sencillo disponible para comenzar a registrar las ventas en efectivo del turno.
                    </p>
                    <button 
                        onClick={() => setShowOpenModal(true)}
                        className="px-8 py-4 bg-brand-charcoal text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#2a2a2a] transition-colors rounded-sm shadow-lg flex items-center gap-2"
                    >
                        <Unlock className="w-4 h-4" /> Abrir Caja Ahora
                    </button>
                </div>
            )}

            {/* HISTORIAL */}
            <div className="mt-16">
                <h3 className="text-xl font-serif text-brand-charcoal mb-6 border-b border-gray-200 pb-2">Historial de Cuadraturas</h3>
                <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 font-serif italic">
                            No hay registros históricos de cajas cerradas.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm font-sans">
                                <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Fecha / Turno</th>
                                        <th className="px-6 py-4 font-bold text-right">Saldo Inicial</th>
                                        <th className="px-6 py-4 font-bold text-right">Efectivo Declarado</th>
                                        <th className="px-6 py-4 font-bold text-right">Sistema Esperaba</th>
                                        <th className="px-6 py-4 font-bold text-right">Descuadre</th>
                                        <th className="px-6 py-4 font-bold text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {history.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800">
                                                        {new Date(reg.opened_at).toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit', month: 'short' })}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(reg.opened_at).toLocaleTimeString('es-CL', {hour:'2-digit', minute:'2-digit'})} - {new Date(reg.closed_at).toLocaleTimeString('es-CL', {hour:'2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-gray-500">
                                                {formatCurrency(reg.opening_amount)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-medium text-gray-800">
                                                {formatCurrency(reg.closing_amount)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-gray-500">
                                                {formatCurrency(reg.expected_cash)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono">
                                                {reg.difference === 0 ? (
                                                    <span className="text-green-600 font-bold">$0</span>
                                                ) : reg.difference > 0 ? (
                                                    <span className="text-blue-600 font-bold">+{formatCurrency(reg.difference)}</span>
                                                ) : (
                                                    <span className="text-red-600 font-bold">{formatCurrency(reg.difference)}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {reg.difference === 0 ? (
                                                    <span className="inline-flex items-center justify-center p-1 bg-green-50 text-green-600 rounded-full" title="Cuadrado Perfectamente">
                                                        <CheckCircle className="w-5 h-5" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center p-1 bg-red-50 text-red-600 rounded-full" title="Descuadre Encontrado">
                                                        <AlertCircle className="w-5 h-5" />
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            
            {/* Modal Apertura */}
            {showOpenModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-brand-charcoal text-white px-6 py-4">
                            <h2 className="text-lg font-serif">Abrir Caja del Día</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Efectivo Físico Inicial (Sencillo)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-lg">$</span>
                                    <input 
                                        type="text" 
                                        value={openingAmount}
                                        onChange={(e) => {
                                            const num = e.target.value.replace(/[^0-9]/g, '');
                                            setOpeningAmount(num ? new Intl.NumberFormat('es-CL').format(Number(num)) : '');
                                        }}
                                        className="w-full border border-gray-200 rounded-sm pl-8 pr-4 py-3 font-mono text-xl outline-none focus:border-brand-charcoal transition-colors"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2 font-serif italic">Ingresa el monto con el que comienzas la caja hoy.</p>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => setShowOpenModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleOpenRegister}
                                    disabled={isProcessing}
                                    className="flex-1 py-3 bg-brand-charcoal text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                                >
                                    {isProcessing ? 'Abriendo...' : 'Abrir Caja'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ingreso/Egreso */}
            {showMovementModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className={`px-6 py-4 text-white ${movementType === 'in' ? 'bg-green-600' : 'bg-red-600'}`}>
                            <h2 className="text-lg font-serif">{movementType === 'in' ? 'Ingreso de Efectivo Extra' : 'Retiro de Efectivo'}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Monto</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-lg">$</span>
                                    <input 
                                        type="text" 
                                        value={movAmount}
                                        onChange={(e) => {
                                            const num = e.target.value.replace(/[^0-9]/g, '');
                                            setMovAmount(num ? new Intl.NumberFormat('es-CL').format(Number(num)) : '');
                                        }}
                                        className="w-full border border-gray-200 rounded-sm pl-8 pr-4 py-3 font-mono text-xl outline-none focus:border-brand-charcoal transition-colors"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Motivo</label>
                                <input 
                                    type="text" 
                                    value={movReason}
                                    onChange={(e) => setMovReason(e.target.value)}
                                    className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm outline-none focus:border-brand-charcoal transition-colors"
                                    placeholder={movementType === 'in' ? 'Ej. Sencillo adicional' : 'Ej. Compra de hilos'}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => setShowMovementModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleAddMovement}
                                    disabled={isProcessing}
                                    className={`flex-1 py-3 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50 ${movementType === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {isProcessing ? 'Guardando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Cierre */}
            {showCloseModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-brand-terracotta text-white px-6 py-4">
                            <h2 className="text-lg font-serif">Cuadratura y Cierre de Caja</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            
                            <div className="bg-orange-50 text-orange-800 p-4 rounded-sm border border-orange-100 text-sm font-sans">
                                <p>El sistema espera que haya <strong>{formatCurrency(calculated?.expectedCash)}</strong> en físico (Efectivo).</p>
                                <p className="mt-1 text-xs opacity-80">Por favor, cuenta el dinero físico y decláralo abajo. Las tarjetas se cuadran de forma automática.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Efectivo Real en Caja (Conteado)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-lg">$</span>
                                    <input 
                                        type="text" 
                                        value={closingAmount}
                                        onChange={(e) => {
                                            const num = e.target.value.replace(/[^0-9]/g, '');
                                            setClosingAmount(num ? new Intl.NumberFormat('es-CL').format(Number(num)) : '');
                                        }}
                                        className="w-full border border-gray-200 rounded-sm pl-8 pr-4 py-3 font-mono text-xl outline-none focus:border-brand-terracotta transition-colors"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Notas (Opcional)</label>
                                <textarea 
                                    value={closeNotes}
                                    onChange={(e) => setCloseNotes(e.target.value)}
                                    className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm outline-none focus:border-brand-terracotta transition-colors resize-none h-20"
                                    placeholder="Justificación si hay descuadre..."
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button 
                                    onClick={() => setShowCloseModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleCloseRegister}
                                    disabled={isProcessing}
                                    className="flex-[1.5] py-3 bg-brand-terracotta text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#b05f42] transition-colors disabled:opacity-50"
                                >
                                    {isProcessing ? 'Cerrando...' : 'Confirmar Cierre'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Cobro Pendiente */}
            {showPendingOrdersModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="bg-brand-charcoal text-white px-6 py-4 flex justify-between items-center shrink-0">
                            <h2 className="text-lg font-serif">Cobrar Saldo Pendiente</h2>
                            <button onClick={() => setShowPendingOrdersModal(false)} className="text-white/60 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {!selectedOrderToPay ? (
                                <div className="space-y-6">
                                    <div className="relative w-full">
                                            <input 
                                                type="text" 
                                                value={pendingSearchTerm}
                                                onChange={(e) => setPendingSearchTerm(e.target.value)}
                                                className="w-full border border-gray-200 rounded-sm px-4 py-3 text-sm outline-none focus:border-brand-charcoal transition-colors pr-10"
                                                placeholder="Buscar por cliente, teléfono o Nº de orden (ej. order_12345)"
                                                autoFocus
                                            />
                                        </div>
                                    
                                    <div className="space-y-3">
                                        {pendingOrders.map(order => {
                                            const total = order.sales_ledger?.total_amount || 0;
                                            const paid = order.paid_amount || 0;
                                            const balance = total - paid;
                                            return (
                                                <div key={order.id} className="border border-gray-100 rounded-sm p-4 flex justify-between items-center hover:border-brand-terracotta/50 transition-colors bg-gray-50/30">
                                                    <div>
                                                        <p className="font-bold text-sm text-brand-charcoal">{order.customers?.full_name || 'Cliente sin nombre'}</p>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">Orden: {order.pos_order_id} • Tel: {order.customers?.phone}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-sm font-bold uppercase tracking-wider">Saldo Pendiente</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-2">
                                                        <div className="text-sm">
                                                            <p className="text-gray-500">Total: {formatCurrency(total)}</p>
                                                            <p className="text-brand-terracotta font-bold">Por pagar: {formatCurrency(balance)}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedOrderToPay(order);
                                                                setPayBalanceAmount(new Intl.NumberFormat('es-CL').format(balance));
                                                            }}
                                                            className="px-4 py-1.5 bg-brand-terracotta text-white text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-[#b05f42]"
                                                        >
                                                            Pagar Saldo
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {pendingOrders.length === 0 && pendingSearchTerm && (
                                            <p className="text-center text-sm text-gray-500 italic py-4">No se encontraron órdenes pendientes con ese criterio.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <button 
                                        onClick={() => setSelectedOrderToPay(null)}
                                        className="text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-brand-charcoal flex items-center gap-1"
                                    >
                                        ← Volver a resultados
                                    </button>
                                    
                                    <div className="bg-brand-charcoal/5 p-4 rounded-sm border border-brand-charcoal/10">
                                        <p className="text-sm font-bold text-brand-charcoal mb-1">Orden: {selectedOrderToPay.pos_order_id}</p>
                                        <p className="text-xs text-gray-600 mb-3">{selectedOrderToPay.customers?.full_name}</p>
                                        <div className="grid grid-cols-2 gap-4 border-t border-brand-charcoal/10 pt-3 mt-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500">Total Orden</p>
                                                <p className="font-mono text-sm">{formatCurrency(selectedOrderToPay.sales_ledger?.total_amount || 0)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-brand-terracotta">Saldo a Pagar</p>
                                                <p className="font-mono text-lg font-bold text-brand-terracotta">
                                                    {formatCurrency((selectedOrderToPay.sales_ledger?.total_amount || 0) - (selectedOrderToPay.paid_amount || 0))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Monto que paga ahora</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-lg">$</span>
                                            <input 
                                                type="text" 
                                                value={payBalanceAmount}
                                                onChange={(e) => {
                                                    const num = e.target.value.replace(/[^0-9]/g, '');
                                                    setPayBalanceAmount(num ? new Intl.NumberFormat('es-CL').format(Number(num)) : '');
                                                }}
                                                className="w-full border border-gray-200 rounded-sm pl-8 pr-4 py-3 font-mono text-xl outline-none focus:border-brand-charcoal transition-colors"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Método de Pago</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => setPayBalanceMethod('efectivo')}
                                                className={`py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-all ${payBalanceMethod === 'efectivo' ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-charcoal'}`}
                                            >
                                                Efectivo / Transferencia
                                            </button>
                                            <button 
                                                onClick={() => setPayBalanceMethod('transbank')}
                                                className={`py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-all ${payBalanceMethod === 'transbank' ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-charcoal'}`}
                                            >
                                                Tarjeta (Máquina / Online)
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={handlePayBalance}
                                        disabled={isProcessing}
                                        className="w-full py-4 bg-green-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-green-700 transition-colors disabled:opacity-50 mt-4 shadow-md"
                                    >
                                        {isProcessing ? 'Procesando...' : 'Confirmar Pago de Saldo'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
