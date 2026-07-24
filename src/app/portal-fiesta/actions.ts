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
                        // Ignored if called from a Server Component
                    }
                },
            },
        }
    );
}

export async function loginFiestaPortal(email: string, rutBody: string) {
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
        
        const cleanInputRut = rutBody.replace(/[^0-9Kk]/g, '').toUpperCase();
        
        const matchedCustomer = customers.find(c => {
            if (!c.rut) return false;
            const cleanDbRut = c.rut.replace(/[^0-9Kk]/g, '').toUpperCase();
            const dbRutBody = cleanDbRut.slice(0, -1);
            return dbRutBody === cleanInputRut;
        });
        
        if (!matchedCustomer) {
            return { success: false, error: 'Credenciales inválidas' };
        }
        
        // Find the latest active fiesta/gala/madrina/graduación project for this customer
        const { data: projects, error: projectsError } = await supabase
            .from('bridal_projects')
            .select('id')
            .eq('customer_id', matchedCustomer.id)
            .in('project_type', ['madrina', 'graduacion', 'fiesta'])
            .order('created_at', { ascending: false })
            .limit(1);
            
        if (projectsError || !projects || projects.length === 0) {
            return { success: false, error: 'No tienes un proyecto de fiesta activo' };
        }
        
        const projectId = projects[0].id;
        
        return { success: true, projectId };
        
    } catch (e: any) {
        console.error('Login error:', e);
        return { success: false, error: 'Ocurrió un error inesperado al iniciar sesión' };
    }
}
