'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Bot, User, Phone, CheckCircle, Search, ToggleLeft, ToggleRight, MessageSquare, ArrowLeft as ArrowLeftMobile, Smile } from 'lucide-react';
import { getWhatsAppChatsAction, getWhatsAppMessagesAction, sendWhatsAppMessageAction, toggleBotSessionAction } from './actions';

// Icono simple de WhatsApp (Omnicanal)
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

export default function LiveChatPage() {
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [autoRevertSeconds, setAutoRevertSeconds] = useState<number | null>(null);
    
    // UI State for mobile responsiveness
    const [showMobileList, setShowMobileList] = useState(true);

    const autoRevertRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const AUTO_REVERT_SECS = 180; // 3 minutos

    const clearAutoRevert = () => {
        if (autoRevertRef.current) clearInterval(autoRevertRef.current);
        autoRevertRef.current = null;
        setAutoRevertSeconds(null);
    };

    const startAutoRevert = (chatId: string) => {
        clearAutoRevert();
        setAutoRevertSeconds(AUTO_REVERT_SECS);
        let remaining = AUTO_REVERT_SECS;
        autoRevertRef.current = setInterval(async () => {
            remaining -= 1;
            setAutoRevertSeconds(remaining);
            if (remaining <= 0) {
                clearAutoRevert();
                await toggleBotSessionAction(chatId, true);
                setSelectedChat((prev: any) => {
                    if (prev && prev.id === chatId) {
                        return { ...prev, session_status: 'bot' };
                    }
                    return prev;
                });
                loadChats();
            }
        }, 1000);
    };

    const loadChats = () => {
        getWhatsAppChatsAction().then(data => {
            setChats(data);
            setLoading(false);
            setSelectedChat((prevSelected: any) => {
                if (prevSelected) {
                    const updatedSelected = data.find((c: any) => c.id === prevSelected.id);
                    return updatedSelected || prevSelected;
                }
                return prevSelected;
            });
        });
    };

    useEffect(() => {
        loadChats();
        const interval = setInterval(loadChats, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        const loadMessages = () => {
            if (selectedChat?.id) {
                getWhatsAppMessagesAction(selectedChat.id).then(msgs => {
                    setMessages(msgs);
                });
            }
        };

        loadMessages();
        interval = setInterval(loadMessages, 5000); 
        
        return () => clearInterval(interval);
    }, [selectedChat?.id]);

    useEffect(() => {
        if (selectedChat?.id && selectedChat?.session_status !== 'bot') {
            startAutoRevert(selectedChat.id);
        } else {
            clearAutoRevert();
        }
        return () => {
            clearAutoRevert();
        };
    }, [selectedChat?.id, selectedChat?.session_status]);

    const scrollToBottom = (instant = false) => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
        }, 100);
    };

    // Auto-scroll when messages change or chat is selected
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom(true); // instant scroll to avoid annoying animation on load
        }
    }, [messages.length, selectedChat?.id]);

    const handleSelectChat = (chat: any) => {
        setSelectedChat(chat);
        setShowMobileList(false); // Oculta lista en mobile
    };

    const handleBackToList = () => {
        setShowMobileList(true);
        setSelectedChat(null);
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
        
        const msgs = await getWhatsAppMessagesAction(selectedChat.id);
        setMessages(msgs);
        
        if (selectedChat.session_status === 'bot') {
            setSelectedChat({ ...selectedChat, session_status: 'human_handoff' });
            loadChats();
        } else {
            startAutoRevert(selectedChat.id);
        }
    };

    const toggleBot = async () => {
        if (!selectedChat) return;
        const newStatus = selectedChat.session_status === 'bot' ? false : true;
        await toggleBotSessionAction(selectedChat.id, newStatus);
        const newSessionStatus = newStatus ? 'bot' : 'human_handoff';
        setSelectedChat({ ...selectedChat, session_status: newSessionStatus });
        loadChats();
    };

    const formatMessageDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        if (d.toDateString() === today.toDateString()) {
            return 'HOY';
        } else if (d.toDateString() === yesterday.toDateString()) {
            return 'AYER';
        } else {
            return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
        }
    };

    const formatLastInteraction = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        if (d.toDateString() === today.toDateString()) {
            return d.toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'});
        } else if (d.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        } else {
            return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit' });
        }
    };

    return (
        <div className="h-[calc(100dvh-64px)] lg:h-[100dvh] w-full bg-[#f0f2f5] flex flex-col font-sans overflow-hidden">
            
            {/* Header Global (Desktop) */}
            <div className={`bg-brand-charcoal px-4 py-3 flex items-center justify-between text-white shrink-0 shadow-sm z-20 ${!showMobileList ? 'hidden md:flex' : 'flex'}`}>
                <div>
                    <Link href="/admin" className="text-gray-300 hover:text-white text-xs flex items-center gap-2 mb-0.5 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Dashboard
                    </Link>
                    <h1 className="text-lg font-serif">Bandeja Omnicanal</h1>
                </div>
            </div>

            <div className="flex-grow flex w-full max-w-[1600px] mx-auto overflow-hidden bg-white md:my-0 md:rounded-none md:border-t md:border-gray-200">
                
                {/* --- SIDEBAR LISTA DE CHATS --- */}
                <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-gray-200 flex flex-col bg-white shrink-0 transition-all z-10 ${!showMobileList ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-2 border-b border-gray-100 bg-white">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Busca un chat o contacto" 
                                className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-100 border-none rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-brand-terracotta transition-colors" 
                            />
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto bg-white">
                        {loading ? (
                            <p className="text-center text-sm text-gray-400 p-8 animate-pulse">Cargando chats...</p>
                        ) : chats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                                <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                                <p className="text-sm">Bandeja vacía</p>
                            </div>
                        ) : (
                            chats.map(chat => (
                                <button
                                    key={chat.id}
                                    onClick={() => handleSelectChat(chat)}
                                    className={`w-full px-3 py-3 border-b border-gray-100 text-left transition-colors flex items-center gap-3 relative ${selectedChat?.id === chat.id ? 'bg-[#f0f2f5]' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            <User className="w-6 h-6 text-gray-500" />
                                        </div>
                                        {/* Omnichannel Badge */}
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-[2px] shadow-sm">
                                            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-grow overflow-hidden pr-1">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h4 className="font-medium text-gray-900 truncate text-[16px]">
                                                {chat.customers?.full_name || chat.phone_number}
                                            </h4>
                                            <span className="text-[12px] text-gray-500 shrink-0 ml-2">
                                                {formatLastInteraction(chat.last_interaction)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-[14px] text-gray-500 truncate flex-grow">
                                                {chat.session_status === 'bot' ? 'IA respondiendo...' : '👤 En espera...'}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* --- MAIN CHAT AREA --- */}
                <div className={`w-full min-w-0 flex-grow flex-col bg-[#efeae2] relative ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
                    {/* Trama de fondo tipo WhatsApp */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.4]" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/508/887/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp-thumbnail.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.05 }}></div>
                    
                    {selectedChat ? (
                        <>
                            {/* Sticky Header del Chat */}
                            <div className="h-[60px] px-3 border-b border-gray-200 bg-[#f0f2f5] flex items-center justify-between shrink-0 z-10 sticky top-0">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={handleBackToList}
                                        className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                                    >
                                        <ArrowLeftMobile className="w-6 h-6" />
                                    </button>
                                    
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                                        <User className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <div className="flex flex-col ml-1">
                                        <h3 className="font-semibold text-gray-900 text-[16px] leading-tight">
                                            {selectedChat.customers?.full_name || selectedChat.phone_number}
                                        </h3>
                                        <p className="text-[13px] text-gray-500 leading-tight">
                                            {selectedChat.phone_number}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pr-2">
                                    {selectedChat.session_status !== 'bot' && autoRevertSeconds !== null && (
                                        <span className="hidden sm:inline-block text-[12px] text-orange-800 bg-orange-100 px-3 py-1 rounded-full font-medium animate-pulse">
                                            Reanuda IA en {autoRevertSeconds}s
                                        </span>
                                    )}
                                    <button 
                                        onClick={toggleBot}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                                            selectedChat.session_status === 'bot' 
                                            ? 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50' 
                                            : 'bg-[#00a884] text-white border-[#00a884] hover:bg-[#008f6f]'
                                        }`}
                                    >
                                        {selectedChat.session_status === 'bot' ? <ToggleRight className="w-5 h-5 text-[#00a884]" /> : <ToggleLeft className="w-5 h-5" />}
                                        <span className="hidden sm:inline">{selectedChat.session_status === 'bot' ? 'Modo Bot IA' : 'Modo Humano'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Área de Historial de Mensajes */}
                            <div className="flex-grow overflow-y-auto p-3 sm:p-5 space-y-2 z-10 scroll-smooth">
                                {messages.map((msg, index) => {
                                    const isCustomer = msg.sender_type === 'customer';
                                    const prevMsg = index > 0 ? messages[index - 1] : null;
                                    const showDateSeparator = !prevMsg || 
                                        new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

                                    // Detect image messages: type='image' and media_url is a Meta numeric ID
                                    const isImageMsg = msg.message_type === 'image' && msg.media_url && /^\d+$/.test(msg.media_url);
                                    // Clean Gemini analysis caption - filter out errors and partial/broken responses
                                    const rawContent = msg.content || '';
                                    let imageCaption = rawContent
                                        .replace(/^\[EL USUARIO ENVIÓ UNA FOTO\. Análisis visual: /i, '')
                                        .replace(/^\[EL USUARIO ENVIÓ UNA FOTO\. Análisis de la imagen: /i, '')
                                        .replace(/^\[EL USUARIO ENVIÓ UN(A)? (FOTO|AUDIO)\. Error del sistema[^\]]*\]/i, '')
                                        .replace(/^\[EL USUARIO ENVIÓ UN(A)? (FOTO|AUDIO)[^\]]*\]/i, '')
                                        .replace(/\]$/, '')
                                        .trim();
                                    // Hide caption if it's too short (broken/partial), contains error indicators, or is raw JSON
                                    if (imageCaption.length < 10 || /error|quota|"@type"|google\.rpc|FreeTier|blocked/i.test(imageCaption) || imageCaption.startsWith('{') || imageCaption.startsWith('[')) {
                                        imageCaption = '';
                                    }

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDateSeparator && (
                                                <div className="flex justify-center my-3">
                                                    <span className="text-[12.5px] text-gray-600 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                                                        {formatMessageDate(msg.created_at)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                                                <div className={`relative max-w-[85%] sm:max-w-[65%] rounded-xl shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ${
                                                    isCustomer 
                                                    ? 'bg-white rounded-tl-none before:absolute before:top-0 before:-left-[8px] before:w-0 before:h-0 before:border-r-[8px] before:border-r-white before:border-b-[12px] before:border-b-transparent' 
                                                    : 'bg-[#dcf8c6] rounded-tr-none after:absolute after:top-0 after:-right-[8px] after:w-0 after:h-0 after:border-l-[8px] after:border-l-[#dcf8c6] after:border-b-[12px] after:border-b-transparent'
                                                } ${isImageMsg ? 'p-1' : 'px-2.5 py-1.5'}`}>
                                                    
                                                    {/* Indicador de Bot/Humano - solo en mensajes de texto */}
                                                    {!isCustomer && !isImageMsg && (
                                                        <div className={`flex items-center gap-1 mb-0.5 text-[#075e54]`}>
                                                            {msg.sender_type === 'bot' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                            <span className="text-[11px] font-medium">
                                                                {msg.sender_type === 'bot' ? 'Bot' : 'Tú'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {isImageMsg ? (
                                                        /* ── IMAGEN ── */
                                                        <div className="relative">
                                                            <a
                                                                href={`/api/admin/media/${msg.media_url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Ver imagen completa"
                                                            >
                                                                <img
                                                                    src={`/api/admin/media/${msg.media_url}`}
                                                                    alt="Foto del cliente"
                                                                    className="max-w-full max-h-[280px] w-auto block cursor-zoom-in object-cover rounded-lg"
                                                                    loading="lazy"
                                                                    onError={(e) => {
                                                                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                                        const sib = (e.currentTarget as HTMLImageElement).nextElementSibling;
                                                                        if (sib) sib.classList.remove('hidden');
                                                                    }}
                                                                />
                                                                <div className="hidden p-3 text-[13px] text-gray-500 flex items-center gap-2">
                                                                    <span>📷</span><span>Foto (imagen expirada o Token Meta vencido)</span>
                                                                </div>
                                                            </a>
                                                            {imageCaption && (
                                                                <div className="px-2.5 pt-1 pb-4 text-[12px] text-gray-500 italic break-words whitespace-pre-wrap overflow-hidden max-w-full">
                                                                    🤖 {imageCaption}
                                                                </div>
                                                            )}
                                                            <div className="absolute bottom-1 right-2 text-[11px] flex items-center gap-1 bg-black/40 text-white rounded px-1">
                                                                {new Date(msg.created_at).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* ── TEXTO ── */
                                                        <>
                                                            <p className="text-[14.2px] text-[#111111] leading-[19px] whitespace-pre-wrap pb-2 break-all overflow-hidden">
                                                                {msg.content}
                                                                <span className="inline-block w-[65px] h-[1px]"></span>
                                                            </p>
                                                            <div className={`absolute bottom-1 right-2 text-[11px] flex items-center gap-1 ${
                                                                isCustomer ? 'text-gray-500' : 'text-[#667781]'
                                                            }`}>
                                                                {new Date(msg.created_at).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}
                                                                {!isCustomer && <span className="text-[#53bdeb]">✓✓</span>}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                                <div ref={messagesEndRef} className="h-2" />
                            </div>

                            {/* Sticky Input Area (Cápsula inferior) */}
                            <div className="bg-[#f0f2f5] p-2.5 pb-[max(10px,env(safe-area-inset-bottom))] z-20 shrink-0">
                                {sendError && (
                                    <div className="mb-2 text-[12px] text-red-600 text-center bg-red-50 py-1 rounded">
                                        ⚠️ Error: {sendError}
                                    </div>
                                )}
                                
                                <div className="flex items-end gap-2 max-w-5xl mx-auto relative">
                                {/* Emoji Picker Popover - outside overflow-hidden */}
                                {showEmojiPicker && (
                                    <div className="absolute bottom-[52px] left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 w-[320px] max-h-[280px] overflow-y-auto">
                                        {[
                                            { label: 'Frecuentes', emojis: ['😊', '👍', '❤️', '🙏', '✨', '🎉', '💯', '🔥', '👏', '😍', '🥰', '💪'] },
                                            { label: 'Caras', emojis: ['😀', '😃', '😄', '😁', '😆', '🥹', '😅', '🤣', '😂', '🙂', '😉', '😌', '😘', '🤔', '🤗', '😎', '🫡', '🤩'] },
                                            { label: 'Gestos', emojis: ['👋', '🤝', '✌️', '🤞', '👌', '💅', '🫶', '🙌', '👀', '💬', '📸', '📌'] },
                                            { label: 'Moda & Costura', emojis: ['🧵', '🪡', '✂️', '👗', '👔', '👖', '👠', '👜', '🎀', '💎', '🪭', '👰'] },
                                            { label: 'Objetos', emojis: ['📅', '⏰', '📍', '📞', '💌', '🏷️', '💳', '🧾', '📦', '🚚', '⭐', '🌟'] },
                                        ].map((cat) => (
                                            <div key={cat.label} className="mb-2">
                                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 px-1">{cat.label}</p>
                                                <div className="grid grid-cols-9 gap-0.5">
                                                    {cat.emojis.map((emoji) => (
                                                        <button
                                                            key={emoji}
                                                            type="button"
                                                            onClick={() => {
                                                                setReplyText(prev => prev + emoji);
                                                                textareaRef.current?.focus();
                                                            }}
                                                            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition-colors cursor-pointer"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex-grow bg-white rounded-3xl flex items-center px-2 min-h-[44px]">
                                    {/* Emoji Picker Button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`p-2 rounded-full transition-colors shrink-0 ${showEmojiPicker ? 'text-[#00a884]' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Smile className="w-6 h-6" />
                                    </button>


                                    <textarea
                                        ref={textareaRef}
                                        value={replyText}
                                        onChange={(e) => { 
                                            setReplyText(e.target.value); 
                                            setSendError(null);
                                            if (selectedChat?.id && selectedChat?.session_status !== 'bot') {
                                                startAutoRevert(selectedChat.id);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        onFocus={() => setShowEmojiPicker(false)}
                                        placeholder="Escribe un mensaje"
                                        className="w-full py-3 text-[15px] bg-transparent outline-none resize-none max-h-[120px] scrollbar-hide flex items-center"
                                        rows={1}
                                        style={{ height: replyText.split('\n').length > 1 ? 'auto' : '44px' }}
                                    />
                                </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={!replyText.trim() || sending}
                                        className="bg-[#00a884] text-white rounded-full w-[44px] h-[44px] flex items-center justify-center shrink-0 transition-transform active:scale-95 disabled:opacity-50"
                                    >
                                        {sending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="hidden md:flex flex-grow flex-col items-center justify-center text-gray-500 bg-[#f0f2f5] z-10 border-b-8 border-[#00a884]">
                            <h2 className="text-3xl font-light text-[#41525d] mb-4 mt-8">WhatsApp Web</h2>
                            <p className="text-[14px] text-[#667781] text-center max-w-md leading-relaxed">
                                Envía y recibe mensajes sin necesidad de tener tu teléfono conectado.
                                Usa WhatsApp en hasta 4 dispositivos vinculados y 1 teléfono a la vez.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
