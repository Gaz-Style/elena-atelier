'use client';

import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, 
    Megaphone, 
    RefreshCw, 
    Send, 
    Mail, 
    User,
    ChevronRight,
    Inbox
} from 'lucide-react';
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
        <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden min-h-[620px] flex flex-col md:flex-row shadow-2xl">
            
            {/* Left Tabs Bar */}
            <div className="w-full md:w-64 bg-[#0a0a0a] border-r border-white/10 p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                    <button 
                        onClick={() => setActiveTab('inbox')}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === 'inbox' 
                                ? 'bg-[#C17F5F] text-white shadow-lg shadow-[#C17F5F]/20' 
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Conversaciones</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('campaigns')}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === 'campaigns' 
                                ? 'bg-[#C17F5F] text-white shadow-lg shadow-[#C17F5F]/20' 
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <Megaphone className="w-4 h-4" />
                        <span>Campañas Masivas</span>
                    </button>
                </div>

                <div className="border-t border-white/5 pt-4">
                    <p className="text-[9px] tracking-[0.2em] font-semibold text-white/30 uppercase text-center">ELENA La Costurera CRM</p>
                </div>
            </div>

            {/* Active view */}
            {activeTab === 'inbox' ? (
                <div className="flex-1 flex flex-col md:flex-row">
                    
                    {/* Customers Sub-list */}
                    <div className="w-full md:w-80 bg-[#161616] border-r border-white/10 flex flex-col max-h-[620px] overflow-hidden">
                        <div className="p-4 border-b border-white/10 bg-[#0F0F0F] flex items-center justify-between">
                            <span className="text-[10px] tracking-widest text-[#C17F5F] font-bold uppercase">CLIENTAS CON CORREO</span>
                            <span className="text-[10px] bg-white/5 text-white/60 px-2 py-0.5 rounded-full font-mono">{customers.length}</span>
                        </div>
                        
                        {/* Custom scrollbar styling wrapper */}
                        <div className="flex-grow overflow-y-auto divide-y divide-white/5 scrollbar-thin">
                            {customers.map((c) => {
                                const initials = c.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCustomerId(c.id)}
                                        className={`w-full p-4 text-left transition-all hover:bg-white/5 flex items-center gap-3 ${
                                            c.id === selectedCustomerId ? 'bg-[#C17F5F]/5 border-r-2 border-[#C17F5F]' : ''
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                            c.id === selectedCustomerId ? 'bg-[#C17F5F] text-white' : 'bg-white/5 text-white/70'
                                        }`}>
                                            {initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white text-sm truncate">{c.full_name}</p>
                                            <p className="text-xs text-white/40 truncate mt-0.5">{c.email}</p>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 text-white/20 transition-all ${c.id === selectedCustomerId ? 'text-[#C17F5F] translate-x-0.5' : ''}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chat Thread Panel */}
                    <div className="flex-grow flex flex-col max-h-[620px] bg-[#0E0E0E]">
                        {selectedCustomer ? (
                            <>
                                {/* Header */}
                                <div className="p-4 border-b border-white/10 bg-[#161616] flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#C17F5F]/15 border border-[#C17F5F]/30 flex items-center justify-center">
                                            <User className="w-5 h-5 text-[#C17F5F]" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-base text-white font-bold tracking-wide">{selectedCustomer.full_name}</h3>
                                            <p className="text-xs text-white/40 mt-0.5">{selectedCustomer.email}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => loadThreads(selectedCustomerId)}
                                        className="text-xs border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/80 px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 font-medium"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${loadingThreads ? 'animate-spin text-[#C17F5F]' : ''}`} />
                                        <span>Actualizar Hilo</span>
                                    </button>
                                </div>

                                {/* Messages Scroll */}
                                <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-[#0a0a0a] flex flex-col scrollbar-thin">
                                    {loadingThreads ? (
                                        <div className="text-center text-white/40 py-12 flex-1 flex flex-col justify-center items-center gap-3">
                                            <RefreshCw className="w-8 h-8 animate-spin text-[#C17F5F]" />
                                            <p className="text-sm font-medium">Cargando conversación...</p>
                                        </div>
                                    ) : threads.length === 0 ? (
                                        <div className="text-center text-white/40 py-12 flex-grow flex flex-col justify-center items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                                <Mail className="w-6 h-6 text-white/30" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white/80">No hay mensajes en este hilo</p>
                                                <p className="text-xs text-white/40 mt-1">Escribe tu primer correo a continuación.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        threads.map((msg) => (
                                            <div 
                                                key={msg.id}
                                                className={`flex flex-col max-w-[80%] rounded-2xl p-4 space-y-2 border ${
                                                    msg.direction === 'outbound' 
                                                        ? 'self-end bg-[#C17F5F]/5 border-[#C17F5F]/15 text-white' 
                                                        : 'self-start bg-[#1C1C1C] border-white/5 text-white/90'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center gap-8 border-b border-white/5 pb-1.5">
                                                    <span className="text-[9px] font-bold tracking-widest text-[#C17F5F] uppercase">
                                                        {msg.direction === 'outbound' ? 'Atelier (Saliente)' : 'Cliente (Entrante)'}
                                                    </span>
                                                    <span className="text-[9px] text-white/30">
                                                        {new Date(msg.created_at).toLocaleString('es-CL')}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-semibold text-white/80 italic font-serif">
                                                    {msg.subject}
                                                </div>
                                                <p className="text-xs whitespace-pre-wrap leading-relaxed text-white/70">
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
                                        rows={2}
                                        className="flex-1 bg-[#1E1E1E] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C17F5F] resize-none"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={sendingReply || !replyBody.trim()}
                                        className="bg-[#C17F5F] hover:bg-[#a96b4f] disabled:opacity-50 text-white font-bold text-xs px-5 py-3.5 rounded-xl transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>{sendingReply ? 'Enviando...' : 'Responder'}</span>
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-3">
                                <Inbox className="w-8 h-8 text-white/20" />
                                <p className="text-sm">Selecciona una clienta de la lista para ver su conversación.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 bg-[#0E0E0E]">
                    {/* Left: Campañas creadas */}
                    <div className="w-full md:w-1/2 flex flex-col space-y-4 max-h-[580px] overflow-hidden">
                        <h2 className="text-lg font-bold font-serif text-white tracking-wide">Historial de Campañas</h2>
                        
                        <div className="bg-[#161616] border border-white/5 rounded-xl overflow-y-auto flex-grow divide-y divide-white/5 scrollbar-thin">
                            {campaigns.length === 0 ? (
                                <div className="p-12 text-center text-white/30 text-sm flex flex-col items-center gap-2">
                                    <Megaphone className="w-8 h-8 text-white/10" />
                                    <p>No has enviado campañas de marketing aún.</p>
                                </div>
                            ) : (
                                campaigns.map((camp) => (
                                    <div key={camp.id} className="p-4 flex flex-col gap-1.5 hover:bg-white/[0.02] transition-all">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-white text-sm">{camp.name}</span>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                                camp.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                            }`}>
                                                {camp.status === 'sent' ? 'Enviado' : 'Fallo'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-white/40 italic">Asunto: {camp.subject}</span>
                                        <div className="flex justify-between items-center mt-3 text-[9px] text-white/30">
                                            <span>Audiencia: {camp.recipient_count} clientas</span>
                                            <span>{new Date(camp.created_at).toLocaleDateString('es-CL')}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Lanzador de Campaña */}
                    <div className="w-full md:w-1/2 bg-[#161616] border border-white/10 p-6 rounded-2xl flex flex-col space-y-4">
                        <div>
                            <h2 className="text-lg font-bold font-serif text-white tracking-wide">Nueva Campaña Masiva</h2>
                            <p className="text-xs text-white/40 mt-1">Redacta una campaña para enviarla en lote a toda tu base de clientas registradas con correo.</p>
                        </div>
                        
                        {campaignSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs">
                                {campaignSuccess}
                            </div>
                        )}

                        <form onSubmit={handleSendCampaign} className="space-y-4 flex-grow flex flex-col">
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Identificador Interno</label>
                                <input
                                    type="text"
                                    value={campName}
                                    onChange={(e) => setCampName(e.target.value)}
                                    placeholder="Ej: Lanzamiento Colección Novias Primavera"
                                    className="w-full bg-[#1E1E1E] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C17F5F] transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Asunto del Correo</label>
                                <input
                                    type="text"
                                    value={campSubject}
                                    onChange={(e) => setCampSubject(e.target.value)}
                                    placeholder="Ej: Te invitamos a nuestra nueva venta exclusiva ✨"
                                    className="w-full bg-[#1E1E1E] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C17F5F] transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2 flex-grow flex flex-col">
                                <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Mensaje (Texto libre)</label>
                                <textarea
                                    value={campContent}
                                    onChange={(e) => setCampContent(e.target.value)}
                                    placeholder="Escribe el cuerpo de tu boletín o anuncio comercial aquí..."
                                    className="w-full flex-grow bg-[#1E1E1E] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C17F5F] transition-all resize-none min-h-[150px]"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sendingCampaign}
                                className="w-full bg-[#C17F5F] hover:bg-[#a96b4f] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-xs mt-2"
                            >
                                {sendingCampaign ? 'Enviando a toda la base...' : 'Despachar Campaña Masiva'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .scrollbar-thin::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 99px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
            `}</style>

        </div>
    );
}
