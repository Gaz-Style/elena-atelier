'use client';

import React, { useState, useEffect } from 'react';
import { 
    getEmailThreadsAction, 
    sendBulkCampaignAction, 
    replyToEmailThreadAction 
} from '../actions';

interface Customer {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
}

interface Campaign {
    id: string;
    name: string;
    subject: string;
    recipient_count: number;
    segment: string;
    status: string;
    created_at: string;
}

interface ThreadMessage {
    id: string;
    subject: string;
    direction: 'inbound' | 'outbound';
    sender: string;
    recipient: string;
    body_text: string | null;
    body_html: string | null;
    message_id: string | null;
    created_at: string;
}

export default function CorreoCentralClient({ 
    initialCustomers, 
    initialCampaigns 
}: { 
    initialCustomers: Customer[], 
    initialCampaigns: Campaign[] 
}) {
    const [activeTab, setActiveTab] = useState<'inbox' | 'campaigns'>('inbox');
    const [customers] = useState<Customer[]>(initialCustomers);
    const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
    
    // Inbox state
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomers[0]?.id || '');
    const [threads, setThreads] = useState<ThreadMessage[]>([]);
    const [loadingThreads, setLoadingThreads] = useState(false);
    const [replyBody, setReplyBody] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    // Campaigns state
    const [campName, setCampName] = useState('');
    const [campSubject, setCampSubject] = useState('');
    const [campContent, setCampContent] = useState('');
    const [sendingCampaign, setSendingCampaign] = useState(false);
    const [campaignSuccess, setCampaignSuccess] = useState<string | null>(null);

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    // Load conversation threads
    const loadThreads = async (customerId: string) => {
        if (!customerId) return;
        setLoadingThreads(true);
        try {
            const res = await getEmailThreadsAction(customerId);
            if (res.success) {
                setThreads(res.threads as ThreadMessage[]);
            }
        } catch (err) {
            console.error('Error loading threads:', err);
        } finally {
            setLoadingThreads(false);
        }
    };

    useEffect(() => {
        loadThreads(selectedCustomerId);
    }, [selectedCustomerId]);

    // Handle sending reply in thread
    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId || !replyBody.trim()) return;

        setSendingReply(true);
        try {
            const lastMsg = threads[threads.length - 1];
            const subject = lastMsg ? `Re: ${lastMsg.subject.replace(/^Re:\s*/i, '')}` : 'Mensaje de Elena Atelier';
            
            const res = await replyToEmailThreadAction(
                selectedCustomerId,
                subject,
                replyBody,
                lastMsg?.message_id || undefined
            );

            if (res.success && res.thread) {
                setThreads(prev => [...prev, res.thread as ThreadMessage]);
                setReplyBody('');
            } else {
                alert(res.error || 'No se pudo enviar la respuesta.');
            }
        } catch (err) {
            console.error('Error sending reply:', err);
        } finally {
            setSendingReply(false);
        }
    };

    // Handle sending bulk campaign
    const handleSendCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campName || !campSubject || !campContent) {
            alert('Por favor completa todos los campos.');
            return;
        }

        setSendingCampaign(true);
        setCampaignSuccess(null);
        try {
            // Build raw template HTML
            const compiledHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&family=Pinyon+Script&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #F0EDE8; margin: 0; padding: 20px; }
    .card { max-width: 420px; margin: 0 auto; background-color: #1A1A1A; border-radius: 20px; overflow: hidden; color: #F5F5F0; padding: 30px; text-align: center; }
    .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: 12px; text-transform: uppercase; margin-bottom: 8px; text-align: center; padding-left: 12px; }
    .divider { border-bottom: 1px dashed rgba(255,255,255,0.15); margin: 20px 0; }
    .badge { font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 700; color: #FFFFFF; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; text-align: center; padding-left: 4px; }
    .text { color: #CECAC2; font-size: 13px; line-height: 1.6; text-align: justify; white-space: pre-line; }
  </style>
</head>
<body>
  <div class="card">
    <a href="https://elenalacosturera.cl" style="text-decoration: none; display: block; color: inherit;">
      <div class="logo">ELENA</div>
      <div class="badge">LA COSTURERA</div>
    </a>
    <div class="divider"></div>
    <p style="font-size: 9px; font-weight: 600; color: #C17F5F; letter-spacing: 4px; text-transform: uppercase; margin: 0 auto 20px auto; font-family: 'Inter', sans-serif; text-align: center;">Boletín de Alta Costura</p>
    <p class="text" style="text-align: left;">Hola,</p>
    <div class="text" style="text-align: left; margin-bottom: 30px;">
      ${campContent.replace(/\n/g, '<br/>')}
    </div>
    <div style="margin-top: 30px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 20px; text-align: center;">
      <p style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #C17F5F; margin: 0 0 10px 0;">Agradecemos tu preferencia</p>
      <p style="font-style: italic; font-size: 14px; color: #E5E0D8; margin: 0 0 4px 0;">Con cariño,</p>
      <p style="font-family: 'Pinyon Script', cursive; font-size: 38px; color: #FFFFFF; margin: 0 0 4px 0; font-weight: normal;">Elena R.</p>
      <p style="font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #8A857D; margin: 0;">ELENA La Costurera</p>
    </div>
    <p style="font-size: 8px; color: #8A857D; letter-spacing: 2.5px; margin-top: 36px; font-weight: 400; font-family: 'Inter', sans-serif;">Av. Tabancura 1091, Oficina 319 · Vitacura</p>
  </div>
</body>
</html>
            `;

            const res = await sendBulkCampaignAction(campName, campSubject, compiledHtml, 'all');
            if (res.success && res.campaign) {
                setCampaignSuccess(`Campaña enviada con éxito a ${res.sentCount} de ${res.total} clientas.`);
                setCampName('');
                setCampSubject('');
                setCampContent('');
                setCampaigns(prev => [res.campaign as Campaign, ...prev]);
            } else {
                alert('Ocurrió un error al despachar la campaña.');
            }
        } catch (err) {
            console.error('Error sending campaign:', err);
        } finally {
            setSendingCampaign(false);
        }
    };

    return (
        <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl overflow-hidden min-h-[600px] flex flex-col md:flex-row">
            
            {/* Left Tabs Bar */}
            <div className="w-full md:w-64 bg-[#161616] border-r border-white/10 p-4 space-y-2 flex flex-col">
                <button 
                    onClick={() => setActiveTab('inbox')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'inbox' ? 'bg-[#C17F5F] text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                >
                    💬 Conversaciones (Hilos)
                </button>
                <button 
                    onClick={() => setActiveTab('campaigns')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'campaigns' ? 'bg-[#C17F5F] text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                >
                    📣 Campañas Masivas
                </button>

                <div className="flex-1" />
                <div className="border-t border-white/5 pt-4 text-[10px] text-white/40 text-center">
                    ELENA La Costurera CRM
                </div>
            </div>

            {/* Active view */}
            {activeTab === 'inbox' ? (
                <div className="flex-1 flex flex-col md:flex-row">
                    {/* Customers Sub-list */}
                    <div className="w-full md:w-80 bg-[#1A1A1A] border-r border-white/10 flex flex-col max-h-[600px] overflow-y-auto">
                        <div className="p-4 border-b border-white/5">
                            <span className="text-[10px] tracking-widest text-[#C17F5F] uppercase font-bold">CLIENTAS RECIENTES</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {customers.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedCustomerId(c.id)}
                                    className={`w-full p-4 text-left transition-all hover:bg-white/5 flex flex-col gap-1 ${c.id === selectedCustomerId ? 'bg-[#C17F5F]/10 border-l-4 border-[#C17F5F]' : ''}`}
                                >
                                    <span className="font-semibold text-white text-sm">{c.full_name}</span>
                                    <span className="text-xs text-white/50 truncate">{c.email}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Thread Panel */}
                    <div className="flex-1 flex flex-col max-h-[600px]">
                        {selectedCustomer ? (
                            <>
                                {/* Header */}
                                <div className="p-4 border-b border-white/10 bg-[#161616] flex justify-between items-center">
                                    <div>
                                        <h3 className="font-serif text-lg text-white font-bold">{selectedCustomer.full_name}</h3>
                                        <p className="text-xs text-white/60">{selectedCustomer.email}</p>
                                    </div>
                                    <button 
                                        onClick={() => loadThreads(selectedCustomerId)}
                                        className="text-xs border border-white/20 hover:bg-white/5 text-white/70 hover:text-white px-3 py-1.5 rounded transition-all"
                                    >
                                        🔄 Actualizar Hilo
                                    </button>
                                </div>

                                {/* Messages Scroll */}
                                <div className="flex-1 p-6 space-y-4 overflow-y-auto min-h-[300px] bg-[#121212] flex flex-col">
                                    {loadingThreads ? (
                                        <div className="text-center text-white/50 py-12">Cargando conversación...</div>
                                    ) : threads.length === 0 ? (
                                        <div className="text-center text-white/40 py-12 flex-1 flex flex-col justify-center items-center">
                                            <p className="text-2xl mb-2">✉️</p>
                                            <p className="text-sm">No hay mensajes previos en este hilo.</p>
                                            <p className="text-xs text-white/30 mt-1">Escribe tu primer correo a continuación.</p>
                                        </div>
                                    ) : (
                                        threads.map((msg) => (
                                            <div 
                                                key={msg.id}
                                                className={`flex flex-col max-w-[85%] rounded-2xl p-4 space-y-2 ${
                                                    msg.direction === 'outbound' 
                                                        ? 'self-end bg-[#C17F5F]/10 border border-[#C17F5F]/20 text-white' 
                                                        : 'self-start bg-[#242424] border border-white/5 text-white/90'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center gap-6">
                                                    <span className="text-[9px] font-bold tracking-wider text-[#C17F5F] uppercase">
                                                        {msg.direction === 'outbound' ? 'Atelier (Saliente)' : 'Cliente (Entrante)'}
                                                    </span>
                                                    <span className="text-[9px] text-white/30">
                                                        {new Date(msg.created_at).toLocaleString('es-CL')}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-semibold text-white/70 italic">
                                                    Asunto: {msg.subject}
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                                    {msg.body_text || 'Mensaje enviado en formato HTML (Ver plantilla)'}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Reply Input Area */}
                                <form onSubmit={handleSendReply} className="p-4 border-t border-white/10 bg-[#161616] flex gap-3 items-end">
                                    <textarea
                                        value={replyBody}
                                        onChange={(e) => setReplyBody(e.target.value)}
                                        placeholder="Escribe tu respuesta y mantén el hilo de la conversación..."
                                        rows={3}
                                        className="flex-1 bg-[#1E1E1E] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#C17F5F] resize-none"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={sendingReply || !replyBody.trim()}
                                        className="bg-[#C17F5F] hover:bg-[#a96b4f] disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg"
                                    >
                                        {sendingReply ? 'Enviando...' : 'Enviar'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
                                Selecciona una clienta de la lista para ver su conversación.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                    {/* Left: Campañas creadas */}
                    <div className="w-full md:w-1/2 flex flex-col space-y-4">
                        <h2 className="text-xl font-bold font-serif text-white">Historial de Campañas</h2>
                        <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden flex-1 divide-y divide-white/5">
                            {campaigns.length === 0 ? (
                                <div className="p-8 text-center text-white/40 text-sm">No has enviado campañas de marketing aún.</div>
                            ) : (
                                campaigns.map((camp) => (
                                    <div key={camp.id} className="p-4 flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-white text-sm">{camp.name}</span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${camp.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                {camp.status === 'sent' ? 'Completado' : 'Fallo'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-white/50">Asunto: {camp.subject}</span>
                                        <div className="flex justify-between items-center mt-2 text-[10px] text-white/40">
                                            <span>Audiencia: {camp.recipient_count} clientas</span>
                                            <span>{new Date(camp.created_at).toLocaleDateString('es-CL')}</span>
                                        </div>
                                    </div>
                                ))
							)}
                        </div>
                    </div>

                    {/* Right: Lanzador de Campaña */}
                    <div className="w-full md:w-1/2 bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl flex flex-col space-y-4">
                        <h2 className="text-xl font-bold font-serif text-white">Nueva Campaña Masiva</h2>
                        <p className="text-xs text-white/50">Redacta una campaña para enviarla en lote a toda tu base de clientas registradas con correo.</p>
                        
                        {campaignSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm">
                                {campaignSuccess}
                            </div>
                        )}

                        <form onSubmit={handleSendCampaign} className="space-y-4 flex-1 flex flex-col">
                            <div className="space-y-2">
                                <label className="text-xs text-white/60 uppercase font-bold tracking-wider">Identificador Interno de Campaña</label>
                                <input
                                    type="text"
                                    value={campName}
                                    onChange={(e) => setCampName(e.target.value)}
                                    placeholder="Ej: Lanzamiento Colección Novias Primavera"
                                    className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#C17F5F]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-white/60 uppercase font-bold tracking-wider">Asunto del Correo</label>
                                <input
                                    type="text"
                                    value={campSubject}
                                    onChange={(e) => setCampSubject(e.target.value)}
                                    placeholder="Ej: Te invitamos a nuestra nueva venta exclusiva ✨"
                                    className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#C17F5F]"
                                    required
                                />
                            </div>

                            <div className="space-y-2 flex-1 flex flex-col">
                                <label className="text-xs text-white/60 uppercase font-bold tracking-wider">Contenido de la Campaña (Texto libre)</label>
                                <textarea
                                    value={campContent}
                                    onChange={(e) => setCampContent(e.target.value)}
                                    placeholder="Escribe el cuerpo de tu boletín o anuncio comercial aquí..."
                                    rows={8}
                                    className="w-full flex-1 bg-[#242424] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#C17F5F]"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sendingCampaign}
                                className="w-full bg-[#C17F5F] hover:bg-[#a96b4f] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg text-sm mt-4"
                            >
                                {sendingCampaign ? 'Enviando a toda la base...' : 'Despachar Campaña Masiva'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
