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
        
        // Find ALL active projects for this customer (any type)
        const { data: projects, error: projectsError } = await supabase
            .from('bridal_projects')
            .select('id, project_type, created_at')
            .eq('customer_id', matchedCustomer.id)
            .order('created_at', { ascending: false });
            
        if (projectsError || !projects || projects.length === 0) {
            return { success: false, error: 'No tienes un proyecto activo' };
        }
        
        // If only one project, redirect directly (original behavior)
        if (projects.length === 1) {
            const projectId = projects[0].id;
            const projectType = projects[0].project_type;
            return { success: true, projectId, projectType, projects: null };
        }
        
        // Multiple projects: return all so the UI can show a selector
        return { 
            success: true, 
            projectId: null, 
            projectType: null, 
            projects: projects.map(p => ({ id: p.id, project_type: p.project_type }))
        };
        
    } catch (e: any) {
        console.error('Login error:', e);
        return { success: false, error: 'Ocurrió un error inesperado al iniciar sesión' };
    }
}
