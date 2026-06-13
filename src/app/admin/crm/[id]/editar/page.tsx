import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EditCustomerForm from './EditCustomerForm';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !customer) {
        return notFound();
    }

    return <EditCustomerForm customer={customer} />;
}
