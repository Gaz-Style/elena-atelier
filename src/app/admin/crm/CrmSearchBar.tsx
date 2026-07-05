'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import { searchCustomersAction } from './actions';
import { useRouter } from 'next/navigation';

export default function CrmSearchBar() {
    const [query, setQuery] = useState('');
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
            const res = await searchCustomersAction(query);
            if (res.success && res.customers) {
                setResults(res.customers);
            }
            setIsSearching(false);
        };

        const debounceTimer = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    return (
        <div ref={wrapperRef} className="relative flex-grow md:flex-grow-0 w-full md:w-auto z-50">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar clienta..." 
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full md:w-64 pl-10 pr-4 py-3 md:py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-brand-terracotta bg-white transition-colors"
                />
                {query && (
                    <button 
                        type="button"
                        onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                        ×
                    </button>
                )}
            </div>

            {isOpen && query.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 md:w-[400px] mt-2 bg-white border border-gray-100 shadow-xl rounded-sm max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
                        {isSearching ? 'Buscando...' : `Resultados (${results.length})`}
                    </div>
                    
                    {!isSearching && results.length === 0 && (
                        <div className="p-4 text-center">
                            <p className="text-xs text-gray-500 italic mb-2">No se encontraron clientas.</p>
                            <Link href="/admin/crm/nueva" className="text-[10px] uppercase tracking-widest font-bold text-brand-terracotta hover:underline">
                                + Crear nueva clienta
                            </Link>
                        </div>
                    )}
                    
                    {!isSearching && results.map(customer => (
                        <Link
                            key={customer.id}
                            href={`/admin/crm/${customer.id}`}
                            onClick={() => {
                                setIsOpen(false);
                                setQuery('');
                            }}
                            className="block p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 group transition-colors"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-sm font-medium text-brand-charcoal group-hover:text-black">
                                    {customer.full_name}
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">
                                    {customer.email} | {customer.phone}
                                </p>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-terracotta transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
