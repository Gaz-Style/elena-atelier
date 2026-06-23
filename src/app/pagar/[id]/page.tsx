import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import PaymentClient from './PaymentClient';

export const dynamic = 'force-dynamic';

const getAdminClient = () => {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

export default async function PagarOrdenPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ amount?: string }> }) {
    const params = await props.params;
    const { id } = params;
    const searchParams = await props.searchParams;
    const amountParam = searchParams?.amount;

    const supabase = getAdminClient();
    const { data: order, error } = await supabase
        .from('sales_ledger')
        .select('*')
        .eq('internal_id', id)
        .single();

    if (error || !order) {
        const keyExists = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        return (
            <div className="p-8 text-white bg-red-900">
                <h2>Error al cargar la orden: {id}</h2>
                <p>Service Role Key Exists: {keyExists ? 'Yes' : 'No'}</p>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    if (order.status === 'completed' || order.status === 'paid') {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 max-w-md w-full rounded-sm shadow-xl text-center">
                    <h1 className="text-2xl font-serif text-[#1A1A1A] mb-2">Orden Pagada</h1>
                    <p className="text-gray-600 text-sm">Esta orden ya se encuentra pagada.</p>
                </div>
            </div>
        );
    }

    const amountToCharge = amountParam ? parseInt(amountParam, 10) : order.total_amount;

    return (
        <div className="min-h-screen bg-[#0B0C10] text-[#EAEAEA] font-sans antialiased selection:bg-[#C5A880] selection:text-[#12131C] relative overflow-hidden py-24 px-4 flex flex-col items-center justify-center">
            {/* Background elements for premium aesthetic */}
            <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[60%] rounded-full bg-[#C17F5F]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[50%] rounded-full bg-[#C5A880]/5 blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-md">
                <PaymentClient orderId={id} total={amountToCharge} />
            </div>
        </div>
    );
}
