import React from 'react';
import ReconciliationDashboard from './ReconciliationDashboard';

export const metadata = {
    title: 'Reconciliación MercadoPago | Elena Atelier',
};

export default function ReconciliacionPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="font-serif text-3xl text-white mb-2 italic">Reconciliación de Pagos</h1>
                <p className="text-gray-400 text-sm">
                    Cruza los reportes de liquidación de MercadoPago con las ventas registradas en el sistema.
                </p>
            </div>

            <ReconciliationDashboard />
        </div>
    );
}
