import { createClient } from '@supabase/supabase-js';
import { ShieldCheck, Plus, Trash2, Mail, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import UserForm from './UserForm';
import DeleteUserButton from './DeleteUserButton';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-charcoal/5 flex items-center justify-center">
            <ShieldCheck className="text-brand-charcoal w-5 h-5" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">Usuarios Administradores</h1>
        </div>
        <p className="text-zinc-500 text-sm ml-13">
          Crea nuevas cuentas y gestiona quién tiene acceso a Elena OS.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Crear Usuario */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-zinc-900 mb-1">Nuevo Usuario</h2>
            <p className="text-sm text-zinc-500 mb-6">Completa los datos para dar de alta a un miembro del equipo.</p>
            <UserForm />
          </div>
        </div>

        {/* Columna Derecha: Lista de Usuarios */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Usuario (Correo)</th>
                    <th className="px-6 py-4">Último Acceso</th>
                    <th className="px-6 py-4">Fecha de Alta</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {users && users.length > 0 ? (
                    users.map((user) => {
                      const isMainAdmin = user.email === 'elenaatalier@gmail.com';
                      return (
                        <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs uppercase">
                                {user.email?.substring(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-zinc-900">{user.email}</span>
                                {isMainAdmin && <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Súper Admin</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-600">
                            {user.last_sign_in_at 
                              ? new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(user.last_sign_in_at))
                              : 'Nunca'}
                          </td>
                          <td className="px-6 py-4 text-zinc-500 text-xs">
                            {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(user.created_at))}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {!isMainAdmin && <DeleteUserButton userId={user.id} />}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
