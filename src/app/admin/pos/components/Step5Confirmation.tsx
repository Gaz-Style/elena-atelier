'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from './POSContext';
import { CheckCircle, Printer, MessageSquare, Plus, ExternalLink, Copy, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendOrderConfirmationEmailAction, checkOrderStatusAction } from '@/app/admin/pos/actions';

export default function Step5Confirmation() {
  const { 
    checkoutResult,
    selectedCustomer,
    setCurrentStep,
    setSelectedCustomer,
    clearCart,
    setDeadline,
    setPaymentMethod,
  } = usePOS();

  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const isTerminal = checkoutResult?.method === 'mercadopago_point' || checkoutResult?.isMixedTerminal;
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(!isTerminal);
  const [confirmedPaidAmount, setConfirmedPaidAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!checkoutResult || !isTerminal || isPaymentConfirmed) return;

    const checkStatus = async () => {
      try {
        const orderIdStr = checkoutResult.orderId ?? checkoutResult.order_number ?? checkoutResult.internal_id;
        if (!orderIdStr) return;
        
        const posOrderId = `order_${orderIdStr}`;
        const res = await checkOrderStatusAction(posOrderId);
        
        if (res.success) {
          if (res.status === 'paid' || res.status === 'completed' || (res.paidAmount !== undefined && checkoutResult.total !== undefined && res.paidAmount >= checkoutResult.total)) {
            setIsPaymentConfirmed(true);
            setConfirmedPaidAmount(res.paidAmount ?? checkoutResult.total);
          } else if (res.status === 'canceled' || res.status === 'rejected' || res.status === 'abandoned') {
            alert('El pago fue rechazado o cancelado en el terminal. Por favor, inténtelo de nuevo o seleccione otro método de pago.');
            clearInterval(intervalId);
            setCurrentStep(4);
          }
        }
      } catch (err) {
        console.error("Error polling order status:", err);
      }
    };

    const intervalId = setInterval(checkStatus, 3000);
    return () => clearInterval(intervalId);
  }, [checkoutResult, isPaymentConfirmed]);

  const handleNewSale = () => {
    setSelectedCustomer(null);
    clearCart();
    setDeadline('');
    setPaymentMethod(null);
    setCurrentStep(1);
  };

  const handleCancelTerminalPayment = () => {
    setCurrentStep(4);
  };

  const handleResendEmail = async () => {
    if (!checkoutResult?.customer?.email) return;
    setIsSending(true);
    try {
      const res = await sendOrderConfirmationEmailAction({
        customerEmail: checkoutResult.customer.email,
        customerName: checkoutResult.customer.full_name,
        orderId: checkoutResult.orderId,
        items: (checkoutResult.items || []).map((item: any) => ({
          name: item.name,
          price: item.price,
          category: item.category,
          notes: item.details?.notes || item.notes || '',
        })),
        total: checkoutResult.total,
        paymentMethod: checkoutResult.method || '',
        date: checkoutResult.date || new Date().toLocaleDateString('es-CL'),
        deliveryDate: checkoutResult.deliveryDate || '',
        paymentUrl: checkoutResult.paymentUrl || '',
      });
      if (res.success) {
        alert('¡Comprobante enviado por correo con éxito!');
      } else {
        alert('Error al enviar correo: ' + res.error);
      }
    } catch (e) {
      alert('Error al enviar correo.');
    } finally {
      setIsSending(false);
    }
  };

  const handleWhatsApp = () => {
    if (!checkoutResult?.customer?.phone) return;
    const deliveryInfo = checkoutResult.deliveryDate ? `Entrega estimada: ${checkoutResult.deliveryDate}\n` : '';
    const paymentText = checkoutResult.paymentUrl
      ? `\n💳 Paga en línea de forma segura aquí: ${checkoutResult.paymentUrl}\n`
      : '';
    const message = encodeURIComponent(
      `¡Hola ${checkoutResult.customer.full_name?.split(' ')[0]}! 🎀\n\nTu pieza ya ingresó al atelier y está en proceso.\nOrden #: ${checkoutResult.orderId}\nTotal: $${checkoutResult.total?.toLocaleString('es-CL')} CLP\n${deliveryInfo}${paymentText}\nSi tienes dudas, contáctanos.\n\n- Elena La Costurera`
    );
    const cleanPhone = checkoutResult.customer.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleCopyPaymentLink = () => {
    if (!checkoutResult?.paymentUrl) return;
    navigator.clipboard.writeText(checkoutResult.paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!checkoutResult) return null;

  if (!isPaymentConfirmed) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-8 animate-in zoom-in-95 duration-500 mt-16">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 border-4 border-amber-200 rounded-full animate-ping opacity-20"></div>
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin relative z-10" />
          </div>
          <div className="space-y-3">
            <h2 className="font-serif text-3xl text-zinc-900">Esperando Terminal...</h2>
            <p className="text-zinc-500 max-w-sm mx-auto text-sm">
              Por favor, pide al cliente que pase su tarjeta por la máquina de Mercado Pago. Esta pantalla se actualizará automáticamente.
            </p>
          </div>
        </div>
        
        <div className="pt-8 max-w-xs mx-auto">
          <button
            onClick={handleCancelTerminalPayment}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm border border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
          >
            <XCircle className="w-4 h-4" />
            Cancelar y Cambiar Método
          </button>
        </div>
      </div>
    );
  }

  const paidAmount = confirmedPaidAmount ?? checkoutResult.paidAmount ?? checkoutResult.paid_amount ?? 0;
  const orderId = checkoutResult.orderId ?? checkoutResult.order_number ?? checkoutResult.internal_id ?? 'XXX';
  const methodLabel = checkoutResult.method === 'mercadopago_point' ? 'Mercado Pago Point'
    : checkoutResult.method === 'transbank' ? 'Webpay Plus'
    : checkoutResult.method === 'cash' ? 'Efectivo / Transferencia'
    : checkoutResult.method || '—';

  return (
    <div className="max-w-xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-500 mt-10">
      <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-emerald-500" />
      </div>
      
      <h2 className="font-serif text-4xl text-zinc-900 tracking-tight">¡Orden Creada con Éxito!</h2>
      <p className="text-zinc-500 text-lg">
        La orden de <strong>{selectedCustomer?.full_name || checkoutResult.customer?.full_name}</strong> ha sido registrada y enviada al taller.
      </p>

      {/* Order Details Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-left max-w-sm mx-auto shadow-sm mt-8 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">ID de Orden</span>
          <span className="font-semibold text-zinc-900">WO-{orderId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Total Orden</span>
          <span className="font-semibold text-zinc-900">${checkoutResult.total?.toLocaleString('es-CL')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Monto Pagado</span>
          <span className={`font-semibold ${paidAmount > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            ${paidAmount.toLocaleString('es-CL')}
          </span>
        </div>
        {paidAmount < checkoutResult.total && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Saldo Pendiente</span>
            <span className="font-semibold text-red-500">${(checkoutResult.total - paidAmount).toLocaleString('es-CL')}</span>
          </div>
        )}
        {checkoutResult.method && (
          <div className="flex justify-between text-sm border-t border-zinc-100 pt-2 mt-2">
            <span className="text-zinc-500">Método de Pago</span>
            <span className="font-semibold text-zinc-700 text-right">{methodLabel}</span>
          </div>
        )}
        {checkoutResult.deliveryDate && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Fecha Entrega</span>
            <span className="font-semibold text-zinc-700">{checkoutResult.deliveryDate}</span>
          </div>
        )}
      </div>

      {/* Payment Link (Contra Entrega / Transbank) */}
      {checkoutResult.paymentUrl && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm mx-auto text-left">
          <p className="text-[10px] uppercase tracking-widest font-bold text-amber-700 mb-2">Link de Pago Online</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={checkoutResult.paymentUrl}
              className="flex-1 bg-white border border-amber-200 px-3 py-1.5 text-xs rounded-sm text-zinc-600 outline-none"
            />
            <button
              onClick={handleCopyPaymentLink}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-sm transition-all flex items-center gap-1 ${
                copied ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
              }`}
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button
              onClick={() => window.open(checkoutResult.paymentUrl, '_blank')}
              className="px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-bold rounded-sm hover:bg-zinc-700 transition-all"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[10px] text-amber-600 mt-2">Comparte este link con la clienta para que pague online.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-8 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full flex items-center justify-center gap-2 py-3.5 text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm border border-zinc-200 hover:border-zinc-900 text-zinc-700 bg-white"
        >
          <Printer className="w-4 h-4 text-[#C17B5C]" />
          Imprimir Recibo
        </button>

        {checkoutResult.customer?.email && (
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm border border-zinc-200 hover:border-zinc-900 text-zinc-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Enviando...' : 'Reenviar por Email'}
          </button>
        )}

        {checkoutResult.customer?.phone && (
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm border border-emerald-200 hover:border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Enviar Comprobante WP
          </button>
        )}
      </div>

      <div className="pt-4 max-w-sm mx-auto w-full">
        <button
          type="button"
          onClick={handleNewSale}
          className="w-full flex items-center justify-center gap-2 py-4 text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Venta
        </button>
      </div>
    </div>
  );
}
