'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, CheckCircle2, Mail, Phone, Calendar, Heart, Sparkles, User, FileText } from 'lucide-react';
import { updateCustomer } from '../../actions';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  rut?: string;
  birthday?: string;
  style_preference?: string;
  typical_occasion?: string;
  measurements?: string;
  marketing_opt_in: boolean;
}

export default function EditCustomerForm({ customer }: { customer: Customer }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus('idle');
        
        const formData = new FormData(e.currentTarget);
        const result = await updateCustomer(customer.id, formData);
        
        setIsSaving(false);
        if (result.success) {
            setSaveStatus('success');
            setTimeout(() => router.push(`/admin/crm/${customer.id}`), 2000);
        } else {
            setSaveStatus('error');
            alert('Error: ' + result.error);
        }
    }

    return (
        <div className="min-h-screen bg-brand-sand/10 p-4 md:p-8 pt-20 font-sans text-brand-charcoal">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href={`/admin/crm/${customer.id}`} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver al Perfil
                        </Link>
                        <h1 className="font-serif text-5xl">Editar Clienta</h1>
                        <p className="text-text-secondary mt-2">Modifica los datos de identidad, estilo, medidas y preferencias de marketing.</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Primary Info */}
                    <div className="md:col-span-2 bg-white p-8 rounded-sm border border-gray-100 shadow-sm space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-terracotta border-b border-gray-50 pb-2">1. Datos de Identidad</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">Nombre Completo *</label>
                                    <input 
                                        name="full_name" 
                                        required 
                                        type="text" 
                                        defaultValue={customer.full_name} 
                                        placeholder="Ej. María Ignacia Vial" 
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta text-sm" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">RUT / Identificación</label>
                                    <input 
                                        name="rut" 
                                        type="text" 
                                        defaultValue={customer.rut || ''} 
                                        placeholder="12.345.678-9" 
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta text-sm" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2"><Mail className="w-3 h-3" /> Correo Electrónico *</label>
                                    <input 
                                        name="email" 
                                        required 
                                        type="email" 
                                        defaultValue={customer.email} 
                                        placeholder="m.vial@email.com" 
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta text-sm" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2"><Phone className="w-3 h-3" /> Teléfono / WhatsApp</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-3 text-brand-terracotta font-bold text-sm select-none pointer-events-none tracking-widest">+56 9</span>
                                        <input 
                                            type="tel" placeholder="1234 5678" 
                                            maxLength={9}
                                            defaultValue={(() => {
                                                if (!customer.phone) return '';
                                                let d = customer.phone.replace(/\D/g, '');
                                                if (d.startsWith('56')) d = d.slice(2);
                                                if (d.startsWith('9') && d.length === 9) d = d.slice(1);
                                                if (d.length === 8) return d.slice(0,4) + ' ' + d.slice(4);
                                                return d;
                                            })()}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/\D/g, '').slice(0, 8);
                                                if (val.length > 4) val = val.slice(0,4) + ' ' + val.slice(4);
                                                e.target.value = val;
                                                const hidden = e.target.parentElement?.querySelector('input[type="hidden"]') as HTMLInputElement;
                                                if (hidden) hidden.value = val.replace(/\D/g, '').length > 0 ? '+56 9 ' + val : '';
                                            }}
                                            className="w-full pl-20 p-3 bg-gray-50 border border-gray-100 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta text-sm font-mono tracking-widest" 
                                        />
                                        <input type="hidden" name="phone" defaultValue={customer.phone || ''} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2"><Calendar className="w-3 h-3" /> Fecha de Nacimiento (Para promociones)</label>
                                <input 
                                    name="birthday" 
                                    type="date" 
                                    defaultValue={customer.birthday ? customer.birthday.substring(0, 10) : ''} 
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta text-sm" 
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-terracotta border-b border-gray-50 pb-2">2. Perfil de Estilo & Ficha Técnica</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2"><Heart className="w-3 h-3" /> Preferencia de Estilo</label>
                                    <select 
                                        name="style_preference" 
                                        defaultValue={customer.style_preference || 'Clásico'} 
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta text-xs font-bold uppercase tracking-widest"
                                    >
                                        <option value="Clásico">Clásico / Atemporal</option>
                                        <option value="Moderno">Moderno / Vanguardista</option>
                                        <option value="Bohemio">Bohemio / Romántico</option>
                                        <option value="Minimalista">Minimalista / Lujo Silencioso</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Ocasión Típica</label>
                                    <select 
                                        name="typical_occasion" 
                                        defaultValue={customer.typical_occasion || 'Novia'} 
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta text-xs font-bold uppercase tracking-widest"
                                    >
                                        <option value="Novia">Novia</option>
                                        <option value="Gala / Fiesta">Gala / Fiesta</option>
                                        <option value="Ejecutiva">Ejecutiva / Daily Business</option>
                                        <option value="Madrina">Madrina / Invitada</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2"><FileText className="w-3 h-3" /> Medidas y Ficha Técnica</label>
                                <textarea 
                                    name="measurements" 
                                    rows={5} 
                                    defaultValue={customer.measurements || ''} 
                                    placeholder="Ingrese las medidas (ej. Contorno Busto: 92cm, Cintura: 74cm, etc.) y anotaciones de la clienta."
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta text-sm font-sans"
                                />
                            </div>

                            <div className="flex items-center gap-4 bg-brand-sand/20 p-4 rounded-sm border border-brand-sand/40">
                                <input 
                                    name="marketing_opt_in" 
                                    type="checkbox" 
                                    defaultChecked={customer.marketing_opt_in} 
                                    id="marketing" 
                                    className="w-4 h-4 accent-brand-terracotta" 
                                />
                                <label htmlFor="marketing" className="text-xs font-medium text-brand-charcoal cursor-pointer">
                                    Acepta recibir promociones exclusivas y lanzamientos de nuevas colecciones (Marketing Directo).
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Actions */}
                    <div className="space-y-6">
                        <div className="bg-brand-charcoal text-white p-8 rounded-sm shadow-xl">
                            <User className="w-12 h-12 text-brand-terracotta mb-6 opacity-50" />
                            <h3 className="font-serif text-xl mb-4">Guardar Cambios</h3>
                            <p className="text-sm text-white/60 mb-8 italic">
                                Asegúrate de registrar las variaciones correctas en el perfil de la clienta para mantener su ficha de medidas e historial siempre al día.
                            </p>
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-brand-terracotta text-white py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-brand-charcoal transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                {saveStatus === 'success' ? 'Cambios Guardados' : 'Guardar Cambios'}
                            </button>
                        </div>
                        
                        <div className="bg-white p-6 border border-dashed border-gray-200 rounded-sm text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 text-center">Seguridad de Datos</p>
                            <p className="text-[8px] text-gray-400">Los datos están encriptados y protegidos según normativas de privacidad vigentes para Elena Atelier.</p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
