'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Mail, Send, Search, RefreshCw, X, Check, AlertCircle, ChevronRight, Eye,
    FileCheck, Calendar, FileText, Wallet, CheckCircle, Megaphone, Inbox,
    Clock, Copy, ArrowLeft, BarChart2, Users
} from 'lucide-react';
import {
    getEmailThreadsAction,
    sendTemplatedEmailAction,
    markThreadsAsReadAction,
    sendBulkCampaignAction,
    getMarketingCampaignsAction
} from '../actions';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Customer { id: string; full_name: string; email: string | null; phone: string | null; }
interface Campaign { id: string; name: string; subject: string; recipient_count: number; status: string; created_at: string; }
interface ThreadMessage {
    id: string;
    customer_id: string | null;
    subject: string;
    direction: 'inbound' | 'outbound';
    sender: string;
    recipient: string;
    body_text: string | null;
    body_html: string | null;
    created_at: string;
    read_at: string | null;
    customers?: any;
}
interface TemplateVariable { key: string; label: string; default: string; type?: string; }
interface Template { id: string; name: string; description: string; defaultSubject: string; variables: TemplateVariable[]; emoji: string; }

// ─── Template Definitions ──────────────────────────────────────────────────────
const TEMPLATES: Template[] = [
    { id: 'welcome',     emoji: '✨', name: 'Bienvenida',        description: 'Carta de bienvenida al Atelier.',           defaultSubject: 'Bienvenida a Elena La Costurera ✨',           variables: [] },
    { id: 'appointment', emoji: '📅', name: 'Confirmación Cita', description: 'Cita de prueba o asesoría confirmada.',      defaultSubject: 'Tu cita está confirmada — Elena Atelier',     variables: [
        { key: 'SERVICE', label: 'Tipo de Cita',  default: 'Prueba de calce' },
        { key: 'DATE',    label: 'Fecha',          default: 'Jueves 15 de Octubre' },
        { key: 'TIME',    label: 'Hora',           default: '16:30 hrs' }
    ]},
    { id: 'budget',      emoji: '📋', name: 'Presupuesto',       description: 'Propuesta de diseño a medida.',             defaultSubject: 'Tu diseño a medida te está esperando',        variables: [
        { key: 'LINK',   label: 'Enlace',          default: 'https://elenalacosturera.cl/quotes/propuesta' }
    ]},
    { id: 'payment',     emoji: '💳', name: 'Confirmación Pago', description: 'Recibo digital de pago o abono.',           defaultSubject: 'Confirmación de Pago — Elena Atelier',        variables: [
        { key: 'SERVICE', label: 'Servicio',       default: 'Vestido a medida' },
        { key: 'AMOUNT',  label: 'Monto',          default: '$150.000 CLP' },
        { key: 'METHOD',  label: 'Método de Pago', default: 'Transferencia Bancaria' }
    ]},
    { id: 'order_ready', emoji: '👗', name: 'Prenda Lista',      description: 'Tu prenda está lista para retiro.',         defaultSubject: 'Tu prenda está lista para retiro ✨',          variables: [
        { key: 'ITEM',   label: 'Prenda',          default: 'Vestido de Novia' },
        { key: 'HOURS',  label: 'Horario',         default: 'Lun–Vie 10:00–19:00 hrs' }
    ]},
    { id: 'custom',      emoji: '✉️', name: 'Mensaje Libre',     description: 'Comunicación oficial con texto libre.',     defaultSubject: 'Actualización sobre tu prenda',               variables: [
        { key: 'MESSAGE', label: 'Mensaje',        type: 'textarea', default: 'Te escribimos del taller para coordinar los siguientes pasos...' }
    ]},
    { id: 'luxury_pass', emoji: '🎟️', name: 'Luxury Pass',      description: 'Pase VIP y tarjeta de reserva exclusiva.', defaultSubject: 'Tu Luxury Pass Exclusivo ✨',                  variables: [
        { key: 'TITLE',       label: 'Título del Pase',     default: 'LUXURY PASS' },
        { key: 'DETAILS',     label: 'Mensaje Invitación',  type: 'textarea', default: 'Tu cita ha sido confirmada en nuestro sistema.' },
        { key: 'SUBTITLE',    label: 'Subtítulo',           default: 'LUXURY PASS & RESERVA' },
        { key: 'FIELD1_LABEL',label: 'Etiqueta 1',          default: 'Fecha de Visita' },
        { key: 'FIELD1_VALUE',label: 'Valor 1',             default: 'Jueves 15 de Octubre' },
        { key: 'FIELD2_LABEL',label: 'Etiqueta 2',          default: 'Horario Exclusivo' },
        { key: 'FIELD2_VALUE',label: 'Valor 2',             default: '17:00 hrs' },
        { key: 'BARCODE_TEXT',label: 'Código',              default: 'ELENA*VIP*PASS' }
    ]},
    { id: 'review',      emoji: '⭐', name: 'Solicitud Reseña',  description: 'Pide al cliente valorar su experiencia.',    defaultSubject: 'Nos encantaría conocer tu opinión ✨',          variables: [] },
];

// ─── Preview HTML map ──────────────────────────────────────────────────────────
const PREVIEW_HTML: Record<string, string> = {
    welcome: `<!DOCTYPE html><html lang="es"><head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,300&family=Inter:wght@300;400;600&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;background:#F0EDE8;margin:0;padding:20px}.c{max-width:420px;margin:0 auto;background:#1A1A1A;border-radius:20px;color:#F5F5F0;padding:30px;text-align:center}.l{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFF;letter-spacing:12px;text-transform:uppercase;margin-bottom:8px}.d{border-bottom:1px dashed rgba(255,255,255,.15);margin:20px 0}.b{font-size:8px;font-weight:700;color:#FFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px}.t{color:#CECAC2;font-size:13px;line-height:1.6;text-align:justify}.btn{display:inline-block;background:#C17F5F;color:#FFF!important;text-decoration:none;padding:12px 20px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-radius:2px;margin:20px 0}</style></head><body><div class="c"><div class="l">ELENA</div><div class="b">LA COSTURERA</div><div class="d"></div><div class="b">Manifiesto de Autor</div><div style="font-style:italic;font-size:20px;color:#FFF;margin:15px 0">"Pierde el miedo, sé tú misma"</div><p class="t">¡Hola! Qué gusto saludarte. Soy Elena.</p><p class="t">Fundé este taller para devolverle a la ropa su verdadero propósito: <strong>ser una extensión de tu identidad</strong>, no al revés.</p><a href="https://elenalacosturera.cl" class="btn">AGENDAR ASESORÍA</a></div></body></html>`,
    appointment: `<!DOCTYPE html><html lang="es"><head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;background:#F0EDE8;margin:0;padding:20px}.c{max-width:420px;margin:0 auto;background:#1A1A1A;border-radius:20px;color:#F5F5F0;padding:30px;text-align:center}.l{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFF;letter-spacing:12px;text-transform:uppercase;margin-bottom:8px}.d{border-bottom:1px dashed rgba(255,255,255,.15);margin:20px 0}.b{font-size:8px;font-weight:700;color:#FFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px}.t{color:#CECAC2;font-size:13px;line-height:1.6}.h{border:1px solid rgba(245,242,235,.15);padding:15px;text-align:left;margin:20px 0;font-size:13px}.btn{display:inline-block;background:#C17F5F;color:#FFF!important;text-decoration:none;padding:12px 20px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-radius:2px;margin:20px 0}</style></head><body><div class="c"><div class="l">ELENA</div><div class="b">LA COSTURERA</div><div class="d"></div><div class="b">CONFIRMACIÓN DE CITA</div><div style="font-style:italic;font-size:20px;color:#FFF;margin:15px 0">Tu cita está agendada</div><p class="t">Hola {{NAME}}, confirmamos tu cita para <strong>{{SERVICE}}</strong>.</p><div class="h"><span style="color:#C17F5F;font-size:10px;font-weight:700">DETALLE</span><br/><strong>Fecha:</strong> {{DATE}}<br/><strong>Hora:</strong> {{TIME}}<br/><strong>Dirección:</strong> Av. Tabancura 1091, Of 319, Vitacura</div><a href="https://elenalacosturera.cl" class="btn">GESTIONAR MI CITA</a></div></body></html>`,
    budget: `<!DOCTYPE html><html lang="es"><head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;background:#F0EDE8;margin:0;padding:20px}.c{max-width:420px;margin:0 auto;background:#1A1A1A;border-radius:20px;color:#F5F5F0;padding:30px;text-align:center}.l{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFF;letter-spacing:12px;text-transform:uppercase;margin-bottom:8px}.d{border-bottom:1px dashed rgba(255,255,255,.15);margin:20px 0}.b{font-size:8px;font-weight:700;color:#FFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px}.t{color:#CECAC2;font-size:13px;line-height:1.6}.btn{display:inline-block;background:#C17F5F;color:#FFF!important;text-decoration:none;padding:12px 20px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-radius:2px;margin:20px 0}</style></head><body><div class="c"><div class="l">ELENA</div><div class="b">LA COSTURERA</div><div class="d"></div><div class="b">PROPUESTA DE DISEÑO</div><div style="font-style:italic;font-size:20px;color:#FFF;margin:15px 0">Tu boceto exclusivo está listo</div><p class="t">Hola {{NAME}}, tu propuesta de diseño y cotización ya está lista.</p><a href="{{LINK}}" class="btn">REVISAR PRESUPUESTO</a></div></body></html>`,
    payment: `<!DOCTYPE html><html lang="es"><head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;background:#F0EDE8;margin:0;padding:20px}.c{max-width:420px;margin:0 auto;background:#1A1A1A;border-radius:20px;color:#F5F5F0;padding:30px;text-align:center}.l{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFF;letter-spacing:12px;text-transform:uppercase;margin-bottom:8px}.d{border-bottom:1px dashed rgba(255,255,255,.15);margin:20px 0}.b{font-size:8px;font-weight:700;color:#FFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px}.t{color:#CECAC2;font-size:13px;line-height:1.6}.h{border:1px solid rgba(245,242,235,.15);padding:15px;text-align:left;margin:20px 0;font-size:13px}.btn{display:inline-block;background:#C17F5F;color:#FFF!important;text-decoration:none;padding:12px 20px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-radius:2px;margin:20px 0}</style></head><body><div class="c"><div class="l">ELENA</div><div class="b">LA COSTURERA</div><div class="d"></div><div class="b">RECIBO DIGITAL</div><div style="font-style:italic;font-size:20px;color:#FFF;margin:15px 0">Pago recibido</div><p class="t">Estimada {{NAME}}, confirmamos el pago por <strong>{{SERVICE}}</strong>.</p><div class="h"><span style="color:#C17F5F;font-size:10px;font-weight:700">DETALLE</span><br/><strong>Monto:</strong> {{AMOUNT}}<br/><strong>Método:</strong> {{METHOD}}</div><a href="https://elenalacosturera.cl" class="btn">VER EN MI CUENTA</a></div></body></html>`,
    order_ready: `<!DOCTYPE html><html lang="es"><head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;background:#F0EDE8;margin:0;padding:20px}.c{max-width:420px;margin:0 auto;background:#1A1A1A;border-radius:20px;color:#F5F5F0;padding:30px;text-align:center}.l{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFF;letter-spacing:12px;text-transform:uppercase;margin-bottom:8px}.d{border-bottom:1px dashed rgba(255,255,255,.15);margin:20px 0}.b{font-size:8px;font-weight:700;color:#FFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px}.t{color:#CECAC2;font-size:13px;line-height:1.6}.h{border:1px solid rgba(245,242,235,.15);padding:15px;text-align:left;margin:20px 0;font-size:13px}.btn{display:inline-block;background:#C17F5F;color:#FFF!important;text-decoration:none;padding:12px 20px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-radius:2px;margin:20px 0}</style></head><body><div class="c"><div class="l">ELENA</div><div class="b">LA COSTURERA</div><div class="d"></div><div class="b">CONFECCIÓN FINALIZADA</div><div style="font-style:italic;font-size:20px;color:#FFF;margin:15px 0">Tu prenda está lista</div><p class="t">Hola {{NAME}}, tu <strong>{{ITEM}}</strong> pasó el control de calidad y está lista.</p><div class="h"><span style="color:#C17F5F;font-size:10px;font-weight:700">HORARIOS</span><br/>{{HOURS}}<br/>Av. Tabancura 1091, Of 319, Vitacura.</div><a href="https://elenalacosturera.cl" class="btn">AGENDAR RETIRO</a></div></body></html>`,
    custom: `<!DOCTYPE html><html lang="es"><head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Inter:wght@300;400;600&family=Pinyon+Script&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;background:#F0EDE8;margin:0;padding:20px}.c{max-width:420px;margin:0 auto;background:#1A1A1A;background-image:linear-gradient(to bottom, rgba(26, 26, 26, 0.15) 0%, rgba(26, 26, 26, 0.78) 220px, #1A1A1A 340px, #1A1A1A 100%), url('/trabajos/model_desnuda_bw.png');background-repeat:no-repeat;background-position:center top;background-size:120% auto;border-radius:24px;border:1px solid rgba(245, 242, 235, 0.15);overflow:hidden;color:#F5F5F0;padding:30px;text-align:center}.l{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFF;letter-spacing:12px;text-transform:uppercase;margin-bottom:8px}.d{border-bottom:1px dashed rgba(255,255,255,.15);margin:20px 0}.t{color:#CECAC2;font-size:13px;line-height:1.6;white-space:pre-line}</style></head><body><div class="c"><a href="https://elenalacosturera.cl" style="text-decoration:none;display:block;color:inherit"><div class="l">ELENA</div><div style="font-size:8px;font-weight:700;color:#FFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px">LA COSTURERA</div></a><div class="d"></div><p style="font-size:9px;font-weight:600;color:#C17F5F;letter-spacing:4px;text-transform:uppercase;margin:0 0 20px">Mensaje del Atelier</p><p class="t" style="text-align:left">Estimada {{NAME}},</p><p class="t" style="text-align:left">{{MESSAGE}}</p><div style="margin-top:30px;border-top:1px dashed rgba(255,255,255,.15);padding-top:20px;text-align:center"><p style="font-style:italic;font-size:14px;color:#E5E0D8;margin:0 0 4px">Con cariño,</p><p style="font-family:'Pinyon Script',cursive;font-size:38px;color:#FFF;margin:0 0 4px;font-weight:normal">Elena R.</p></div><p style="font-size:8px;color:#8A857D;letter-spacing:2.5px;margin-top:36px">Av. Tabancura 1091, Oficina 319 · Vitacura</p></div></body></html>`,
    luxury_pass: `<!DOCTYPE html><html lang="es"><head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Inter:wght@300;400;600&family=Pinyon+Script&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;background:#F0EDE8;margin:0;padding:20px}.c{max-width:360px;margin:0 auto;background:#1A1A1A;border-radius:24px;border:1px solid rgba(245,242,235,.15);color:#F5F5F0;padding:30px;text-align:center}.l{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFF;letter-spacing:12px;text-transform:uppercase;margin-bottom:8px}.t{color:#CECAC2;font-size:13px;line-height:1.6}.h{border:1px solid rgba(245,242,235,.15);padding:15px;text-align:center;margin:20px auto;width:85%}</style></head><body><div class="c"><div class="l">ELENA</div><div style="font-size:8px;font-weight:700;color:#FFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px">LA COSTURERA</div><p style="font-size:8px;font-weight:600;color:#C17F5F;letter-spacing:5px;text-transform:uppercase;margin:0 0 4px">{{TITLE}}</p><p style="font-family:'Playfair Display',serif;font-size:24px;font-style:italic;color:#F5F5F0;margin:0 0 20px">¡Hola {{NAME}}!</p><p class="t">{{DETAILS}}</p><div class="h"><span style="font-size:8px;text-transform:uppercase;color:#C17F5F;letter-spacing:2px;font-weight:700">{{SUBTITLE}}</span><hr style="border:0;border-top:1px solid rgba(245,242,235,.1);margin:8px 0 12px"><span style="font-size:8px;text-transform:uppercase;color:#8A857D;letter-spacing:1px">{{FIELD1_LABEL}}</span><br/><strong style="font-size:14px;color:#FFF;font-family:'Playfair Display',serif;display:inline-block;margin:4px 0 12px">{{FIELD1_VALUE}}</strong><br/><span style="font-size:8px;text-transform:uppercase;color:#8A857D;letter-spacing:1px">{{FIELD2_LABEL}}</span><br/><strong style="font-size:12px;color:#C17F5F;display:inline-block;margin-top:4px">{{FIELD2_VALUE}}</strong></div><div style="margin:25px 0 12px;text-align:center;opacity:.7"><span style="display:inline-block;width:1px;height:24px;background:#F5F5F0;margin:0 1px"></span><span style="display:inline-block;width:2px;height:24px;background:#F5F5F0;margin:0 1px"></span><span style="display:inline-block;width:3px;height:24px;background:#F5F5F0;margin:0 1px"></span><span style="display:inline-block;width:1px;height:24px;background:#F5F5F0;margin:0 1px"></span><span style="display:inline-block;width:4px;height:24px;background:#F5F5F0;margin:0 1px"></span><div style="font-size:7.5px;color:#8A857D;letter-spacing:4px;margin-top:6px;text-transform:uppercase">{{BARCODE_TEXT}}</div></div><div style="margin-top:30px;border-top:1px dashed rgba(255,255,255,.15);padding-top:20px;text-align:center"><p style="font-style:italic;font-size:14px;color:#E5E0D8;margin:0 0 4px">Con cariño,</p><p style="font-family:'Pinyon Script',cursive;font-size:38px;color:#FFF;margin:0 0 4px;font-weight:normal">Elena R.</p></div></div></body></html>`,
    review: `<!DOCTYPE html><html lang="es"><head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,300&family=Inter:wght@300;400;600&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;background:#F0EDE8;margin:0;padding:20px}.c{max-width:420px;margin:0 auto;background:#1A1A1A;background-image:linear-gradient(to bottom, rgba(26, 26, 26, 0.15) 0%, rgba(26, 26, 26, 0.8) 200px, #1A1A1A 320px, #1A1A1A 100%), url('/elena-torso.webp');background-repeat:no-repeat;background-position:center top;background-size:100% auto;border-radius:24px;border:1px solid rgba(245,242,235,.15);overflow:hidden;color:#F5F5F0;padding:30px;text-align:center}.l{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFF;letter-spacing:12px;text-transform:uppercase;margin-bottom:8px}.d{border-bottom:1px dashed rgba(255,255,255,.15);margin:20px 0}.b{font-size:8px;font-weight:700;color:#FFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px}.t{color:#CECAC2;font-size:13px;line-height:1.6;text-align:left}.btn{display:inline-block;background:#C17F5F;color:#FFF!important;text-decoration:none;padding:12px 20px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-radius:2px;margin:20px 0}</style></head><body><div class="c"><div class="l">ELENA</div><div style="font-size:8px;font-weight:700;color:#FFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px">LA COSTURERA</div><div class="d"></div><div class="b">Tu Experiencia</div><div style="font-style:italic;font-size:20px;color:#FFF;margin:15px 0">¿Cómo calificarías tu visita?</div><p class="t">Estimada {{NAME}},</p><p class="t">Cada prenda, que confeccionamos, ajustamos o transformamos recibe toda nuestra dedicación y atención a los detalles. Para nosotros, saber tu opinión es fundamental para seguir mejorando.</p><p class="t">Te invitamos a tomarte un minuto para contarnos cómo fue tu experiencia y valorar nuestro trabajo.</p><a href="https://elenalacosturera.cl/opiniones" class="btn">VALORAR MI EXPERIENCIA</a></div></body></html>`,
};

// ─── Main Component ────────────────────────────────────────────────────────────
import { useRouter } from 'next/navigation';

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CorreoCentralClient({
    initialCustomers,
    initialCampaigns,
    initialMessages,
}: {
    initialCustomers: Customer[];
    initialCampaigns: Campaign[];
    initialMessages: ThreadMessage[];
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'inbox' | 'campaigns'>('inbox');
    const [search, setSearch] = useState('');
    const [selectedThreadEmail, setSelectedThreadEmail] = useState<string | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

    // Composer state
    const [selectedTemplateId, setSelectedTemplateId] = useState('custom');
    const [subject, setSubject] = useState('');
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [sending, setSending] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showComposer, setShowComposer] = useState(false);

    // Quick Reply state
    const [replyText, setReplyText] = useState('');
    const [sendingQuick, setSendingQuick] = useState(false);
    const [quickTemplateId, setQuickTemplateId] = useState('');
    const [showQuickPreview, setShowQuickPreview] = useState(false);

    // Campaign state
    const [campName, setCampName] = useState('');
    const [campSubject, setCampSubject] = useState('');
    const [campContent, setCampContent] = useState('');
    const [sendingCampaign, setSendingCampaign] = useState(false);
    const [campSuccess, setCampSuccess] = useState<string | null>(null);
    const [showCampConfirm, setShowCampConfirm] = useState(false);
    const [selectedCampCustomers, setSelectedCampCustomers] = useState<string[]>([]);
    const [campSearch, setCampSearch] = useState('');

    useEffect(() => {
        if (initialCustomers) {
            setSelectedCampCustomers(initialCustomers.map(c => c.id));
        }
    }, [initialCustomers]);

    const filteredCampCustomers = useMemo(() => {
        const query = campSearch.toLowerCase();
        return initialCustomers.filter(c => 
            c.email && (c.full_name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query))
        );
    }, [initialCustomers, campSearch]);

    const searchRef = useRef<HTMLInputElement>(null);
    const activeTemplate = useMemo(() => TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0], [selectedTemplateId]);

    // Parse messages into threads grouped by client's email address
    const activeThreads = useMemo(() => {
        const map: Record<string, {
            email: string;
            customerName: string;
            customerId: string | null;
            lastMessage: ThreadMessage;
            messages: ThreadMessage[];
            unreadCount: number;
        }> = {};

        (initialMessages || []).forEach(msg => {
            const email = (msg.direction === 'inbound' ? msg.sender : msg.recipient)?.toLowerCase().trim();
            if (!email) return;

            if (!map[email]) {
                const customerObj = Array.isArray(msg.customers) ? msg.customers[0] : msg.customers;
                const customerName = customerObj?.full_name || msg.sender?.split('@')[0] || email;
                map[email] = {
                    email,
                    customerName,
                    customerId: msg.customer_id || customerObj?.id || null,
                    lastMessage: msg,
                    messages: [],
                    unreadCount: 0
                };
            }
            map[email].messages.push(msg);
            if (msg.direction === 'inbound' && msg.read_at === null) {
                map[email].unreadCount += 1;
            }
        });

        // Sort threads by latest message date descending
        return Object.values(map).sort((a, b) => 
            new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
        );
    }, [initialMessages]);

    // Active selected thread details
    const selectedThread = useMemo(() => {
        if (!selectedThreadEmail) return null;
        const active = activeThreads.find(t => t.email === selectedThreadEmail);
        if (active) return active;

        // Fallback for starting thread with a customer who doesn't have messages yet
        const customer = initialCustomers.find(c => c.email?.toLowerCase().trim() === selectedThreadEmail);
        if (customer) {
            return {
                email: selectedThreadEmail,
                customerName: customer.full_name,
                customerId: customer.id,
                lastMessage: null as any,
                messages: [] as ThreadMessage[],
                unreadCount: 0
            };
        }

        // For a new raw email search match
        return {
            email: selectedThreadEmail,
            customerName: selectedThreadEmail.split('@')[0] || selectedThreadEmail,
            customerId: null,
            lastMessage: null as any,
            messages: [] as ThreadMessage[],
            unreadCount: 0
        };
    }, [activeThreads, selectedThreadEmail, initialCustomers]);

    // Filtered list of threads for sidebar
    const filteredThreads = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return activeThreads;

        // 1. Match active threads
        const activeMatches = activeThreads.filter(t => 
            t.customerName.toLowerCase().includes(q) || 
            t.email.toLowerCase().includes(q) || 
            (t.lastMessage?.subject || '').toLowerCase().includes(q)
        );

        // 2. Match customers in CRM without an active thread
        const activeEmails = new Set(activeThreads.map(t => t.email));
        const customerMatches = initialCustomers
            .filter(c => 
                c.email && 
                !activeEmails.has(c.email.toLowerCase().trim()) && 
                (c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
            )
            .map(c => ({
                email: c.email!.toLowerCase().trim(),
                customerName: c.full_name,
                customerId: c.id,
                lastMessage: null as any,
                messages: [] as ThreadMessage[],
                unreadCount: 0
            }));

        // 3. Match raw email search if it looks like an email and no customer/thread matched it
        const isEmailFormat = q.includes('@') && q.includes('.');
        const emailMatches: any[] = [];
        if (isEmailFormat && !activeEmails.has(q) && !initialCustomers.some(c => c.email?.toLowerCase().trim() === q)) {
            emailMatches.push({
                email: q,
                customerName: q.split('@')[0] || q,
                customerId: null,
                lastMessage: null as any,
                messages: [] as ThreadMessage[],
                unreadCount: 0
            });
        }

        return [...activeMatches, ...customerMatches, ...emailMatches];
    }, [activeThreads, initialCustomers, search]);

    const totalUnread = useMemo(() => 
        activeThreads.reduce((acc, t) => acc + t.unreadCount, 0)
    , [activeThreads]);

    const compiledHtml = useMemo(() => {
        const raw = PREVIEW_HTML[selectedTemplateId] || '';
        let html = raw
            .replace(/{{NAME}}/g, selectedThread?.customerName || 'Clienta')
            .replace(/{{SUBJECT}}/g, subject);
        Object.entries(variables).forEach(([k, v]) => {
            html = html.replace(new RegExp(`{{${k}}}`, 'g'), v);
        });
        return html;
    }, [selectedTemplateId, subject, variables, selectedThread]);

    const compiledQuickHtml = useMemo(() => {
        if (!selectedThread) return '';
        const messageHtmlText = replyText.replace(/\n/g, '<br/>');
        return `<!DOCTYPE html><html lang="es"><head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Inter:wght@300;400;600&family=Pinyon+Script&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;background:#F0EDE8;margin:0;padding:20px}.c{max-width:420px;margin:0 auto;background:#1A1A1A;background-image:linear-gradient(to bottom, rgba(26, 26, 26, 0.15) 0%, rgba(26, 26, 26, 0.78) 220px, #1A1A1A 340px, #1A1A1A 100%), url('/trabajos/model_desnuda_bw.png');background-repeat:no-repeat;background-position:center top;background-size:120% auto;border-radius:24px;border:1px solid rgba(245, 242, 235, 0.15);overflow:hidden;color:#F5F5F0;padding:30px;text-align:center}.l{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFF;letter-spacing:12px;text-transform:uppercase;margin-bottom:8px}.d{border-bottom:1px dashed rgba(255,255,255,.15);margin:20px 0}.t{color:#CECAC2;font-size:13px;line-height:1.6;text-align:left;white-space:pre-line}</style></head><body><div class="c"><a href="https://elenalacosturera.cl" style="text-decoration:none;display:block;color:inherit"><div class="l">ELENA</div><div style="font-size:8px;font-weight:700;color:#FFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px">LA COSTURERA</div></a><div class="d"></div><p style="font-size:9px;font-weight:600;color:#C17F5F;letter-spacing:4px;text-transform:uppercase;margin:0 0 20px">Mensaje del Atelier</p><p class="t" style="text-align:left">Estimada ${selectedThread?.customerName || 'Clienta'},</p><p class="t" style="text-align:left">${messageHtmlText}</p><div style="margin-top:30px;border-top:1px dashed rgba(255,255,255,.15);padding-top:20px;text-align:center"><p style="font-style:italic;font-size:14px;color:#E5E0D8;margin:0 0 4px">Con cariño,</p><p style="font-family:'Pinyon Script',cursive;font-size:38px;color:#FFF;margin:0 0 4px;font-weight:normal">Elena R.</p></div><p style="font-size:8px;color:#8A857D;letter-spacing:2.5px;margin-top:36px">Av. Tabancura 1091, Oficina 319 · Vitacura</p></div></body></html>`;
    }, [selectedThread, replyText]);

    useEffect(() => {
        setSubject(activeTemplate.defaultSubject);
        const d: Record<string, string> = {};
        activeTemplate.variables.forEach(v => { d[v.key] = v.default; });
        setVariables(d);
    }, [activeTemplate]);

    const handleSelectThread = async (email: string) => {
        setSelectedThreadEmail(email);
        setSearch('');
        setSuccessMsg(null); setErrorMsg(null);
        
        const thread = activeThreads.find(t => t.email === email);
        if (thread && thread.unreadCount > 0) {
            await markThreadsAsReadAction(thread.customerId, thread.email);
            router.refresh();
        }
    };

    const handleConfirmSend = async () => {
        if (!selectedThreadEmail) return;
        setSending(true); setShowConfirmModal(false);
        try {
            const res = await sendTemplatedEmailAction(
                selectedThread?.customerId || null, 
                selectedTemplateId, 
                subject,
                { ...variables, HTML_CONTENT: compiledHtml },
                selectedThreadEmail
            );
            if (res.success) {
                setSuccessMsg(`Correo enviado a ${selectedThread?.customerName || selectedThreadEmail}`);
                setShowComposer(false);
                router.refresh();
            } else setErrorMsg(res.error || 'Error al enviar.');
        } catch (e: any) { setErrorMsg(e.message); }
        finally { setSending(false); }
    };

    const handleApplyQuickTemplate = (templateId: string) => {
        setQuickTemplateId(templateId);
        if (!templateId) {
            setReplyText('');
            return;
        }
        
        const temp = TEMPLATES.find(t => t.id === templateId);
        if (!temp) return;
        
        if (templateId === 'custom') {
            setReplyText('Te escribimos del taller para coordinar los siguientes pasos...');
        } else if (templateId === 'welcome') {
            setReplyText('¡Hola! Qué gusto saludarte. Soy Elena. Fundé este taller para devolverle a la ropa su verdadero propósito: ser una extensión de tu identidad, no al revés.');
        } else {
            let text = `Hola ${selectedThread?.customerName || 'Clienta'},\n`;
            if (templateId === 'appointment') {
                text += `Confirmamos tu cita para Jueves 15 de Octubre a las 16:30 hrs (Prueba de calce) en nuestro taller de Av. Tabancura 1091.`;
            } else if (templateId === 'budget') {
                text += `Tu propuesta de diseño y presupuesto a medida ya está lista. Puedes revisarla aquí: https://elenalacosturera.cl/quotes/propuesta`;
            } else if (templateId === 'payment') {
                text += `Confirmamos la recepción de tu abono por $150.000 CLP mediante Transferencia Bancaria por concepto de Vestido a medida.`;
            } else if (templateId === 'order_ready') {
                text += `Te escribimos para avisarte que tu Vestido de Novia pasó con éxito todos los controles de calidad y está listo para retiro en el Atelier.`;
            } else if (templateId === 'luxury_pass') {
                text += `Te invitamos oficialmente a tu visita exclusiva en el Atelier. Adjuntamos tu pase Luxury Pass de acceso VIP.`;
            }
            setReplyText(text);
        }
    };

    const handleSendQuickReply = async () => {
        if (!replyText.trim() || !selectedThreadEmail) return;
        setSendingQuick(true);
        try {
            const lastMsgSubject = selectedThread?.lastMessage?.subject || '';
            const replySubject = lastMsgSubject.toLowerCase().startsWith('re:') 
                ? lastMsgSubject 
                : `Re: ${lastMsgSubject || 'Contacto Elena Atelier'}`;

            const replyHtml = `<!DOCTYPE html><html lang="es"><head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Inter:wght@300;400;600&family=Pinyon+Script&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;background:#F0EDE8;margin:0;padding:20px}.c{max-width:420px;margin:0 auto;background:#1A1A1A;background-image:linear-gradient(to bottom, rgba(26, 26, 26, 0.15) 0%, rgba(26, 26, 26, 0.78) 220px, #1A1A1A 340px, #1A1A1A 100%), url('/trabajos/model_desnuda_bw.png');background-repeat:no-repeat;background-position:center top;background-size:120% auto;border-radius:24px;border:1px solid rgba(245, 242, 235, 0.15);overflow:hidden;color:#F5F5F0;padding:30px;text-align:center}.l{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFF;letter-spacing:12px;text-transform:uppercase;margin-bottom:8px}.d{border-bottom:1px dashed rgba(255,255,255,.15);margin:20px 0}.t{color:#CECAC2;font-size:13px;line-height:1.6;text-align:left;white-space:pre-line}</style></head><body><div class="c"><a href="https://elenalacosturera.cl" style="text-decoration:none;display:block;color:inherit"><div class="l">ELENA</div><div style="font-size:8px;font-weight:700;color:#FFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px">LA COSTURERA</div></a><div class="d"></div><p style="font-size:9px;font-weight:600;color:#C17F5F;letter-spacing:4px;text-transform:uppercase;margin:0 0 20px">Mensaje del Atelier</p><p class="t" style="text-align:left">Estimada ${selectedThread?.customerName || 'Clienta'},</p><p class="t" style="text-align:left">${replyText.replace(/\n/g, '<br/>')}</p><div style="margin-top:30px;border-top:1px dashed rgba(255,255,255,.15);padding-top:20px;text-align:center"><p style="font-style:italic;font-size:14px;color:#E5E0D8;margin:0 0 4px">Con cariño,</p><p style="font-family:'Pinyon Script',cursive;font-size:38px;color:#FFF;margin:0 0 4px;font-weight:normal">Elena R.</p></div><p style="font-size:8px;color:#8A857D;letter-spacing:2.5px;margin-top:36px">Av. Tabancura 1091, Oficina 319 · Vitacura</p></div></body></html>`;

            const res = await sendTemplatedEmailAction(
                selectedThread?.customerId || null,
                'custom',
                replySubject,
                { MESSAGE: replyText, HTML_CONTENT: replyHtml },
                selectedThreadEmail
            );

            if (res.success) {
                setReplyText('');
                setQuickTemplateId('');
                router.refresh();
            } else {
                alert(res.error || 'Error al enviar respuesta');
            }
        } catch (e: any) {
            alert(e.message || 'Error al enviar');
        } finally {
            setSendingQuick(false);
        }
    };

    const handleConfirmCampaign = async () => {
        if (selectedCampCustomers.length === 0) {
            alert('Por favor selecciona al menos una destinataria.');
            return;
        }
        setShowCampConfirm(false); setSendingCampaign(true); setCampSuccess(null);
        try {
            const campaignHtml = `<!DOCTYPE html><html lang="es"><head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700&family=Inter:wght@300;400;600&family=Pinyon+Script&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;background:#F0EDE8;margin:0;padding:20px}.c{max-width:420px;margin:0 auto;background:#1A1A1A;border-radius:20px;color:#F5F5F0;padding:30px;text-align:center}.l{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFF;letter-spacing:12px;text-transform:uppercase;margin-bottom:8px}.d{border-bottom:1px dashed rgba(255,255,255,.15);margin:20px 0}.t{color:#CECAC2;font-size:13px;line-height:1.6;text-align:left;white-space:pre-line}</style></head><body><div class="c"><a href="https://elenalacosturera.cl" style="text-decoration:none;display:block;color:inherit"><div class="l">ELENA</div><div style="font-size:8px;font-weight:700;color:#FFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px">LA COSTURERA</div></a><div class="d"></div><p style="font-size:9px;font-weight:600;color:#C17F5F;letter-spacing:4px;text-transform:uppercase;margin:0 0 20px">Boletín del Atelier</p><p class="t">${campContent.replace(/\n/g, '<br/>')}</p><div style="margin-top:30px;border-top:1px dashed rgba(255,255,255,.15);padding-top:20px;text-align:center"><p style="font-style:italic;font-size:14px;color:#E5E0D8;margin:0 0 4px">Con cariño,</p><p style="font-family:'Pinyon Script',cursive;font-size:38px;color:#FFF;margin:0 0 4px;font-weight:normal">Elena R.</p></div><p style="font-size:8px;color:#8A857D;letter-spacing:2.5px;margin-top:36px">Av. Tabancura 1091, Oficina 319 · Vitacura</p></div></body></html>`;
            const recipientEmails = initialCustomers
                .filter(c => selectedCampCustomers.includes(c.id))
                .map(c => c.email)
                .filter((e): e is string => !!e);
            
            const res = await sendBulkCampaignAction(campName, campSubject, campaignHtml, 'custom', recipientEmails);
            if (res.success) {
                setCampSuccess(`✓ Campaña enviada a ${res.sentCount} de ${res.total} clientas.`);
                setCampName(''); setCampSubject(''); setCampContent('');
                const fresh = await getMarketingCampaignsAction();
                setCampaigns(fresh.campaigns);
            }
        } catch (e: any) { alert(e.message); }
        finally { setSendingCampaign(false); }
    };

    return (
        <>
        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TOP NAVIGATION                                                    */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 bg-[#F5F1EC] p-1 rounded-xl border border-[#E8E3DC]">
                <button
                    onClick={() => setActiveTab('inbox')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                        activeTab === 'inbox'
                            ? 'bg-white text-[#1C1917] shadow-sm border border-[#E8E3DC]'
                            : 'text-[#78716C] hover:text-[#1C1917]'
                    }`}
                >
                    <Inbox className="w-4 h-4" />
                    Conversaciones
                    {totalUnread > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                            {totalUnread}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                        activeTab === 'campaigns'
                            ? 'bg-white text-[#1C1917] shadow-sm border border-[#E8E3DC]'
                            : 'text-[#78716C] hover:text-[#1C1917]'
                    }`}
                >
                    <Megaphone className="w-4 h-4" />
                    Campañas Masivas
                </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#A8A29E]">
                <div className="flex items-center gap-1.5 bg-[#F5F1EC] border border-[#E8E3DC] px-3 py-1.5 rounded-lg">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-semibold text-[#1C1917]">{initialCustomers.length}</span>
                    <span>clientas</span>
                </div>
                {campaigns.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-[#F5F1EC] border border-[#E8E3DC] px-3 py-1.5 rounded-lg">
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span className="font-semibold text-[#1C1917]">{campaigns.length}</span>
                        <span>campaña{campaigns.length !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MAIN PANEL                                                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="flex gap-0 border border-[#E8E3DC] rounded-xl shadow-sm overflow-hidden bg-white" style={{ height: 'calc(100vh - 230px)', minHeight: 640 }}>
            {/* ── INBOX VIEW ───────────────────────────────────────────── */}
            {activeTab === 'inbox' && (
                <>
                {/* CONTACTS PANEL */}
                <div className="w-[300px] flex flex-col border-r border-[#E8E4DF]" style={{ background: '#FAFAF9' }}>
                    {/* Header */}
                    <div className="px-4 pt-5 pb-3 border-b border-[#E8E4DF]">
                        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[15px] font-bold text-[#1C1917] mb-3">
                            Conversaciones
                        </h2>
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A8A29E]" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Buscar clienta..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-[13px] border border-[#E8E4DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C17F5F]/30 focus:border-[#C17F5F] bg-white text-[#1C1917] placeholder:text-[#A8A29E] transition-all"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917]">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Main Feed */}
                        <div>
                            {!search && (
                                <div className="px-4 py-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E]">Recientes</span>
                                </div>
                            )}
                            {search && (
                                <div className="px-4 py-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E]">Resultados</span>
                                </div>
                            )}

                            {filteredThreads.length === 0 ? (
                                !search ? (
                                    <div className="px-5 py-12 text-center flex flex-col items-center gap-2">
                                        <Inbox className="w-8 h-8 text-[#D6D3D1]" />
                                        <p className="text-[12px] font-semibold text-[#78716C]">Bandeja vacía</p>
                                        <p className="text-[10px] text-[#A8A29E] leading-normal px-2">
                                            Tu bandeja de entrada está vacía. Escribe en el buscador de arriba para iniciar un hilo de correo.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="px-4 py-10 text-center">
                                        <Search className="w-6 h-6 text-[#D6D3D1] mx-auto mb-2" />
                                        <p className="text-[12px] text-[#A8A29E]">Sin resultados para &quot;{search}&quot;</p>
                                    </div>
                                )
                            ) : (
                                filteredThreads.map(t => (
                                    <ContactItem 
                                        key={t.email} 
                                        c={{ id: t.email, full_name: t.customerName, email: t.email, phone: null }} 
                                        unread={t.unreadCount} 
                                        isSelected={t.email === selectedThreadEmail} 
                                        onSelect={() => handleSelectThread(t.email)} 
                                        lastMessage={t.lastMessage ? {
                                            subject: t.lastMessage.subject,
                                            snippet: t.lastMessage.body_text || '(Mensaje de correo)',
                                            date: t.lastMessage.created_at,
                                            direction: t.lastMessage.direction
                                        } : undefined}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* THREAD + COMPOSER */}
                <div className="flex-1 flex flex-col bg-white min-w-0">
                    {!selectedThread ? (
                        /* Welcome state */
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1C1917 0%, #3D2B1F 100%)' }}>
                                <Mail className="w-8 h-8 text-white/80" />
                            </div>
                            <div className="text-center max-w-xs">
                                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold text-[#1C1917] mb-2">
                                    Central de Correos
                                </h3>
                                <p className="text-[13px] text-[#78716C] leading-relaxed">
                                    Recibe y responde correos. Usa el buscador de la izquierda para redactar a cualquier clienta o ingresar un correo nuevo.
                                </p>
                            </div>
                            {/* Quick stats */}
                            <div className="flex gap-4 mt-2">
                                <div className="flex flex-col items-center gap-1 bg-[#FAFAF9] border border-[#E8E4DF] rounded-xl px-5 py-3">
                                    <span className="text-lg font-bold text-[#1C1917]">{initialCustomers.length}</span>
                                    <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider font-semibold">Clientas</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 bg-[#FAFAF9] border border-[#E8E4DF] rounded-xl px-5 py-3">
                                    <span className="text-lg font-bold text-[#C17F5F]">{campaigns.length}</span>
                                    <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider font-semibold">Campañas</span>
                                </div>
                                {totalUnread > 0 && (
                                    <div className="flex flex-col items-center gap-1 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
                                        <span className="text-lg font-bold text-red-500">{totalUnread}</span>
                                        <span className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">Sin leer</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex overflow-hidden">
                            {/* THREAD */}
                            {!showComposer && (
                                <div className="flex-1 flex overflow-hidden">
                                    <div className="flex-1 flex flex-col min-w-0 bg-white">
                                    {/* Thread header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DF] bg-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#1C1917] flex items-center justify-center text-xs font-bold text-white shrink-0">
                                                {selectedThread.customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[14px] font-bold text-[#1C1917]">
                                                    {selectedThread.customerName}
                                                    {!selectedThread.customerId && (
                                                        <span className="ml-2 text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-sans font-normal uppercase tracking-wider">No CRM</span>
                                                    )}
                                                </p>
                                                <p className="text-[11px] text-[#A8A29E]">{selectedThread.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {successMsg && (
                                                <span className="text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                                                    <Check className="w-3 h-3 stroke-[3px]" /> {successMsg}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => { router.refresh(); }}
                                                className="w-8 h-8 rounded-lg border border-[#E8E4DF] flex items-center justify-center text-[#78716C] hover:bg-[#FAFAF9] transition-all"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => { setShowComposer(true); setSuccessMsg(null); setErrorMsg(null); }}
                                                className="flex items-center gap-2 px-4 py-2 rounded-sm text-xs uppercase tracking-widest font-bold transition-all bg-brand-charcoal hover:bg-brand-terracotta text-white shadow-sm"
                                            >
                                                <Send className="w-3.5 h-3.5" /> Redactar Correo
                                            </button>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ background: '#FAFAF9' }}>
                                        {selectedThread.messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-center">
                                                <div className="w-12 h-12 rounded-full bg-white border border-[#E8E4DF] flex items-center justify-center shadow-sm">
                                                    <Clock className="w-5 h-5 text-[#D6D3D1]" />
                                                </div>
                                                <p className="text-[13px] font-semibold text-[#78716C]">Sin mensajes previos</p>
                                                <p className="text-[11px] text-[#A8A29E]">Usa el redactor para enviar el primer correo a esta dirección.</p>
                                                <button
                                                    onClick={() => setShowComposer(true)}
                                                    className="mt-2 flex items-center gap-2 bg-[#C17F5F] hover:bg-[#A66B4E] text-white px-4 py-2 rounded-lg text-[12px] font-semibold transition-all"
                                                >
                                                    <Send className="w-3.5 h-3.5" /> Redactar correo
                                                </button>
                                            </div>
                                        ) : (
                                            [...selectedThread.messages].reverse().map(msg => (
                                                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                                                        msg.direction === 'outbound'
                                                            ? 'bg-[#1C1917] text-white rounded-tr-sm'
                                                            : 'bg-white border border-[#E8E4DF] text-[#1C1917] rounded-tl-sm'
                                                    }`}>
                                                        <div className="flex items-center justify-between gap-4 mb-2">
                                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${msg.direction === 'outbound' ? 'text-[#C17F5F]' : 'text-[#A8A29E]'}`}>
                                                                {msg.direction === 'outbound' ? '↗ Atelier' : '↙ Remitente'}
                                                            </span>
                                                            <span className={`text-[9px] ${msg.direction === 'outbound' ? 'text-white/40' : 'text-[#A8A29E]'}`} suppressHydrationWarning>
                                                                {new Date(msg.created_at).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className={`text-[11px] italic mb-2 ${msg.direction === 'outbound' ? 'text-white/60' : 'text-[#78716C]'}`}>
                                                            {msg.subject}
                                                        </p>
                                                        <p className={`text-[12px] leading-relaxed whitespace-pre-wrap ${msg.direction === 'outbound' ? 'text-white/85' : 'text-[#44403C]'}`}>
                                                            {msg.body_text || '(HTML)'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Quick Reply Bar */}
                                    <div className="p-4 border-t border-[#E8E4DF] bg-white flex flex-col gap-3">
                                        <textarea
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder={`Responder a ${selectedThread.customerName}...`}
                                            className="w-full border border-[#E8E4DF] rounded-xl p-3 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#C17F5F]/30 focus:border-[#C17F5F] text-[#44403C] placeholder:text-[#A8A29E] transition-all"
                                            rows={3}
                                        />
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={quickTemplateId}
                                                    onChange={e => handleApplyQuickTemplate(e.target.value)}
                                                    className="text-[11px] border border-[#E8E4DF] rounded-lg px-2.5 py-1.5 bg-white text-[#78716C] focus:outline-none focus:ring-1 focus:ring-[#C17F5F]"
                                                >
                                                    <option value="">Cargar plantilla...</option>
                                                    {TEMPLATES.map(t => (
                                                        <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>
                                                    ))}
                                                </select>
                                                {replyText.trim() && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowQuickPreview(true)}
                                                        className="text-[#78716C] hover:text-[#1C1917] border border-[#E8E4DF] hover:bg-[#FAFAF9] text-[11.5px] font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> Previsualizar
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleSendQuickReply}
                                                disabled={sendingQuick || !replyText.trim()}
                                                className="bg-[#C17F5F] hover:bg-[#A66B4E] disabled:bg-[#D6D3D1] text-white text-[12px] font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                                            >
                                                {sendingQuick ? (
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <><Send className="w-3 h-3" /> Responder</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    </div>
                                    {replyText.trim() && (
                                        <div className="w-[380px] bg-[#FAFAF9] border-l border-[#E8E4DF] flex flex-col h-full shrink-0">
                                            <div className="p-4 border-b border-[#E8E4DF] bg-white flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-[#1C1917] font-serif uppercase tracking-wider">Vista Previa de Respuesta</span>
                                            </div>
                                            <div className="flex-1 p-4 bg-brand-sand/15 overflow-y-auto flex items-center justify-center">
                                                <iframe 
                                                    title="Live Reply Preview"
                                                    srcDoc={compiledQuickHtml}
                                                    className="w-full h-full min-h-[480px] bg-white rounded-xl shadow-md overflow-hidden"
                                                    sandbox="allow-same-origin"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* COMPOSER PANEL */}
                            {showComposer && (
                                <div className="flex-1 overflow-y-auto bg-gray-50 border-l border-gray-200">
                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h1 className="text-2xl font-serif font-bold text-brand-charcoal mb-2">Redactor de Correo</h1>
                                                <p className="text-sm text-gray-500">Envía notificaciones de la base de correo o redacta un mensaje personalizado para {selectedThread.customerName}</p>
                                            </div>
                                            <button 
                                                onClick={() => setShowComposer(false)}
                                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-brand-charcoal transition-colors bg-white px-4 py-2 border border-gray-200 rounded-sm"
                                            >
                                                <X className="w-4 h-4" /> Cancelar Redacción
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                                            {/* Left Column - Controls */}
                                            <div className="xl:col-span-5 space-y-6">
                                                
                                                {/* 1. Template Selection */}
                                                <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 space-y-4">
                                                    <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100 pb-2">1. Seleccionar Plantilla Base</h2>
                                                    <div className="space-y-2.5">
                                                        {TEMPLATES.map(t => (
                                                            <button
                                                                key={t.id}
                                                                onClick={() => setSelectedTemplateId(t.id)}
                                                                className={`w-full text-left p-3.5 border rounded-sm transition-all flex items-start gap-3 hover:bg-gray-50 ${
                                                                    selectedTemplateId === t.id 
                                                                        ? 'border-brand-terracotta bg-brand-sand/10 shadow-sm' 
                                                                        : 'border-gray-200 bg-white'
                                                                }`}
                                                            >
                                                                <span className="mt-0.5 shrink-0 text-xl">{t.emoji}</span>
                                                                <div>
                                                                    <div className="font-serif text-sm font-semibold text-brand-charcoal">{t.name}</div>
                                                                    <div className="text-[11px] text-gray-400 mt-1 leading-relaxed">{t.description}</div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </section>

                                                {/* 2. Variables Form */}
                                                <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 space-y-4">
                                                    <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100 pb-2">2. Personalizar Contenido</h2>
                                                    
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block mb-1">Asunto del Correo</label>
                                                            <input 
                                                                type="text"
                                                                value={subject}
                                                                onChange={(e) => setSubject(e.target.value)}
                                                                className="w-full p-3 bg-white border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-brand-terracotta outline-none text-brand-charcoal"
                                                            />
                                                        </div>

                                                        {activeTemplate.variables.map(v => (
                                                            <div key={v.key}>
                                                                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block mb-1">{v.label}</label>
                                                                {v.type === 'textarea' ? (
                                                                    <textarea
                                                                        value={variables[v.key] || ''}
                                                                        onChange={(e) => setVariables(p => ({...p, [v.key]: e.target.value}))}
                                                                        rows={4}
                                                                        className="w-full p-3 bg-white border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-brand-terracotta outline-none resize-none text-gray-700"
                                                                    />
                                                                ) : (
                                                                    <input 
                                                                        type="text"
                                                                        value={variables[v.key] || ''}
                                                                        onChange={(e) => setVariables(p => ({...p, [v.key]: e.target.value}))}
                                                                        className="w-full p-3 bg-white border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-brand-terracotta outline-none text-brand-charcoal"
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                        
                                                        {activeTemplate.variables.length === 0 && (
                                                            <p className="text-xs text-gray-400 italic py-2">Esta plantilla no tiene variables adicionales. El saludo de bienvenida se genera automáticamente.</p>
                                                        )}
                                                    </div>
                                                </section>

                                                {/* 3. Send Panel */}
                                                <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 space-y-4">
                                                    <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100 pb-2">3. Acciones de Envío</h2>

                                                    {successMsg && (
                                                        <div className="bg-emerald-50 text-emerald-700 p-4 border border-emerald-200 rounded-sm text-xs flex items-center gap-2">
                                                            <Check className="w-4 h-4 text-emerald-500 stroke-[3px]" />
                                                            <span>{successMsg}</span>
                                                        </div>
                                                    )}

                                                    {errorMsg && (
                                                        <div className="bg-red-50 text-red-600 p-4 border border-red-200 rounded-sm text-xs flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                                            <span>{errorMsg}</span>
                                                        </div>
                                                    )}

                                                    <div className="space-y-3">
                                                        <button
                                                            onClick={() => setShowConfirmModal(true)}
                                                            disabled={sending}
                                                            className="w-full bg-brand-terracotta hover:bg-brand-charcoal disabled:bg-gray-200 disabled:text-gray-400 text-white p-3.5 rounded-sm uppercase tracking-widest text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                                                        >
                                                            {sending ? (
                                                                <><RefreshCw className="w-4 h-4 animate-spin" /> Procesando Envío...</>
                                                            ) : (
                                                                <><Send className="w-4 h-4" /> Enviar por Email (Nodemailer)</>
                                                            )}
                                                        </button>
                                                        
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button
                                                                onClick={() => { navigator.clipboard.writeText(compiledHtml); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                                                className="border border-gray-200 hover:bg-gray-50 text-gray-600 p-3 rounded-sm uppercase tracking-widest text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                                                            >
                                                                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3px]" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar HTML</>}
                                                            </button>
                                                            <button
                                                                className="border border-gray-200 hover:bg-gray-50 text-gray-600 p-3 rounded-sm uppercase tracking-widest text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                                                            >
                                                                <Mail className="w-3.5 h-3.5" /> Abrir Cliente
                                                            </button>
                                                        </div>
                                                    </div>
                                                </section>
                                            </div>

                                            {/* Right Column - Preview */}
                                            <div className="xl:col-span-7 space-y-6">
                                                <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex flex-col h-[650px] sticky top-6">
                                                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                                            <span className="text-xs text-gray-400 font-mono ml-2 truncate">Previsualización de Correo</span>
                                                        </div>
                                                        <div className="flex bg-white border border-gray-200 rounded-sm p-0.5 text-xs">
                                                            <button className="px-3 py-1 rounded-sm bg-brand-charcoal text-white font-bold">Diseño</button>
                                                            <button className="px-3 py-1 rounded-sm text-gray-400 hover:text-brand-charcoal">Código HTML</button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1 bg-brand-sand/15 overflow-auto p-4 flex items-center justify-center">
                                                        <iframe 
                                                            title="Email Preview"
                                                            srcDoc={compiledHtml}
                                                            className="w-full max-w-[460px] h-[580px] bg-white rounded-xl shadow-xl overflow-hidden mx-auto"
                                                            sandbox="allow-same-origin"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                </>
            )}

            {/* ── CAMPAIGNS VIEW ───────────────────────────────────────── */}
            {activeTab === 'campaigns' && (
                <div className="flex-1 flex overflow-hidden">
                    {/* Campaign history */}
                    <div className="w-[380px] flex flex-col border-r border-[#E8E4DF]" style={{ background: '#FAFAF9' }}>
                        <div className="px-5 py-4 border-b border-[#E8E4DF]">
                            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[15px] font-bold text-[#1C1917]">Historial</h2>
                            <p className="text-[11px] text-[#A8A29E] mt-0.5">{campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''} enviada{campaigns.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-[#E8E4DF]">
                            {campaigns.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-center">
                                    <Megaphone className="w-8 h-8 text-[#D6D3D1]" />
                                    <p className="text-[12px] text-[#A8A29E]">Aún no has enviado campañas.</p>
                                </div>
                            ) : (
                                campaigns.map(camp => (
                                    <div key={camp.id} className="p-4 hover:bg-white transition-all">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className="text-[13px] font-semibold text-[#1C1917]">{camp.name}</p>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${camp.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                                {camp.status === 'sent' ? 'Enviado' : 'Error'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#78716C] italic mb-2 leading-relaxed">{camp.subject}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[10px] text-[#A8A29E]">
                                                <Users className="w-3 h-3" />
                                                <span>{camp.recipient_count} destinatarias</span>
                                            </div>
                                            <span className="text-[10px] text-[#A8A29E]">{new Date(camp.created_at).toLocaleDateString('es-CL')}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Campaign composer */}
                    <div className="flex-1 flex flex-col bg-white">
                        <div className="px-8 py-6 border-b border-[#E8E4DF]">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 rounded-lg bg-[#1C1917] flex items-center justify-center">
                                    <Megaphone className="w-4 h-4 text-[#C17F5F]" />
                                </div>
                                <div>
                                    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[15px] font-bold text-[#1C1917]">Nueva Campaña Masiva</h2>
                                    <p className="text-[11px] text-[#A8A29E]">Redacta el boletín y selecciona a qué clientas deseas enviarlo</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {campSuccess && (
                                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-[12px] flex items-center gap-2">
                                    <Check className="w-4 h-4 shrink-0 stroke-[3px]" /> {campSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Form Inputs */}
                                <div className="lg:col-span-7 space-y-5">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] block mb-1.5">Nombre Interno de la Campaña</label>
                                        <input
                                            type="text"
                                            value={campName}
                                            onChange={e => setCampName(e.target.value)}
                                            placeholder="Ej: Colección Novias Primavera 2026"
                                            className="w-full border border-[#E8E4DF] rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#C17F5F]/30 focus:border-[#C17F5F] text-[#1C1917] placeholder:text-[#D6D3D1] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] block mb-1.5">Asunto del Correo</label>
                                        <input
                                            type="text"
                                            value={campSubject}
                                            onChange={e => setCampSubject(e.target.value)}
                                            placeholder="Ej: Te invitamos a nuestra venta exclusiva ✨"
                                            className="w-full border border-[#E8E4DF] rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#C17F5F]/30 focus:border-[#C17F5F] text-[#1C1917] placeholder:text-[#D6D3D1] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] block mb-1.5">Mensaje</label>
                                        <textarea
                                            rows={7}
                                            value={campContent}
                                            onChange={e => setCampContent(e.target.value)}
                                            placeholder="Escribe aquí el cuerpo del mensaje. Se enviará con el diseño oficial del Atelier..."
                                            className="w-full border border-[#E8E4DF] rounded-xl p-3 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#C17F5F]/30 focus:border-[#C17F5F] text-[#44403C] placeholder:text-[#D6D3D1] transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => { if (!campName || !campSubject || !campContent) return alert('Completa todos los campos.'); setShowCampConfirm(true); }}
                                        disabled={sendingCampaign || selectedCampCustomers.length === 0}
                                        className="w-full bg-[#1C1917] hover:bg-[#3D2B1F] disabled:bg-[#D6D3D1] text-white py-3.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                                    >
                                        {sendingCampaign ? <><RefreshCw className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Revisar y Despachar Campaña</>}
                                    </button>
                                </div>

                                {/* Target Customers Selector */}
                                <div className="lg:col-span-5 border border-[#E8E4DF] bg-[#FAFAF9] rounded-xl p-5 flex flex-col h-[500px]">
                                    <div className="mb-4">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#A8A29E] mb-2">Destinatarias ({selectedCampCustomers.length} seleccionadas)</p>
                                        
                                        {/* Filters & Actions */}
                                        <div className="flex gap-2 mb-3">
                                            <button 
                                                onClick={() => setSelectedCampCustomers(initialCustomers.map(c => c.id))} 
                                                className="text-[10px] font-bold uppercase tracking-wider text-[#C17F5F] bg-white border border-[#E8E4DF] px-2.5 py-1.5 rounded-lg hover:bg-[#FAFAF9] transition-all"
                                            >
                                                Marcar Todas
                                            </button>
                                            <button 
                                                onClick={() => setSelectedCampCustomers([])} 
                                                className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] bg-white border border-[#E8E4DF] px-2.5 py-1.5 rounded-lg hover:bg-[#FAFAF9] transition-all"
                                            >
                                                Desmarcar Todas
                                            </button>
                                        </div>

                                        {/* Search */}
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#A8A29E]" />
                                            <input 
                                                type="text" 
                                                placeholder="Filtrar clientas..."
                                                value={campSearch}
                                                onChange={e => setCampSearch(e.target.value)}
                                                className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-[#E8E4DF] bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C17F5F]/30 focus:border-[#C17F5F] text-[#1C1917] transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Scrollable list */}
                                    <div className="flex-1 overflow-y-auto border border-[#E8E4DF] rounded-lg bg-white divide-y divide-[#FAFAF9]">
                                        {filteredCampCustomers.map(customer => {
                                            const isChecked = selectedCampCustomers.includes(customer.id);
                                            return (
                                                <div 
                                                    key={customer.id} 
                                                    onClick={() => {
                                                        setSelectedCampCustomers(prev => 
                                                            prev.includes(customer.id) 
                                                                ? prev.filter(id => id !== customer.id) 
                                                                : [...prev, customer.id]
                                                        );
                                                    }}
                                                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#FAFAF9] cursor-pointer transition-all select-none"
                                                >
                                                    <input 
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        readOnly
                                                        className="w-3.5 h-3.5 rounded text-[#C17F5F] focus:ring-[#C17F5F] border-[#E8E4DF] pointer-events-none"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[12px] font-semibold text-[#1C1917] truncate">{customer.full_name}</p>
                                                        <p className="text-[10px] text-[#A8A29E] truncate">{customer.email}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {filteredCampCustomers.length === 0 && (
                                            <div className="p-4 text-center text-[11px] text-[#A8A29E]">Ningún cliente coincide con la búsqueda.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* ══ SEND CONFIRMATION MODAL ════════════════════════════════════════ */}
        {showConfirmModal && selectedThread && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-[#E8E4DF]">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-lg font-bold text-[#1C1917]">Confirmar Envío</h3>
                                <p className="text-[11px] text-[#A8A29E] mt-1">Verifica los datos antes de enviar. Esta acción es irreversible.</p>
                            </div>
                            <button onClick={() => setShowConfirmModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A8A29E] hover:bg-[#FAFAF9] hover:text-[#1C1917] transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-[#FAFAF9] border border-[#E8E4DF] rounded-xl p-4 space-y-3 text-[12px]">
                            <div className="flex gap-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] w-20 shrink-0 pt-0.5">Para</span>
                                <span className="font-semibold text-[#1C1917]">{selectedThread.customerName} <span className="font-normal text-[#78716C]">({selectedThread.email})</span></span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] w-20 shrink-0 pt-0.5">Plantilla</span>
                                <span className="text-[#44403C]">{activeTemplate.emoji} {activeTemplate.name}</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] w-20 shrink-0 pt-0.5">Asunto</span>
                                <span className="text-[#44403C] italic">{subject}</span>
                            </div>
                        </div>
                        <div className="border border-[#E8E4DF] rounded-xl overflow-hidden h-40">
                            <iframe title="Preview" srcDoc={compiledHtml} className="w-full h-full border-0" sandbox="allow-same-origin" />
                        </div>
                    </div>
                    <div className="flex gap-3 px-6 pb-6">
                        <button onClick={() => setShowConfirmModal(false)} className="flex-1 border border-[#E8E4DF] hover:bg-[#FAFAF9] text-[#78716C] py-3 rounded-xl text-[12px] font-semibold transition-all">
                            Cancelar
                        </button>
                        <button onClick={handleConfirmSend} className="flex-1 bg-[#C17F5F] hover:bg-[#A66B4E] text-white py-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm">
                            <Send className="w-3.5 h-3.5" /> Enviar Ahora
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* ══ CAMPAIGN CONFIRMATION MODAL ════════════════════════════════════ */}
        {showCampConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCampConfirm(false)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-[#E8E4DF]">
                        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-lg font-bold text-[#1C1917]">Confirmar Campaña</h3>
                        <p className="text-[11px] text-[#A8A29E] mt-1">Se enviará a <strong>{selectedCampCustomers.length} clientas</strong> seleccionadas.</p>
                    </div>
                    <div className="p-6 space-y-3">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-700 font-medium">
                            ⚠️ Esta acción enviará correos masivos y no puede deshacerse.
                        </div>
                        <div className="bg-[#FAFAF9] border border-[#E8E4DF] rounded-xl p-4 space-y-2 text-[12px]">
                            <div className="flex gap-3"><span className="font-bold text-[#A8A29E] w-20 shrink-0">Campaña</span><span className="text-[#1C1917] font-semibold">{campName}</span></div>
                            <div className="flex gap-3"><span className="font-bold text-[#A8A29E] w-20 shrink-0">Asunto</span><span className="text-[#44403C] italic">{campSubject}</span></div>
                        </div>
                    </div>
                    <div className="flex gap-3 px-6 pb-6">
                        <button onClick={() => setShowCampConfirm(false)} className="flex-1 border border-[#E8E4DF] hover:bg-[#FAFAF9] text-[#78716C] py-3 rounded-xl text-[12px] font-semibold transition-all">Cancelar</button>
                        <button onClick={handleConfirmCampaign} className="flex-1 bg-[#1C1917] hover:bg-[#3D2B1F] text-white py-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all">
                            <Send className="w-3.5 h-3.5" /> Enviar Campaña
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* ══ QUICK REPLY PREVIEW MODAL ════════════════════════════════════════ */}
        {showQuickPreview && selectedThread && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQuickPreview(false)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[680px]" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-[#E8E4DF] flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#1C1917] font-serif">Previsualización de Respuesta Rápida</span>
                        </div>
                        <button onClick={() => setShowQuickPreview(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A8A29E] hover:bg-[#FAFAF9] hover:text-[#1C1917] transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 bg-brand-sand/15 overflow-auto p-4 flex items-center justify-center">
                        <iframe 
                            title="Quick Reply Email Preview"
                            srcDoc={compiledQuickHtml}
                            className="w-full max-w-[420px] h-[550px] bg-white rounded-xl shadow-xl overflow-hidden mx-auto"
                            sandbox="allow-same-origin"
                        />
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

// ─── ContactItem ───────────────────────────────────────────────────────────────
function ContactItem({ c, unread, isSelected, onSelect, lastMessage }: {
    c: Customer; 
    unread: number; 
    isSelected: boolean; 
    onSelect: (id: string) => void;
    lastMessage?: { subject: string; snippet: string; date: string; direction: string };
}) {
    const initials = c.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    // Format relative time / date
    const formattedDate = useMemo(() => {
        if (!lastMessage?.date) return '';
        const d = new Date(lastMessage.date);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
    }, [lastMessage?.date]);

    return (
        <button
            onClick={() => onSelect(c.id)}
            className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-all hover:bg-white ${isSelected ? 'bg-white shadow-sm border-l-2 border-[#C17F5F]' : 'border-l-2 border-transparent'}`}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${isSelected ? 'bg-[#C17F5F] text-white' : 'bg-[#1C1917] text-white/80'}`}>
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                    <p className={`text-[13px] truncate ${unread > 0 ? 'font-bold text-[#1C1917]' : 'font-medium text-[#44403C]'}`}>{c.full_name}</p>
                    {formattedDate && (
                        <span className="text-[10px] text-[#A8A29E] shrink-0 font-medium" suppressHydrationWarning>{formattedDate}</span>
                    )}
                </div>
                {lastMessage ? (
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={`text-[11.5px] truncate flex-1 ${unread > 0 ? 'font-semibold text-[#1C1917]' : 'text-[#78716C]'}`}>
                            <span className="text-[#A8A29E] font-bold mr-1">{lastMessage.direction === 'outbound' ? '↗' : '↙'}</span>
                            {lastMessage.snippet}
                        </p>
                        {unread > 0 && (
                            <span className="bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shrink-0">{unread}</span>
                        )}
                    </div>
                ) : (
                    <p className="text-[11px] text-[#A8A29E] truncate mt-0.5">{c.email}</p>
                )}
            </div>
        </button>
    );
}
