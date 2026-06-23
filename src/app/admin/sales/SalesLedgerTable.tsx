'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Trash2, AlertCircle, Loader2 } from 'lucide-react';
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
    status: string;
    payment_method?: string;
    customer_id?: string;
}

interface SalesLedgerTableProps {
    sales: Sale[];
}

export default function SalesLedgerTable({ sales }: SalesLedgerTableProps) {
    const [salesList, setSalesList] = useState<Sale[]>(sales);
    
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
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('es-CL', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
            timeZone: 'America/Santiago'
        });
    };

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
        // Fallback master PIN is '2026' in case notifications fail
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

    return (
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
                        {salesList.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                                    No hay registros de ventas.
                                </td>
                            </tr>
                        ) : (
                            salesList.map((sale) => (
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

            {/* Authorization Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white max-w-sm w-full shadow-2xl rounded-sm overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-[#f8d7da] p-6 text-center border-b border-[#f5c6cb]">
                            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                                <AlertCircle className="w-6 h-6 text-[#721c24]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#721c24] mb-1">Autorización Requerida</h2>
                            <p className="text-xs text-[#721c24]/80">
                                {authMode === 'delete' ? 'Eliminación de Transacción' : 'Cambio de Estado de Transacción'}
                            </p>
                        </div>
                        <div className="p-6">
                            {isAuthorizing ? (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-terracotta mb-4" />
                                    <p className="text-sm text-center text-gray-600">Procesando solicitud de autorización...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-center text-gray-600">
                                        El administrador ha sido notificado. Por favor, ingrese el PIN de 4 dígitos para autorizar {
                                            authMode === 'delete' 
                                                ? `la eliminación de la venta ${pendingDeleteSale?.internal_id}` 
                                                : `el cambio de estado de la venta ${pendingStatusChange?.sale.internal_id} a ${
                                                    pendingStatusChange?.newStatus === 'completed' 
                                                        ? 'Pagado' 
                                                        : pendingStatusChange?.newStatus === 'pending' 
                                                            ? 'Pendiente' 
                                                            : 'Cancelada'
                                                }`
                                        }:
                                    </p>
                                    <input 
                                        type="text" 
                                        maxLength={4}
                                        value={authPinInput}
                                        onChange={(e) => setAuthPinInput(e.target.value.replace(/\D/g, ''))}
                                        className="w-full text-center text-3xl font-bold tracking-[0.5em] p-4 bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta"
                                        placeholder="••••"
                                        autoFocus
                                    />
                                    <div className="flex gap-3 pt-2">
                                        <button 
                                            onClick={() => {
                                                setShowAuthModal(false);
                                                setPendingDeleteSale(null);
                                                setPendingStatusChange(null);
                                                setAuthPinInput('');
                                                setExpectedPin('');
                                            }} 
                                            className="flex-1 py-3 border border-gray-200 text-gray-600 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={handleAuthorize}
                                            disabled={authPinInput.length !== 4}
                                            className="flex-1 py-3 bg-brand-terracotta text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-charcoal transition-all rounded-sm disabled:opacity-50"
                                        >
                                            Autorizar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
