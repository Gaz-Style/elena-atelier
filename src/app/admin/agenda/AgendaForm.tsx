'use client';

import { useState } from 'react';
import { Plus, Search, X, ArrowRight } from 'lucide-react';
import { createCustomer } from '../crm/actions';

export default function AgendaForm({ 
    selectedDateStr, 
    addEventoManual,
    customers,
    currentDayConfig
}: { 
    selectedDateStr: string, 
    addEventoManual: (formData: FormData) => Promise<{success?: boolean, error?: string} | void>,
    customers: any[],
    currentDayConfig?: any
}) {
    const [tipo, setTipo] = useState('cliente');
    const [clientSearch, setClientSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isRegisteringClient, setIsRegisteringClient] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', phone: '56', email: '' });
    const [loading, setLoading] = useState(false);
    const [localCustomers, setLocalCustomers] = useState(customers);

    const handleQuickRegister = async () => {
        if (!newClientData.name) return;
        setLoading(true);
        const fd = new FormData();
        fd.append('full_name', newClientData.name);
        fd.append('phone', newClientData.phone);
        fd.append('email', newClientData.email);
        
        const res = await createCustomer(fd);
        if (res.success) {
            setSelectedCustomer(res.data);
            setLocalCustomers([...localCustomers, res.data]);
            setIsRegisteringClient(false);
            setClientSearch('');
            setNewClientData({ name: '', phone: '56', email: '' });
        } else {
            alert("Error al registrar: " + res.error);
        }
        setLoading(false);
    };

    const clientAction = async (formData: FormData) => {
        setLoading(true);
        const res = await addEventoManual(formData);
        if (res && !res.success) {
            alert(res.error);
        } else {
            setSelectedCustomer(null);
            setClientSearch('');
            if (tipo === 'tarea') {
                const form = document.getElementById('agenda-form') as HTMLFormElement;
                if (form) form.reset();
            }
        }
        setLoading(false);
    };

    let availableHours: string[] = [];
    let isClosed = false;
    if (currentDayConfig) {
        if (!currentDayConfig.activo || !currentDayConfig.hora_inicio || !currentDayConfig.hora_fin) {
            isClosed = true;
        } else {
            const startH = parseInt(currentDayConfig.hora_inicio.split(':')[0], 10);
            const endH = parseInt(currentDayConfig.hora_fin.split(':')[0], 10);
            for (let i = startH; i <= endH; i++) {
                availableHours.push(`${i.toString().padStart(2, '0')}:00`);
                if (i !== endH) {
                    availableHours.push(`${i.toString().padStart(2, '0')}:30`);
                }
            }
        }
    } else {
        for (let i = 8; i <= 22; i++) {
            availableHours.push(`${i.toString().padStart(2, '0')}:00`);
            if (i !== 22) {
                availableHours.push(`${i.toString().padStart(2, '0')}:30`);
            }
        }
    }

    if (isClosed) {
        return (
            <div className="bg-brand-sand/10 p-6 rounded-sm border border-brand-sand/30 text-center">
                <p className="text-sm font-medium text-brand-charcoal">El taller está cerrado este día.</p>
                <p className="text-xs text-gray-500 mt-2">Puedes cambiar la configuración de horarios en el panel si necesitas agendar algo hoy.</p>
            </div>
        );
    }

    return (
        <form id="agenda-form" action={clientAction} className="space-y-4">
            <input type="hidden" name="date" value={selectedDateStr} />
            <input type="hidden" name="tipo" value={tipo} />
            
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tipo de Reserva</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        type="button"
                        onClick={() => setTipo('cliente')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tipo === 'cliente' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                    >
                        Cliente
                    </button>
                    <button 
                        type="button"
                        onClick={() => setTipo('tarea')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tipo === 'tarea' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                    >
                        Tarea Interna
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Hora de Inicio</label>
                <select name="hora" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50" required>
                    {availableHours.map(hora => (
                        <option key={hora} value={hora}>{hora}</option>
                    ))}
                </select>
            </div>

            {tipo === 'cliente' ? (
                <div className="space-y-4 pt-2">
                    {selectedCustomer ? (
                        <div className="flex justify-between items-center bg-brand-sand/10 p-4 rounded-sm border border-brand-sand/30">
                            <div>
                                <p className="font-serif text-lg text-brand-charcoal">{selectedCustomer.full_name}</p>
                                <p className="text-xs text-gray-500">{selectedCustomer.phone || selectedCustomer.email}</p>
                                {/* Hidden inputs para enviar a la Action */}
                                <input type="hidden" name="nombre" value={selectedCustomer.full_name.split(' ')[0]} />
                                <input type="hidden" name="apellido" value={selectedCustomer.full_name.split(' ').slice(1).join(' ')} />
                                <input type="hidden" name="celular" value={selectedCustomer.phone} />
                                <input type="hidden" name="correo" value={selectedCustomer.email} />
                            </div>
                            <button type="button" onClick={() => setSelectedCustomer(null)} className="text-xs uppercase tracking-widest text-gray-400 hover:text-red-500 font-bold">Cambiar</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nombre o correo..." 
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta text-sm"
                                    />
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsRegisteringClient(!isRegisteringClient);
                                        setNewClientData({ name: '', phone: '56', email: '' });
                                    }}
                                    className={`w-full py-3 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center justify-center gap-2 border ${isRegisteringClient ? 'bg-white border-red-200 text-red-500' : 'bg-black text-white border-black hover:bg-gray-800'}`}
                                >
                                    {isRegisteringClient ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                                    {isRegisteringClient ? 'Cancelar' : 'Nuevo Cliente'}
                                </button>
                            </div>

                            {/* Dropdown Resultados */}
                            {clientSearch && !isRegisteringClient && (
                                <div className="bg-white border border-gray-100 shadow-lg rounded-sm max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                    {localCustomers.filter(c => c.full_name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))).map(c => (
                                        <div key={c.id} onClick={() => { setSelectedCustomer(c); setClientSearch(''); }} className="p-3 hover:bg-brand-sand/10 cursor-pointer border-b border-gray-50 flex justify-between items-center group">
                                            <div>
                                                <p className="text-sm font-medium text-brand-charcoal">{c.full_name}</p>
                                                <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{c.email}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-terracotta transition-all" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Formulario Rápido */}
                            {isRegisteringClient && (
                                <div className="bg-white p-4 rounded-sm border border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2 relative">
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Nombre Completo</label>
                                        <input 
                                            type="text" 
                                            value={newClientData.name} 
                                            onChange={e => setNewClientData({...newClientData, name: e.target.value.replace(/\b\w/g, c => c.toUpperCase())})} 
                                            className="w-full p-2 text-sm border rounded-sm outline-none focus:border-brand-terracotta" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Celular (+56...)</label>
                                        <input 
                                            type="tel" 
                                            value={newClientData.phone} 
                                            onChange={e => setNewClientData({...newClientData, phone: e.target.value.replace(/\D/g, "")})} 
                                            className="w-full p-2 text-sm border rounded-sm outline-none focus:border-brand-terracotta" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Email</label>
                                        <input 
                                            type="email" 
                                            value={newClientData.email} 
                                            onChange={e => setNewClientData({...newClientData, email: e.target.value})} 
                                            className="w-full p-2 text-sm border rounded-sm outline-none focus:border-brand-terracotta" 
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleQuickRegister} 
                                        disabled={loading || !newClientData.name || newClientData.phone.length < 8} 
                                        className="w-full py-3 bg-brand-charcoal text-white text-[10px] uppercase font-bold hover:bg-brand-terracotta transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Guardando...' : 'Registrar Cliente'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Motivo / Tarea</label>
                    <input type="text" name="notas" placeholder="Ej: Compra de telas..." className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50" />
                </div>
            )}

            <button 
                type="submit" 
                disabled={tipo === 'cliente' && !selectedCustomer}
                className="w-full mt-4 bg-black text-white p-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Plus className="w-4 h-4" />
                {tipo === 'cliente' ? 'Agendar Cita Cliente' : 'Bloquear Horario'}
            </button>
        </form>
    );
}
