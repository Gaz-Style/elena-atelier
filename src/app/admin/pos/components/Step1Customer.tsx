'use client';

import React, { useState, useEffect } from 'react';
import { usePOS, Customer } from './POSContext';
import { getCustomers, createCustomer } from '@/app/admin/crm/actions';
import { getPendingBalancesAction } from '@/app/admin/pos/actions';
import { Search, Plus, User, ArrowRight, Wallet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Step1Customer() {
  const { 
    selectedCustomer, setSelectedCustomer, setCurrentStep, 
    setPosMode, setPendingOrderToPay 
  } = usePOS();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [pendingBalances, setPendingBalances] = useState<Record<string, any[]>>({});
  
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', phone: '56', email: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCustomers(),
      getPendingBalancesAction()
    ]).then(([custRes, balRes]) => {
      if (Array.isArray(custRes)) {
        setAllCustomers(custRes);
        setFilteredCustomers(custRes);
      }
      if (balRes.success && balRes.balancesByCustomer) {
        setPendingBalances(balRes.balancesByCustomer);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setFilteredCustomers([]);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredCustomers(allCustomers.filter(c => 
        c.full_name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, allCustomers]);

  const handleRegisterClient = async () => {
    const formattedName = newClientData.name.trim().replace(/\b\w/g, c => c.toUpperCase());
    if (formattedName.split(/\s+/).length < 2) {
      alert("Por favor ingrese al menos nombre y apellido.");
      return;
    }
    const cleanPhone = newClientData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 8 || cleanPhone.length > 12) {
      alert("El teléfono debe tener entre 8 y 12 dígitos.");
      return;
    }
    if (newClientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientData.email)) {
      alert("Por favor ingrese un correo válido.");
      return;
    }

    setIsSavingClient(true);
    try {
      const formData = new FormData();
      formData.append('full_name', newClientData.name);
      formData.append('phone', newClientData.phone);
      formData.append('email', newClientData.email);

      const res = await createCustomer(formData);
      if (res.success && res.data) {
        setAllCustomers([...allCustomers, res.data]);
        setSelectedCustomer(res.data);
        setCurrentStep(2);
      } else {
        alert("Error al crear cliente: " + (res.error || ''));
      }
    } catch (e) {
      console.error(e);
      alert("Error al crear cliente");
    } finally {
      setIsSavingClient(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-zinc-900 mb-2">Identificación del Cliente</h2>
        <p className="text-zinc-500 text-sm">Selecciona o registra al cliente para iniciar la orden.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-4 md:p-6">
        {selectedCustomer ? (
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900">{selectedCustomer.full_name}</h3>
            <p className="text-zinc-500 text-sm mt-1">{selectedCustomer.phone} • {selectedCustomer.email || 'Sin correo'}</p>
            
            <div className="flex flex-col gap-3 mt-6 w-full max-w-sm mx-auto">
              
              {pendingBalances[selectedCustomer.id] && pendingBalances[selectedCustomer.id].length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full mb-2">
                  <div className="flex items-center gap-2 text-amber-800 mb-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold text-sm">Saldos Pendientes</span>
                  </div>
                  {pendingBalances[selectedCustomer.id].map(order => (
                    <div key={order.internal_id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-amber-100 mb-2 shadow-sm">
                      <div>
                        <p className="text-xs text-zinc-500 font-medium">Orden {order.internal_id}</p>
                        <p className="text-sm font-bold text-amber-700">${order.balance.toLocaleString('es-CL')}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-amber-700 border-amber-200 hover:bg-amber-100"
                        onClick={() => {
                          setPosMode('pay_balance');
                          setPendingOrderToPay(order);
                          setCurrentStep(4);
                        }}
                      >
                        <Wallet className="w-4 h-4 mr-1.5" /> Pagar
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedCustomer(null)}>
                  Cambiar Cliente
                </Button>
                <Button 
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white" 
                  onClick={() => {
                    setPosMode('new_sale');
                    setPendingOrderToPay(null);
                    setCurrentStep(2);
                  }}
                >
                  Nueva Orden <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900"
                  placeholder="Buscar por nombre, teléfono o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                {searchTerm.trim().length >= 2 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-zinc-200 shadow-xl rounded-xl max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 bg-zinc-50 rounded-t-xl">Clientes Registrados (Nueva Venta)</div>
                    
                    {isLoading ? (
                      <div className="p-4 text-center text-sm text-zinc-500">Cargando clientes...</div>
                    ) : filteredCustomers.length > 0 ? (
                      filteredCustomers.map(c => (
                        <div 
                          key={c.id} 
                          className="flex items-center justify-between p-4 border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer transition-all last:border-0 group"
                          onClick={() => setSelectedCustomer(c)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center relative">
                              <User className="w-5 h-5 text-zinc-400" />
                              {pendingBalances[c.id] && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-zinc-900">{c.full_name}</p>
                              <p className="text-xs text-zinc-500 font-mono tracking-tighter uppercase">{c.email || 'Sin correo'} | {c.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {pendingBalances[c.id] && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                Deuda
                              </span>
                            )}
                            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition-all" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-xs text-zinc-500 italic mb-2">No se encontró cliente con "{searchTerm}"</p>
                        <button 
                          onClick={() => { setIsRegistering(true); setSearchTerm(''); }} 
                          className="text-[10px] uppercase tracking-widest font-bold text-zinc-700 hover:text-zinc-900 hover:underline"
                        >
                          + Crear ficha de cliente nuevo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button 
                variant="outline"
                className={`md:w-auto w-full transition-all flex items-center gap-2 ${isRegistering ? 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  if (!isRegistering) {
                    setNewClientData({ name: '', phone: '56', email: '' });
                  }
                }}
              >
                {isRegistering ? 'Cancelar Registro' : <><Plus className="w-4 h-4" /> Nuevo Cliente</>}
              </Button>
            </div>

            {isRegistering && (
              <div className="space-y-4 pt-4 border-t border-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Registrar Nuevo Cliente</h3>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 bg-zinc-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 ${
                      newClientData.name ? (newClientData.name.trim().split(/\s+/).length < 2 ? 'border-red-300 focus:border-red-500' : 'border-green-400') : 'border-zinc-200'
                    }`}
                    value={newClientData.name}
                    onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Teléfono (WhatsApp) *</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 bg-zinc-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 ${
                      newClientData.phone ? (newClientData.phone.replace(/\D/g, "").length < 8 || newClientData.phone.replace(/\D/g, "").length > 12 ? 'border-red-300 focus:border-red-500' : 'border-green-400') : 'border-zinc-200'
                    }`}
                    value={newClientData.phone}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setNewClientData({...newClientData, phone: raw});
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    className={`w-full px-3 py-2 bg-zinc-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 ${
                      newClientData.email ? (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientData.email) ? 'border-red-300 focus:border-red-500' : 'border-green-400') : 'border-zinc-200'
                    }`}
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                  />
                </div>
                
                <Button 
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white mt-6 disabled:opacity-50"
                  onClick={handleRegisterClient}
                  disabled={
                    isSavingClient || 
                    !newClientData.name || 
                    newClientData.name.trim().split(/\s+/).length < 2 || 
                    newClientData.phone.replace(/\D/g, "").length < 8 ||
                    (newClientData.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientData.email))
                  }
                >
                  {isSavingClient ? 'Registrando...' : 'Registrar y Continuar'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
