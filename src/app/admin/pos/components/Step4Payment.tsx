'use client';

import React, { useState } from 'react';
import { usePOS } from './POSContext';
import { createPOSOrdersAction, saveBudgetAction, sendBudgetEmailAction, wakeUpMercadoPagoTerminalAction, checkDesignExclusivityAction, sendOrderConfirmationEmailAction, sendWhatsAppPaymentConfirmationAction } from '@/app/admin/pos/actions';
import { payOrderBalanceAction } from '@/app/admin/caja/actions';
import { CreditCard, Wallet, AlertCircle, Globe, Loader2, Copy, Mail, MessageSquare, X } from 'lucide-react';

export default function Step4Payment() {
  const { 
    cart, 
    selectedCustomer, 
    deadline, 
    setCurrentStep, 
    paymentMethod, 
    setPaymentMethod,
    initialPaymentType,
    setInitialPaymentType,
    splitCashAmount,
    setSplitCashAmount,
    splitCardAmount,
    setSplitCardAmount,
    setCheckoutResult,
    isCajaOpen,
    posMode,
    pendingOrderToPay,
    setPosMode,
    clearCart
  } = usePOS();
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Budget modal state (same as old POS)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);

  const [exclusivityType, setExclusivityType] = useState('none');
  const [exclusivityEventId, setExclusivityEventId] = useState('');
  const [exclusivityDesignName, setExclusivityDesignName] = useState('');

  const total = posMode === 'pay_balance' && pendingOrderToPay 
    ? pendingOrderToPay.balance 
    : cart.reduce((sum, item) => sum + item.price, 0);
  
  let amountToPay = 0;
  if (initialPaymentType === 'total' || posMode === 'pay_balance') amountToPay = total;
  else if (initialPaymentType === '50percent') amountToPay = Math.round(total / 2);
  else if (initialPaymentType === 'zero') amountToPay = 0;

  // ─── Budget generation: opens modal with WhatsApp & Email sharing (same as old POS) ───
  const generateBudgetLink = async () => {
    setIsGeneratingBudget(true);
    try {
      const orderId = Math.floor(Math.random() * 90000) + 10000;
      const posOrderId = `budget_${orderId}`;
      const budgetData = {
        cart: cart.map(item => ({ ...item, images: undefined })),
        total: total,
        date: new Date().toISOString(),
        customerId: selectedCustomer ? selectedCustomer?.id : null,
        customerName: selectedCustomer ? selectedCustomer?.full_name : null,
        customerEmail: selectedCustomer ? selectedCustomer?.email : null,
        customerPhone: selectedCustomer ? selectedCustomer.phone : null,
        posOrderId: posOrderId,
      };
      const result = await saveBudgetAction(budgetData);
      if (result.success && result.id) {
        const baseUrl = window.location.origin.includes('localhost') 
          ? 'https://elenalacosturera.cl' 
          : window.location.origin;
        const link = `${baseUrl}/presupuesto?id=${result.id}`;
        setGeneratedLink(link);
        if (selectedCustomer) {
          setClientPhone(selectedCustomer.phone || '');
          setClientEmail(selectedCustomer?.email || '');
          // Auto-send email if customer has email
          if (selectedCustomer?.email) {
            setIsSendingEmail(true);
            sendBudgetEmailAction({
              customerEmail: selectedCustomer?.email,
              customerName: selectedCustomer?.full_name || 'Estimada Clienta',
              budgetLink: link,
              items: cart.map(item => ({
                name: item.name,
                price: item.price,
                category: item.category,
                notes: item.details?.notes || ''
              })),
              total: total
            }).then(res => {
              if (!res.success) console.error('Error auto-sending budget email:', res.error);
            }).catch(err => console.error('Error auto-sending budget email:', err))
              .finally(() => setIsSendingEmail(false));
          }
        }
        setIsBudgetModalOpen(true);
      } else {
        alert('Error al generar el link: ' + (result.error || 'Desconocido'));
      }
    } catch (error) {
      console.error('Error in generateBudgetLink:', error);
      alert('Error al conectar con el servidor.');
    } finally {
      setIsGeneratingBudget(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const shareViaWhatsApp = () => {
    if (!clientPhone) return;
    const message = encodeURIComponent(`¡Hola! Te envío el presupuesto formal de Elena Atelier para tu proyecto de alta costura. Puedes verlo y aceptarlo aquí: ${generatedLink}`);
    const cleanPhone = clientPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const shareViaEmail = async () => {
    if (!clientEmail) return;
    setIsSendingEmail(true);
    try {
      const res = await sendBudgetEmailAction({
        customerEmail: clientEmail,
        customerName: selectedCustomer?.full_name || 'Estimada Clienta',
        budgetLink: generatedLink,
        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          category: item.category,
          notes: item.details?.notes || ''
        })),
        total: total
      });
      if (res.success) {
        alert('¡El presupuesto ha sido enviado con éxito a la clienta por correo corporativo!');
      } else {
        alert('Error al enviar el correo: ' + res.error);
      }
    } catch (e) {
      console.error(e);
      alert('Error al enviar correo.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleProcessPayment = async () => {
    if (initialPaymentType !== 'zero' && !paymentMethod) return alert("Selecciona un método de pago");
    if (posMode === 'new_sale' && !selectedCustomer) return alert("Selecciona un cliente para continuar");
    
    setIsProcessing(true);
    try {
      // Exclusivity Check
      if (exclusivityType !== 'none' && posMode === 'new_sale') {
        if (!exclusivityEventId.trim() || !exclusivityDesignName.trim()) {
          alert("Debes ingresar el colegio/evento y el nombre del diseño para la exclusividad.");
          setIsProcessing(false);
          return;
        }
        try {
          const check = await checkDesignExclusivityAction(exclusivityType as 'graduacion' | 'novias', exclusivityEventId, exclusivityDesignName);
          if (check.success && !check.available) {
            alert(`⚠️ Conflicto de Exclusividad: El diseño "${exclusivityDesignName}" ya está registrado para "${exclusivityEventId}".`);
            setIsProcessing(false);
            return;
          }
        } catch (e) {
          console.error("Error al validar exclusividad", e);
        }
      }

      const newOrderIdNumber = Math.floor(Math.random() * 90000) + 10000;
      let finalOrderIdStr = `order_${newOrderIdNumber}`;

      let finalPaymentMethodStr = initialPaymentType === 'zero'
        ? 'Pago Contra Entrega'
        : paymentMethod === 'cash' && splitCardAmount > 0 
        ? `Mixto (Máquina: $${splitCardAmount.toLocaleString('es-CL')}, Efectivo: $${splitCashAmount.toLocaleString('es-CL')})` 
        : paymentMethod === 'cash' ? 'Efectivo / Transferencia'
        : paymentMethod ?? '';

      // paymentUrl: only generated for Contra Entrega and Transbank (same as old POS)
      let paymentUrl = '';
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.elenalacosturera.cl';
      if (initialPaymentType === 'zero') {
        paymentUrl = `${siteUrl}/pagar/${finalOrderIdStr}?amount=${total}`;
      } else if (paymentMethod === 'transbank') {
        paymentUrl = `${siteUrl}/pagar/${finalOrderIdStr}?amount=${amountToPay}`;
      }

      let finalPaidAmount = amountToPay;
      let finalPaymentStatus = initialPaymentType === 'total' ? 'completed' : initialPaymentType === '50percent' ? 'partial' : 'pending';
      const isMixedTerminal = paymentMethod === 'cash' && splitCardAmount > 0;
      if (initialPaymentType !== 'zero' && (paymentMethod === 'mercadopago_point' || paymentMethod === 'transbank' || isMixedTerminal)) {
        finalPaymentStatus = 'pending_terminal';
        finalPaidAmount = isMixedTerminal ? splitCashAmount : 0;
      }

      const dateStr = new Date().toLocaleDateString('es-CL');
      const deliveryDateStr = deadline ? new Date(deadline).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

      // Pay balance (existing order)
      if (posMode === 'pay_balance' && pendingOrderToPay) {
        finalOrderIdStr = pendingOrderToPay.internal_id;
        const res = await payOrderBalanceAction(
          finalOrderIdStr,
          amountToPay,
          finalPaymentMethodStr || 'Desconocido',
          finalPaymentStatus === 'pending_terminal'
        );
        if (!res.success) {
          alert("Error al saldar deuda: " + res.error);
          setIsProcessing(false);
          return;
        }
        if (paymentMethod === 'mercadopago_point') {
          wakeUpMercadoPagoTerminalAction(amountToPay, "Pago Saldo - " + finalOrderIdStr, finalOrderIdStr).catch(console.error);
        }
        // Send confirmation email with payment link for transbank balance payments
        if (selectedCustomer?.email && paymentMethod !== 'mercadopago_point') {
          sendOrderConfirmationEmailAction({
            customerEmail: selectedCustomer?.email,
            customerName: selectedCustomer?.full_name,
            orderId: Number(finalOrderIdStr.replace('order_', '')) || 0,
            items: cart.map(item => ({ name: item.name, price: item.price, category: item.category, notes: item.details?.notes || '' })),
            total: amountToPay,
            paymentMethod: finalPaymentMethodStr,
            date: dateStr,
            deliveryDate: deadline || '',
            deliveryWindowStart: '15:00',
            deliveryWindowEnd: '18:00',
            paymentUrl: paymentUrl,
            subject: 'Link de Pago - Saldo de Orden - ELENA La Costurera'
          }).catch(err => console.error("Error sending email", err));
        }
        setCheckoutResult({ orderId: finalOrderIdStr.replace('order_', ''), customer: selectedCustomer, total, paidAmount: amountToPay, items: cart, paymentUrl, date: dateStr, deliveryDate: deliveryDateStr, method: paymentMethod });
        setCurrentStep(5);
        return;
      }

      // New sale: Contra Entrega
      if (initialPaymentType === 'zero') {
        const orderData = {
          customerId: selectedCustomer!.id,
          posOrderId: finalOrderIdStr,
          paymentMethod: finalPaymentMethodStr,
          paymentStatus: 'pending',
          paidAmount: 0,
          items: cart.map(item => ({
            name: item.name, price: item.price, category: item.category,
            hours: Number(item.details?.hours || 2), notes: item.details?.notes || '',
            isCustom: !!item.isCustom, assignedOperatorId: item.assignedOperatorId || 'unassigned',
            scheduledStartDate: item.scheduledStartDate || undefined,
            productionStartDate: item.productionStartDate || undefined,
            productionEndDate: item.productionEndDate || undefined
          })),
          deadline: deadline || null,
          exclusividad: exclusivityType !== 'none' ? { tipo: exclusivityType as 'graduacion' | 'novias', identificador: exclusivityEventId, diseno: exclusivityDesignName } : undefined
        };
        const result = await createPOSOrdersAction(orderData);
        if (result.success) {
          // Email WITH payment link for Contra Entrega
          if (selectedCustomer?.email) {
            sendOrderConfirmationEmailAction({
              customerEmail: selectedCustomer?.email,
              customerName: selectedCustomer?.full_name,
              orderId: newOrderIdNumber,
              items: cart.map(item => ({ name: item.name, price: item.price, category: item.category, notes: item.details?.notes || '' })),
              total: total,
              paymentMethod: 'Pago Contra Entrega',
              date: dateStr,
              deliveryDate: deadline || '',
              deliveryWindowStart: '15:00',
              deliveryWindowEnd: '18:00',
              paymentUrl: paymentUrl  // includes payment link so client can pay online
            }).catch(err => console.error("Error sending email", err));
          }
          setCheckoutResult({ ...result, orderId: finalOrderIdStr.replace('order_', ''), customer: selectedCustomer, total, paidAmount: 0, items: cart, paymentUrl, date: dateStr, deliveryDate: deliveryDateStr, method: paymentMethod });
          setCurrentStep(5);
        } else {
          alert("Error al procesar la orden: " + result.error);
        }
        return;
      }

      // New sale: paid methods
      if (paymentMethod === 'mercadopago_point' || isMixedTerminal) {
        const amountForTerminal = isMixedTerminal ? splitCardAmount : amountToPay;
        wakeUpMercadoPagoTerminalAction(amountForTerminal, "Orden #" + newOrderIdNumber, finalOrderIdStr).catch(console.error);
      }

      const orderData = {
        customerId: selectedCustomer!.id,
        posOrderId: finalOrderIdStr,
        paymentMethod: finalPaymentMethodStr || undefined,
        paymentStatus: finalPaymentStatus,
        paidAmount: finalPaidAmount,
        items: cart.map(item => ({
          name: item.name, price: item.price, category: item.category,
          hours: Number(item.details?.hours || 2), notes: item.details?.notes || '',
          isCustom: !!item.isCustom, assignedOperatorId: item.assignedOperatorId || 'unassigned',
          scheduledStartDate: item.scheduledStartDate || undefined
        })),
        deadline: deadline || null,
        splitCashAmount: isMixedTerminal ? splitCashAmount : undefined,
        splitCardAmount: isMixedTerminal ? splitCardAmount : undefined,
        exclusividad: exclusivityType !== 'none' ? { tipo: exclusivityType as 'graduacion' | 'novias', identificador: exclusivityEventId, diseno: exclusivityDesignName } : undefined
      };

      const result = await createPOSOrdersAction(orderData);
      
      if (result.success) {
        // Email WITHOUT payment link for normal paid methods (except mercadopago_point, which waits for confirmation in Step 5)
        if (selectedCustomer?.email && paymentMethod !== 'mercadopago_point') {
          sendOrderConfirmationEmailAction({
            customerEmail: selectedCustomer?.email,
            customerName: selectedCustomer?.full_name,
            orderId: newOrderIdNumber,
            items: cart.map(item => ({ name: item.name, price: item.price, category: item.category, notes: item.details?.notes || '' })),
            total: amountToPay,
            paymentMethod: finalPaymentMethodStr || '',
            date: dateStr,
            deliveryDate: deadline || '',
            deliveryWindowStart: '15:00',
            deliveryWindowEnd: '18:00',
            paymentUrl: paymentUrl,  // empty for cash/machine, payment link only for transbank
            splitCashAmount: isMixedTerminal ? splitCashAmount : undefined,
            splitCardAmount: isMixedTerminal ? splitCardAmount : undefined,
          }).catch(err => console.error("Error sending email", err));
        }

        // WhatsApp confirmation for cash payments
        if (paymentMethod === 'cash' && splitCardAmount === 0 && amountToPay > 0) {
          sendWhatsAppPaymentConfirmationAction(finalOrderIdStr.replace('order_', ''), amountToPay, finalPaymentMethodStr || 'Efectivo/Transferencia')
            .catch(err => console.error('Error enviando WhatsApp:', err));
        }

        setCheckoutResult({ ...result, orderId: finalOrderIdStr.replace('order_', ''), customer: selectedCustomer, total, paidAmount: paymentMethod === 'mercadopago_point' ? 0 : amountToPay, items: cart, paymentUrl, date: dateStr, deliveryDate: deliveryDateStr, method: paymentMethod });
        setCurrentStep(5);
      } else {
        alert("Error al procesar la orden en producción: " + result.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error crítico al procesar pago.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    clearCart();
    setPosMode('new_sale');
    setInitialPaymentType('total');
    setPaymentMethod(null);
    setSplitCardAmount(0);
    setSplitCashAmount(0);
    setCurrentStep(1);
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-in fade-in duration-500">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <h3 className="font-serif text-xl text-zinc-800">Procesando Orden...</h3>
        <p className="text-zinc-500 text-sm">Validando el pago y registrando en caja</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-zinc-900 mb-2">Pago y Facturación</h2>
          <p className="text-zinc-500 text-sm">
            {posMode === 'pay_balance' ? `Pago de saldo para Orden ${pendingOrderToPay?.internal_id}` : 'Selecciona cómo pagará el cliente.'}
          </p>
        </div>

        {!isCajaOpen && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Caja Cerrada:</strong> No hay una caja abierta para hoy. El pago se registrará, pero deberás revisar el descuadre contable más tarde.
            </p>
          </div>
        )}

        <div className="space-y-6">

          {/* Totales */}
          <div className="flex justify-between items-center pb-5 border-b border-zinc-100">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">Total de la Orden</p>
              <p className="text-3xl font-serif text-zinc-900">${total.toLocaleString('es-CL')}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">A cobrar ahora</p>
              <p className="text-3xl font-serif text-emerald-600">${amountToPay.toLocaleString('es-CL')}</p>
            </div>
          </div>

          {/* Abono Inicial */}
          {posMode !== 'pay_balance' && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-700 mb-3">Abono Inicial</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'total', label: 'Pago Total' },
                  { value: '50percent', label: 'Abono 50%' },
                  { value: 'zero', label: 'Contra Entrega' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setInitialPaymentType(opt.value);
                      if (opt.value === 'zero') setPaymentMethod(null);
                    }}
                    className={`py-2.5 text-[9px] uppercase tracking-widest font-bold transition-all rounded-sm border ${
                      initialPaymentType === opt.value
                        ? 'bg-[#C17B5C] text-white border-[#C17B5C]'
                        : 'bg-white text-slate-600 border-zinc-200 hover:border-[#C17B5C]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Método de Pago */}
          {initialPaymentType !== 'zero' && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-700 mb-3">Método de Pago</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'mercadopago_point', label: 'Pago Máquina' },
                  { id: 'transbank', label: 'Pago en Línea' },
                  { id: 'cash', label: 'Efectivo / Mixto' },
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method.id as any);
                      if (method.id === 'cash') {
                        setSplitCashAmount(amountToPay);
                        setSplitCardAmount(0);
                      }
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 py-2.5 text-[8px] uppercase tracking-widest transition-all rounded-sm border font-bold ${
                      paymentMethod === method.id
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                        : 'border-zinc-200 hover:border-[#C17B5C] text-slate-700 bg-white cursor-pointer'
                    }`}
                  >
                    {method.id === 'mercadopago_point' && (
                      <CreditCard className={`w-4 h-4 ${paymentMethod === method.id ? 'text-white' : 'text-[#C17B5C]'}`} />
                    )}
                    {method.id === 'transbank' && (
                      <Globe className={`w-4 h-4 ${paymentMethod === method.id ? 'text-white' : 'text-blue-500'}`} />
                    )}
                    {method.id === 'cash' && (
                      <div className="flex gap-1 text-[14px] leading-none justify-center">
                        <span>💵</span>
                        <span>💳</span>
                      </div>
                    )}
                    {method.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desglose Efectivo / Mixto */}
          {paymentMethod === 'cash' && initialPaymentType !== 'zero' && (
            <div className="p-4 border border-[#C17B5C]/20 bg-[#C17B5C]/5 rounded-sm space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 text-center">Detalle de Pago</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col justify-end">
                  <label className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Monto Tarjeta (Máquina)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={splitCardAmount || ''}
                    placeholder="0"
                    onChange={e => {
                      const val = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
                      setSplitCardAmount(val);
                      setSplitCashAmount(Math.max(0, amountToPay - val));
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-sm px-3 py-2 text-sm outline-none focus:border-[#C17B5C]"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Monto Efectivo</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={splitCashAmount || ''}
                    placeholder="0"
                    onChange={e => {
                      const val = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
                      setSplitCashAmount(val);
                      setSplitCardAmount(Math.max(0, amountToPay - val));
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-sm px-3 py-2 text-sm outline-none focus:border-[#C17B5C]"
                  />
                </div>
              </div>
              <p className="text-[10px] text-center text-zinc-400">Si paga 100% efectivo, deja Monto Tarjeta en 0.</p>
            </div>
          )}

          {/* Bloqueo de Exclusividad */}
          {posMode !== 'pay_balance' && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-700 mb-1">Bloqueo de Exclusividad</label>
              <p className="text-[10px] text-zinc-400 mb-2">Tipo de Campaña</p>
              <select
                value={exclusivityType}
                onChange={e => {
                  const val = e.target.value;
                  setExclusivityType(val);
                  if (val === 'none') { setExclusivityEventId(''); setExclusivityDesignName(''); }
                  else if (cart.length > 0) setExclusivityDesignName(cart[0].name);
                }}
                className="w-full p-2.5 text-xs bg-white border border-zinc-200 rounded-sm outline-none focus:border-[#C17B5C]"
              >
                <option value="none">Sin bloqueo</option>
                <option value="graduacion">Vestidos de Graduación</option>
                <option value="novias">Vestidos de Novia</option>
              </select>
              {exclusivityType !== 'none' && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-sm">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">
                      {exclusivityType === 'graduacion' ? 'Colegio y Curso' : 'Fecha o Lugar del Evento'}
                    </label>
                    <input type="text" value={exclusivityEventId} onChange={e => setExclusivityEventId(e.target.value)}
                      className="w-full bg-white border border-zinc-200 px-3 py-2 text-xs rounded-sm outline-none focus:border-[#C17B5C]"
                      placeholder={exclusivityType === 'graduacion' ? 'Ej: San Benito 4º Medio' : 'Ej: Club de Polo'} />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Diseño</label>
                    <input type="text" value={exclusivityDesignName} onChange={e => setExclusivityDesignName(e.target.value)}
                      className="w-full bg-white border border-zinc-200 px-3 py-2 text-xs rounded-sm outline-none focus:border-[#C17B5C]"
                      placeholder="Ej: Vestido sirena encaje rojo" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-8 space-y-3">
            {(initialPaymentType === 'total' || initialPaymentType === '50percent') && posMode !== 'pay_balance' && (
              <button
                type="button"
                onClick={generateBudgetLink}
                disabled={isGeneratingBudget}
                className="w-full bg-white border border-zinc-800 text-zinc-800 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingBudget ? 'Generando...' : 'Generar Presupuesto Web (Link)'}
              </button>
            )}

            <button
              type="button"
              onClick={handleProcessPayment}
              disabled={(initialPaymentType !== 'zero' && !paymentMethod) || isProcessing}
              className={`w-full py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${
                (initialPaymentType !== 'zero' && !paymentMethod) || isProcessing
                  ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
              }`}
            >
              {isProcessing
                ? 'Procesando...'
                : initialPaymentType === 'zero'
                ? 'Registrar Orden sin Pago Inicial'
                : paymentMethod === 'mercadopago_point'
                ? 'Enviar a Terminal Físico'
                : paymentMethod === 'transbank'
                ? 'Generar Link de Pago'
                : 'Cobrar y Emitir Boleta'
              }
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full bg-white border border-red-200 text-red-500 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-red-50 hover:border-red-500 transition-all"
            >
              {posMode === 'pay_balance' ? 'Cancelar Pago de Saldo' : 'Cancelar Venta y Vaciar Carrito'}
            </button>
          </div>
        </div>
      </div>

      {/* Budget Modal — same as old POS */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="flex justify-end">
                <button onClick={() => setIsBudgetModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-3xl text-zinc-900">¡Presupuesto Web Listo!</h2>
                <p className="text-sm text-zinc-500 px-8">Hemos generado un link interactivo para tu clienta. Puede verlo y pagar desde su celular.</p>
              </div>

              <div className="bg-zinc-50 p-4 rounded-sm border border-zinc-100 flex flex-col gap-4">
                <div className="space-y-4">
                  {/* WhatsApp */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 text-left italic">Enviar por WhatsApp</p>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        placeholder="Ej. 56912345678"
                        className="flex-1 bg-white border border-zinc-200 px-3 py-2 text-xs rounded-sm outline-none focus:border-[#C17B5C]"
                      />
                      <button
                        onClick={shareViaWhatsApp}
                        disabled={!clientPhone}
                        className="bg-[#25D366] text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#128C7E] transition-all rounded-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2 border-t border-zinc-200 pt-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 text-left italic">Enviar por Correo</p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        placeholder="cliente@email.com"
                        className="flex-1 bg-white border border-zinc-200 px-3 py-2 text-xs rounded-sm outline-none focus:border-[#C17B5C]"
                      />
                      <button
                        onClick={shareViaEmail}
                        disabled={!clientEmail || isSendingEmail}
                        className="bg-zinc-900 text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#C17B5C] transition-all rounded-sm flex items-center gap-2 disabled:opacity-50 min-w-[100px] justify-center"
                      >
                        {isSendingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                        {isSendingEmail ? 'Enviando...' : 'Email'}
                      </button>
                    </div>
                  </div>

                  {/* Link directo */}
                  <div className="border-t border-zinc-200 pt-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 text-left mb-2">Link Directo</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="flex-1 bg-white border border-zinc-200 px-3 py-2 text-[10px] text-zinc-400 rounded-sm outline-none"
                      />
                      <button
                        onClick={copyToClipboard}
                        className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm flex items-center gap-2 ${
                          copySuccess ? 'bg-emerald-600 text-white' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                        }`}
                      >
                        <Copy className="w-3 h-3" />
                        {copySuccess ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => window.open(generatedLink, '_blank')}
                    className="flex items-center justify-center gap-2 py-3 border border-zinc-200 text-zinc-900 text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-50 transition-all rounded-sm"
                  >
                    Ver como Cliente
                  </button>
                  <button
                    onClick={() => setIsBudgetModalOpen(false)}
                    className="py-3 bg-zinc-900 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#C17B5C] transition-all rounded-sm"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
