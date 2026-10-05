import { createClient } from '@/lib/supabase/server';
import { Monitor, Smartphone, Globe, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

function parseUserAgent(ua: string) {
  if (!ua) return 'Desconocido';
  
  let browser = 'Navegador Desconocido';
  let os = 'OS Desconocido';

  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';
  else if (ua.includes('Opera/') || ua.includes('OPR/')) browser = 'Opera';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return `${browser} en ${os}`;
}

export default async function SessionsPage() {
  const supabase = await createClient();

  const { data: sessions, error } = await supabase
    .from('admin_sessions_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const isMissingTable = error?.message?.includes('relation "public.admin_sessions_log" does not exist');

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-charcoal/5 flex items-center justify-center">
            <ShieldCheck className="text-brand-charcoal w-5 h-5" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">Sesiones & Accesos</h1>
        </div>
        <p className="text-zinc-500 text-sm ml-13">
          Monitorea quién y desde dónde acceden al panel de administración de Elena.
        </p>
      </header>

      {isMissingTable ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-lg">Falta configurar la base de datos</h3>
            <p className="text-amber-700 max-w-md mx-auto text-sm mt-1">
              Para ver las sesiones, primero debes ejecutar el archivo SQL <strong>`supabase_admin_sessions.sql`</strong> en la sección SQL Editor de tu panel de Supabase.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Fecha y Hora</th>
                  <th className="px-6 py-4">Dirección IP</th>
                  <th className="px-6 py-4">Dispositivo / Navegador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sessions && sessions.length > 0 ? (
                  sessions.map((session) => {
                    const isMobile = session.user_agent?.toLowerCase().includes('mobile');
                    return (
                      <tr key={session.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900">{session.email}</div>
                        </td>
                        <td className="px-6 py-4 text-zinc-600">
                          {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(session.created_at))}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                          {session.ip_address || 'Desconocida'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-zinc-600">
                            {isMobile ? <Smartphone className="w-4 h-4 text-zinc-400" /> : <Globe className="w-4 h-4 text-zinc-400" />}
                            <span className="truncate max-w-[200px]" title={session.user_agent}>
                              {parseUserAgent(session.user_agent || '')}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                      Aún no hay inicios de sesión registrados desde que se habilitó esta función.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
