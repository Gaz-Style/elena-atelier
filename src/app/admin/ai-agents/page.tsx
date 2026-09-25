import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { BrainCircuit, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

export default async function AIAgentsPage() {
    const supabase = await createClient();

    // Fetch tasks stats
    const { data: tasks } = await supabase
        .from('ai_agent_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    const pendingCount = tasks?.filter(t => t.status === 'pending').length || 0;
    const processingCount = tasks?.filter(t => t.status === 'processing').length || 0;
    const completedCount = tasks?.filter(t => t.status === 'completed').length || 0;
    const failedCount = tasks?.filter(t => t.status === 'failed').length || 0;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-zinc-900">Orquestador de Agentes IA</h1>
                    <p className="text-sm text-zinc-500">Monitor de ejecución y tareas en cola del motor DeepSeek</p>
                </div>
                <Link 
                    href="/admin/livechat"
                    className="px-4 py-2 bg-brand-charcoal text-white text-xs uppercase tracking-wider font-bold rounded-lg hover:bg-zinc-800 transition-colors"
                >
                    Ir a Live Chat
                </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase">Pendientes</p>
                        <h3 className="text-2xl font-bold text-zinc-900">{pendingCount}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase">Procesando</p>
                        <h3 className="text-2xl font-bold text-zinc-900">{processingCount}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase">Completadas</p>
                        <h3 className="text-2xl font-bold text-zinc-900">{completedCount}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase">Fallidas</p>
                        <h3 className="text-2xl font-bold text-zinc-900">{failedCount}</h3>
                    </div>
                </div>
            </div>

            {/* Recent Tasks Queue */}
            <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                    <h3 className="font-bold text-zinc-800 text-sm">Últimas Tareas del Orquestador</h3>
                    <span className="text-xs text-zinc-400">DeepSeek Chat / WhatsApp Agent</span>
                </div>
                <div className="divide-y divide-zinc-100">
                    {(!tasks || tasks.length === 0) ? (
                        <p className="p-6 text-center text-sm text-zinc-400">No hay tareas registradas en la cola.</p>
                    ) : (
                        tasks.map((task: any) => (
                            <div key={task.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <BrainCircuit className="w-5 h-5 text-zinc-400" />
                                    <div>
                                        <p className="text-xs font-bold text-zinc-800 uppercase">{task.agent_role}</p>
                                        <p className="text-xs text-zinc-500 max-w-md truncate">{task.payload?.content || 'Sin contenido de texto'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                        task.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                        task.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {task.status}
                                    </span>
                                    <span className="text-[10px] text-zinc-400">
                                        {new Date(task.created_at).toLocaleTimeString('es-CL')}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
