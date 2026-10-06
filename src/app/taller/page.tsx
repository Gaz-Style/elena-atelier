'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveOperators, verifyOperatorPin } from './actions';
import { Scissors, ChevronRight, Loader2, Lock, X } from 'lucide-react';

export default function TallerLoginPage() {
    const router = useRouter();
    const [operators, setOperators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Auth state
    const [selectedOp, setSelectedOp] = useState<any | null>(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    useEffect(() => {
        getActiveOperators().then(data => {
            setOperators(data);
            setLoading(false);
        });
    }, []);

    const handleSelect = (op: any) => {
        setSelectedOp(op);
        setPin('');
        setError(false);
    };

    const handlePinEntry = (digit: string) => {
        if (pin.length < 4) {
            const newPin = pin + digit;
            setPin(newPin);
            setError(false);
            
            if (newPin.length === 4) {
                verifyPin(newPin);
            }
        }
    };

    const verifyPin = async (enteredPin: string) => {
        setIsAuthenticating(true);
        
        try {
            const isValid = await verifyOperatorPin(selectedOp.id, enteredPin);
            
            if (isValid) {
                router.push(`/taller/${selectedOp.id}`);
            } else {
                setError(true);
                setPin('');
                setIsAuthenticating(false);
            }
        } catch (error) {
            console.error("Error verificando PIN:", error);
            setError(true);
            setPin('');
            setIsAuthenticating(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden bg-[#FDFCF8]">
            {/* Decorative blurs */}
            <div className="absolute top-[-20%] right-[-15%] w-[50%] h-[40%] rounded-full bg-[#C17F5F]/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-15%] left-[-10%] w-[40%] h-[35%] rounded-full bg-[#F5F5F0]/50 blur-[80px] pointer-events-none" />

            {/* Logo */}
            <div className="text-center mb-12 z-10">
                <h1 className="font-serif text-4xl md:text-5xl font-black tracking-[0.15em] text-[#1A1A1A] uppercase">
                    ELENA
                </h1>
                <p className="text-[9px] font-bold tracking-[0.4em] text-[#C17F5F] uppercase mt-2">
                    Portal del Taller
                </p>
                <div className="w-12 h-[1px] bg-[#C17F5F]/30 mx-auto mt-4" />
            </div>

            {/* Operator Selection */}
            {loading ? (
                <div className="flex flex-col items-center gap-3 py-12 z-10">
                    <Loader2 className="w-6 h-6 text-[#C17F5F] animate-spin" />
                    <span className="text-xs text-[#737373] uppercase tracking-widest font-semibold">Cargando equipo...</span>
                </div>
            ) : operators.length === 0 ? (
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 text-center shadow-sm z-10">
                    <Scissors className="w-8 h-8 text-[#C17F5F]/40 mx-auto mb-3" />
                    <p className="text-sm text-[#737373]">No hay costureras activas registradas en el sistema.</p>
                </div>
            ) : (
                <div className="w-full max-w-md space-y-3 z-10">
                    <p className="text-sm text-[#4A4A4A] font-light text-center mb-8">
                        Selecciona tu nombre para ver tu agenda del día, fichas técnicas y entregas pendientes.
                    </p>
                    
                    {operators.map(op => (
                        <button
                            key={op.id}
                            onClick={() => handleSelect(op)}
                            disabled={selectedOp !== null}
                            className={`w-full group flex items-center justify-between px-6 py-5 bg-white border rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md text-left ${
                                selectedOp?.id === op.id
                                    ? 'border-[#C17F5F] bg-[#C17F5F]/5 shadow-md scale-[0.98]'
                                    : 'border-[#E5E5E5] hover:border-[#C17F5F]/40'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold uppercase transition-all duration-300 ${
                                    selectedOp?.id === op.id
                                        ? 'bg-[#C17F5F] text-white'
                                        : 'bg-[#F5F5F0] text-[#C17F5F] group-hover:bg-[#C17F5F]/10'
                                }`}>
                                    {op.name.charAt(0)}
                                </div>
                                <div>
                                    <span className="block text-sm font-semibold text-[#1A1A1A]">
                                        {op.name}
                                    </span>
                                    <span className="text-[10px] text-[#737373] uppercase tracking-widest font-medium">
                                        Operaria Activa
                                    </span>
                                </div>
                            </div>
                            <div className={`transition-all duration-300 ${
                                selectedOp?.id === op.id ? 'text-[#C17F5F]' : 'text-[#E5E5E5] group-hover:text-[#C17F5F]/50'
                            }`}>
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* PIN MODAL */}
            {selectedOp && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
                    <div className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl pt-8 pb-10 px-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:fade-in-0 duration-300">
                        
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">{selectedOp.name}</h3>
                                <p className="text-xs text-[#737373] mt-1">Ingresa tu clave de 4 dígitos para acceder</p>
                            </div>
                            <button 
                                onClick={() => { setSelectedOp(null); setPin(''); setError(false); }}
                                className="bg-[#F5F5F0] text-[#737373] p-2 rounded-full hover:text-[#1A1A1A] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* PIN DISPLAY */}
                        <div className="flex justify-center gap-3 mb-8">
                            {[0, 1, 2, 3].map(i => (
                                <div 
                                    key={i}
                                    className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${
                                        error 
                                            ? 'bg-red-50 border-2 border-red-200 text-red-500' 
                                            : pin.length > i 
                                                ? 'bg-[#1A1A1A] border-2 border-[#1A1A1A] text-white' 
                                                : 'bg-[#F5F5F0] border-2 border-transparent text-transparent'
                                    }`}
                                >
                                    {pin.length > i ? '•' : ''}
                                </div>
                            ))}
                        </div>

                        {error && (
                            <p className="text-center text-xs font-bold text-red-500 uppercase tracking-widest mb-4 animate-bounce">
                                Clave incorrecta
                            </p>
                        )}
                        {isAuthenticating && !error && (
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Loader2 className="w-4 h-4 text-[#C17F5F] animate-spin" />
                                <span className="text-xs font-bold text-[#C17F5F] uppercase tracking-widest">Validando...</span>
                            </div>
                        )}
                        {!error && !isAuthenticating && <div className="h-4 mb-4" />} {/* Spacer */}

                        {/* NUMPAD */}
                        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handlePinEntry(num.toString())}
                                    disabled={isAuthenticating}
                                    className="h-16 rounded-2xl bg-[#FDFCF8] border border-[#E5E5E5] text-2xl font-medium text-[#1A1A1A] hover:bg-[#F5F5F0] hover:border-[#C17F5F]/30 active:scale-95 transition-all shadow-sm"
                                >
                                    {num}
                                </button>
                            ))}
                            <div className="h-16" /> {/* Empty spot */}
                            <button
                                onClick={() => handlePinEntry('0')}
                                disabled={isAuthenticating}
                                className="h-16 rounded-2xl bg-[#FDFCF8] border border-[#E5E5E5] text-2xl font-medium text-[#1A1A1A] hover:bg-[#F5F5F0] hover:border-[#C17F5F]/30 active:scale-95 transition-all shadow-sm"
                            >
                                0
                            </button>
                            <button
                                onClick={() => {
                                    setPin(pin.slice(0, -1));
                                    setError(false);
                                }}
                                disabled={isAuthenticating || pin.length === 0}
                                className="h-16 rounded-2xl bg-[#F5F5F0] text-sm font-bold text-[#737373] hover:text-[#1A1A1A] active:scale-95 transition-all flex items-center justify-center uppercase tracking-widest"
                            >
                                Borrar
                            </button>
                        </div>
                        
                        <div className="mt-8 text-center flex items-center justify-center gap-1.5 text-[#737373]/60">
                            <Lock className="w-3 h-3" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Portal Seguro</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-16 text-center z-10 pb-6">
                <p className="text-[8px] text-[#737373]/60 uppercase tracking-[0.3em] font-semibold">
                    Solo Lectura · Atelier Elena La Costurera
                </p>
            </div>
        </div>
    );
}
