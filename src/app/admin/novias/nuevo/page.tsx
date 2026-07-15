'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Crown, GraduationCap, Calendar, DollarSign, FileText, Loader2, CheckCircle2, Sparkles, User, Camera, X, Search, Plus, ArrowRight } from 'lucide-react';
import { createBridalProject } from '../actions';
import { getCustomers, createCustomer } from '../../crm/actions';

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export default function NuevoProyectoPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [customerId, setCustomerId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isSavingClient, setIsSavingClient] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', phone: '56', email: '' });
    
    const [projectType, setProjectType] = useState('novia');
    const [serviceType, setServiceType] = useState('modificacion_tienda');
    const [eventDate, setEventDate] = useState('');
    const [eventVenue, setEventVenue] = useState('');
    const [subtotal, setSubtotal] = useState(0);
    const [discountType, setDiscountType] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [description, setDescription] = useState('');
    const [materialsNotes, setMaterialsNotes] = useState('');
    const [contractNotes, setContractNotes] = useState('');
    const [referenceImages, setReferenceImages] = useState<{url: string}[]>([]);

    // Derived
    const totalAmount = Math.max(0, subtotal - discountAmount);
    const isNovia = projectType === 'novia';
    const payment1 = Math.round(totalAmount * 0.5);
    const payment2 = isNovia ? Math.round(totalAmount * 0.25) : totalAmount - payment1;
    const payment3 = isNovia ? totalAmount - payment1 - payment2 : 0;

    // Calculate milestone dates
    const milestones = eventDate ? [
        { title: 'Prueba 1 — Toma de Medidas y Diseño', weeks: 12 },
        { title: 'Prueba 2 — Estructura y Calce Base', weeks: 8 },
        { title: 'Prueba 3 — Ajustes y Detalles', weeks: 5 },
        { title: 'Prueba 4 — Prueba Final (Milimétrica)', weeks: 3 },
        { title: 'Entrega Final', weeks: 1 },
    ].map(m => {
        const date = new Date(`${eventDate}T12:00:00`);
        date.setDate(date.getDate() - (m.weeks * 7));
        return { ...m, date };
    }) : [];

    useEffect(() => {
        async function load() {
            const data = await getCustomers();
            setCustomers(data || []);
            setLoading(false);
        }
        load();
    }, []);

    useEffect(() => {
        if (searchTerm.trim().length < 2) {
            setFilteredCustomers([]);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredCustomers(customers.filter(c => 
                c.full_name?.toLowerCase().includes(term) ||
                c.email?.toLowerCase().includes(term) ||
                c.phone?.toLowerCase().includes(term)
            ));
        }
    }, [searchTerm, customers]);

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
                setCustomers([...customers, res.data]);
                setCustomerId(res.data.id);
                setIsRegistering(false);
                setSearchTerm('');
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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError('');

        const formData = new FormData();
        formData.set('customer_id', customerId);
        formData.set('project_type', projectType);
        formData.set('service_type', serviceType);
        formData.set('event_date', eventDate);
        formData.set('event_venue', eventVenue);
        formData.set('total_amount', String(totalAmount));
        formData.set('description', description);
        
        let finalMaterialsNotes = materialsNotes;
        if (referenceImages.length > 0) {
            referenceImages.forEach((img, idx) => {
                finalMaterialsNotes += `\n\n![Referencia ${idx + 1}](${img.url})`;
            });
        }
        let finalContractNotes = contractNotes;
        if (discountAmount > 0) {
            finalContractNotes += `\n\nDescuento aplicado: ${discountType} (-$${discountAmount})`;
        }
        
        formData.set('materials_notes', finalMaterialsNotes);
        formData.set('contract_notes', finalContractNotes);

        const result = await createBridalProject(formData);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push(`/admin/novias/${result.projectId}`);
            }, 1500);
        } else {
            setError(result.error || 'Error al crear el proyecto');
        }
        setSaving(false);
    }

    const selectedCustomer = customers.find(c => c.id === customerId);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50/30 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/30 font-sans text-zinc-800">
            <main className="max-w-4xl mx-auto px-6 md:px-8 py-8">

                {/* Header */}
                <div className="mb-8">
                    <Link href="/admin/novias" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 font-bold hover:text-zinc-700 transition-colors mb-4">
                        <ArrowLeft className="w-3 h-3" /> Volver a Proyectos
                    </Link>
                    <h1 className="font-serif text-3xl text-zinc-900">Nuevo Proyecto Especial</h1>
                    <p className="text-zinc-500 text-sm mt-1">Completa los datos para crear un nuevo proyecto de novia, madrina o graduación.</p>
                </div>

                {success ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-emerald-200 shadow-sm">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h2 className="font-serif text-2xl text-zinc-900 mb-2">¡Proyecto Creado!</h2>
                        <p className="text-zinc-500">Redirigiendo a la ficha del proyecto...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Step 1: Client Selection */}
                        <section className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] relative z-10">
                            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" /> 1. Seleccionar Clienta
                            </h2>
                            
                            {selectedCustomer ? (
                                <div className="mt-3 bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-zinc-900">{selectedCustomer.full_name}</h3>
                                            <div className="flex flex-wrap gap-4 text-zinc-500 text-sm mt-1">
                                                <span>📧 {selectedCustomer.email || 'Sin correo'}</span>
                                                <span>📱 {selectedCustomer.phone || 'Sin teléfono'}</span>
                                                {selectedCustomer.rut && <span>🪪 {selectedCustomer.rut}</span>}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCustomerId('')}
                                            className="text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Cambiar Clienta
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row gap-4 relative">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition-shadow"
                                                placeholder="Buscar por nombre, teléfono o correo..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            
                                            {searchTerm.trim().length >= 2 && (
                                                <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-zinc-200 shadow-xl rounded-xl max-h-64 overflow-y-auto custom-scrollbar">
                                                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 bg-zinc-50 rounded-t-xl">Clientes Encontrados</div>
                                                    
                                                    {filteredCustomers.length > 0 ? (
                                                        filteredCustomers.map(c => (
                                                            <div 
                                                                key={c.id} 
                                                                className="flex items-center justify-between p-3 border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer transition-all last:border-0 group"
                                                                onClick={() => {
                                                                    setCustomerId(c.id);
                                                                    setSearchTerm('');
                                                                }}
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-sm text-zinc-900">{c.full_name}</p>
                                                                    <p className="text-xs text-zinc-500 tracking-tighter">{c.email || 'Sin correo'} | {c.phone}</p>
                                                                </div>
                                                                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition-all" />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center">
                                                            <p className="text-xs text-zinc-500 italic mb-2">No se encontró cliente con "{searchTerm}"</p>
                                                            <button 
                                                                type="button"
                                                                onClick={() => { setIsRegistering(true); setSearchTerm(''); }} 
                                                                className="text-[10px] uppercase tracking-widest font-bold text-rose-500 hover:text-rose-600 hover:underline"
                                                            >
                                                                + Crear ficha de cliente nuevo
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className={`md:w-auto w-full transition-all flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm border-2 ${isRegistering ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : 'border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800'}`}
                                            onClick={() => {
                                                setIsRegistering(!isRegistering);
                                                if (!isRegistering) setNewClientData({ name: '', phone: '56', email: '' });
                                            }}
                                        >
                                            {isRegistering ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nuevo Cliente</>}
                                        </button>
                                    </div>

                                    {isRegistering && (
                                        <div className="pt-4 border-t border-zinc-100">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Nombre Completo *</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-rose-300"
                                                        value={newClientData.name}
                                                        onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-zinc-700 mb-1">Teléfono (WhatsApp) *</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-rose-300"
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
                                                        className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-rose-300"
                                                        value={newClientData.email}
                                                        onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                className="w-full md:w-auto mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                                onClick={handleRegisterClient}
                                                disabled={
                                                    isSavingClient || 
                                                    !newClientData.name || 
                                                    newClientData.name.trim().split(/\s+/).length < 2 || 
                                                    newClientData.phone.replace(/\D/g, "").length < 8
                                                }
                                            >
                                                {isSavingClient ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
                                                {isSavingClient ? 'Guardando...' : 'Guardar y Seleccionar'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Step 2: Project Type */}
                        <section className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> 2. Tipo de Proyecto
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: 'novia', label: 'Novia', icon: Heart, desc: 'Vestido de novia', gradient: 'from-rose-50 to-pink-50', border: 'border-rose-300', text: 'text-rose-600' },
                                    { value: 'madrina', label: 'Madrina', icon: Crown, desc: 'Vestido de madrina / ceremonia', gradient: 'from-violet-50 to-purple-50', border: 'border-violet-300', text: 'text-violet-600' },
                                    { value: 'graduacion', label: 'Graduación', icon: GraduationCap, desc: 'Vestido de graduación', gradient: 'from-sky-50 to-blue-50', border: 'border-sky-300', text: 'text-sky-600' },
                                ].map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setProjectType(type.value)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                            projectType === type.value
                                                ? `bg-gradient-to-br ${type.gradient} ${type.border} shadow-sm`
                                                : 'border-zinc-200 hover:border-zinc-300 bg-white'
                                        }`}
                                    >
                                        <type.icon className={`w-6 h-6 mb-2 ${projectType === type.value ? type.text : 'text-zinc-400'}`} />
                                        <p className={`font-bold text-sm ${projectType === type.value ? type.text : 'text-zinc-700'}`}>{type.label}</p>
                                        <p className="text-[10px] text-zinc-400 mt-1">{type.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Step 3: Service Type */}
                        <section className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> 3. Tipo de Servicio
                            </h2>
                            <div className="space-y-2">
                                {[
                                    { value: 'modificacion_tienda', label: 'Modificación de vestido de la tienda', desc: 'La clienta adquiere un vestido del inventario de ELENA y se adapta a sus medidas.' },
                                    { value: 'vestido_propio', label: 'Ajuste de vestido propio', desc: 'La clienta trae su propio vestido (comprado en otro lugar o heredado) para modificar.' },
                                    { value: 'bespoke', label: 'Confección desde cero (Bespoke)', desc: 'Creación total del vestido a medida desde diseño y patronaje.' },
                                ].map(svc => (
                                    <label
                                        key={svc.value}
                                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            serviceType === svc.value
                                                ? 'border-zinc-800 bg-zinc-50'
                                                : 'border-zinc-200 hover:border-zinc-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="service_type"
                                            value={svc.value}
                                            checked={serviceType === svc.value}
                                            onChange={() => setServiceType(svc.value)}
                                            className="mt-1 accent-zinc-800"
                                        />
                                        <div>
                                            <p className="font-bold text-sm text-zinc-800">{svc.label}</p>
                                            <p className="text-xs text-zinc-500 mt-1">{svc.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {serviceType === 'vestido_propio' && (
                                <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-lg text-xs text-amber-800">
                                    <strong>⚠ Nota:</strong> El contrato incluirá automáticamente la cláusula de exención de responsabilidad sobre la tela original.
                                </div>
                            )}
                        </section>

                        {/* Step 4: Event & Pricing */}
                        <section className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> 4. Evento y Precio
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Fecha del Evento *</label>
                                    <input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        required
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Lugar del Evento</label>
                                    <input
                                        type="text"
                                        value={eventVenue}
                                        onChange={(e) => setEventVenue(e.target.value)}
                                        placeholder="Ej: Viña Santa Rita, Santiago"
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Monto Base del Proyecto (CLP) *</label>
                                    <input
                                        type="number"
                                        value={subtotal || ''}
                                        onChange={(e) => setSubtotal(parseInt(e.target.value) || 0)}
                                        required
                                        min={0}
                                        placeholder="500000"
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Descripción del Vestido</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Ej: Vestido sirena con encaje francés"
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Tipo de Descuento (Opcional)</label>
                                    <select
                                        value={discountType}
                                        onChange={(e) => {
                                            setDiscountType(e.target.value);
                                            if (!e.target.value) setDiscountAmount(0);
                                        }}
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none bg-white"
                                    >
                                        <option value="">— Sin descuento —</option>
                                        <option value="Embajadora">Embajadora</option>
                                        <option value="Influencer / Canje">Influencer / Canje</option>
                                        <option value="Familiar / Amiga">Familiar / Amiga</option>
                                        <option value="Campaña Especial">Campaña Especial</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Monto del Descuento (CLP)</label>
                                    <input
                                        type="number"
                                        value={discountAmount || ''}
                                        onChange={(e) => setDiscountAmount(parseInt(e.target.value) || 0)}
                                        min={0}
                                        max={subtotal}
                                        placeholder="0"
                                        disabled={!discountType}
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none disabled:bg-zinc-100 disabled:text-zinc-400"
                                    />
                                </div>
                            </div>

                            {/* Payment Preview */}
                            {totalAmount > 0 && (
                                <div className="mt-6 bg-gradient-to-r from-zinc-50 to-rose-50/30 border border-zinc-200 rounded-xl p-5">
                                    <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-3 flex items-center gap-2">
                                        <DollarSign className="w-3.5 h-3.5" /> Desglose de Pagos
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-600">Cuota 1 — Abono Inicial (50%)</span>
                                            <span className="font-bold text-zinc-800">{formatCurrency(payment1)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-600">Cuota 2 — {isNovia ? 'Prueba Intermedia (25%)' : 'Contra Entrega (50%)'}</span>
                                            <span className="font-bold text-zinc-800">{formatCurrency(payment2)}</span>
                                        </div>
                                        {isNovia && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-zinc-600">Cuota 3 — Contra Entrega (25%)</span>
                                                <span className="font-bold text-zinc-800">{formatCurrency(payment3)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-sm pt-3 mt-2 border-t border-zinc-300 font-bold">
                                            <span>Total a Pagar</span>
                                            <div className="text-right">
                                                {discountAmount > 0 && <span className="text-xs text-zinc-400 line-through mr-2">{formatCurrency(subtotal)}</span>}
                                                <span className="text-lg text-zinc-900">{formatCurrency(totalAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Step 5: Timeline Preview */}
                        {milestones.length > 0 && (
                            <section className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                                <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> 5. Cronograma Automático de Pruebas
                                </h2>
                                <div className="space-y-3">
                                    {milestones.map((m, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-lg">
                                            <span className="w-7 h-7 rounded-full bg-zinc-800 text-white text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-zinc-800">{m.title}</p>
                                                <p className="text-xs text-zinc-500">{m.weeks} semanas antes del evento</p>
                                            </div>
                                            <span className="text-sm text-zinc-600 font-medium">
                                                {m.date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-3 italic">
                                    * Las fechas se calculan automáticamente desde la fecha del evento. Se podrán ajustar manualmente después.
                                </p>
                            </section>
                        )}

                        {/* Step 6: Additional Notes */}
                        <section className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4">6. Notas Adicionales (Opcional)</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Materiales Comprometidos</label>
                                    <textarea
                                        value={materialsNotes}
                                        onChange={(e) => setMaterialsNotes(e.target.value)}
                                        placeholder="Ej: 3m encaje francés color ivory, 5m tul de seda, 200 perlas..."
                                        rows={2}
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-2 font-medium">Fotos de Referencia (Se adjuntarán a los materiales)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {referenceImages.map((img, idx) => (
                                            <div key={idx} className="relative w-16 h-16 border border-zinc-200 rounded-lg overflow-hidden group">
                                                <img src={img.url} alt="Referencia" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setReferenceImages(referenceImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="border border-dashed border-zinc-300 rounded-lg w-16 h-16 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 hover:bg-zinc-50 transition-colors relative">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                                                onChange={async (e) => {
                                                    if (e.target.files?.[0]) {
                                                        const url = await compressImage(e.target.files[0], 600, 600, 0.5);
                                                        setReferenceImages([...referenceImages, { url }]);
                                                    }
                                                }} 
                                            />
                                            <Camera className="w-4 h-4 text-zinc-400" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Cláusulas Adicionales al Contrato</label>
                                    <textarea
                                        value={contractNotes}
                                        onChange={(e) => setContractNotes(e.target.value)}
                                        placeholder="Notas especiales que se incluirán en el contrato..."
                                        rows={2}
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex justify-end gap-4 pt-4">
                            <Link href="/admin/novias" className="px-6 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={saving || !customerId || !eventDate || totalAmount <= 0}
                                className="bg-zinc-900 hover:bg-rose-700 disabled:bg-zinc-300 text-white px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Crear Proyecto
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
