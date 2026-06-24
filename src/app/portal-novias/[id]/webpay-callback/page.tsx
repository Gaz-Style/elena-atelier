import React from 'react';
import { commitWebpayTransaction } from '@/lib/transbank';
import { redirect } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getBridalProjectById, registerPayment, acceptContract, sendBridalThankYouEmailAction } from '@/app/admin/novias/actions';

export const dynamic = 'force-dynamic';

export default async function WebpayCallbackPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ token_ws?: string; TBK_TOKEN?: string }>;
}) {
    const { id: projectId } = await params;
    const resolvedSearchParams = await searchParams;
    const token = resolvedSearchParams.token_ws || resolvedSearchParams.TBK_TOKEN;

    if (!token) {
        return <ErrorView projectId={projectId} message="No se recibió token de Transbank. El pago pudo haber sido anulado." />;
    }

    try {
        const commitResponse = await commitWebpayTransaction(token);

        if (!commitResponse.success || !commitResponse.data) {
            return <ErrorView projectId={projectId} message={`Error al confirmar el pago: ${commitResponse.error}`} />;
        }

        const data = commitResponse.data;

        if (data.response_code === 0 && data.status === 'AUTHORIZED') {
            // Pago exitoso, procesar en base de datos
            const project = await getBridalProjectById(projectId);
            
            if (project && project.payment_1_status !== 'paid') {
                // Registrar contrato y pago
                await acceptContract(projectId);
                await registerPayment(projectId, 1);
                await sendBridalThankYouEmailAction(projectId);
            }

            // Redirigir a la página de éxito
            redirect(`/portal-novias/${projectId}/pago-exitoso`);
        } else {
            return <ErrorView projectId={projectId} message={`El pago fue rechazado por su banco o tarjeta. (Código: ${data.response_code})`} />;
        }
    } catch (err: any) {
        return <ErrorView projectId={projectId} message={`Excepción al procesar pago: ${err.message || String(err)}`} />;
    }
}

function ErrorView({ projectId, message }: { projectId: string; message: string }) {
    return (
        <div className="min-h-screen bg-[#F8F6F0] font-sans text-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-6">
                <XCircle className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-3xl mb-4">Error en el Pago</h1>
            <p className="text-gray-500 mb-8 max-w-md">{message}</p>
            <Link 
                href={`/portal-novias/${projectId}/pagar`}
                className="bg-[#1A1A1A] text-white px-8 py-3 rounded-sm text-sm uppercase tracking-widest font-bold hover:bg-[#C17F5F] transition-colors"
            >
                Volver a intentar
            </Link>
        </div>
    );
}
