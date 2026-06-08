'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Bot, User, Phone, CheckCircle, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { getWhatsAppChatsAction, getWhatsAppMessagesAction, sendWhatsAppMessageAction, toggleBotSessionAction } from './actions';

export default function LiveChatPage() {
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadChats = () => {
        getWhatsAppChatsAction().then(data => {
            setChats(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadChats();
        // Polling for new messages (realtime subscription would be better)
        const interval = setInterval(loadChats, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedChat) {
            getWhatsAppMessagesAction(selectedChat.id).then(msgs => {
                setMessages(msgs);
                scrollToBottom();
            });
        }
    }, [selectedChat]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = async () => {
        if (!replyText.trim() || !selectedChat || sending) return;
        const txt = replyText;
        setReplyText('');
        setSendError(null);
        setSending(true);
        
        // Optimistic update
        setMessages(prev => [...prev, { id: Date.now(), sender_type: 'human', content: txt, created_at: new Date().toISOString() }]);
        scrollToBottom();

        const result = await sendWhatsAppMessageAction(selectedChat.id, txt);
        setSending(false);
        
        if (!result.success) {
            setSendError(result.error || 'Error desconocido al enviar el mensaje');
        }
        
        // Refresh messages from DB
        const msgs = await getWhatsAppMessagesAction(selectedChat.id);
        setMessages(msgs);
        
        // Update local chat status to human if needed
        if (selectedChat.session_status === 'bot') {
            setSelectedChat({ ...selectedChat, session_status: 'human_handoff' });
            loadChats();
        }
    };

    const toggleBot = async () => {
        if (!selectedChat) return;
        const newStatus = selectedChat.session_status === 'bot' ? false : true;
        await toggleBotSessionAction(selectedChat.id, newStatus);
        setSelectedChat({ ...selectedChat, session_status: newStatus ? 'bot' : 'human_handoff' });
        loadChats();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans h-screen">
            {/* Sidebar Simple */}
            <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col hidden md:flex shrink-0">
                <div className="mb-10">
                    <h2 className="text-xl font-serif font-bold tracking-wider">ELENA ATELIER</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Admin Panel</p>
                </div>
                <nav className="flex-1 space-y-2">
                    <Link href="/admin/livechat" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black text-white text-sm font-medium">
                        Live Chat
                    </Link>
                    <Link href="/admin/agenda" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black transition-colors text-sm font-medium">
                        Agenda
                    </Link>
                    <Link href="/admin/horarios" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black transition-colors text-sm font-medium">
                        Horarios
                    </Link>
                </nav>
            </aside>

            {/* Main Chat Area Wrapper */}
            <div className="flex-1 p-6 flex flex-col h-screen overflow-hidden">
                <div className="w-full flex-grow flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-brand-charcoal px-6 py-4 flex items-center justify-between text-white shrink-0">
                        <div>
                            <Link href="/admin" className="text-gray-400 hover:text-white text-xs flex items-center gap-2 mb-1 transition-colors">
                                <ArrowLeft className="w-3 h-3" />
                                Volver al Dashboard
                            </Link>
                            <h1 className="text-xl font-serif">Elena La Costurera (Live Chat)</h1>
                        </div>
                    </div>

                <div className="flex flex-grow overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50">
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <input type="text" placeholder="Buscar conversación..." className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-brand-terracotta transition-colors" />
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            {loading ? (
                                <p className="text-center text-sm text-gray-400 p-4">Cargando chats...</p>
                            ) : chats.length === 0 ? (
                                <p className="text-center text-sm text-gray-400 p-4">No hay conversaciones</p>
                            ) : (
                                chats.map(chat => (
                                    <button
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat)}
                                        className={`w-full p-4 border-b border-gray-100 text-left transition-colors flex items-start gap-3 ${selectedChat?.id === chat.id ? 'bg-white border-l-4 border-brand-terracotta' : 'hover:bg-gray-100 border-l-4 border-transparent'}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-brand-sand flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-brand-charcoal" />
                                        </div>
                                        <div className="flex-grow overflow-hidden">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-bold text-sm text-brand-charcoal truncate">{chat.customers?.full_name || chat.phone_number}</h4>
                                                <span className="text-[10px] text-gray-400">{new Date(chat.last_interaction).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] uppercase tracking-wider font-bold ${chat.session_status === 'bot' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {chat.session_status === 'bot' ? 'Bot IA' : 'Humano'}
                                                </span>
                                                <span className="text-xs text-gray-500 truncate">Score: {chat.lead_score}%</span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="w-2/3 flex flex-col bg-white">
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-sand flex items-center justify-center">
                                            <User className="w-6 h-6 text-brand-charcoal" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-brand-charcoal">{selectedChat.customers?.full_name || selectedChat.phone_number}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {selectedChat.phone_number}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={toggleBot}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${
                                                selectedChat.session_status === 'bot' 
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' 
                                                : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                                            }`}
                                        >
                                            {selectedChat.session_status === 'bot' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                            {selectedChat.session_status === 'bot' ? 'IA Activa' : 'Pausado (Humano)'}
                                        </button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                                    {messages.map(msg => {
                                        const isCustomer = msg.sender_type === 'customer';
                                        return (
                                            <div key={msg.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                                                    isCustomer ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none' 
                                                    : msg.sender_type === 'bot' ? 'bg-brand-sand/30 border border-brand-sand text-brand-charcoal rounded-tr-none' 
                                                    : 'bg-brand-charcoal text-white rounded-tr-none'
                                                }`}>
                                                    {!isCustomer && (
                                                        <div className="flex items-center gap-1 mb-1 opacity-70">
                                                            {msg.sender_type === 'bot' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                            <span className="text-[9px] uppercase tracking-widest font-bold">
                                                                {msg.sender_type === 'bot' ? 'Elena La Costurera' : 'Asesor'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    <div className={`text-[10px] mt-2 flex justify-end items-center gap-1 ${isCustomer ? 'text-gray-400' : 'text-white/70'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}
                                                        {!isCustomer && <CheckCircle className="w-3 h-3" />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                                    {selectedChat.session_status === 'bot' && (
                                        <div className="mb-2 text-[10px] text-blue-600 font-medium bg-blue-50 p-2 rounded-md border border-blue-100 flex items-center gap-2">
                                            <Bot className="w-4 h-4" />
                                            El Agente IA está respondiendo automáticamente. Al enviar un mensaje, el bot se pausará.
                                        </div>
                                    )}
                                    {sendError && (
                                        <div className="mb-2 text-[11px] text-red-700 font-medium bg-red-50 p-2 rounded-md border border-red-200 flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5">⚠️</span>
                                            <span><strong>Error WhatsApp:</strong> {sendError}</span>
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => { setReplyText(e.target.value); setSendError(null); }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            }}
                                            placeholder="Escribe un mensaje al cliente..."
                                            className="flex-grow p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta resize-none min-h-[60px]"
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={!replyText.trim() || sending}
                                            className="bg-brand-charcoal text-white p-4 rounded-lg hover:bg-brand-terracotta transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[60px] w-[60px]"
                                        >
                                            {sending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
                                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                                <p>Selecciona una conversación para comenzar</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}

// Just an icon to avoid missing import
const MessageSquare = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
