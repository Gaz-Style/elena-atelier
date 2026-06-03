import React from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { Terminal, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export const revalidate = 0; // Disable caching

function formatJSON(json: any) {
    if (!json) return 'No payload';
    try {
        return JSON.stringify(json, null, 2);
    } catch (e) {
        return String(json);
    }
}

export default async function SystemLogsPage() {
    const supabase = await createClient();
    
    // Fetch logs
    const { data: logs, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    const safeLogs = logs || [];

    return (
        <div className="min-h-screen bg-brand-charcoal text-white font-sans">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24 space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-brand-sand">
                            <Terminal className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Monitor de Sistema</span>
                        </div>
                        <h1 className="font-serif text-4xl text-white">System Logs</h1>
                        <p className="text-white/60 mt-2 text-sm">Monitoreo en vivo de Webhooks y pasarelas de pago (Últimos 100 eventos)</p>
                    </div>
                </header>

                <div className="bg-black/40 border border-white/10 rounded-sm overflow-hidden">
                    {safeLogs.length === 0 ? (
                        <div className="p-12 text-center text-white/40">
                            <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No hay eventos registrados en el sistema.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {safeLogs.map((log: any) => (
                                <div key={log.id} className="p-6 hover:bg-white/5 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        <div className="flex-shrink-0 pt-1">
                                            {log.level === 'ERROR' ? (
                                                <ShieldAlert className="w-5 h-5 text-red-500" />
                                            ) : log.level === 'WARN' ? (
                                                <AlertCircle className="w-5 h-5 text-orange-400" />
                                            ) : (
                                                <Info className="w-5 h-5 text-green-400" />
                                            )}
                                        </div>
                                        <div className="flex-grow space-y-2">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm ${
                                                        log.level === 'ERROR' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                                        log.level === 'WARN' ? 'bg-orange-400/10 text-orange-300 border border-orange-400/20' : 
                                                        'bg-green-400/10 text-green-300 border border-green-400/20'
                                                    }`}>
                                                        {log.level}
                                                    </span>
                                                    <span className="text-white/80 font-semibold">{log.service}</span>
                                                </div>
                                                <span className="text-xs text-white/40 font-mono">
                                                    {new Date(log.created_at).toLocaleString('es-CL')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/90">{log.message}</p>
                                            
                                            {log.payload && (
                                                <div className="mt-4 bg-black/60 border border-white/10 rounded-sm p-4 overflow-x-auto">
                                                    <pre className="text-[10px] text-brand-sand font-mono leading-relaxed">
                                                        {formatJSON(log.payload)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
