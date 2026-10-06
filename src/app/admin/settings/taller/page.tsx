'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, ShieldCheck, Lock, Scissors } from 'lucide-react';
import { getOperatorsAccessAction, updateOperatorPinAction } from './actions';

export default function TallerAccessSettingsPage() {
    const [operators, setOperators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingOpId, setSavingOpId] = useState<string | null>(null);

    const loadData = () => {
        setLoading(true);
        getOperatorsAccessAction().then(data => {
            setOperators(data || []);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSavePin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const opId = formData.get('id') as string;
        
        setSavingOpId(opId);
        const res = await updateOperatorPinAction(formData);
        
        if (res.success) {
            alert('Clave guardada exitosamente.');
            loadData();
        } else {
            alert("Error: " + res.error);
        }
        setSavingOpId(null);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-2">
                <Link href="/admin/settings" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors w-fit mb-2">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Configuraciones
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <ShieldCheck className="text-blue-600 w-5 h-5" />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">Accesos Portal Taller</h1>
                </div>
                <p className="text-zinc-500 text-sm ml-13">
                    Gestiona los PINs de seguridad de 4 dígitos para que las costureras puedan acceder a su agenda diaria.
                </p>
            </header>

            <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6">
                <h2 className="font-bold text-lg text-zinc-900 mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-zinc-400" /> Claves de Acceso (PIN)
                </h2>
                
                {loading ? (
                    <div className="text-center py-10 text-zinc-500 text-sm">Cargando operarias...</div>
                ) : operators.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 text-sm border border-dashed rounded-xl border-zinc-200">
                        No hay costureras activas en el sistema.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {operators.map(op => (
                            <form key={op.id} onSubmit={handleSavePin} className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-xl hover:border-zinc-200 transition-colors">
                                <input type="hidden" name="id" value={op.id} />
                                
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-brand-sand flex items-center justify-center text-brand-charcoal font-bold uppercase shrink-0">
                                        {op.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900">{op.name}</p>
                                        <span className={`text-[10px] uppercase tracking-widest font-bold ${op.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                                            {op.status === 'active' ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-zinc-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            name="pin" 
                                            maxLength={4} 
                                            placeholder="Ej: 5042" 
                                            defaultValue={op.pin || ''} 
                                            required
                                            pattern="\d{4}"
                                            title="La clave debe tener exactamente 4 números."
                                            className="block w-32 pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono tracking-widest text-center"
                                        />
                                    </div>
                                    
                                    <button 
                                        disabled={savingOpId === op.id} 
                                        type="submit" 
                                        className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-sm shrink-0"
                                    >
                                        {savingOpId === op.id ? '...' : <><Save className="w-4 h-4" /> Guardar</>}
                                    </button>
                                </div>
                            </form>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
