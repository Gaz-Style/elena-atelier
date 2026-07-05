'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { searchAgendaEventsAction } from './actions';
import { useRouter } from 'next/navigation';

export default function AgendaSearchBar({ view, selectedDateStr, initialSearch = '' }: { view: string, selectedDateStr: string, initialSearch?: string }) {
    const [query, setQuery] = useState(initialSearch);
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }
            setIsSearching(true);
            const res = await searchAgendaEventsAction(query);
            if (res.success && res.events) {
                setResults(res.events);
            }
            setIsSearching(false);
        };

        const debounceTimer = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    return (
        <div ref={wrapperRef} className="relative flex-1 sm:w-[300px]">
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar novia o tarea..." 
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && query.trim().length >= 2) {
                            e.preventDefault();
                            setIsOpen(false);
                            router.push(`/admin/agenda?view=${view}&date=${selectedDateStr}&search=${encodeURIComponent(query.trim())}`);
                        }
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                />
                {query && (
                    <button 
                        type="button"
                        onClick={() => { 
                            setQuery(''); 
                            setResults([]); 
                            setIsOpen(false); 
                            if (initialSearch) {
                                router.push(`/admin/agenda?view=${view}&date=${selectedDateStr}`);
                            }
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                        ×
                    </button>
                )}
            </div>

            {isOpen && query.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-100 shadow-xl rounded-lg max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
                        {isSearching ? 'Buscando...' : `Resultados (${results.length})`}
                    </div>
                    
                    {!isSearching && results.length === 0 && (
                        <div className="p-4 text-center">
                            <p className="text-xs text-gray-500 italic">No se encontraron agendamientos.</p>
                        </div>
                    )}
                    
                    {!isSearching && results.map(evento => {
                        const dateStr = new Date(evento.fecha_hora).toISOString().split('T')[0];
                        return (
                            <Link
                                key={evento.id}
                                href={`/admin/agenda?view=day&date=${dateStr}`}
                                onClick={() => {
                                    setIsOpen(false);
                                    setQuery('');
                                }}
                                className="block p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 group transition-colors"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-black">
                                        {evento.tipo_evento === 'tarea_interna' ? evento.notas : `${evento.nombre} ${evento.apellido}`}
                                    </p>
                                    <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm ml-2 shrink-0 ${evento.tipo_evento === 'tarea_interna' ? 'bg-gray-200 text-gray-700' : 'bg-black text-white'}`}>
                                        {evento.tipo_evento === 'tarea_interna' ? 'Bloqueo' : (evento.notas || 'Cita')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-[10px] text-gray-500 flex items-center gap-1 font-mono uppercase tracking-tighter">
                                        <Clock className="w-3 h-3" /> 
                                        {new Date(evento.fecha_hora).toLocaleString('es-CL', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
                                </div>
                            </Link>
                        );
                    })}
                    
                    {!isSearching && results.length > 0 && (
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                router.push(`/admin/agenda?view=${view}&date=${selectedDateStr}&search=${encodeURIComponent(query.trim())}`);
                            }}
                            className="block w-full p-3 text-center text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-50 border-t border-gray-100 uppercase tracking-widest transition-colors"
                        >
                            Ver todos los resultados
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
