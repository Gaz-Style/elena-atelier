'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabaseClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

export async function loginBridalPortal(email: string, rutBody: string) {
    try {
        const supabase = await getSupabaseClient();
        
        // Find the customer by email
        const { data: customers, error: customerError } = await supabase
            .from('customers')
            .select('id, rut')
            .ilike('email', email);
            
        if (customerError || !customers || customers.length === 0) {
            return { success: false, error: 'Credenciales inválidas' };
        }
        
        // Since email could match multiple, find the one with matching RUT body
        // The RUT in DB could be "12345678-9" or "12.345.678-9"
        const cleanInputRut = rutBody.replace(/[^0-9Kk]/g, '').toUpperCase();
        
        const matchedCustomer = customers.find(c => {
            if (!c.rut) return false;
            // Clean the DB rut
            const cleanDbRut = c.rut.replace(/[^0-9Kk]/g, '').toUpperCase();
            // Remove the verifier digit from the DB rut to compare
            const dbRutBody = cleanDbRut.slice(0, -1);
            return dbRutBody === cleanInputRut;
        });
        
        if (!matchedCustomer) {
            return { success: false, error: 'Credenciales inválidas' };
        }
        
        // Find the latest active bridal project for this customer
        const { data: projects, error: projectsError } = await supabase
            .from('bridal_projects')
            .select('id')
            .eq('customer_id', matchedCustomer.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
        if (projectsError || !projects || projects.length === 0) {
            return { success: false, error: 'No tienes un proyecto de novia activo' };
        }
        
        const projectId = projects[0].id;
        
        // In a real app we might set a secure session cookie here.
        // For now, we return the projectId so the client can redirect to the secret URL.
        // We could also set a simple cookie to prove they logged in, if we want to lock down the URL.
        
        return { success: true, projectId };
        
    } catch (e: any) {
        console.error('Login error:', e);
        return { success: false, error: 'Ocurrió un error inesperado al iniciar sesión' };
    }
}
