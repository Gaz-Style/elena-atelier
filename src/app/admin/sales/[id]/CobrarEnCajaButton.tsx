'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, ArrowRight } from 'lucide-react';

interface Props {
    saleId: string;
    internalId: string;
    totalAmount: number;
    currentStatus: string;
}

export default function CobrarEnCajaButton({ saleId, currentStatus }: Props) {
    const router = useRouter();

    // Only show for pending or partial sales
    if (currentStatus !== 'pending' && currentStatus !== 'partial') return null;

    return (
        <button
            type="button"
            onClick={() => router.push(`/admin/pos?saleId=${saleId}`)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all shadow-sm hover:shadow-md group cursor-pointer"
        >
            <Banknote className="w-3.5 h-3.5" />
            Cobrar en POS
            <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </button>
    );
}
