'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { registerBridalInstallment, acceptContract } from '@/app/admin/novias/actions';
import { commitWebpayTransaction } from '@/lib/transbank';

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = searchParams.get('token_ws') || searchParams.get('TBK_TOKEN');

    useEffect(() => {
        if (!token) {
            setError("No se recibió token de Transbank. El pago pudo haber sido anulado.");
            setLoading(false);
            return;
        }

        // Llamar al commit de Webpay
        commitWebpayTransaction(token)
            .then(async (res) => {
                if (res.success && res.data && res.data.response_code === 0 && res.data.status === 'AUTHORIZED') {
                    const data = res.data;
                    
                    let cuotaIndex = 0;
                    if (data.buy_order && data.buy_order.includes('_C')) {
                        const parts = data.buy_order.split('_C');
                        cuotaIndex = parseInt(parts[1], 10);
                    }

                    // Registrar abono
                    await registerBridalInstallment(projectId, cuotaIndex, 'Webpay Plus', true);

                    if (cuotaIndex === 0) {
                        await acceptContract(projectId);
                    }

                    // Redireccionar al éxito
                    router.replace(`/portal-fiesta/${projectId}/pago-exitoso`);
                } else {
                    setError(res.error || `El pago fue rechazado por su banco o tarjeta. (Código: ${res.data?.response_code ?? 'N/A'})`);
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("Excepción al procesar pago:", err);
                setError(`Excepción al procesar pago: ${err.message || String(err)}`);
                setLoading(false);
            });
    }, [token, projectId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F6F0] font-sans text-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#C17F5F] mb-6" />
                <h1 className="font-serif text-3xl mb-4">Confirmando Pago</h1>
                <p className="text-gray-500 max-w-md">Por favor, no cierres la ventana. Estamos validando tu transacción con Webpay...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8F6F0] font-sans text-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-6">
                    <XCircle className="w-8 h-8" />
                </div>
                <h1 className="font-serif text-3xl mb-4">Error en el Pago</h1>
                <p className="text-gray-500 mb-8 max-w-md">{error}</p>
                <Link 
                    href={`/portal-fiesta/${projectId}/pagar`}
                    className="bg-[#1A1A1A] text-white px-8 py-3 rounded-sm text-sm uppercase tracking-widest font-bold hover:bg-[#C17F5F] transition-colors"
                >
                    Volver a intentar
                </Link>
            </div>
        );
    }

    return null;
}

export default function WebpayCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F8F6F0] font-sans text-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#C17F5F] mb-6" />
                <h1 className="font-serif text-3xl mb-4">Cargando...</h1>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
