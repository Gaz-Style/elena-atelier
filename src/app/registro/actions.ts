'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/** Normalize any Chilean phone input to the canonical format: +56 9 XXXX XXXX */
function normalizePhone(raw: string | null): string | null {
    if (!raw || raw.trim() === '') return null;
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('56')) digits = digits.slice(2);
    if (digits.startsWith('9') && digits.length === 9) digits = digits.slice(1);
    if (digits.length !== 8) return raw.trim();
    return `+56 9 ${digits.slice(0, 4)} ${digits.slice(4)}`;
}

// Secret for signing the cookie. Falls back to SUPABASE_SERVICE_ROLE_KEY
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret';

function signEmail(email: string) {
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(email);
    const signature = hmac.digest('hex');
    return `${Buffer.from(email).toString('base64')}.${signature}`;
}

export async function publicRegisterCustomer(formData: FormData) {
    try {
        const full_name = formData.get('full_name') as string;
        const email = formData.get('email') as string;
        const phone = normalizePhone(formData.get('phone') as string);
        const style_preference = formData.get('style_preference') as string;
        const typical_occasion = formData.get('typical_occasion') as string;
        const marketing_opt_in = formData.get('marketing_opt_in') === 'on';

        if (!email) {
            return { error: 'El correo electrónico es requerido.' };
        }

        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Check if customer exists first
        const { data: existingCustomer, error: fetchError } = await supabaseAdmin
            .from('customers')
            .select('id, email')
            .eq('email', email)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // Not a 'not found' error
            return { error: fetchError.message };
        }

        if (!existingCustomer) {
            // Insert new customer with real data
            const { error: insertError } = await supabaseAdmin
                .from('customers')
                .insert([{
                    full_name,
                    email,
                    phone,
                    style_preference,
                    typical_occasion,
                    marketing_opt_in
                }]);

            if (insertError) {
                return { error: insertError.message };
            }
        }
        // If it exists, we do nothing to protect admin data.

        // Generate the secure token
        const token = signEmail(email);

        // Set the secure HttpOnly cookie
        const isProd = process.env.NODE_ENV === 'production';
        const cookieStore = await cookies();
        cookieStore.set('agenda_access', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour validity
            path: '/'
        });

        return { success: true };
    } catch (err: any) {
        return { error: err.message || 'Error desconocido' };
    }
}

export async function checkCustomerByEmail(email: string) {
    if (!email || !email.includes('@')) return null;
    try {
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data, error } = await supabaseAdmin
            .from('customers')
            .select('full_name, phone, style_preference, typical_occasion')
            .eq('email', email)
            .maybeSingle();

        if (error) {
            console.error('Error fetching customer by email:', error);
            return null;
        }
        return data;
    } catch (err) {
        console.error('Error in checkCustomerByEmail server action:', err);
        return null;
    }
}

