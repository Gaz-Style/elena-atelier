const fs = require('fs');
let code = fs.readFileSync('src/app/admin/livechat/page.tsx', 'utf8');

const OLD = `                                {messages.map((msg, index) => {
                                    const isCustomer = msg.sender_type === 'customer';
                                    const prevMsg = index > 0 ? messages[index - 1] : null;
                                    const showDateSeparator = !prevMsg || 
                                        new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDateSeparator && (
                                                <div className="flex justify-center my-3">
                                                    <span className="text-[12.5px] text-gray-600 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                                                        {formatMessageDate(msg.created_at)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className={\`flex \${isCustomer ? 'justify-start' : 'justify-end'}\`}>
                                                <div className={\`relative max-w-[85%] sm:max-w-[65%] rounded-lg px-2.5 py-1.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] \${
                                                    isCustomer 
                                                    ? 'bg-white rounded-tl-none' 
                                                    : 'bg-[#dcf8c6] rounded-tr-none' // Verde clásico WhatsApp web
                                                }\`}>
                                                    
                                                    {/* Indicador de Bot/Humano dentro de la burbuja enviada */}
                                                    {!isCustomer && (
                                                        <div className={\`flex items-center gap-1 mb-0.5 text-[#075e54]\`}>
                                                            {msg.sender_type === 'bot' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                            <span className="text-[11px] font-medium">
                                                                {msg.sender_type === 'bot' ? 'Bot' : 'Tú'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <p className="text-[14.2px] text-[#111111] leading-[19px] whitespace-pre-wrap pb-2 break-all overflow-hidden">
                                                        {msg.content}
                                                        <span className="inline-block w-[65px] h-[1px]"></span>
                                                    </p>
                                                    
                                                    {/* Marca de tiempo estilo WhatsApp */}
                                                    <div className={\`absolute bottom-1 right-2 text-[11px] flex items-center gap-1 \${
                                                        isCustomer ? 'text-gray-500' : 'text-[#667781]'
                                                    }\`}>
                                                        {new Date(msg.created_at).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}
                                                        {!isCustomer && <span className="text-[#53bdeb]">✓✓</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                                <div ref={messagesEndRef} className="h-2" />`;

const NEW = `                                {messages.map((msg, index) => {
                                    const isCustomer = msg.sender_type === 'customer';
                                    const prevMsg = index > 0 ? messages[index - 1] : null;
                                    const showDateSeparator = !prevMsg || 
                                        new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

                                    // Detect image messages: type='image' and media_url is a Meta numeric ID
                                    const isImageMsg = msg.message_type === 'image' && msg.media_url && /^\\d+$/.test(msg.media_url);
                                    // Clean Gemini analysis caption
                                    const rawContent = msg.content || '';
                                    const imageCaption = rawContent
                                        .replace(/^\\[EL USUARIO ENVIÓ UNA FOTO\\. Análisis visual: /i, '')
                                        .replace(/^\\[EL USUARIO ENVIÓ UNA FOTO\\. Error del sistema:[^\\]]+\\]/i, '')
                                        .replace(/\\]$/, '')
                                        .trim();

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDateSeparator && (
                                                <div className="flex justify-center my-3">
                                                    <span className="text-[12.5px] text-gray-600 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                                                        {formatMessageDate(msg.created_at)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className={\`flex \${isCustomer ? 'justify-start' : 'justify-end'}\`}>
                                                <div className={\`relative max-w-[85%] sm:max-w-[65%] rounded-lg shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] overflow-hidden \${
                                                    isCustomer 
                                                    ? 'bg-white rounded-tl-none' 
                                                    : 'bg-[#dcf8c6] rounded-tr-none'
                                                } \${isImageMsg ? 'p-0' : 'px-2.5 py-1.5'}\`}>
                                                    
                                                    {/* Indicador de Bot/Humano - solo en mensajes de texto */}
                                                    {!isCustomer && !isImageMsg && (
                                                        <div className={\`flex items-center gap-1 mb-0.5 text-[#075e54]\`}>
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
                                                                href={\`/api/admin/media/\${msg.media_url}\`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Ver imagen completa"
                                                            >
                                                                <img
                                                                    src={\`/api/admin/media/\${msg.media_url}\`}
                                                                    alt="Foto del cliente"
                                                                    className="max-w-full max-h-[280px] w-auto block cursor-zoom-in object-cover"
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
                                                                <div className="px-2.5 pt-1 pb-4 text-[12px] text-gray-500 italic">
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
                                                            <div className={\`absolute bottom-1 right-2 text-[11px] flex items-center gap-1 \${
                                                                isCustomer ? 'text-gray-500' : 'text-[#667781]'
                                                            }\`}>
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
                                <div ref={messagesEndRef} className="h-2" />`;

if (code.includes(OLD)) {
    code = code.replace(OLD, NEW);
    fs.writeFileSync('src/app/admin/livechat/page.tsx', code, 'utf8');
    console.log('SUCCESS: Image support added to chat.');
} else {
    console.log('ERROR: Target string not found.');
    // Show surrounding context
    const idx = code.indexOf('messages.map((msg, index)');
    console.log('Found at index:', idx);
    console.log(JSON.stringify(code.substring(idx, idx + 200)));
}
