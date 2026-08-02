import React from 'react';
import { commitWebpayTransaction } from '@/lib/transbank';
import { redirect } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getBridalProjectById, registerBridalInstallment, acceptContract, sendBridalThankYouEmailAction, sendBridalPaymentConfirmationEmailAction } from '@/app/admin/novias/actions';

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
        return <ErrorView projectId={projectId} message="No se recibió token de Transbank. El pago pudo haber sido anulado." isFiesta={false} />;
    }

    try {
        const commitResponse = await commitWebpayTransaction(token);

        if (!commitResponse.success || !commitResponse.data) {
            return <ErrorView projectId={projectId} message={`Error al confirmar el pago: ${commitResponse.error}`} isFiesta={false} />;
        }

        const data = commitResponse.data;

        if (data.response_code === 0 && data.status === 'AUTHORIZED') {
            const project = await getBridalProjectById(projectId);
            const isFiesta = project && project.project_type && ['madrina', 'graduacion', 'fiesta'].includes(project.project_type);
            
            let cuotaIndex = 0;
            if (data.buy_order && data.buy_order.includes('_C')) {
                const parts = data.buy_order.split('_C');
                cuotaIndex = parseInt(parts[1], 10);
            }

            await registerBridalInstallment(projectId, cuotaIndex, 'Webpay');

            if (cuotaIndex === 0 && project && !project.contract_accepted) {
                await acceptContract(projectId);
                await sendBridalThankYouEmailAction(projectId);
            } else {
                await sendBridalPaymentConfirmationEmailAction(projectId, cuotaIndex, data.amount, 'Webpay Plus');
            }

            if (isFiesta) {
                redirect(`/portal-fiesta/${projectId}/pago-exitoso`);
            } else {
                redirect(`/portal-novias/${projectId}/pago-exitoso`);
            }
        } else {
            const project = await getBridalProjectById(projectId);
            const isFiesta = project && project.project_type && ['madrina', 'graduacion', 'fiesta'].includes(project.project_type);
            return <ErrorView projectId={projectId} message={`El pago fue rechazado por su banco o tarjeta. (Código: ${data.response_code})`} isFiesta={!!isFiesta} />;
        }
    } catch (err: any) {
        return <ErrorView projectId={projectId} message={`Excepción al procesar pago: ${err.message || String(err)}`} isFiesta={false} />;
    }
}

function ErrorView({ projectId, message, isFiesta }: { projectId: string; message: string; isFiesta: boolean }) {
    return (
        <div className="min-h-screen bg-[#F8F6F0] font-sans text-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-6">
                <XCircle className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-3xl mb-4">Error en el Pago</h1>
            <p className="text-gray-500 mb-8 max-w-md">{message}</p>
            <Link 
                href={isFiesta ? `/portal-fiesta/${projectId}/pagar` : `/portal-novias/${projectId}/pagar`}
                className="bg-[#1A1A1A] text-white px-8 py-3 rounded-sm text-sm uppercase tracking-widest font-bold hover:bg-[#C17F5F] transition-colors"
            >
                Volver a intentar
            </Link>
        </div>
    );
}
