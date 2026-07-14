'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShoppingCart, User, Search, CreditCard, Tag, X, Plus, MessageSquare, Mail, ClipboardList, TrendingUp, Loader2, Package, Camera, FileText, AlertCircle, Globe, Sparkles, Trash2 } from 'lucide-react';
import { getCostSettings } from '../finance/actions';
import { getCatalog } from '../catalog/actions';
import { getCustomers, createCustomer } from '../crm/actions';
import { sendBudgetEmailAction, sendOrderConfirmationEmailAction, createPOSOrdersAction, checkOrderStatusAction, getDailyWorkloadAction, getEstimatedDatesAction, getOperatorsAction, getAtelierConfigAction, saveBudgetAction, wakeUpMercadoPagoTerminalAction, requestDiscountAuthorizationAction, getOperatorsDailyLoadAction, analyzeDesignWithGeminiAction, cancelPendingOrderAction, getLatestWebhookLogsAction, sendWhatsAppPaymentConfirmationAction, checkDesignExclusivityAction, registerDesignExclusivityAction } from './actions';
import { createPaymentPreference } from '@/lib/payments';
import { createWebpayTransaction } from '@/lib/transbank';
import { getCurrentCashRegisterAction, getAllPendingOrdersAction, payOrderBalanceAction } from '../caja/actions';

const getLocalDateString = (dateObj: Date) => {
    const y = dateObj.getFullYear();
    const mo = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${mo}-${d}`;
};

const getLocalTimeString = (dateObj: Date) => {
    const h = String(dateObj.getHours()).padStart(2, '0');
    const m = String(dateObj.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
};

const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(event.target?.result as string);
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = () => {
                resolve(event.target?.result as string);
            };
        };
        reader.onerror = () => {
            resolve('');
        };
    });
};

const getDefaultProductionHours = (name: string, category: string): number => {
    const n = name.toLowerCase();
    if (n.includes('basta máquina') || n.includes('basta maquina')) return 0.5;
    if (n.includes('basta postizo')) return 1.0;
    if (n.includes('basta a mano')) return 1.5;
    if (n.includes('basta sesgo')) return 1.5;
    if (n.includes('basta vestido con cola')) return 3.0;
    if (n.includes('basta vestido s/cola')) return 2.0;
    if (category.toLowerCase().includes('bastas')) return 1.0;
    return 1.0; // Default fallback
};


const DEFAULT_HC_TEMPLATES = [
  {
    id: 'vestido_gala',
    name: 'Vestido Gala',
    svg: `<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M35,20 C35,20 40,15 50,22 C60,15 65,20 65,20 L68,40 C65,55 68,70 75,120 L25,120 C32,70 35,55 32,40 Z" /><path d="M36,23 C36,23 41,18 50,24 C59,18 64,23 64,23 L66,41 C63,55 66,70 72,117 L28,117 C34,70 37,55 34,41 Z" stroke-dasharray="2 2" stroke-width="0.8" /></svg>`,
    molderia: 'draping',
    pieces: 8,
    tela: 'hard',
    estructura: { canvas: false, lining: true, cups: true, bones: true, pads: false },
    acabados: { handHem: true, handButtonholes: 0, handDraping: true, handEmbroideryHours: 6 },
    pruebas: 3,
    toile: true,
    materiales: 120000,
    extra: 40000
  },
  {
    id: 'chaqueta_sastre',
    name: 'Chaqueta Sastre',
    svg: `<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M30,20 L40,15 L50,25 L60,15 L70,20 L75,60 L70,105 L30,105 L25,60 Z" /><path d="M40,15 L45,40 L50,25 L55,40 L60,15" /><path d="M30,20 L22,65 L26,95 L30,95 L28,60" /><path d="M70,20 L78,65 L74,95 L70,95 L72,60" /></svg>`,
    molderia: 'custom',
    pieces: 18,
    tela: 'medium',
    estructura: { canvas: true, lining: true, cups: false, bones: false, pads: true },
    acabados: { handHem: true, handButtonholes: 5, handDraping: false, handEmbroideryHours: 0 },
    pruebas: 2,
    toile: true,
    materiales: 95000,
    extra: 20000
  },
  {
    id: 'vestido_novia',
    name: 'Vestido Novia',
    svg: `<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M40,20 C40,20 45,15 50,18 C55,15 60,20 60,20 L65,40 C60,50 40,50 35,40 Z" /><path d="M35,40 C35,60 20,130 15,140 L85,140 C80,130 65,60 65,40" /><path d="M45,45 C45,45 50,55 55,45" stroke-dasharray="1 2" stroke-width="0.5" /></svg>`,
    molderia: 'draping',
    pieces: 14,
    tela: 'haute',
    estructura: { canvas: false, lining: true, cups: true, bones: true, pads: false },
    acabados: { handHem: true, handButtonholes: 12, handDraping: true, handEmbroideryHours: 15 },
    pruebas: 4,
    toile: true,
    materiales: 250000,
    extra: 80000
  },
  {
    id: 'pantalon_vestir',
    name: 'Pantalón Sastre',
    svg: `<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M35,30 L65,30 L70,120 L55,120 L50,60 L45,120 L30,120 Z" /><path d="M45,30 L45,50 M55,30 L55,50" stroke-dasharray="2 2" stroke-width="0.8" /><path d="M50,30 L50,55" /></svg>`,
    molderia: 'custom',
    pieces: 8,
    tela: 'medium',
    estructura: { canvas: false, lining: true, cups: false, bones: false, pads: false },
    acabados: { handHem: true, handButtonholes: 2, handDraping: false, handEmbroideryHours: 0 },
    pruebas: 2,
    toile: true,
    materiales: 45000,
    extra: 10000
  },
  {
    id: 'abrigo_sastre',
    name: 'Abrigo Sastre',
    svg: `<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M25,25 L40,20 L50,25 L60,20 L75,25 L80,110 L20,110 Z" /><path d="M40,20 L45,50 L50,25 L55,50 L60,20" /><path d="M25,25 L20,70 L25,75 L30,70 L28,25 M75,25 L80,70 L75,75 L70,70 L72,25" /><path d="M40,70 L60,70 M40,85 L60,85 M50,50 L50,110" /></svg>`,
    molderia: 'custom',
    pieces: 16,
    tela: 'hard',
    estructura: { canvas: true, lining: true, cups: false, bones: false, pads: true },
    acabados: { handHem: true, handButtonholes: 6, handDraping: false, handEmbroideryHours: 0 },
    pruebas: 2,
    toile: true,
    materiales: 110000,
    extra: 30000
  },
  {
    id: 'falda_tubo',
    name: 'Falda Tubo',
    svg: `<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M35,40 L65,40 C65,40 70,60 68,90 L32,90 C30,60 35,40 35,40 Z" /><path d="M45,40 L43,60 M55,40 L57,60" stroke-dasharray="2 2" stroke-width="0.8" /></svg>`,
    molderia: 'existing',
    pieces: 4,
    tela: 'easy',
    estructura: { canvas: false, lining: true, cups: false, bones: false, pads: false },
    acabados: { handHem: true, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0 },
    pruebas: 1,
    toile: false,
    materiales: 25000,
    extra: 5000
  },
  {
    id: 'corse_clasico',
    name: 'Corsé Clásico',
    svg: `<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M35,35 C42,32 58,32 65,35 L68,75 L32,75 Z" /><path d="M38,35 L40,75 M44,34 L46,75 M50,33 L50,75 M56,34 L54,75 M62,35 L60,75" stroke-width="0.8" /></svg>`,
    molderia: 'custom',
    pieces: 10,
    tela: 'hard',
    estructura: { canvas: true, lining: true, cups: true, bones: true, pads: false },
    acabados: { handHem: false, handButtonholes: 0, handDraping: false, handEmbroideryHours: 2 },
    pruebas: 2,
    toile: true,
    materiales: 35000,
    extra: 15000
  },
  {
    id: 'chaleco_sastre',
    name: 'Chaleco Sastre',
    svg: `<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M35,25 L45,20 L55,20 L65,25 L70,60 L60,75 L50,70 L40,75 L30,60 Z" /><path d="M45,20 L50,45 L55,20" /><path d="M50,45 L50,70" /><circle cx="50" cy="50" r="1" /><circle cx="50" cy="58" r="1" /></svg>`,
    molderia: 'custom',
    pieces: 12,
    tela: 'medium',
    estructura: { canvas: true, lining: true, cups: false, bones: false, pads: false },
    acabados: { handHem: true, handButtonholes: 5, handDraping: false, handEmbroideryHours: 0 },
    pruebas: 2,
    toile: true,
    materiales: 30000,
    extra: 10000
  },
  {
    id: 'falda_vuelo',
    name: 'Falda Vuelo',
    svg: `<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M40,40 L60,40 C60,40 80,90 85,110 L15,110 C20,90 40,40 40,40 Z" /><path d="M45,40 C45,40 40,90 35,110 M50,40 C50,40 50,90 50,110 M55,40 C55,40 60,90 65,110" stroke-width="0.8" /></svg>`,
    molderia: 'existing',
    pieces: 3,
    tela: 'easy',
    estructura: { canvas: false, lining: true, cups: false, bones: false, pads: false },
    acabados: { handHem: true, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0 },
    pruebas: 1,
    toile: false,
    materiales: 40000,
    extra: 5000
  }
];

export default function POSPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loadBalancerModal, setLoadBalancerModal] = useState<{ show: boolean, targetOpId: string, itemIndex: number | null, estimatedHours: number, targetName: string, targetLoadDays: string, alternatives: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'mercadopago_point' | 'transbank' | 'cash' | 'split' | null>(null);
    const [initialPaymentType, setInitialPaymentType] = useState<'total' | '50percent' | 'zero'>('total');
    const [splitCardAmount, setSplitCardAmount] = useState<number>(0);
    const [splitCashAmount, setSplitCashAmount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    
    // Gobernanza de Capacidad y Algoritmo de Fechas
    const [estimatedDates, setEstimatedDates] = useState<{
        productionStartDate: string;
        productionEndDate: string;
        finalDeliveryDate: string;
        backlogHours: number;
        dailyCapacity: number;
        config: any;
        } | null>(null);
    const [loadingEstimatedDates, setLoadingEstimatedDates] = useState(false);
    const [adminOverride, setAdminOverride] = useState(false);
    const [operators, setOperators] = useState<any[]>([]);
    const [atelierConfig, setAtelierConfig] = useState<any>(null);
    const [assignedOperatorId, setAssignedOperatorId] = useState<string>('');
    const [isCajaOpen, setIsCajaOpen] = useState<boolean | null>(null);

    const [posMode, setPosMode] = useState<'new_sale' | 'pay_balance'>('new_sale');
    const [allPendingOrders, setAllPendingOrders] = useState<any[]>([]);
    // const [pendingSearchTerm, setPendingSearchTerm] = useState('');
    const [filteredPendingOrders, setFilteredPendingOrders] = useState<any[]>([]);
    const [pendingOrderToPay, setPendingOrderToPay] = useState<any>(null);

    useEffect(() => {
        getCurrentCashRegisterAction().then(res => {
            if (res.success) {
                setIsCajaOpen(!!res.register);
            }
        });
        getAllPendingOrdersAction().then(res => {
            if (res.success) {
                setAllPendingOrders(res.orders || []);
            }
        });
    }, []);


    const addToCart = (p: any) => setCart([...cart, p]);
    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const hasUnassignedItems = posMode === 'new_sale' && cart.length > 0 && cart.some(item => !item.assignedOperatorId || item.assignedOperatorId === 'unassigned');



    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [customOrderName, setCustomOrderName] = useState('');
    const [customOrderCategory, setCustomOrderCategory] = useState('Diseño y confección');
    const [selectedCatalogCategory, setSelectedCatalogCategory] = useState('');
    const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<any>(null);
    
    // ERP Costing States
    const [hoursEstimated, setHoursEstimated] = useState<number>(0);
    const [hourlyRate, setHourlyRate] = useState<number>(25000);
    const [materialsCost, setMaterialsCost] = useState<number>(0);
    const [extraCost, setExtraCost] = useState<number>(0);
    const [fixedCost, setFixedCost] = useState<number>(349000);
    const [marginPercentage, setMarginPercentage] = useState<number>(15);
    const [globalSettings, setGlobalSettings] = useState<any>(null);
    const [customPrice, setCustomPrice] = useState<string>('');
 
    const [allCustomers, setAllCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    // Exclusivity Campaign State
    const [exclusivityType, setExclusivityType] = useState<'none' | 'graduacion' | 'novias'>('none');
    const [exclusivityEventId, setExclusivityEventId] = useState('');
    const [exclusivityDesignName, setExclusivityDesignName] = useState('');
    const [clientSearch, setClientSearch] = useState('');

    useEffect(() => {
        if (!clientSearch.trim()) {
            setFilteredPendingOrders([]);
            return;
        }
        const term = clientSearch.toLowerCase();
        const filtered = allPendingOrders.filter(o => 
            (o.pos_order_id && o.pos_order_id.toLowerCase().includes(term)) ||
            (o.customers?.full_name && o.customers.full_name.toLowerCase().includes(term)) ||
            (o.customers?.email && o.customers.email.toLowerCase().includes(term)) ||
            (o.customers?.phone && o.customers.phone.toLowerCase().includes(term))
        );
        setFilteredPendingOrders(filtered);
    }, [clientSearch, allPendingOrders]);
    const [isRegisteringClient, setIsRegisteringClient] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', phone: '56', email: '' });
    const [checkoutResult, setCheckoutResult] = useState<any>(null);
    const [orderNotes, setOrderNotes] = useState('');
    const [orderImages, setOrderImages] = useState<{ url: string; notes: string }[]>([]);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
    const [deadline, setDeadline] = useState<string>('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authPinInput, setAuthPinInput] = useState('');
    const [expectedPin, setExpectedPin] = useState('');
    const [pendingAuthItem, setPendingAuthItem] = useState<any>(null);
    const [isAuthorizing, setIsAuthorizing] = useState(false);

    // AI Haute Couture Calculator states
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
    const [isAiCalculatorModalOpen, setIsAiCalculatorModalOpen] = useState(false);

    // Haute Couture Modal states
    const [isHauteCoutureModalOpen, setIsHauteCoutureModalOpen] = useState(false);
    const [hcTemplates, setHcTemplates] = useState<any[]>([]);
    const [hcPrendaName, setHcPrendaName] = useState('');
    const [hcPatternType, setHcPatternType] = useState('custom');
    const [hcPatternPieces, setHcPatternPieces] = useState(10);
    const [hcTextileDifficulty, setHcTextileDifficulty] = useState('medium');
    const [hcInternalArchitecture, setHcInternalArchitecture] = useState({ canvas: false, lining: false, cups: false, bones: false, pads: false });
    const [hcHandcraft, setHcHandcraft] = useState({ handHem: false, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0 });
    const [hcFittingsCount, setHcFittingsCount] = useState(2);
    const [hcToileNeeded, setHcToileNeeded] = useState(false);
    const [hcMaterialsCost, setHcMaterialsCost] = useState(50000);
    const [hcExtraCost, setHcExtraCost] = useState(0);
    const [hcNeckline, setHcNeckline] = useState('redondo');
    const [hcSleeve, setHcSleeve] = useState('sin manga');
    const [hcLength, setHcLength] = useState('largo');
    const [newTemplateName, setNewTemplateName] = useState('');

    // Load HC templates from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('elena_hc_custom_templates');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setHcTemplates([...DEFAULT_HC_TEMPLATES, ...parsed]);
                    return;
                } catch (e) { console.error(e); }
            }
        }
        setHcTemplates(DEFAULT_HC_TEMPLATES);
    }, [isHauteCoutureModalOpen]);

    const handleApplyTemplate = (tpl: any) => {
        setHcPrendaName(tpl.name);
        setHcPatternType(tpl.molderia);
        setHcPatternPieces(tpl.pieces);
        setHcTextileDifficulty(tpl.tela);
        setHcInternalArchitecture({ ...tpl.estructura });
        setHcHandcraft({ ...tpl.acabados });
        setHcFittingsCount(tpl.pruebas);
        setHcToileNeeded(tpl.toile);
        setHcMaterialsCost(tpl.materiales || 0);
        setHcExtraCost(tpl.extra || 0);
    };

    const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("¿Seguro que deseas eliminar esta plantilla personalizada?")) return;
        const customOnly = hcTemplates.filter(t => t.id.startsWith('custom_') && t.id !== id);
        localStorage.setItem('elena_hc_custom_templates', JSON.stringify(customOnly));
        setHcTemplates([...DEFAULT_HC_TEMPLATES, ...customOnly]);
    };

    const handleSaveAsTemplateInline = (nameToUse?: string) => {
        const tplName = nameToUse || newTemplateName || hcPrendaName || "Diseño Especial";
        const newTpl = {
            id: `custom_${Date.now()}`,
            name: tplName,
            img: '/assets/siluetas/vestido_gala.png',
            molderia: hcPatternType,
            pieces: hcPatternPieces,
            tela: hcTextileDifficulty,
            estructura: hcInternalArchitecture,
            acabados: hcHandcraft,
            pruebas: hcFittingsCount,
            toile: hcToileNeeded,
            materiales: hcMaterialsCost,
            extra: hcExtraCost
        };
        const customOnly = hcTemplates.filter(t => t.id.startsWith('custom_'));
        const updated = [...customOnly, newTpl];
        localStorage.setItem('elena_hc_custom_templates', JSON.stringify(updated));
        setHcTemplates([...DEFAULT_HC_TEMPLATES, ...updated]);
        setNewTemplateName('');
        alert(`¡Plantilla "${tplName}" guardada con éxito!`);
    };

    // Haute Couture hours computation
    const hcComputedHours = React.useMemo(() => {
        const MOLD_H: any = { existing: 4, custom: 12, draping: 18 };
        const TELA_MULT: any = { easy: 1.0, medium: 1.15, hard: 1.35, haute: 1.6 };
        let h = MOLD_H[hcPatternType] || 12;
        h += hcPatternPieces * 0.75;
        h *= TELA_MULT[hcTextileDifficulty] || 1.0;
        if (hcInternalArchitecture.canvas) h += 6;
        if (hcInternalArchitecture.lining) h += 3;
        if (hcInternalArchitecture.cups) h += 2;
        if (hcInternalArchitecture.bones) h += 4;
        if (hcInternalArchitecture.pads) h += 1.5;
        if (hcHandcraft.handHem) h += 2;
        h += hcHandcraft.handButtonholes * 0.5;
        if (hcHandcraft.handDraping) h += 4;
        h += hcHandcraft.handEmbroideryHours;
        h += hcFittingsCount * 1.5;
        if (hcToileNeeded) h += 6;
        return Math.round(h * 10) / 10;
    }, [hcPatternType, hcPatternPieces, hcTextileDifficulty, hcInternalArchitecture, hcHandcraft, hcFittingsCount, hcToileNeeded]);

    const hcTotalCost = React.useMemo(() => {
        const laborCost = hcComputedHours * hourlyRate;
        return Math.round(laborCost + hcMaterialsCost + hcExtraCost);
    }, [hcComputedHours, hourlyRate, hcMaterialsCost, hcExtraCost]);

    // Populate AI calculator when analysis result arrives
    useEffect(() => {
        if (aiAnalysisResult) {
            setHcPatternType(aiAnalysisResult.molderia || 'custom');
            setHcPatternPieces(aiAnalysisResult.pieces || 10);
            setHcTextileDifficulty(aiAnalysisResult.tela || 'medium');
            setHcInternalArchitecture({
                canvas: !!aiAnalysisResult.estructura?.canvas,
                lining: !!aiAnalysisResult.estructura?.lining,
                cups: !!aiAnalysisResult.estructura?.cups,
                bones: !!aiAnalysisResult.estructura?.bones,
                pads: !!aiAnalysisResult.estructura?.pads,
            });
            setHcHandcraft({
                handHem: !!aiAnalysisResult.acabados?.handHem,
                handButtonholes: aiAnalysisResult.acabados?.handButtonholes || 0,
                handDraping: !!aiAnalysisResult.acabados?.handDraping,
                handEmbroideryHours: aiAnalysisResult.acabados?.handEmbroideryHours || 0,
            });
            setHcFittingsCount(aiAnalysisResult.pruebas || 2);
            setHcToileNeeded(!!aiAnalysisResult.toile);
            setHcMaterialsCost(aiAnalysisResult.materiales || 50000);
            setIsHauteCoutureModalOpen(true);
        }
    }, [aiAnalysisResult]);

    // Adjusted dates working backward from manual deadline if needed
    const adjustedDates = React.useMemo(() => {
        if (!estimatedDates) return null;
        
        let productionStartDate = estimatedDates.productionStartDate;
        let productionEndDate = estimatedDates.productionEndDate;
        let finalDeliveryDate = estimatedDates.finalDeliveryDate;
        
        if (adminOverride && deadline) {
            const deadlineDate = new Date(deadline);
            if (!isNaN(deadlineDate.getTime())) {
                finalDeliveryDate = deadline;
                
                // Get current time in Chile timezone and align to working hours
                const now = new Date();
                const nowInChile = new Date(now.toLocaleString("en-US", { timeZone: "America/Santiago" }));
                const workingDays = atelierConfig?.workshop_working_days || [1, 2, 3, 4, 5, 6];
                const startHourStr = atelierConfig?.workshop_working_hour_start || '09:00:00';
                const endHourStr = atelierConfig?.workshop_working_hour_end || '18:00:00';
                const [startH, startM] = startHourStr.split(':').map(Number);
                const [endH, endM] = endHourStr.split(':').map(Number);
                
                const alignToWorkingHours = (d: Date): Date => {
                    let res = new Date(d.getTime());
                    let safeguard = 0;
                    while (safeguard < 30) {
                        safeguard++;
                        if (!workingDays.includes(res.getDay())) {
                            res.setDate(res.getDate() + 1);
                            res.setHours(startH || 9, startM || 0, 0, 0);
                            continue;
                        }
                        const currentH = res.getHours();
                        const currentM = res.getMinutes();
                        if (currentH < (startH || 9) || (currentH === (startH || 9) && currentM < (startM || 0))) {
                            res.setHours(startH || 9, startM || 0, 0, 0);
                            break;
                        }
                        if (currentH > (endH || 18) || (currentH === (endH || 18) && currentM > (endM || 0))) {
                            res.setDate(res.getDate() + 1);
                            res.setHours(startH || 9, startM || 0, 0, 0);
                            continue;
                        }
                        break;
                    }
                    return res;
                };
                
                const minStartDate = alignToWorkingHours(nowInChile);
                
                const bufferMs = (estimatedDates.config?.bufferDays || 0) * 24 * 60 * 60 * 1000;
                const maxProductionEnd = new Date(deadlineDate.getTime() - bufferMs);
                const autoProductionEnd = new Date(estimatedDates.productionEndDate);
                
                if (autoProductionEnd > maxProductionEnd) {
                    const durationMs = autoProductionEnd.getTime() - new Date(estimatedDates.productionStartDate).getTime();
                    let adjustedEnd = maxProductionEnd;
                    let adjustedStart = new Date(adjustedEnd.getTime() - durationMs);
                    
                    // Clamp start to at least the minimum allowed start date
                    if (adjustedStart < minStartDate) {
                        adjustedStart = minStartDate;
                        adjustedEnd = new Date(adjustedStart.getTime() + durationMs);
                    }
                    
                    productionEndDate = adjustedEnd.toISOString();
                    productionStartDate = adjustedStart.toISOString();
                }
            }
        }
        
        return {
            ...estimatedDates,
            productionStartDate,
            productionEndDate,
            finalDeliveryDate
        };
    }, [estimatedDates, adminOverride, deadline, atelierConfig]);

    const [dailyWorkload, setDailyWorkload] = useState<{ count: number; totalHours: number } | null>(null);
    const [loadingWorkload, setLoadingWorkload] = useState<boolean>(false);
    // Custom date-time picker state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerStep, setPickerStep] = useState<'date' | 'time'>('date');
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
    const [tempDate, setTempDate] = useState('');
    const [tempHour, setTempHour] = useState('10');
    const [tempMinute, setTempMinute] = useState('00');
    const datePickerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const queryDate = adjustedDates?.productionEndDate || deadline;
        if (!queryDate) {
            setDailyWorkload(null);
            return;
        }
        setLoadingWorkload(true);
        getDailyWorkloadAction(queryDate).then(res => {
            setDailyWorkload(res);
            setLoadingWorkload(false);
        });
    }, [deadline, adjustedDates?.productionEndDate]);

    const [allEstimates, setAllEstimates] = useState<any>({});

    // Calcular reactivamente las fechas sugeridas por el taller al cambiar el carrito (por costurera y fecha agendada)
    React.useEffect(() => {
        // 1. Group total hours by unique operator id and scheduled start date
        const groupMap: { [key: string]: { hours: number, opId: string, scheduledDate?: string } } = {};
        
        cart.forEach(item => {
            const opId = item.assignedOperatorId || 'unassigned';
            const scheduledDate = item.scheduledStartDate || '';
            const key = `${opId}_${scheduledDate}`;
            const hours = item.isCustom 
                ? Number(item.details?.hours || 0) 
                : getDefaultProductionHours(item.name, item.category);
            
            if (!groupMap[key]) {
                groupMap[key] = { hours: 0, opId, scheduledDate: scheduledDate || undefined };
            }
            groupMap[key].hours += hours;
        });

        const totalCartHours = Object.values(groupMap).reduce((sum, g) => sum + g.hours, 0);
        
        if (totalCartHours === 0) {
            setEstimatedDates(null);
            if (!adminOverride) {
                setDeadline('');
            }
            return;
        }

        setLoadingEstimatedDates(true);

        // 2. Fetch estimated dates for each group in parallel
        const promises = Object.values(groupMap).map(group => {
            return getEstimatedDatesAction(group.hours, group.opId, group.scheduledDate);
        });

        Promise.all(promises).then(results => {
            // Find the latest finalDeliveryDate
            let latestResult = results[0];
            const newEstimatesMap: any = {};
            const keys = Object.keys(groupMap);
            for (let i = 0; i < results.length; i++) {
                const key = keys[i];
                newEstimatesMap[key] = results[i];
                if (new Date(results[i].finalDeliveryDate) > new Date(latestResult.finalDeliveryDate)) {
                    latestResult = results[i];
                }
            }

            setAllEstimates(newEstimatesMap);
            setEstimatedDates(latestResult);
            if (!adminOverride) {
                setDeadline(latestResult.finalDeliveryDate);
            }
            setLoadingEstimatedDates(false);
        }).catch(err => {
            console.error("Error al calcular fechas estimadas de taller:", err);
            setLoadingEstimatedDates(false);
        });
    }, [cart, adminOverride]);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Picker helpers
    const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const DAY_NAMES = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];
    const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDay = (m: number, y: number) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };
    const today = new Date(); today.setHours(0,0,0,0);

    const windowStart = adjustedDates?.config?.windowStart || atelierConfig?.delivery_window_start || '10:00:00';
    const windowEnd = adjustedDates?.config?.windowEnd || atelierConfig?.delivery_window_end || '18:00:00';
    
    const [startHStr, startMStr] = windowStart.split(':');
    const [endHStr, endMStr] = windowEnd.split(':');
    const startH = parseInt(startHStr) || 10;
    const startM = parseInt(startMStr) || 0;
    const endH = parseInt(endHStr) || 18;
    const endM = parseInt(endMStr) || 0;

    const MINUTES = ['00','15','30','45'];

    const pickerHours = React.useMemo(() => {
        const list: string[] = [];
        for (let h = startH; h <= endH; h++) {
            list.push(String(h).padStart(2, '0'));
        }
        return list.length > 0 ? list : ['10','11','12','13','14','15','16','17','18'];
    }, [startH, endH]);

    const isDateTimePast = (dateStr: string, hourStr: string, minuteStr: string) => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (dateStr < todayStr) return true;
        if (dateStr > todayStr) return false;
        const h = parseInt(hourStr);
        const m = parseInt(minuteStr);
        if (h < now.getHours()) return true;
        if (h === now.getHours() && m <= now.getMinutes()) return true;
        return false;
    };

    const isDeliveryTimeDisabled = (dateStr: string, hStr: string, mStr: string) => {
        if (isDateTimePast(dateStr, hStr, mStr)) return true;
        const h = parseInt(hStr);
        const m = parseInt(mStr);
        if (h < startH || (h === startH && m < startM)) return true;
        if (h > endH || (h === endH && m > endM)) return true;
        return false;
    };

    const findFirstAvailableSlot = (dateStr: string) => {
        const configStartH = String(startH).padStart(2, '0');
        const configStartM = String(startM).padStart(2, '0');
        
        if (!isDeliveryTimeDisabled(dateStr, configStartH, configStartM)) {
            return { hour: configStartH, minute: configStartM };
        }
        
        let firstH = configStartH;
        let firstM = configStartM;
        let found = false;
        for (const h of pickerHours) {
            for (const m of MINUTES) {
                if (!isDeliveryTimeDisabled(dateStr, h, m)) {
                    firstH = h;
                    firstM = m;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        return { hour: firstH, minute: firstM };
    };

    const openPicker = () => {
        if (deadline) {
            const dateObj = new Date(deadline);
            if (!isNaN(dateObj.getTime())) {
                const dp = getLocalDateString(dateObj);
                const h = String(dateObj.getHours()).padStart(2, '0');
                const m = String(dateObj.getMinutes()).padStart(2, '0');
                setTempDate(dp);
                setTempHour(h);
                setTempMinute(m);
                setCalendarYear(dateObj.getFullYear());
                setCalendarMonth(dateObj.getMonth());
            } else {
                setTempDate('');
                const now = new Date();
                setCalendarMonth(now.getMonth());
                setCalendarYear(now.getFullYear());
            }
        } else {
            setTempDate('');
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const todayPast = isDeliveryTimeDisabled(todayStr, String(endH).padStart(2, '0'), String(endM).padStart(2, '0'));
            const defaultDate = todayPast ? (() => {
                const nextDay = new Date();
                nextDay.setDate(nextDay.getDate() + 1);
                return `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
            })() : todayStr;
            const { hour, minute } = findFirstAvailableSlot(defaultDate);
            setTempHour(hour); setTempMinute(minute);
            setCalendarMonth(new Date().getMonth()); setCalendarYear(new Date().getFullYear());
        }
        setPickerStep('date');
        setShowDatePicker(true);
    };

    const selectDay = (day: number) => {
        const d = `${calendarYear}-${String(calendarMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        setTempDate(d);
        
        // Keep existing hour and minute if valid and not in the past or disabled
        if (tempHour && tempMinute && !isDeliveryTimeDisabled(d, tempHour, tempMinute)) {
            // Keep existing
        } else {
            const configStartH = String(startH).padStart(2, '0');
            const configStartM = String(startM).padStart(2, '0');
            
            if (!isDeliveryTimeDisabled(d, configStartH, configStartM)) {
                setTempHour(configStartH);
                setTempMinute(configStartM);
            } else {
                const { hour, minute } = findFirstAvailableSlot(d);
                setTempHour(hour);
                setTempMinute(minute);
            }
        }
        setPickerStep('time');
    };

    const confirmTime = () => {
        const dateObj = new Date(`${tempDate}T${tempHour}:${tempMinute}`);
        if (!isNaN(dateObj.getTime())) {
            setDeadline(dateObj.toISOString());
        } else {
            setDeadline(`${tempDate}T${tempHour}:${tempMinute}`);
        }
        setShowDatePicker(false);
    };

    const formatDeadlineDisplay = () => {
        if (!deadline) return null;
        const dateObj = new Date(deadline);
        if (isNaN(dateObj.getTime())) return null;
        return {
            day: dateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            time: getLocalTimeString(dateObj)
        };
    };
 
    React.useEffect(() => {
        setLoading(true);
        Promise.all([
            getCostSettings(),
            getCatalog(),
            getCustomers().catch(() => []), // Fallback in case CRM is not fully seeded yet
            getOperatorsAction().catch(() => []), // Cargar costureras
            getAtelierConfigAction().catch(() => null) // Cargar configuración
        ]).then(([costData, catalogData, customersData, operatorsData, configData]) => {
            setGlobalSettings(costData);
            setHourlyRate(costData.labor_hourly_rate);
            setFixedCost(costData.operational_fixed_cost);
            setMarginPercentage(costData.default_margin_percentage);
            setProducts(catalogData);
            setAllCustomers(customersData || []);
            setOperators(operatorsData || []);
            setAtelierConfig(configData);
            setLoading(false);
        });
    }, []);
 
    const laborCost = hoursEstimated * hourlyRate;
    const productionCost = laborCost + materialsCost + extraCost;
    const totalCost = productionCost + fixedCost;
    const calculatedPrice = marginPercentage > 0 ? totalCost / (1 - (marginPercentage / 100)) : totalCost;
 
    const handleAddCustomOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customOrderName) return;
        
        const finalPrice = customPrice ? Math.round(Number(customPrice.replace(/\D/g, ''))) : Math.round(calculatedPrice);
        const hasDiscount = finalPrice < Math.round(calculatedPrice);
        const discountPct = hasDiscount ? Math.round(((Math.round(calculatedPrice) - finalPrice) / Math.round(calculatedPrice)) * 100) : 0;

        const cartItem = {
            id: Date.now(),
            name: customOrderName,
            price: finalPrice,
            suggestedPrice: Math.round(calculatedPrice),
            discountPercentage: discountPct,
            category: customOrderCategory,
            isCustom: true,
            notes: orderNotes,
            images: orderImages,
            assignedOperatorId: assignedOperatorId,
            details: {
                hours: hoursEstimated,
                materials: materialsCost,
                extra: extraCost
            },
            costBreakdown: {
                labor: laborCost,
                materials: materialsCost + extraCost,
                fixed: fixedCost,
                margin: marginPercentage
            }
        };

        if (discountPct > 20) {
            setPendingAuthItem(cartItem);
            setShowAuthModal(true);
            setIsAuthorizing(true);
            requestDiscountAuthorizationAction({
                sellerName: 'Caja Principal',
                itemName: customOrderName,
                originalPrice: finalPrice,
                suggestedPrice: Math.round(calculatedPrice),
                discountPct
            }).then(res => {
                setIsAuthorizing(false);
                if (res.success) {
                    setExpectedPin(res.pin || '');
                } else {
                    alert('Error enviando solicitud de autorización al admin.');
                    setShowAuthModal(false);
                    setPendingAuthItem(null);
                }
            });
            return;
        }

        addToCart(cartItem);
        resetCustomOrderForm();
    };

    const resetCustomOrderForm = () => {
        setCustomOrderName('');
        setCustomOrderCategory('Diseño y confección');
        setHoursEstimated(0);
        setMaterialsCost(0);
        setExtraCost(0);
        setMarginPercentage(globalSettings?.default_margin_percentage || 15);
        setOrderNotes('');
        setOrderImages([]);
        setActiveImageIndex(0);
        setCustomPrice('');
        setAssignedOperatorId('');
    };

    const handleQuickRegister = async () => {
        if (!newClientData.name) return;
        setLoading(true);
        const fd = new FormData();
        fd.append('full_name', newClientData.name);
        fd.append('phone', newClientData.phone);
        fd.append('email', newClientData.email);
        
        const res = await createCustomer(fd);
        if (res.success) {
            setSelectedCustomer(res.data);
            setAllCustomers([...allCustomers, res.data]);
            setIsRegisteringClient(false);
            setClientSearch('');
            setNewClientData({ name: '', phone: '56', email: '' });
        } else {
            alert("Error al registrar: " + res.error);
        }
        setLoading(false);
    };

    const handleOperatorSelection = async (opId: string, itemIndex: number | null, estimatedHours: number) => {
        if (opId === 'unassigned' || opId === '') {
            if (itemIndex === null) setAssignedOperatorId(opId);
            else {
                const newCart = [...cart];
                newCart[itemIndex] = { ...newCart[itemIndex], assignedOperatorId: opId };
                setCart(newCart);
            }
            return;
        }

        const operatorsLoad = await getOperatorsDailyLoadAction();
        const targetOp = operatorsLoad.find((o: any) => o.id === opId);
        
        if (targetOp) {
            const newBacklog = targetOp.backlog + estimatedHours;
            const newPercentage = Math.round((newBacklog / targetOp.dailyCapacity) * 100);
            
            if (newPercentage > 100) {
                const alternatives = operatorsLoad.filter((o: any) => o.id !== opId && o.workloadPercentage < 100);
                setLoadBalancerModal({
                    show: true,
                    targetOpId: opId,
                    itemIndex: itemIndex,
                    estimatedHours: estimatedHours,
                    targetName: targetOp.name,
                    targetLoadDays: (newBacklog / targetOp.dailyCapacity).toFixed(1),
                    alternatives: alternatives
                });
                return;
            }
        }

        if (itemIndex === null) setAssignedOperatorId(opId);
        else {
            const newCart = [...cart];
            newCart[itemIndex] = { ...newCart[itemIndex], assignedOperatorId: opId };
            setCart(newCart);
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0 || !selectedCustomer) return;
        if (initialPaymentType !== 'zero' && !paymentMethod) return;

        setIsProcessing(true);

        // Validar exclusividad si corresponde
        if (exclusivityType !== 'none') {
            if (!exclusivityEventId.trim()) {
                alert(`Por favor ingresa el ${exclusivityType === 'graduacion' ? 'colegio y curso' : 'matrimonio o fecha'} para registrar la exclusividad.`);
                setIsProcessing(false);
                return;
            }
            if (!exclusivityDesignName.trim()) {
                alert("Por favor especifica el nombre del diseño para registrar la exclusividad.");
                setIsProcessing(false);
                return;
            }

            try {
                const check = await checkDesignExclusivityAction(exclusivityType, exclusivityEventId, exclusivityDesignName);
                if (check.success && !check.available) {
                    alert(`⚠️ Conflicto de Exclusividad: El diseño "${exclusivityDesignName}" ya está registrado para "${exclusivityEventId}".`);
                    setIsProcessing(false);
                    return;
                }
            } catch (errEx) {
                console.error("Error al validar exclusividad:", errEx);
            }
        }

        let amountToCharge = total;
        if (initialPaymentType === '50percent') amountToCharge = Math.round(total / 2);
        else if (initialPaymentType === 'zero') amountToCharge = 0;

        if (initialPaymentType !== 'zero' && paymentMethod === 'cash' && splitCardAmount > 0 && (splitCardAmount + splitCashAmount !== amountToCharge)) {
            alert(`La suma de pago dividido no coincide con el abono a pagar (${amountToCharge}).`);
            return;
        }

        if (!isCajaOpen && initialPaymentType !== 'zero' && paymentMethod === 'cash') {
            if (!confirm('⚠️ La caja diaria está CERRADA. Si cobras en efectivo o mixto, este ingreso no cuadrará correctamente al momento del cierre. ¿Deseas continuar de todas formas?')) {
                return;
            }
        }
        
        
        try {
            const newOrderIdNumber = Math.floor(Math.random() * 90000) + 10000;
            const dateStr = new Date().toLocaleDateString();

            let finalPaymentMethodStr: string | null = paymentMethod;
            if (initialPaymentType === 'zero') {
                finalPaymentMethodStr = 'Pago Contra Entrega';
            } else if (paymentMethod === 'cash') {
                if (splitCardAmount > 0) {
                    finalPaymentMethodStr = `Mixto (Máquina: $${splitCardAmount}, Efectivo: $${splitCashAmount})`;
                } else {
                    finalPaymentMethodStr = 'Efectivo / Transferencia';
                }
            }

            let finalOrderIdStr = '';
            let finalDeliveryDateStr = deadline || (adjustedDates?.finalDeliveryDate ? new Date(adjustedDates.finalDeliveryDate).toLocaleDateString('es-CL') : 'A coordinar');

            const isDigitalTerminal = paymentMethod === 'mercadopago_point' || paymentMethod === 'transbank';
            const isMixedTerminal = paymentMethod === 'cash' && splitCardAmount > 0;
            const isPendingTerminal = isDigitalTerminal || isMixedTerminal;

            let finalPaidAmount = amountToCharge;
            let finalPaymentStatus = initialPaymentType === 'total' ? 'completed' : initialPaymentType === '50percent' ? 'partial' : 'pending';

            if (isPendingTerminal) {
                finalPaymentStatus = 'pending_terminal';
                finalPaidAmount = isMixedTerminal ? splitCashAmount : 0;
            }

            if (posMode === 'pay_balance' && pendingOrderToPay) {
                finalOrderIdStr = pendingOrderToPay.pos_order_id;
                const res = await payOrderBalanceAction(
                    finalOrderIdStr, 
                    amountToCharge, 
                    finalPaymentMethodStr || 'Desconocido',
                    isPendingTerminal
                );

                if (!res.success) {
                    alert("Error al saldar la deuda en caja: " + res.error);
                    setIsProcessing(false);
                    return;
                }
                finalDeliveryDateStr = 'Entrega Coordinada (Saldo Pagado)';
            } else {
                finalOrderIdStr = `order_${newOrderIdNumber}`;
                const res = await createPOSOrdersAction({
                    customerId: selectedCustomer.id,
                    posOrderId: finalOrderIdStr,
                    paymentMethod: finalPaymentMethodStr || undefined,
                    paymentStatus: finalPaymentStatus,
                    paidAmount: finalPaidAmount,
                    items: cart.map(item => ({
                        name: item.name,
                        price: item.price,
                        category: item.category,
                        hours: Number(item.details?.hours || getDefaultProductionHours(item.name, item.category)),
                        notes: item.details?.notes || '',
                        isCustom: !!item.isCustom,
                        assignedOperatorId: item.assignedOperatorId || 'unassigned',
                        scheduledStartDate: item.scheduledStartDate || undefined
                    })),
                    deadline: deadline || null,
                    productionStartDate: adjustedDates?.productionStartDate || null,
                    productionEndDate: adjustedDates?.productionEndDate || null,
                    finalDeliveryDate: adjustedDates?.finalDeliveryDate || deadline || null,
                    splitCashAmount: (paymentMethod === 'cash' && splitCardAmount > 0) ? splitCashAmount : undefined,
                    splitCardAmount: (paymentMethod === 'cash' && splitCardAmount > 0) ? splitCardAmount : undefined,
                    exclusividad: exclusivityType !== 'none' ? {
                        tipo: exclusivityType,
                        identificador: exclusivityEventId,
                        diseno: exclusivityDesignName
                    } : undefined
                });

                if (!res.success) {
                    alert("Error al registrar la orden en producción: " + res.error);
                    setIsProcessing(false);
                    return;
                }
            }

            let paymentUrl = '';
            if (initialPaymentType === 'zero') {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.elenalacosturera.cl';
                paymentUrl = `${siteUrl}/pagar/${finalOrderIdStr}?amount=${total}`;
                
                setCheckoutResult({
                    orderId: finalOrderIdStr.replace('order_', ''),
                    customer: selectedCustomer,
                    total: total,
                    paidAmount: amountToCharge,
                    items: cart,
                    method: 'Pago Contra Entrega',
                    date: dateStr,
                    deliveryDate: deadline ? new Date(deadline).toLocaleDateString() : null,
                    paymentUrl: paymentUrl
                });
                setPaymentConfirmed(true);

                if (selectedCustomer.email && posMode === 'new_sale') {
                    sendOrderConfirmationEmailAction({
                        customerEmail: selectedCustomer.email,
                        customerName: selectedCustomer.full_name,
                        orderId: Number(finalOrderIdStr.replace('order_', '')) || 0,
                        items: cart.map(item => ({
                            name: item.name,
                            price: item.price,
                            category: item.category,
                            notes: item.notes || ''
                        })),
                        total: total,
                        paymentMethod: 'Pago Contra Entrega',
                        date: dateStr,
                        deliveryDate: deadline || adjustedDates?.finalDeliveryDate || '',
                        deliveryWindowStart: adjustedDates?.config?.windowStart ? adjustedDates.config.windowStart.slice(0, 5) : '15:00',
                        deliveryWindowEnd: adjustedDates?.config?.windowEnd ? adjustedDates.config.windowEnd.slice(0, 5) : '18:00',
                        paymentUrl: paymentUrl
                    }).catch(err => {
                        console.error('Error al enviar correo automático de Pago Contra Entrega:', err);
                    });
                }

                setCart([]);
                setPaymentMethod(null);
                setDeadline('');
                setDailyWorkload(null);
                setIsProcessing(false);
                return;
            } else if (paymentMethod === 'transbank') {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.elenalacosturera.cl';
                paymentUrl = `${siteUrl}/pagar/${finalOrderIdStr}?amount=${amountToCharge}`;
            } else if (paymentMethod === 'mercadopago_point' || (paymentMethod === 'cash' && splitCardAmount > 0)) {
                try {
                    const mpDesc = posMode === 'pay_balance' ? `Pago Saldo - ${finalOrderIdStr}` : `Orden de Trabajo #${newOrderIdNumber}`;
                    const amountForTerminal = (paymentMethod === 'cash' && splitCardAmount > 0) ? splitCardAmount : amountToCharge;
                    
                    if (amountForTerminal < 100) {
                        alert('El monto a cobrar con tarjeta (Mercado Pago Point) debe ser al menos de $100 CLP.');
                        setIsProcessing(false);
                        return;
                    }
                    
                    const mpRes = await wakeUpMercadoPagoTerminalAction(amountForTerminal, mpDesc, finalOrderIdStr);
                    if (!mpRes.success) {
                        console.error('Error despertando terminal Mercado Pago:', mpRes.error);
                        alert(`Error al enviar el cobro a la maquinita física: ${mpRes.error}`);
                    }
                } catch (mpErr) {
                    console.error('Excepción al despertar terminal MP:', mpErr);
                }
            }
            
            let targetPaidAmount = amountToCharge;
            if (posMode === 'pay_balance' && pendingOrderToPay) {
                targetPaidAmount = Number(pendingOrderToPay.paid_amount || 0) + amountToCharge;
            }
            
            setCheckoutResult({
                orderId: finalOrderIdStr.replace('order_', ''),
                customer: selectedCustomer,
                items: [...cart],
                total: amountToCharge,
                targetPaidAmount,
                method: finalPaymentMethodStr,
                date: dateStr,
                deliveryDate: finalDeliveryDateStr,
                paymentUrl: paymentUrl,
                splitCashAmount: (paymentMethod === 'cash' && splitCardAmount > 0) ? splitCashAmount : undefined,
                splitCardAmount: (paymentMethod === 'cash' && splitCardAmount > 0) ? splitCardAmount : undefined
            });
            
            setPaymentConfirmed(false);
            if (paymentMethod === 'cash' && splitCardAmount === 0) {
                setPaymentConfirmed(true);
            }

            if (selectedCustomer.email && (posMode === 'new_sale' || paymentMethod === 'transbank')) {
                sendOrderConfirmationEmailAction({
                    customerEmail: selectedCustomer.email,
                    customerName: selectedCustomer.full_name,
                    orderId: posMode === 'new_sale' ? newOrderIdNumber : Number(finalOrderIdStr.replace('order_', '')),
                    items: cart.map(item => ({
                        name: item.name,
                        price: item.price,
                        category: item.category,
                        notes: item.notes || '',
                        images: item.images || []
                    })),
                    total: amountToCharge,
                    paymentMethod: finalPaymentMethodStr || '',
                    date: dateStr,
                    deliveryDate: deadline || adjustedDates?.finalDeliveryDate || '',
                    deliveryWindowStart: adjustedDates?.config?.windowStart?.slice(0, 5) || '15:00',
                    deliveryWindowEnd: adjustedDates?.config?.windowEnd?.slice(0, 5) || '18:00',
                    paymentUrl: paymentUrl,
                    splitCashAmount: (paymentMethod === 'cash' && splitCardAmount > 0) ? splitCashAmount : undefined,
                    splitCardAmount: (paymentMethod === 'cash' && splitCardAmount > 0) ? splitCardAmount : undefined,
                    subject: posMode === 'pay_balance' ? 'Link de Pago - Saldo de Orden — ELENA La Costurera' : undefined
                }).catch(err => {
                    console.error('Error al enviar correo automático de confirmación:', err);
                });
            }
            
            // NUEVO: Enviar WhatsApp si el pago es en efectivo/transferencia
            // OJO: SOLO enviar si es 100% efectivo. Si es Mixto (splitCardAmount > 0), no enviar, el Webhook se encarga al confirmar la tarjeta.
            if (paymentMethod === 'cash' && splitCardAmount === 0 && posMode === 'new_sale' && amountToCharge > 0) {
                sendWhatsAppPaymentConfirmationAction(finalOrderIdStr.replace('order_', ''), amountToCharge, finalPaymentMethodStr || 'Efectivo/Transferencia')
                    .catch(err => console.error('Error enviando WhatsApp de confirmacion de efectivo:', err));
            }
            
            setCart([]);
            setPaymentMethod(null);
            setDeadline('');
            setDailyWorkload(null);
            if (posMode === 'pay_balance') {
                getAllPendingOrdersAction().then(res => {
                    if (res.success) setAllPendingOrders(res.orders || []);
                });
            }
        } catch (error: any) {
            console.error('Error during checkout processing:', error);
            alert("Ocurrió un error inesperado al procesar el cobro: " + (error.message || String(error)));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseCheckout = () => {
        setCheckoutResult(null);
        setSelectedCustomer(null);
        setOrderNotes('');
        setOrderImages([]);
        setActiveImageIndex(0);
        setDeadline('');
        setDailyWorkload(null);
        setPosMode('new_sale');
        setPendingOrderToPay(null);
        
        // Refrescar saldos pendientes al cerrar el modal para que no quede la data obsoleta (stale) en el dropdown
        getAllPendingOrdersAction().then(res => {
            if (res.success) {
                setAllPendingOrders(res.orders || []);
            }
        });
    };

    const handleCloseBudgetModal = () => {
        setIsBudgetModalOpen(false);
        setCart([]);
        setSelectedCustomer(null);
        setOrderNotes('');
        setOrderImages([]);
        setActiveImageIndex(0);
        setDeadline('');
        setDailyWorkload(null);
        setPaymentConfirmed(false);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
    };

    const generateBudgetLink = async () => {
        setIsProcessing(true);
        try {
            const orderId = Math.floor(Math.random() * 90000) + 10000;
            const posOrderId = `budget_${orderId}`;

            const budgetData = {
                cart: cart.map(item => ({
                    ...item,
                    images: undefined
                })),
                total: total,
                date: new Date().toISOString(),
                customerId: selectedCustomer ? selectedCustomer.id : null,
                customerName: selectedCustomer ? selectedCustomer.full_name : null,
                customerEmail: selectedCustomer ? selectedCustomer.email : null,
                customerPhone: selectedCustomer ? selectedCustomer.phone : null,
                posOrderId: posOrderId,
                adjustedDates: adjustedDates 
            };
            const result = await saveBudgetAction(budgetData);
            
            if (result.success && result.id) {
                const baseUrl = window.location.origin.includes('localhost') ? 'https://elenalacosturera.cl' : window.location.origin;
                const link = `${baseUrl}/presupuesto?id=${result.id}`;
                setGeneratedLink(link);
                if (selectedCustomer) {
                    setClientPhone(selectedCustomer.phone || '');
                    setClientEmail(selectedCustomer.email || '');
                    
                    if (selectedCustomer.email) {
                        setIsSendingEmail(true);
                        sendBudgetEmailAction({
                            customerEmail: selectedCustomer.email,
                            customerName: selectedCustomer.full_name || 'Estimada Clienta',
                            budgetLink: link,
                            items: cart.map(item => ({
                                name: item.name,
                                price: item.price,
                                category: item.category,
                                notes: item.notes
                            })),
                            total: total
                        }).then(res => {
                            if (!res.success) console.error('Error auto-sending budget email:', res.error);
                        }).catch(err => console.error('Unexpected error auto-sending budget email:', err))
                          .finally(() => setIsSendingEmail(false));
                    }
                    if (selectedCustomer.phone) {
                        const WHATSAPP_API_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN || process.env.WHATSAPP_API_TOKEN;
                        const PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
                        
                        if (WHATSAPP_API_TOKEN && PHONE_NUMBER_ID) {
                            const cleanPhone = selectedCustomer.phone.replace(/\D/g, '');
                            const finalPhone = cleanPhone.startsWith('56') ? cleanPhone : `56${cleanPhone}`;
                            
                            fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    messaging_product: 'whatsapp',
                                    to: finalPhone,
                                    type: 'template',
                                    template: {
                                        name: 'envio_presupuesto',
                                        language: { code: 'es_CL' },
                                        components: [
                                            {
                                                type: 'body',
                                                parameters: [{ type: 'text', text: selectedCustomer.full_name }]
                                            },
                                            {
                                                type: 'button',
                                                sub_type: 'url',
                                                index: '0',
                                                parameters: [{ type: 'text', text: result.id }]
                                            }
                                        ]
                                    }
                                })
                            }).then(res => res.json()).then(data => {
                                if (data.error) console.error('Error auto-sending budget WhatsApp:', data.error);
                            }).catch(err => console.error('Unexpected error WhatsApp:', err));
                        }
                    }
                }
                setIsBudgetModalOpen(true);
            } else {
                alert('Error al generar el link: ' + (result.error || 'Desconocido'));
            }
        } catch (error) {
            console.error('Error in generateBudgetLink:', error);
            alert('Error al conectar con el servidor.');
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const shareViaWhatsApp = () => {
        if (!clientPhone) return;
        const message = encodeURIComponent(`¡Hola! Te envío el presupuesto formal de Elena Atelier para tu proyecto de alta costura. Puedes verlo y aceptarlo aquí: ${generatedLink}`);
        const cleanPhone = clientPhone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    };

    const shareViaEmail = async () => {
        if (!clientEmail) return;
        setIsSendingEmail(true);
        try {
            const res = await sendBudgetEmailAction({
                customerEmail: clientEmail,
                customerName: selectedCustomer?.full_name || 'Estimada Clienta',
                budgetLink: generatedLink,
                items: cart.map(item => ({
                    name: item.name,
                    price: item.price,
                    category: item.category,
                    notes: item.notes
                })),
                total: total
            });
            if (res.success) {
                alert('¡El presupuesto ha sido enviado con éxito a la clienta por correo corporativo! ✨');
            } else {
                alert('Error al enviar el correo: ' + res.error);
            }
        } catch (err: any) {
            alert('Error inesperado: ' + err.message);
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <>
        <div className={`min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans ${isBudgetModalOpen ? 'print:hidden' : ''}`}>
            {/* Product Selection Area */}
            <div className="flex-1 p-4 md:p-8 pt-20 space-y-8 overflow-y-auto">
                <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-serif text-brand-charcoal mb-2">Crear Nueva Orden</h2>
                        <p className="text-gray-500 font-sans text-[10px] uppercase tracking-widest flex items-center gap-2">
                            Punto de Venta · Nueva Venta o Presupuesto
                        </p>
                    </div>
                    {isCajaOpen !== null && (
                        <Link 
                            href="/admin/caja" 
                            className={`px-5 py-2.5 rounded-full shadow-md flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                                isCajaOpen 
                                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                            }`}
                        >
                            <span className={`w-2.5 h-2.5 rounded-full ${isCajaOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            {isCajaOpen ? 'Caja Diaria Abierta' : 'Caja Diaria Cerrada'}
                        </Link>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="font-serif text-3xl text-brand-charcoal flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-brand-terracotta" />
                        Ingreso de Orden de Trabajo
                    </h1>
                    <button
                        onClick={async () => {
                            if (orderImages.length > 0) {
                                setIsAnalyzing(true);
                                try {
                                    const res = await analyzeDesignWithGeminiAction(orderImages[0].url);
                                    if (res.success && res.data) {
                                        setAiAnalysisResult(res.data);
                                        setHcPrendaName(customOrderName || 'Diseño Personalizado');
                                    } else {
                                        alert('Error analizando diseño: ' + (res.error || 'Intente nuevamente'));
                                    }
                                } catch (err: any) {
                                    alert('Error en el análisis: ' + err.message);
                                } finally {
                                    setIsAnalyzing(false);
                                    setIsHauteCoutureModalOpen(true);
                                }
                            } else {
                                setHcPrendaName(customOrderName || '');
                                setIsHauteCoutureModalOpen(true);
                            }
                        }}
                        disabled={isAnalyzing}
                        className="px-5 py-2.5 bg-brand-charcoal text-white hover:bg-brand-terracotta text-[10px] uppercase tracking-widest font-bold rounded-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Analizando...</>
                        ) : (
                            <span>✨ Calculadora Alta Costura</span>
                        )}
                    </button>
                </div>

                {/* Unified Search Bar implemented below inside the main customer area */}

                {/* Section 1: Client (Always show for searching either client or pending order) */}
                <div className="bg-white p-6 md:p-8 rounded-sm border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand-terracotta border-b border-gray-100 pb-2 flex items-center gap-2 mb-6">
                        <User className="w-4 h-4" /> 1. Identificación de Cliente
                    </h3>
                    
                    {selectedCustomer ? (
                        <div className="flex justify-between items-center bg-brand-sand/10 p-4 rounded-sm border border-brand-sand/30">
                            <div>
                                <p className="font-serif text-lg text-brand-charcoal">{selectedCustomer.full_name}</p>
                                <p className="text-xs text-gray-500">{selectedCustomer.phone || selectedCustomer.email}</p>
                            </div>
                            <button onClick={() => {
                                setSelectedCustomer(null);
                                setPosMode('new_sale');
                                setPendingOrderToPay(null);
                                if (posMode === 'pay_balance') setCart([]);
                            }} className="text-xs uppercase tracking-widest text-gray-400 hover:text-red-500 font-bold">Cambiar Cliente / Limpiar</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Search and New Button Bar */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nombre, rut o correo..." 
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta text-sm"
                                    />
                                    
                                    {/* Search Results Dropdown */}
                                    {clientSearch && (
                                        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-100 shadow-xl rounded-sm max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                            {/* 1. Pendientes Prioritarios */}
                                            {filteredPendingOrders.length > 0 && (
                                                <div className="bg-brand-terracotta/5">
                                                    <div className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-brand-terracotta border-b border-brand-terracotta/10">Saldos Pendientes</div>
                                                    {filteredPendingOrders.map((order, i) => {
                                                        const total = order.sales_ledger?.total_amount || 0;
                                                        const paid = order.paid_amount || 0;
                                                        const pendingAmount = total - paid;
                                                        return (
                                                            <div 
                                                                key={`pending-${i}`} 
                                                                onClick={() => {
                                                                    setPosMode('pay_balance');
                                                                    setPendingOrderToPay(order);
                                                                    setClientSearch('');
                                                                    setCart([{
                                                                        name: `Pago Saldo Orden ${order.pos_order_id}`,
                                                                        price: pendingAmount,
                                                                        category: 'pago_saldo',
                                                                        notes: `Saldo pendiente de orden total $${total}`
                                                                    }]);
                                                                    setSelectedCustomer({
                                                                        id: order.customer_id,
                                                                        full_name: order.customers?.full_name,
                                                                        email: order.customers?.email,
                                                                        phone: order.customers?.phone
                                                                    });
                                                                    setInitialPaymentType('total'); // Force full payment
                                                                }}
                                                                className="p-4 hover:bg-brand-terracotta/10 cursor-pointer border-b border-brand-terracotta/10 last:border-0 flex justify-between items-center group transition-colors"
                                                            >
                                                                <div>
                                                                    <p className="font-bold text-sm text-brand-charcoal">{order.customers?.full_name}</p>
                                                                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
                                                                        PAGAR SALDO ORDEN #{order.pos_order_id}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right flex items-center gap-4">
                                                                    <div>
                                                                        <p className="text-[9px] text-brand-terracotta uppercase tracking-widest font-bold mb-0.5">Por Pagar</p>
                                                                        <p className="text-sm font-bold text-brand-terracotta">${pendingAmount.toLocaleString('es-CL')}</p>
                                                                    </div>
                                                                    <ArrowRight className="w-4 h-4 text-brand-terracotta opacity-50 group-hover:opacity-100 transition-opacity" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* 2. Clientes Regulares */}
                                            <div className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">Clientes Registrados (Nueva Venta)</div>
                                            {allCustomers.filter(c => c.full_name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))).map(c => (
                                                <div key={c.id} onClick={() => { 
                                                    setSelectedCustomer(c); 
                                                    setClientSearch(''); 
                                                    setPosMode('new_sale');
                                                    setPendingOrderToPay(null);
                                                }} className="p-4 hover:bg-brand-sand/10 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center group">
                                                    <div>
                                                        <p className="text-sm font-medium text-brand-charcoal">{c.full_name}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{c.email} | {c.phone}</p>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-terracotta transition-all" />
                                                </div>
                                            ))}
                                            {allCustomers.filter(c => c.full_name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))).length === 0 && (
                                                <div className="p-6 text-center">
                                                    <p className="text-xs text-gray-500 italic mb-2">No se encontró cliente con "{clientSearch}"</p>
                                                    <button onClick={() => { setIsRegisteringClient(true); setClientSearch(''); }} className="text-[10px] uppercase tracking-widest font-bold text-brand-terracotta hover:underline">+ Crear ficha de cliente nuevo</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsRegisteringClient(!isRegisteringClient);
                                        setNewClientData({ name: '', phone: '', email: '' });
                                    }}
                                    className={`px-6 py-3 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 justify-center border ${isRegisteringClient ? 'bg-white border-red-200 text-red-500' : 'bg-brand-charcoal text-white border-brand-charcoal hover:bg-brand-terracotta'}`}
                                >
                                    {isRegisteringClient ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                                    {isRegisteringClient ? 'Cancelar' : 'Nuevo Cliente'}
                                </button>
                            </div>

                            {/* Search Results Dropdown Moved up into relative wrapper */}

                            {/* Quick Registration Form (Expandable) */}
                            {isRegisteringClient && (
                                <div className="bg-white p-8 rounded-sm border border-gray-100 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm relative">
                                    <button 
                                        onClick={() => setIsRegisteringClient(false)}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <div className="text-center space-y-1">
                                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta">Nueva Ficha de Cliente</h4>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Ingrese los datos para registro oficial en CRM</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block px-1">Nombre Completo</label>
                                            <input 
                                                type="text" 
                                                placeholder="Nombre y Apellido" 
                                                value={newClientData.name} 
                                                onChange={e => {
                                                    const formatted = e.target.value.replace(/\b\w/g, c => c.toUpperCase());
                                                    setNewClientData({...newClientData, name: formatted});
                                                }} 
                                                className={`w-full p-3 text-sm border rounded-sm outline-none transition-all ${
                                                    newClientData.name 
                                                        ? newClientData.name.trim().split(/\s+/).length < 2 
                                                            ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                                            : 'border-green-500/30 bg-green-50/30 focus:border-green-500' 
                                                        : 'bg-gray-50 border-gray-200 focus:border-brand-terracotta focus:bg-white'
                                                }`} 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block px-1">WhatsApp</label>
                                            <div className={`flex border rounded-sm overflow-hidden transition-all ${
                                                newClientData.phone 
                                                    ? (newClientData.phone.length < 8 || newClientData.phone.length > 12) 
                                                        ? 'border-red-300 bg-red-50 focus-within:border-red-500' 
                                                        : 'border-green-500/30 bg-green-50/30 focus-within:border-green-500' 
                                                    : 'bg-gray-50 border-gray-200 focus-within:border-brand-terracotta'
                                            }`}>
                                                <select className="bg-transparent border-r border-gray-200 p-2 text-[10px] uppercase font-bold outline-none cursor-pointer text-gray-600">
                                                    <option value="56">🇨🇱 +56</option>
                                                    <option value="54">🇦🇷 +54</option>
                                                    <option value="55">🇧🇷 +55</option>
                                                    <option value="51">🇵🇪 +51</option>
                                                    <option value="1">🇺🇸 +1</option>
                                                </select>
                                                <input 
                                                    type="tel" 
                                                    placeholder="9 1234 5678" 
                                                    value={newClientData.phone} 
                                                    onChange={e => {
                                                        const raw = e.target.value.replace(/\D/g, "");
                                                        setNewClientData({...newClientData, phone: raw});
                                                    }} 
                                                    className="flex-1 p-3 text-sm bg-transparent outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block px-1">Email</label>
                                            <input 
                                                type="email" 
                                                placeholder="ejemplo@correo.com" 
                                                value={newClientData.email} 
                                                onChange={e => setNewClientData({...newClientData, email: e.target.value})} 
                                                className={`w-full p-3 text-sm border rounded-sm outline-none transition-all ${
                                                    newClientData.email 
                                                        ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientData.email) 
                                                            ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                                            : 'border-green-500/30 bg-green-50/30 focus:border-green-500' 
                                                        : 'bg-gray-50 border-gray-200 focus:border-brand-terracotta focus:bg-white'
                                                }`} 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-center pt-4">
                                        <button 
                                            onClick={handleQuickRegister} 
                                            disabled={
                                                !newClientData.name || 
                                                newClientData.name.trim().split(/\s+/).length < 2 || 
                                                newClientData.phone.length < 8 ||
                                                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientData.email)
                                            } 
                                            className="w-full md:w-[400px] py-4 bg-brand-charcoal text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-terracotta transition-all disabled:opacity-20 disabled:bg-gray-400 rounded-sm shadow-md active:scale-95 text-center"
                                        >
                                            Registrar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* Sections 2, 3, 4 only visible for new sales */}
                {posMode === 'new_sale' && (
                    <>
                        {/* Section 2: Asignar Costurera */}
                        <div className={`bg-white p-6 md:p-8 rounded-sm border border-gray-100 shadow-sm space-y-6 transition-all ${!selectedCustomer ? 'opacity-50 pointer-events-none' : ''}`}>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-terracotta border-b border-gray-100 pb-2 flex items-center gap-2 mb-6">
                                <Tag className="w-4 h-4" /> 2. Asignar Costurera
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] uppercase tracking-widest text-brand-charcoal font-bold mb-1 flex items-center gap-1.5">
                                        👤 Costurera / Operaria Asignada
                                    </label>
                                    <p className="text-[10px] text-gray-500 leading-normal mb-2">Selecciona la costurera para calcular la agenda y tiempos de entrega automáticamente.</p>
                                    <select
                                        value={assignedOperatorId}
                                        onChange={(e) => handleOperatorSelection(e.target.value, null, selectedCatalogProduct ? Number(selectedCatalogProduct.estimated_hours || 2) : (Number(hoursEstimated) || 2))}
                                        className="w-full p-3 text-sm font-medium bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta transition-colors"
                                    >
                                        <option value="" disabled>-- Selecciona Costurera o Taller General --</option>
                                        {operators.map((op: any) => (
                                            <option key={op.id} value={op.id}>
                                                {op.name} ({op.daily_hours_capacity}h por día)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Detalle del Trabajo */}
                        <div className="bg-white p-6 md:p-8 rounded-sm border border-gray-100 shadow-sm space-y-6 transition-all">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-terracotta border-b border-gray-100 pb-2 flex items-center gap-2 mb-6">
                                <Tag className="w-4 h-4" /> 3. Detalle del Trabajo
                            </h3>
                            
                            <div className={`grid grid-cols-1 ${customOrderCategory !== 'Catálogo de servicios' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                                <div className="col-span-1">
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Categoría Principal</label>
                                    <select value={customOrderCategory} onChange={(e) => setCustomOrderCategory(e.target.value)} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta">
                                        <option value="Diseño y confección">Diseño y confección</option>
                                        <option value="Arreglos especializados">Arreglos especializados</option>
                                        <option value="Catálogo de servicios">Catálogo de servicios</option>
                                    </select>
                                </div>
                                {customOrderCategory !== 'Catálogo de servicios' && (
                                    <>
                                        <div className="col-span-1">
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Prenda / Artículo *</label>
                                            <input spellCheck={true} autoCorrect="on" type="text" value={customOrderName} onChange={(e) => setCustomOrderName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))} placeholder="Ej. Pantalón, vestido de novia, chaqueta, etc." className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Horas Taller Estimadas</label>
                                            <input type="number" min="0" value={hoursEstimated || ''} onChange={(e) => setHoursEstimated(Number(e.target.value))} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta" placeholder="0" />
                                        </div>


                                    </>
                                )}
                            </div>

                            {customOrderCategory === 'Catálogo de servicios' ? (
                                <div className="space-y-6 pt-4 border-t border-gray-50 animate-in fade-in duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Tipo de Prenda / Subcategoría</label>
                                            <select 
                                                value={selectedCatalogCategory} 
                                                onChange={(e) => {
                                                    setSelectedCatalogCategory(e.target.value);
                                                    setSelectedCatalogProduct(null);
                                                }} 
                                                className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta cursor-pointer font-medium transition-all"
                                            >
                                                <option value="">-- Seleccionar Subcategoría --</option>
                                                {Array.from(new Set(products.map(p => p.category))).sort().map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Servicio / Operación</label>
                                            <select 
                                                disabled={!selectedCatalogCategory}
                                                value={selectedCatalogProduct ? selectedCatalogProduct.id : ''} 
                                                onChange={(e) => {
                                                    const prodId = e.target.value;
                                                    const found = products.find(p => p.id.toString() === prodId.toString() || p.id === Number(prodId));
                                                    setSelectedCatalogProduct(found || null);
                                                }} 
                                                className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium transition-all"
                                            >
                                                <option value="">
                                                    {!selectedCatalogCategory 
                                                        ? 'Primero seleccione una subcategoría...' 
                                                        : '-- Seleccionar Servicio --'}
                                                </option>
                                                {products
                                                    .filter(p => p.category === selectedCatalogCategory)
                                                    .sort((a, b) => a.name.localeCompare(b.name))
                                                    .map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} ({formatCurrency(p.price)})
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>



                                    {/* Beautiful visual feedback box when a service is selected */}
                                    {selectedCatalogProduct && (
                                        <div className="bg-brand-sand/5 p-6 rounded-sm border border-brand-sand/30 animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6 mt-6">
                                            {/* Item-specific Notes and Image inside Catalog view */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Descripción del Arreglo / Notas Especiales</label>
                                                    <textarea 
                                                        spellCheck={true} autoCorrect="on"
                                                        value={orderNotes}
                                                        onChange={(e) => setOrderNotes(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                                                        placeholder="Ej. Ajuste de hombros vestido seda, arreglar dobladillo, etc."
                                                        className="w-full h-[120px] p-3 text-xs bg-white border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta resize-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Fotos de Referencia (Hasta 4)</label>
                                                    {orderImages.length > 0 ? (
                                                        <div className="space-y-2 h-[120px] flex flex-col justify-between">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {orderImages.map((img, idx) => (
                                                                    <div 
                                                                        key={idx}
                                                                        onClick={() => setActiveImageIndex(idx)}
                                                                        className={`relative w-[50px] h-[50px] border rounded-sm overflow-hidden flex items-center justify-center cursor-pointer bg-white transition-all ${
                                                                            idx === activeImageIndex 
                                                                                ? 'border-brand-terracotta ring-1 ring-brand-terracotta' 
                                                                                : 'border-gray-200 hover:border-gray-300'
                                                                        }`}
                                                                    >
                                                                        <img src={img.url} alt={`Prenda ${idx + 1}`} className="w-full h-full object-contain" />
                                                                        <button 
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const filtered = orderImages.filter((_, i) => i !== idx);
                                                                                setOrderImages(filtered);
                                                                                setActiveImageIndex(Math.max(0, filtered.length - 1));
                                                                            }}
                                                                            className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full shadow hover:bg-red-600 transition-colors z-20"
                                                                        >
                                                                            <X className="w-2.5 h-2.5" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                
                                                                {orderImages.length < 4 && (
                                                                    <div className="border border-dashed border-gray-300 hover:border-brand-terracotta rounded-sm w-[50px] h-[50px] bg-white transition-colors flex flex-col items-center justify-center cursor-pointer relative group">
                                                                        <input 
                                                                            type="file" 
                                                                            accept="image/*"
                                                                            onChange={async (e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    const compressedUrl = await compressImage(file);
                                                                                    const newImages = [...orderImages, { url: compressedUrl, notes: '' }];
                                                                                    setOrderImages(newImages);
                                                                                    setActiveImageIndex(newImages.length - 1);
                                                                                }
                                                                            }}
                                                                            className="absolute inset-0 cursor-pointer w-full h-full z-10"
                                                                            style={{ opacity: 0 }}
                                                                        />
                                                                        <Camera className="w-4 h-4 text-gray-400 group-hover:text-brand-terracotta transition-colors" />
                                                                        <span className="text-[7px] uppercase font-bold text-gray-400 mt-0.5">+ Foto</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {orderImages[activeImageIndex] && (
                                                                <input 
                                                                    type="text"
                                                                    value={orderImages[activeImageIndex].notes}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setOrderImages(prev => prev.map((img, i) => i === activeImageIndex ? { ...img, notes: val } : img));
                                                                    }}
                                                                    placeholder={`Indicaciones para foto ${activeImageIndex + 1}...`}
                                                                    className="w-full p-2 text-xs bg-white border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta transition-all"
                                                                />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="border border-dashed border-gray-200 rounded-sm h-[120px] bg-white hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer relative group">
                                                            <input 
                                                                type="file" 
                                                                accept="image/*"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        const compressedUrl = await compressImage(file);
                                                                        setOrderImages([{ url: compressedUrl, notes: '' }]);
                                                                        setActiveImageIndex(0);
                                                                    }
                                                                }}
                                                                className="absolute inset-0 cursor-pointer w-full h-full z-10"
                                                                style={{ opacity: 0 }}
                                                            />
                                                            <Camera className="w-5 h-5 text-gray-400 group-hover:text-brand-terracotta transition-colors mb-1" />
                                                            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400 group-hover:text-brand-charcoal transition-colors">Adjuntar Fotos</span>
                                                            <span className="text-[8px] text-gray-400 mt-0.5">Soporta múltiples imágenes (Máx 4)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Section 4: Detalle Precio Orden (Catálogo) */}
                                            <div className={`transition-all mt-6 ${(!selectedCustomer || assignedOperatorId === '' || !selectedCatalogProduct) ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-terracotta pb-2 flex items-center gap-2 mb-2 ml-1">
                                                    <Tag className="w-4 h-4" /> 4. Detalle de Precio Orden
                                                </h3>
                                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-charcoal text-white p-6 rounded-sm shadow-lg">
                                                    <div className="text-center sm:text-left">
                                                    <span className="bg-brand-terracotta text-white px-2 py-0.5 rounded-[2px] text-[8px] uppercase tracking-widest font-bold mb-1.5 inline-block">
                                                        {selectedCatalogProduct.category}
                                                    </span>
                                                    <h4 className="font-serif text-lg text-brand-sand">{selectedCatalogProduct.name}</h4>
                                                    <p className="text-2xl font-serif text-white mt-0.5">{formatCurrency(selectedCatalogProduct.price)}</p>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        addToCart({
                                                            ...selectedCatalogProduct,
                                                            notes: orderNotes,
                                                            images: orderImages,
                                                            assignedOperatorId: assignedOperatorId
                                                        });
                                                        setSelectedCatalogProduct(null);
                                                        setSelectedCatalogCategory('');
                                                        setOrderNotes('');
                                                        setOrderImages([]);
                                                        setActiveImageIndex(0);
                                                        setAssignedOperatorId('');
                                                    }}
                                                    className="w-full sm:w-auto bg-brand-terracotta text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-white hover:text-brand-terracotta transition-all shadow-md active:scale-95 text-center"
                                                >
                                                    Añadir a la Orden
                                                </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6 pt-4 border-t border-gray-50 animate-in fade-in duration-500">
                                    {/* Calculator CTA removed as requested, using top right button instead */}
                                    {/* Notes and Photo attachment for Custom Order */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Descripción del Arreglo / Notas Especiales</label>
                                            <textarea 
                                                spellCheck={true} autoCorrect="on"
                                                value={orderNotes}
                                                onChange={(e) => setOrderNotes(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                                                placeholder="Ej. Ajuste de hombros vestido seda, arreglar dobladillo, etc."
                                                className="w-full h-[120px] p-3 text-xs bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta resize-none transition-all focus:bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Foto de Referencia (Prenda - Hasta 4)</label>
                                            {orderImages.length > 0 ? (
                                                <div className="space-y-2 h-[120px] flex flex-col justify-between">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {orderImages.map((img, idx) => (
                                                            <div 
                                                                key={idx}
                                                                onClick={() => setActiveImageIndex(idx)}
                                                                className={`relative w-[50px] h-[50px] border rounded-sm overflow-hidden flex items-center justify-center cursor-pointer bg-white transition-all ${
                                                                    idx === activeImageIndex 
                                                                        ? 'border-brand-terracotta ring-1 ring-brand-terracotta' 
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                            >
                                                                <img src={img.url} alt={`Prenda Custom ${idx + 1}`} className="w-full h-full object-contain" />
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const filtered = orderImages.filter((_, i) => i !== idx);
                                                                        setOrderImages(filtered);
                                                                        setActiveImageIndex(Math.max(0, filtered.length - 1));
                                                                    }}
                                                                    className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full shadow hover:bg-red-600 transition-colors z-20"
                                                                >
                                                                    <X className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        
                                                        {orderImages.length < 4 && (
                                                            <div className="border border-dashed border-gray-300 hover:border-brand-terracotta rounded-sm w-[50px] h-[50px] bg-white transition-colors flex flex-col items-center justify-center cursor-pointer relative group">
                                                                <input 
                                                                    type="file" 
                                                                    accept="image/*"
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            const compressedUrl = await compressImage(file);
                                                                            const newImages = [...orderImages, { url: compressedUrl, notes: '' }];
                                                                            setOrderImages(newImages);
                                                                            setActiveImageIndex(newImages.length - 1);
                                                                        }
                                                                    }}
                                                                    className="absolute inset-0 cursor-pointer w-full h-full z-10"
                                                                    style={{ opacity: 0 }}
                                                                />
                                                                <Camera className="w-4 h-4 text-gray-400 group-hover:text-brand-terracotta transition-colors" />
                                                                <span className="text-[7px] uppercase font-bold text-gray-400 mt-0.5">+ Foto</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {orderImages[activeImageIndex] && (
                                                        <input 
                                                            type="text"
                                                            value={orderImages[activeImageIndex].notes}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setOrderImages(prev => prev.map((img, i) => i === activeImageIndex ? { ...img, notes: val } : img));
                                                            }}
                                                            placeholder={`Indicaciones para foto ${activeImageIndex + 1}...`}
                                                            className="w-full p-2 text-xs bg-white border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta transition-all"
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="border border-dashed border-gray-200 rounded-sm h-[120px] bg-white hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer relative group">
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const compressedUrl = await compressImage(file);
                                                                setOrderImages([{ url: compressedUrl, notes: '' }]);
                                                                setActiveImageIndex(0);
                                                            }
                                                        }}
                                                        className="absolute inset-0 cursor-pointer w-full h-full z-10"
                                                        style={{ opacity: 0 }}
                                                    />
                                                    <Camera className="w-5 h-5 text-gray-400 group-hover:text-brand-terracotta transition-colors mb-1" />
                                                    <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400 group-hover:text-brand-charcoal transition-colors">Adjuntar Fotos</span>
                                                    <span className="text-[8px] text-gray-400 mt-0.5">Soporta múltiples imágenes (Máx 4)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                        {/* Section 4: Detalle Precio Orden (A Medida) */}
                        <div className={`transition-all mt-6 ${(!selectedCustomer || assignedOperatorId === '' || !customOrderName.trim()) ? 'opacity-50 pointer-events-none' : ''}`}>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-terracotta pb-2 flex items-center gap-2 mb-2 ml-1">
                                <Tag className="w-4 h-4" /> 4. Detalle de Precio Orden
                            </h3>
                            <div className="flex flex-col md:flex-row justify-between items-center bg-brand-charcoal text-white p-6 rounded-sm shadow-lg gap-6">
                                        <div className="text-center md:text-left">
                                            <p className="text-[10px] uppercase tracking-widest text-brand-sand font-bold mb-1">Precio Sugerido (Con Margen {marginPercentage}%)</p>
                                            <p className="text-3xl font-serif text-white">{formatCurrency(calculatedPrice)}</p>
                                        </div>
                                        <div className="flex flex-col items-center md:items-start gap-2">
                                            <label className="text-[10px] uppercase tracking-widest text-brand-sand font-bold">Precio Cobrado Real (CLP)</label>
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                                                    <input 
                                                        type="text" 
                                                        value={customPrice} 
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            setCustomPrice(val ? new Intl.NumberFormat('es-CL').format(Number(val)) : '');
                                                        }} 
                                                        placeholder={new Intl.NumberFormat('es-CL').format(Math.round(calculatedPrice))} 
                                                        className="pl-7 pr-3 py-2.5 w-36 bg-white/10 border border-white/20 rounded-sm text-white text-sm font-bold outline-none focus:border-brand-sand focus:bg-white/15 transition-all"
                                                    />
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => setCustomPrice(new Intl.NumberFormat('es-CL').format(Math.round(calculatedPrice)))}
                                                    className="px-3.5 py-2.5 bg-white/5 border border-white/20 hover:border-brand-sand rounded-sm text-[9px] uppercase tracking-widest font-bold text-white transition-all active:scale-95 cursor-pointer"
                                                    title="Copiar precio sugerido"
                                                >
                                                    Copiar Sugerido
                                                </button>
                                            </div>
                                            {/* Mostrar porcentaje de descuento */}
                                            {(() => {
                                                const finalPrice = customPrice ? Number(customPrice.replace(/\D/g, '')) : calculatedPrice;
                                                if (finalPrice > 0 && finalPrice < calculatedPrice) {
                                                    const discountPct = Math.round(((calculatedPrice - finalPrice) / calculatedPrice) * 100);
                                                    if (discountPct > 0) {
                                                        return (
                                                            <span className="text-[9px] bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-1 rounded-sm font-bold uppercase tracking-widest animate-pulse">
                                                                Descuento Realizado: {discountPct}%
                                                            </span>
                                                        );
                                                    }
                                                }
                                                return null;
                                            })()}
                                        </div>

                                        <button 
                                            onClick={(e) => handleAddCustomOrder(e)}
                                            disabled={!customOrderName || !hoursEstimated || !customPrice}
                                            className="w-full md:w-auto bg-brand-terracotta text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-white hover:text-brand-terracotta transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md">
                                            Añadir a la Orden
                                        </button>
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Cart Summary & Checkout */}
            <div className="w-full lg:w-[450px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-6 md:p-8 pt-8 md:pt-24 shadow-2xl flex flex-col h-[500px] lg:h-auto">
                <div className="flex items-center gap-3 mb-8">
                    <ShoppingCart className="w-6 h-6 text-brand-charcoal" />
                    <h2 className="font-serif text-2xl">Pedido Actual</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {cart.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 italic text-sm text-center">
                            Seleccione productos para comenzar el cobro en Tabancura.
                        </div>
                    ) : (
                        cart.map((item: any, i) => (
                            <div key={i} className="flex justify-between items-start p-4 bg-gray-50 rounded-sm group relative gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2">
                                        <p className="text-sm font-medium text-brand-charcoal">{item.name}</p>
                                        {item.costBreakdown && (
                                            <span className="bg-brand-charcoal text-white px-1.5 py-0.5 rounded-[2px] text-[8px] uppercase tracking-widest font-bold">ERP Costeado</span>
                                        )}
                                        {item.discountPercentage > 0 && (
                                            <span className="bg-green-600 text-white px-1.5 py-0.5 rounded-[2px] text-[8px] uppercase tracking-widest font-bold font-sans">-{item.discountPercentage}% Desc.</span>
                                        )}
                                        {item.images && item.images.length > 0 && (
                                            <span className="bg-brand-terracotta text-white px-1.5 py-0.5 rounded-[2px] text-[8px] uppercase tracking-widest font-bold">{item.images.length} {item.images.length === 1 ? 'Foto' : 'Fotos'}</span>
                                        )}
                                    </div>
                                    <p className="text-xs font-serif text-brand-terracotta mt-1">{formatCurrency(item.price)}</p>
                                    
                                    {/* Display item notes in cart */}
                                    {item.notes && (
                                        <p className="text-[11px] text-gray-500 italic mt-1.5 bg-white p-2 rounded-sm border border-gray-100/50 leading-normal">
                                            "{item.notes}"
                                        </p>
                                    )}
                                    
                                    {/* Selector de Costurera Asignada */}
                                    <div className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider w-16">👤 Asignar:</span>
                                            <select
                                                value={item.assignedOperatorId || 'unassigned'}
                                                onChange={(e) => handleOperatorSelection(e.target.value, i, Number(item.estimatedHours || 2))}
                                                className="flex-1 text-[10px] uppercase font-semibold text-brand-charcoal bg-white border border-gray-200 outline-none p-2 rounded-sm focus:border-brand-sand cursor-pointer"
                                            >
                                                <option value="unassigned">Sin asignar (Taller)</option>
                                                {operators.map((op: any) => (
                                                    <option key={op.id} value={op.id}>
                                                        {op.name} ({op.daily_hours_capacity}h/d)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {(() => {
                                            const groupKey = `${item.assignedOperatorId || 'unassigned'}_${item.scheduledStartDate || ''}`;
                                            const estimate = allEstimates[groupKey];
                                            const isOverloaded = estimate && estimate.operatorWorkloadPercentage > 100;
                                            return (
                                                <>
                                                    {isOverloaded && (
                                                        <div className="text-[9px] bg-red-50 border border-red-200 text-red-700 p-2 rounded-sm flex items-start gap-2">
                                                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                            <div>
                                                                <strong className="block mb-0.5">{estimate.operatorName} tiene sobrecarga de {estimate.operatorWorkloadDays} días ({estimate.operatorWorkloadPercentage}%).</strong>
                                                                Sugerimos elegir otra costurera o agendar fecha de inicio.
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {item.assignedOperatorId && item.assignedOperatorId !== 'unassigned' && (
                                                        <div className="flex items-center gap-2 bg-gray-50/50 p-2 rounded-sm border border-gray-100">
                                                            <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider w-16">📅 Agenda:</span>
                                                            <input 
                                                                type="date"
                                                                value={item.scheduledStartDate || ''}
                                                                onChange={(e) => {
                                                                    const newCart = [...cart];
                                                                    newCart[i] = { ...newCart[i], scheduledStartDate: e.target.value };
                                                                    setCart(newCart);
                                                                }}
                                                                className="flex-1 text-xs p-1.5 bg-white border border-gray-200 text-brand-charcoal rounded-sm focus:border-brand-sand outline-none"
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                    
                                    {/* Display individual image notes in cart */}
                                    {item.images && item.images.map((img: any, idx: number) => img.notes && (
                                        <p key={idx} className="text-[10px] text-brand-terracotta mt-1 leading-normal flex items-start gap-1">
                                            <span className="font-bold uppercase text-[7px] bg-brand-terracotta/10 px-1 py-0.5 rounded-[2px] shrink-0 mt-0.5">Indicación Foto {idx + 1}:</span>
                                            <span className="italic">"{img.notes}"</span>
                                        </p>
                                    ))}
                                </div>
                                
                                <div className="flex flex-col gap-1 items-end shrink-0">
                                    <div className="flex gap-1 flex-wrap justify-end max-w-[120px]">
                                        {item.images && item.images.map((img: any, idx: number) => (
                                            <div key={idx} className="w-8 h-8 border border-gray-200 rounded-sm overflow-hidden bg-white flex items-center justify-center shadow-sm">
                                                <img src={img.url} alt={`Prenda ${idx + 1}`} className="h-full w-full object-contain" />
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => removeFromCart(i)} className="text-gray-300 hover:text-red-500 transition-colors p-1 mt-1">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 border-t border-gray-100 pt-8 space-y-4">
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>Subtotal</span>
                        <span>${Math.round(total / 1.19).toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>IVA (19%)</span>
                        <span>${Math.round(total - (total / 1.19)).toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-serif pt-4">
                        <span>Total</span>
                        <span>${total.toLocaleString('es-CL')}</span>
                    </div>

                    {/* Time Blocking & Delivery Date Selector */}
                    {posMode === 'new_sale' && (
                    <div className="border-t border-gray-100 pt-6 mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Fecha de Entrega</h4>
                            <div className="flex items-center gap-4">
                                <label className="inline-flex items-center cursor-pointer text-[9px] font-bold uppercase tracking-wider text-gray-500 gap-1.5 select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={adminOverride} 
                                        onChange={(e) => {
                                            setAdminOverride(e.target.checked);
                                            if (!e.target.checked && estimatedDates) {
                                                setDeadline(estimatedDates.finalDeliveryDate);
                                            }
                                        }}
                                        className="rounded border-gray-300 text-brand-terracotta focus:ring-brand-terracotta w-3.5 h-3.5 cursor-pointer"
                                    />
                                    Anulación (Admin)
                                </label>
                                {deadline
                                    ? <span className="text-[9px] text-green-600 font-bold uppercase tracking-wide">✓ Confirmada</span>
                                    : <span className="text-[9px] text-red-400 font-bold uppercase tracking-wide animate-pulse">● Obligatorio</span>
                                }
                            </div>
                        </div>
 
                        {/* Trigger display card */}
                        <div ref={datePickerRef} className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    if (adminOverride) {
                                        openPicker();
                                    } else {
                                        alert("La fecha de entrega se calcula automáticamente según el Backlog actual del taller. Para forzar una fecha manual diferente, activa la casilla de 'Anulación (Admin)'.");
                                    }
                                }}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                                    deadline
                                        ? 'border-brand-terracotta bg-gradient-to-r from-brand-terracotta/5 to-transparent'
                                        : 'border-dashed border-gray-300 hover:border-brand-terracotta/50 bg-gray-50'
                                }`}
                            >
                                {deadline ? (() => {
                                    const fmt = formatDeadlineDisplay()!;
                                    return (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-brand-terracotta flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-lg">📅</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Entrega programada</p>
                                                <p className="text-sm font-bold text-brand-charcoal capitalize">{fmt.day}</p>
                                                <p className="text-xs font-semibold text-brand-terracotta">⏰ {fmt.time} hrs</p>
                                            </div>
                                            <span className="ml-auto text-[10px] text-gray-400 uppercase tracking-wide">Editar →</span>
                                        </div>
                                    );
                                })() : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl">📅</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Fecha y hora de entrega</p>
                                            <p className="text-sm text-gray-400 italic">Toca para seleccionar...</p>
                                        </div>
                                        <span className="ml-auto text-[10px] text-brand-terracotta uppercase tracking-wide font-bold">Requerido →</span>
                                    </div>
                                )}
                            </button>

                            {/* ── PICKER PANEL ── */}
                            {showDatePicker && (
                                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50" style={{minWidth:'300px'}}>

                                    {/* ── STEP 1: CALENDAR ── */}
                                    {pickerStep === 'date' && (
                                        <div>
                                            {/* Header */}
                                            <div className="bg-brand-charcoal px-4 py-3 flex items-center justify-between">
                                                <button type="button" onClick={() => { const d = new Date(calendarYear, calendarMonth - 1); setCalendarMonth(d.getMonth()); setCalendarYear(d.getFullYear()); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all">‹</button>
                                                <span className="text-white text-sm font-bold uppercase tracking-widest">{MONTHS[calendarMonth]} {calendarYear}</span>
                                                <button type="button" onClick={() => { const d = new Date(calendarYear, calendarMonth + 1); setCalendarMonth(d.getMonth()); setCalendarYear(d.getFullYear()); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all">›</button>
                                            </div>
                                            {/* Day headers */}
                                            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                                                {DAY_NAMES.map(d => <div key={d} className="text-center py-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">{d}</div>)}
                                            </div>
                                            {/* Days grid */}
                                            <div className="grid grid-cols-7 p-2 gap-1">
                                                {Array.from({ length: getFirstDay(calendarMonth, calendarYear) }).map((_, i) => <div key={`e${i}`} />)}
                                                {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }, (_, i) => i + 1).map(day => {
                                                    const dateStr = `${calendarYear}-${String(calendarMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                                                    const dayDate = new Date(dateStr + 'T12:00'); dayDate.setHours(0,0,0,0);
                                                    const isPast = isDateTimePast(dateStr, String(endH).padStart(2, '0'), String(endM).padStart(2, '0'));
                                                    const isSelected = tempDate === dateStr;
                                                    const isToday = dayDate.getTime() === today.getTime();
                                                    return (
                                                        <button
                                                            key={day}
                                                            type="button"
                                                            disabled={isPast}
                                                            onClick={() => selectDay(day)}
                                                            className={`relative w-full aspect-square flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                                                                isPast ? 'text-gray-200 cursor-not-allowed' :
                                                                isSelected ? 'bg-brand-terracotta text-white shadow-md scale-110' :
                                                                isToday ? 'border-2 border-brand-terracotta text-brand-terracotta hover:bg-brand-terracotta/10' :
                                                                'hover:bg-brand-terracotta/10 text-gray-700'
                                                            }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="px-4 pb-3 text-center">
                                                <p className="text-[10px] text-gray-400">Selecciona el día de entrega</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── STEP 2: TIME ── */}
                                    {pickerStep === 'time' && (
                                        <div>
                                            {/* Header */}
                                            <div className="bg-brand-charcoal px-4 py-3 flex items-center gap-3">
                                                <button type="button" onClick={() => setPickerStep('date')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all text-lg">‹</button>
                                                <div>
                                                    <p className="text-white text-sm font-bold capitalize">{(() => { const d = new Date(tempDate + 'T12:00'); return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }); })()}</p>
                                                    <p className="text-brand-terracotta text-[10px] uppercase tracking-widest">Selecciona la hora</p>
                                                </div>
                                            </div>
                                            {/* Time display */}
                                            <div className="bg-gray-50 border-b border-gray-100 py-3 text-center">
                                                <span className="text-4xl font-bold text-brand-charcoal font-serif">{tempHour}:{tempMinute}</span>
                                                <span className="text-gray-400 ml-1 text-sm">hrs</span>
                                            </div>
                                            {/* Hours */}
                                            <div className="px-3 pt-3">
                                                <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-2">Hora</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {pickerHours.map(h => {
                                                        const isHourPast = MINUTES.every(m => isDeliveryTimeDisabled(tempDate, h, m));
                                                        return (
                                                            <button 
                                                                key={h} 
                                                                type="button" 
                                                                disabled={isHourPast}
                                                                onClick={() => {
                                                                    setTempHour(h);
                                                                    if (isDeliveryTimeDisabled(tempDate, h, tempMinute)) {
                                                                        for (const m of MINUTES) {
                                                                            if (!isDeliveryTimeDisabled(tempDate, h, m)) {
                                                                                setTempMinute(m);
                                                                                break;
                                                                            }
                                                                        }
                                                                    }
                                                                }}
                                                                className={`flex-1 min-w-[2.5rem] py-2 rounded-lg text-sm font-bold transition-all ${
                                                                    isHourPast ? 'opacity-25 cursor-not-allowed bg-gray-100 text-gray-400' :
                                                                    tempHour === h ? 'bg-brand-terracotta text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-brand-terracotta/10'
                                                                }`}
                                                            >
                                                                {h}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            {/* Minutes */}
                                            <div className="px-3 pt-3 pb-3">
                                                <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-2">Minutos</p>
                                                <div className="grid grid-cols-4 gap-1.5">
                                                    {MINUTES.map(m => {
                                                        const isMinutePast = isDeliveryTimeDisabled(tempDate, tempHour, m);
                                                        return (
                                                            <button 
                                                                key={m} 
                                                                type="button" 
                                                                disabled={isMinutePast}
                                                                onClick={() => setTempMinute(m)}
                                                                className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                                                                    isMinutePast ? 'opacity-25 cursor-not-allowed bg-gray-100 text-gray-400' :
                                                                    tempMinute === m ? 'bg-brand-terracotta text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-brand-terracotta/10'
                                                                }`}
                                                            >
                                                                {m}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            {/* Confirm */}
                                            <div className="px-3 pb-4">
                                                <button 
                                                    type="button" 
                                                    onClick={confirmTime}
                                                    disabled={isDateTimePast(tempDate, tempHour, tempMinute)}
                                                    className="w-full py-3 bg-brand-charcoal text-white rounded-lg text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Confirmar Entrega {tempHour}:{tempMinute} hrs ✓
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>

                        {!deadline && (
                            <p className="text-[10px] text-red-400 font-medium flex items-center gap-1">
                                <span>⚠</span> Debes ingresar la fecha y hora de entrega para continuar.
                            </p>
                        )}

                        {deadline && (() => {
                            const capacity = adjustedDates?.dailyCapacity || (atelierConfig ? (atelierConfig.labor_capacity_per_operator_daily * atelierConfig.total_active_operators) : 8);
                            const optimalThreshold = capacity * 0.6;
                            const intermediateThreshold = capacity;
                            
                            const totalCartHours = cart.reduce((sum, item) => {
                                const hours = item.isCustom 
                                    ? Number(item.details?.hours || 0) 
                                    : getDefaultProductionHours(item.name, item.category);
                                return sum + hours;
                            }, 0);
                            
                            const combinedWorkloadHours = (dailyWorkload?.totalHours || 0) + totalCartHours;
                            
                            const workloadDate = adjustedDates?.productionEndDate || deadline;
                            const formattedWorkloadDate = workloadDate ? (() => {
                                const d = new Date(workloadDate);
                                return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
                            })() : '';
                            
                            return (
                                <div className="bg-brand-sand/10 border border-brand-sand/30 p-4 rounded-sm space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
                                        <span className="text-gray-500">Carga del Taller (Confección: {formattedWorkloadDate})</span>
                                        {loadingWorkload ? (
                                            <span className="text-brand-terracotta animate-pulse">Calculando...</span>
                                        ) : (
                                            <span className="text-brand-charcoal">
                                                {dailyWorkload !== null ? `${combinedWorkloadHours} / ${capacity} horas` : 'N/A'}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {dailyWorkload !== null && !loadingWorkload && (
                                        <>
                                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-500 ${
                                                        combinedWorkloadHours <= optimalThreshold ? 'bg-green-600' :
                                                        combinedWorkloadHours <= intermediateThreshold ? 'bg-amber-500' : 'bg-rose-600'
                                                    }`}
                                                    style={{ width: `${Math.min((combinedWorkloadHours / capacity) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <p className={`text-[10px] italic font-medium ${
                                                combinedWorkloadHours <= optimalThreshold ? 'text-green-700' :
                                                combinedWorkloadHours <= intermediateThreshold ? 'text-amber-700' : 'text-rose-700'
                                            }`}>
                                                {combinedWorkloadHours <= optimalThreshold ? '🟢 Capacidad Óptima: Espacio disponible en la jornada.' :
                                                 combinedWorkloadHours <= intermediateThreshold ? '🟡 Capacidad Intermedia: Jornada con carga moderada.' :
                                                 '🔴 Capacidad Completa: Jornada sobre-asignada. Se sugiere re-agendar.'}
                                            </p>
                                        </>
                                    )}
                                </div>
                            );
                        })()}

                        {adjustedDates && (
                            <div className="bg-gray-50 border border-gray-200/80 p-5 rounded-sm space-y-4 shadow-sm mt-4 animate-in fade-in duration-300">
                                <h5 className="text-[10px] font-bold uppercase tracking-widest text-brand-terracotta flex items-center gap-1.5 border-b border-gray-200 pb-2">
                                    ⚙️ Desglose de Gobernanza de Tiempos
                                </h5>
                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">🛠️ Inicio Estimado Confección:</span>
                                        <strong className="text-brand-charcoal">
                                            {new Date(adjustedDates.productionStartDate).toLocaleDateString('es-CL', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </strong>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">🏁 Término Confección:</span>
                                        <strong className="text-brand-charcoal">
                                            {new Date(adjustedDates.productionEndDate).toLocaleDateString('es-CL', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </strong>
                                    </div>
                                    <div className="flex justify-between items-center bg-brand-sand/20 p-2.5 rounded-sm border border-brand-sand/40">
                                        <span className="text-brand-charcoal font-semibold">🛍️ Retiro Cliente Prometido:</span>
                                        <strong className="text-brand-terracotta font-serif text-sm">
                                            {new Date(adjustedDates.finalDeliveryDate).toLocaleDateString('es-CL', {
                                                weekday: 'short', day: 'numeric', month: 'short'
                                            })} a las {adjustedDates.config.windowStart.slice(0, 5)} hrs
                                        </strong>
                                    </div>
                                </div>
                                <div className="text-[8px] text-gray-400 leading-relaxed font-medium bg-white p-2.5 border border-gray-100 rounded-sm">
                                    💡 Capacidad del taller: {adjustedDates.dailyCapacity}h diarias ({adjustedDates.config.activeOperators} costureras × {adjustedDates.config.laborCapacity}h). Backlog actual en cola: {adjustedDates.backlogHours.toFixed(1)}h. Buffer logístico post-producción: +{adjustedDates.config.bufferDays} días hábiles.
                                </div>
                            </div>
                        )}
                    </div>
                    )}

                    {hasUnassignedItems && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-sm flex items-start gap-2 mt-6">
                            <span className="text-sm shrink-0 leading-none">⚠</span>
                            <div>
                                <strong className="font-bold block mb-0.5">Asignación Requerida</strong>
                                Debes asignar una costurera a cada una de las prendas en el carrito para poder habilitar el pago y emisión de boleta.
                            </div>
                        </div>
                    )}

                    {posMode === 'new_sale' && (
                    <div className="mt-6">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-charcoal mb-3">Abono Inicial</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button 
                                type="button"
                                disabled={hasUnassignedItems}
                                onClick={() => setInitialPaymentType('total')}
                                className={`py-3 text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm border ${
                                    hasUnassignedItems ? 'bg-gray-50 text-gray-300 border-gray-200 opacity-50 cursor-not-allowed' :
                                    initialPaymentType === 'total' ? 'bg-brand-terracotta text-white border-brand-terracotta shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-brand-terracotta'
                                }`}
                            >
                                Pago Total
                            </button>
                            <button 
                                type="button"
                                disabled={hasUnassignedItems}
                                onClick={() => setInitialPaymentType('50percent')}
                                className={`py-3 text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm border ${
                                    hasUnassignedItems ? 'bg-gray-50 text-gray-300 border-gray-200 opacity-50 cursor-not-allowed' :
                                    initialPaymentType === '50percent' ? 'bg-brand-terracotta text-white border-brand-terracotta shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-brand-terracotta'
                                }`}
                            >
                                Abono 50%
                            </button>
                            <button 
                                type="button"
                                disabled={hasUnassignedItems}
                                onClick={() => {
                                    setInitialPaymentType('zero');
                                    setPaymentMethod(null);
                                }}
                                className={`py-3 text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm border ${
                                    hasUnassignedItems ? 'bg-gray-50 text-gray-300 border-gray-200 opacity-50 cursor-not-allowed' :
                                    initialPaymentType === 'zero' ? 'bg-brand-terracotta text-white border-brand-terracotta shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-brand-terracotta'
                                }`}
                            >
                                Contra Entrega
                            </button>
                        </div>
                    </div>
                    )}

                    {initialPaymentType !== 'zero' && (
                    <div className="mt-6">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-charcoal mb-3">Método de Pago</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button 
                            type="button"
                            disabled={hasUnassignedItems}
                            onClick={() => setPaymentMethod('mercadopago_point')}
                            className={`flex flex-col items-center justify-center gap-2 py-3.5 text-[9px] uppercase tracking-widest transition-all rounded-sm border ${
                                hasUnassignedItems
                                    ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                                    : paymentMethod === 'mercadopago_point'
                                        ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-sm font-bold'
                                        : 'border-gray-200 hover:border-brand-charcoal text-brand-charcoal bg-white cursor-pointer font-bold'
                            }`}>
                            <CreditCard className="w-4 h-4 text-brand-terracotta" />
                            Pago Máquina
                        </button>
                        <button 
                            type="button"
                            disabled={hasUnassignedItems}
                            onClick={() => setPaymentMethod('transbank')}
                            className={`flex flex-col items-center justify-center gap-2 py-3.5 text-[9px] uppercase tracking-widest transition-all rounded-sm border ${
                                hasUnassignedItems
                                    ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                                    : paymentMethod === 'transbank'
                                        ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-sm font-bold'
                                        : 'border-gray-200 hover:border-brand-charcoal text-brand-charcoal bg-white cursor-pointer font-bold'
                            }`}>
                            <Globe className="w-4 h-4 text-blue-500" />
                            Pago en línea
                        </button>
                        <button 
                            type="button"
                            disabled={hasUnassignedItems}
                            onClick={() => {
                                const charge = initialPaymentType === '50percent' ? Math.round(total / 2) : total;
                                setPaymentMethod('cash');
                                setSplitCashAmount(charge);
                                setSplitCardAmount(0);
                            }}
                            className={`flex flex-col items-center justify-center gap-2 py-3.5 text-[9px] uppercase tracking-widest transition-all rounded-sm border ${
                                hasUnassignedItems
                                    ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                                    : paymentMethod === 'cash'
                                        ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-sm font-bold'
                                        : 'border-gray-200 hover:border-brand-charcoal text-brand-charcoal bg-white cursor-pointer font-bold'
                            }`}>
                            <span className="text-[14px] leading-none flex gap-1 justify-center w-full">💵 💳</span>
                            <span className="text-center px-1">Efectivo / Mixto</span>
                        </button>
                    </div>
                    </div>
                    )}

                    {paymentMethod === 'cash' && initialPaymentType !== 'zero' && (
                        <div className="mt-4 p-4 border border-brand-terracotta/20 bg-brand-terracotta/5 rounded-sm space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal text-center mb-2">Detalle de Pago</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1">Monto Tarjeta (Máquina)</label>
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        value={splitCardAmount || ''} 
                                        placeholder="0"
                                        onChange={(e) => {
                                            const val = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
                                            const charge = initialPaymentType === '50percent' ? Math.round(total / 2) : total;
                                            setSplitCardAmount(val);
                                            setSplitCashAmount(charge - val);
                                        }}
                                        className="w-full border-b border-gray-300 py-2 text-sm bg-transparent outline-none focus:border-brand-charcoal font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1">Monto Efectivo / Transf</label>
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        value={splitCashAmount || ''} 
                                        placeholder="0"
                                        onChange={(e) => {
                                            const val = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
                                            const charge = initialPaymentType === '50percent' ? Math.round(total / 2) : total;
                                            setSplitCashAmount(val);
                                            setSplitCardAmount(charge - val);
                                        }}
                                        className="w-full border-b border-gray-300 py-2 text-sm bg-transparent outline-none focus:border-brand-charcoal font-mono"
                                    />
                                </div>
                            </div>
                            {splitCardAmount + splitCashAmount !== (initialPaymentType === '50percent' ? Math.round(total / 2) : total) && (
                                <p className="text-[10px] text-red-500 font-bold text-center">⚠ La suma debe ser exactamente {formatCurrency(initialPaymentType === '50percent' ? Math.round(total / 2) : total)}</p>
                            )}
                        </div>
                    )}


                    {/* Registro de Exclusividad para Graduaciones o Novias */}
                    <div className="mt-4 p-4 border border-gray-200 bg-gray-50 rounded-sm space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal">Bloqueo de Exclusividad</h4>
                        <div>
                            <label className="block text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1">Tipo de Campaña</label>
                            <select 
                                value={exclusivityType} 
                                onChange={(e) => {
                                    const val = e.target.value as any;
                                    setExclusivityType(val);
                                    if (val === 'none') {
                                        setExclusivityEventId('');
                                        setExclusivityDesignName('');
                                    } else {
                                        // Auto-fill design name from customOrderName if present
                                        if (customOrderName) {
                                            setExclusivityDesignName(customOrderName);
                                        } else if (cart.length > 0) {
                                            setExclusivityDesignName(cart[0].name);
                                        }
                                    }
                                }}
                                className="w-full p-2 text-xs bg-white border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta"
                            >
                                <option value="none">Sin bloqueo</option>
                                <option value="graduacion">Vestidos de Graduación</option>
                                <option value="novias">Vestidos de Novia</option>
                            </select>
                        </div>
                        {exclusivityType !== 'none' && (
                            <>
                                <div>
                                    <label className="block text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                                        {exclusivityType === 'graduacion' ? 'Colegio y Curso' : 'Fecha o Lugar del Evento'}
                                    </label>
                                    <input 
                                        type="text"
                                        value={exclusivityEventId}
                                        onChange={(e) => setExclusivityEventId(e.target.value)}
                                        placeholder={exclusivityType === 'graduacion' ? 'Ej. Villa Maria 4to Medio B' : 'Ej. Boda 15 Diciembre'}
                                        className="w-full p-2 text-xs bg-white border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1">Modelo / Diseño a Bloquear</label>
                                    <input 
                                        type="text"
                                        value={exclusivityDesignName}
                                        onChange={(e) => setExclusivityDesignName(e.target.value)}
                                        placeholder="Ej. Clara Celeste"
                                        className="w-full p-2 text-xs bg-white border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                        {posMode === 'new_sale' && (
                            <button 
                                type="button"
                                onClick={generateBudgetLink}
                                disabled={cart.length === 0}
                                className="w-full border border-brand-charcoal text-brand-charcoal py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                Generar Presupuesto Web (Link)
                            </button>
                        )}
                        <button 
                            type="button"
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || !selectedCustomer || (posMode === 'new_sale' && !deadline) || isProcessing || hasUnassignedItems || (initialPaymentType !== 'zero' && (!paymentMethod || (paymentMethod === 'split' && splitCardAmount + splitCashAmount !== (initialPaymentType === '50percent' ? Math.round(total / 2) : total))))}
                            className={`w-full py-4 text-[10px] uppercase tracking-widest font-bold transition-all ${
                                cart.length === 0 || !selectedCustomer || (posMode === 'new_sale' && !deadline) || isProcessing || hasUnassignedItems || (initialPaymentType !== 'zero' && (!paymentMethod || (paymentMethod === 'split' && splitCardAmount + splitCashAmount !== (initialPaymentType === '50percent' ? Math.round(total / 2) : total))))
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                            }`}>
                            {isProcessing
                                ? 'Procesando...'
                                : hasUnassignedItems
                                    ? '⚠ Falta Asignar Costurera'
                                    : !selectedCustomer
                                        ? 'Falta Identificar Cliente'
                                        : (posMode === 'new_sale' && !deadline)
                                            ? '⚠ Falta Fecha y Hora de Entrega'
                                            : initialPaymentType === 'zero'
                                                ? 'Registrar Orden sin Pago Inicial'
                                                : paymentMethod === 'mercadopago_point'
                                                    ? 'Enviar a Terminal Físico'
                                                    : paymentMethod === 'transbank'
                                                        ? 'Generar Link de Pago'
                                                        : 'Cobrar y Emitir Boleta'
                            }
                        </button>

                        {cart.length > 0 && (
                            <button 
                                type="button"
                                onClick={() => {
                                    setCart([]);
                                    setPosMode('new_sale');
                                    setPendingOrderToPay(null);
                                    setInitialPaymentType('total');
                                    setPaymentMethod(null);
                                    setSplitCardAmount(0);
                                    setSplitCashAmount(0);
                                }}
                                className="w-full border border-red-200 text-red-500 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-red-50 hover:border-red-500 transition-all mt-2">
                                {posMode === 'pay_balance' ? 'Cancelar Pago de Saldo' : 'Cancelar Venta y Vaciar Carrito'}
                            </button>
                        )}
                    </div>
                </div>
            </div>


            {/* Interactive Budget Link Modal */}
            {isBudgetModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-16 h-16 bg-brand-sand/30 rounded-full flex items-center justify-center mx-auto">
                                <Plus className="w-8 h-8 text-brand-terracotta rotate-45" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="font-serif text-3xl text-brand-charcoal">¡Presupuesto Web Listo!</h2>
                                <p className="text-sm text-gray-500 px-8">Hemos generado un link interactivo para tu clienta. Puede verlo y pagar desde su celular.</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 flex flex-col gap-4">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 text-left italic">Enviar por WhatsApp</p>
                                        <div className="flex gap-2">
                                            <input 
                                                type="tel" 
                                                value={clientPhone}
                                                onChange={(e) => setClientPhone(e.target.value)}
                                                placeholder="Ej. 56912345678" 
                                                className="flex-1 bg-white border border-gray-200 px-3 py-2 text-xs rounded-sm outline-none focus:border-brand-terracotta" 
                                            />
                                            <button 
                                                onClick={shareViaWhatsApp}
                                                disabled={!clientPhone}
                                                className="bg-[#25D366] text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#128C7E] transition-all rounded-sm flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <MessageSquare className="w-3 h-3" /> WhatsApp
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 border-t border-gray-200 pt-4">
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 text-left italic">Enviar por Correo</p>
                                        <div className="flex gap-2">
                                            <input 
                                                type="email" 
                                                value={clientEmail}
                                                onChange={(e) => setClientEmail(e.target.value)}
                                                placeholder="cliente@email.com" 
                                                className="flex-1 bg-white border border-gray-200 px-3 py-2 text-xs rounded-sm outline-none focus:border-brand-terracotta" 
                                            />
                                            <button 
                                                onClick={shareViaEmail}
                                                disabled={!clientEmail || isSendingEmail}
                                                className="bg-brand-charcoal text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all rounded-sm flex items-center gap-2 disabled:opacity-50 min-w-[100px] justify-center"
                                            >
                                                {isSendingEmail ? (
                                                    <Loader2 className="w-3 h-3 animate-spin text-brand-sand" />
                                                ) : (
                                                    <Mail className="w-3 h-3" />
                                                )}
                                                {isSendingEmail ? 'Enviando...' : 'Email'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 text-left mb-2">Link Directo</p>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={generatedLink} 
                                            className="flex-1 bg-white border border-gray-200 px-3 py-2 text-[10px] text-gray-400 rounded-sm outline-none" 
                                        />
                                        <button 
                                            onClick={copyToClipboard}
                                            className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm flex items-center gap-2 ${copySuccess ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                        >
                                            {copySuccess ? 'Copiado' : 'Copiar Link'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => window.open(generatedLink, '_blank')}
                                    className="flex items-center justify-center gap-2 py-3 border border-gray-200 text-brand-charcoal text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-sm"
                                >
                                    Ver como Cliente
                                </button>
                                <button 
                                    onClick={handleCloseBudgetModal}
                                    className="py-3 bg-brand-charcoal text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all rounded-sm"
                                >
                                    Finalizar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Work Order / Success Modal */}
            {checkoutResult && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 max-h-[calc(100vh-2rem)]">
                        {/* Polling hook logic */}
                        <PollingComponent 
                            checkoutResult={checkoutResult} 
                            paymentConfirmed={paymentConfirmed} 
                            setPaymentConfirmed={setPaymentConfirmed} 
                        />
                        <div className="bg-brand-charcoal text-white p-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <ClipboardList className="w-6 h-6 text-brand-sand" />
                                <div>
                                    <h2 className="font-serif text-xl">Orden de Trabajo #{checkoutResult.orderId}</h2>
                                    <p className="text-[8px] uppercase tracking-[0.3em] text-brand-sand/60">Elena Atelier - Alta Costura</p>
                                </div>
                            </div>
                            <button onClick={handleCloseCheckout} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto flex-1">
                            {/* Staff Info */}
                            <div className="grid grid-cols-2 gap-8 pb-6 border-b border-gray-100">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Cliente</p>
                                    <p className="font-serif text-lg">{checkoutResult.customer.full_name}</p>
                                    <p className="text-xs text-gray-500">{checkoutResult.customer.phone || 'Sin teléfono'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Fecha de Ingreso</p>
                                    <p className="text-sm font-bold">{checkoutResult.date}</p>
                                    {checkoutResult.deliveryDate && (
                                        <div className="mt-2">
                                            <p className="text-[10px] uppercase tracking-widest text-brand-terracotta mb-1">Fecha Estimada Entrega</p>
                                            <p className="text-sm font-bold">{checkoutResult.deliveryDate}</p>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-brand-terracotta font-bold uppercase mt-3">Metodo: {checkoutResult.method === 'mercadopago_point' ? 'Mercado Pago Point' : checkoutResult.method === 'transbank' ? 'Webpay Plus' : checkoutResult.method === 'cash' ? 'Efectivo / Transferencia' : checkoutResult.method}</p>
                                </div>
                            </div>

                            {/* Work Details */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">Detalle para Taller</h3>
                                <div className="space-y-3">
                                    {checkoutResult.items.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-serif text-md">{item.name}</p>
                                                <span className="text-[10px] uppercase font-bold text-brand-terracotta">{item.category}</span>
                                            </div>
                                            {item.isCustom && item.details && (
                                                <div className="grid grid-cols-3 gap-4 mt-2 pt-2 border-t border-gray-200/50">
                                                    <div className="col-span-1">
                                                        <p className="text-[9px] uppercase text-gray-400">Horas Estimadas</p>
                                                        <p className="text-xs font-bold">{item.details.hours} hrs</p>
                                                    </div>
                                                    {item.notes && (
                                                        <div className="col-span-2">
                                                            <p className="text-[9px] uppercase text-gray-400">Descripción del Arreglo / Notas</p>
                                                            <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed italic">"{item.notes}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Item-specific Image inside the Success/Print Modal */}
                                            {item.images && item.images.length > 0 && (
                                                <div className="mt-4 print:break-inside-avoid space-y-3">
                                                    <p className="text-[9px] uppercase tracking-widest font-bold text-brand-terracotta">Registro Fotográfico ({item.images.length})</p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {item.images.map((img: any, imgIdx: number) => (
                                                            <div key={imgIdx} className="space-y-1 bg-white p-2 border border-gray-100 rounded-sm shadow-sm">
                                                                <div className="border border-gray-100 rounded-[1px] overflow-hidden bg-gray-50 flex items-center justify-center h-[90px]">
                                                                    <img src={img.url} alt={`Registro ${imgIdx + 1}`} className="h-full w-full object-contain" />
                                                                </div>
                                                                {img.notes && (
                                                                    <p className="text-[9px] text-brand-charcoal italic leading-tight p-1 bg-brand-sand/5 border-t border-gray-100">
                                                                        "{img.notes}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-brand-sand/10 p-4 rounded-sm border border-brand-sand/30 text-center">
                                <p className="text-[10px] uppercase tracking-widest text-brand-charcoal mb-1">Total de la Orden</p>
                                <p className="text-3xl font-serif text-brand-terracotta">{formatCurrency(checkoutResult.total)}</p>
                            </div>

                            {((checkoutResult.method === 'mercadopago_point' || checkoutResult.method?.startsWith('Mixto')) && !paymentConfirmed) && (
                                <WebhookSupervisorPanel 
                                    checkoutResult={checkoutResult} 
                                    paymentConfirmed={paymentConfirmed} 
                                />
                            )}

                            {!((checkoutResult.method === 'mercadopago_point' || checkoutResult.method?.startsWith('Mixto')) && !paymentConfirmed) && (
                            <div className="border-t border-gray-100 pt-6 space-y-4 print:hidden">
                                <div className="bg-gray-50 p-4 rounded-sm border border-gray-200/60 flex flex-col md:flex-row gap-4 items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Notificaciones al Cliente</p>
                                        <p className="text-xs text-gray-500 font-medium">Reenviar comprobante a: {checkoutResult.customer.email || 'Sin correo'}</p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto justify-end">
                                        {checkoutResult.customer.email && (
                                            <button 
                                                onClick={async (e) => {
                                                    const btn = e.currentTarget;
                                                    btn.disabled = true;
                                                    const originalText = btn.innerHTML;
                                                    btn.innerHTML = 'Enviando...';
                                                    try {
                                                        const res = await sendOrderConfirmationEmailAction({
                                                            customerEmail: checkoutResult.customer.email,
                                                            customerName: checkoutResult.customer.full_name,
                                                            orderId: checkoutResult.orderId,
                                                            items: checkoutResult.items.map((item: any) => ({
                                                                name: item.name,
                                                                price: item.price,
                                                                category: item.category,
                                                                notes: item.notes || '',
                                                                images: item.images || []
                                                            })),
                                                            total: checkoutResult.total,
                                                            paymentMethod: checkoutResult.method,
                                                            date: checkoutResult.date,
                                                            deliveryDate: checkoutResult.deliveryDate || '',
                                                            paymentUrl: checkoutResult.paymentUrl,
                                                            splitCashAmount: checkoutResult.splitCashAmount,
                                                            splitCardAmount: checkoutResult.splitCardAmount
                                                        });
                                                        if (res.success) {
                                                            alert('¡Comprobante enviado por correo con éxito! ✨');
                                                        } else {
                                                            alert('Error: ' + res.error);
                                                        }
                                                    } catch (err: any) {
                                                        alert('Error: ' + err.message);
                                                    } finally {
                                                        btn.disabled = false;
                                                        btn.innerHTML = originalText;
                                                    }
                                                }}
                                                className="px-4 py-2 border border-brand-charcoal text-brand-charcoal text-[9px] uppercase tracking-widest font-bold hover:bg-white transition-all rounded-sm flex items-center gap-2"
                                            >
                                                <Mail className="w-3.5 h-3.5" /> Reenviar Correo
                                            </button>
                                        )}
                                        {checkoutResult.customer.phone && (
                                            <button 
                                                onClick={() => {
                                                    const deliveryInfo = checkoutResult.deliveryDate ? (() => {
                                                        const d = new Date(checkoutResult.deliveryDate);
                                                        const day = d.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                                        const time = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
                                                        return `${day} a las ${time} hrs`;
                                                    })() : '';

                                                    const paymentText = checkoutResult.paymentUrl 
                                                        ? `\n💳 Paga en línea de forma segura aquí: ${checkoutResult.paymentUrl}\n`
                                                        : '';

                                                    const message = encodeURIComponent(`¡Hola ${checkoutResult.customer.full_name.split(' ')[0]}! 🎉\n\nTu pieza ya ingresó al atelier y está en proceso.\nOrden #: ${checkoutResult.orderId}\nTotal: ${checkoutResult.total.toLocaleString('es-CL')} CLP\n${deliveryInfo ? `Entrega estimada: ${deliveryInfo}\n` : ''}${paymentText}\nSi tienes dudas, contáctanos.\n\n— Elena La Costurera`);
                                                    const cleanPhone = checkoutResult.customer.phone.replace(/\D/g, '');
                                                    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
                                                }}
                                                className="px-4 py-2 bg-[#25D366] text-white text-[9px] uppercase tracking-widest font-bold hover:bg-[#128C7E] transition-all rounded-sm flex items-center gap-2"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" /> Enviar WhatsApp
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                            {checkoutResult.paymentUrl && checkoutResult.method === 'transbank' && (
                                <a 
                                    href={checkoutResult.paymentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 bg-brand-terracotta hover:bg-brand-charcoal text-white text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm text-center flex items-center justify-center gap-2 shadow-md"
                                >
                                    <span>💳</span> Ir a Página de Pago
                                </a>
                            )}
                            
                            {((checkoutResult.method === 'mercadopago_point' || checkoutResult.method?.startsWith('Mixto')) && !paymentConfirmed) ? (
                                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                                    <div className="flex-1 py-3 bg-gray-100 text-brand-charcoal text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm text-center flex flex-col items-center justify-center gap-1 opacity-70">
                                        <div className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Esperando Webhook...</div>
                                    </div>
                                    <button 
                                        onClick={() => setPaymentConfirmed(true)} 
                                        className="flex-1 py-3 bg-brand-terracotta text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-charcoal transition-all rounded-sm shadow-md"
                                    >
                                        Validar Manualmente
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if (confirm('¿Estás seguro de que deseas anular la operación? Se borrarán los registros creados.')) {
                                                const res = await cancelPendingOrderAction(checkoutResult.orderId, posMode === 'pay_balance');
                                                if (res.success) {
                                                    alert('Operación anulada exitosamente.');
                                                    handleCloseCheckout();
                                                } else {
                                                    alert('Error al anular la operación: ' + res.error);
                                                }
                                            }
                                        }}
                                        className="flex-1 py-3 bg-red-100 text-red-600 border border-red-300 text-[10px] uppercase tracking-widest font-bold hover:bg-red-200 transition-all rounded-sm shadow-md"
                                    >
                                        Anular Operación Fallida
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => window.print()} className="flex-1 py-3 border border-brand-charcoal text-brand-charcoal text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all rounded-sm">
                                    {(checkoutResult.method === 'mercadopago_point' || checkoutResult.method?.startsWith('Mixto')) ? '✅ Imprimir (Aprobado)' : 'Imprimir Orden (Taller)'}
                                </button>
                            )}
                            
                            <button onClick={handleCloseCheckout} className="flex-1 py-3 bg-brand-charcoal text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all rounded-sm">
                                Finalizar y Nueva Orden
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Authorization Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white max-w-sm w-full shadow-2xl rounded-sm overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-[#f8d7da] p-6 text-center border-b border-[#f5c6cb]">
                            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                                <AlertCircle className="w-6 h-6 text-[#721c24]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#721c24] mb-1">Autorización Requerida</h2>
                            <p className="text-xs text-[#721c24]/80">Descuento superior al 20%</p>
                        </div>
                        <div className="p-6">
                            {isAuthorizing ? (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-terracotta mb-4" />
                                    <p className="text-sm text-center text-gray-600">Enviando solicitud silenciosa al Administrador...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-center text-gray-600">
                                        El administrador ha sido notificado. Por favor, ingrese el PIN de 4 dígitos proporcionado para continuar:
                                    </p>
                                    <input 
                                        type="text" 
                                        maxLength={4}
                                        value={authPinInput}
                                        onChange={(e) => setAuthPinInput(e.target.value.replace(/\D/g, ''))}
                                        className="w-full text-center text-3xl font-bold tracking-[0.5em] p-4 bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta"
                                        placeholder="••••"
                                        autoFocus
                                    />
                                    <div className="flex gap-3 pt-2">
                                        <button 
                                            onClick={() => {
                                                setShowAuthModal(false);
                                                setPendingAuthItem(null);
                                                setAuthPinInput('');
                                                setExpectedPin('');
                                            }} 
                                            className="flex-1 py-3 border border-gray-200 text-gray-600 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (authPinInput === expectedPin && expectedPin !== '') {
                                                    addToCart(pendingAuthItem);
                                                    resetCustomOrderForm();
                                                    setShowAuthModal(false);
                                                    setPendingAuthItem(null);
                                                    setAuthPinInput('');
                                                    setExpectedPin('');
                                                } else {
                                                    alert('PIN incorrecto. Intente nuevamente.');
                                                    setAuthPinInput('');
                                                }
                                            }}
                                            disabled={authPinInput.length !== 4}
                                            className="flex-1 py-3 bg-brand-terracotta text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-charcoal transition-all rounded-sm disabled:opacity-50"
                                        >
                                            Autorizar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* LOAD BALANCER MODAL */}
            {loadBalancerModal && loadBalancerModal.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white max-w-lg w-full rounded-sm shadow-2xl overflow-hidden border-t-4 border-red-500">
                        <div className="p-6 bg-red-50 border-b border-red-100 flex items-start gap-4">
                            <AlertCircle className="w-8 h-8 text-red-500 shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-red-800">Alerta de Sobrecarga</h3>
                                <p className="text-sm text-red-600 mt-1">
                                    ¿Seguro que quieres asignar a <strong>{loadBalancerModal.targetName}</strong>? 
                                    Esto elevaría su carga de hoy a <strong>{loadBalancerModal.targetLoadDays} días</strong>, generando un cuello de botella.
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal border-b border-gray-100 pb-2">Sugerencias con capacidad inmediata:</h4>
                            
                            {loadBalancerModal.alternatives.length > 0 ? (
                                <div className="space-y-3">
                                    {loadBalancerModal.alternatives.map((alt: any) => (
                                        <div key={alt.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-sm hover:border-brand-sand transition-colors">
                                            <div>
                                                <p className="font-bold text-brand-charcoal">{alt.name}</p>
                                                <p className="text-xs text-emerald-600 font-medium">Carga actual: {alt.loadDays} días ({alt.workloadPercentage}%)</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    // Asignar a la alternativa
                                                    if (loadBalancerModal.itemIndex === null) {
                                                        setAssignedOperatorId(alt.id);
                                                    } else {
                                                        const newCart = [...cart];
                                                        newCart[loadBalancerModal.itemIndex] = { ...newCart[loadBalancerModal.itemIndex], assignedOperatorId: alt.id };
                                                        setCart(newCart);
                                                    }
                                                    setLoadBalancerModal(null);
                                                }}
                                                className="px-4 py-2 bg-brand-charcoal text-white text-[10px] uppercase font-bold tracking-wider rounded-sm hover:bg-brand-terracotta transition-colors"
                                            >
                                                Reasignar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No hay otras costureras disponibles hoy con capacidad.</p>
                            )}
                        </div>
                        
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <button 
                                onClick={() => setLoadBalancerModal(null)}
                                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 uppercase tracking-widest"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => {
                                    // Forzar asignación a pesar de la sobrecarga (Exclusividad)
                                    if (loadBalancerModal.itemIndex === null) {
                                        setAssignedOperatorId(loadBalancerModal.targetOpId);
                                    } else {
                                        const newCart = [...cart];
                                        newCart[loadBalancerModal.itemIndex] = { ...newCart[loadBalancerModal.itemIndex], assignedOperatorId: loadBalancerModal.targetOpId };
                                        setCart(newCart);
                                    }
                                    setLoadBalancerModal(null);
                                }}
                                className="px-4 py-2 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-red-200 transition-colors"
                            >
                                Forzar Asignación (Exclusivo)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Haute Couture Calculator Modal */}
            {isHauteCoutureModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto animate-in fade-in duration-300">
                    <div className="bg-white text-brand-charcoal rounded-sm border border-gray-200 shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden max-h-[95vh]">
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-brand-sand/10 shrink-0">
                            <div>
                                <h2 className="font-serif text-xl md:text-2xl text-brand-charcoal tracking-wide">Calculadora Alta Costura</h2>
                                <p className="text-xs text-gray-500 mt-1">Desglose técnico de costos y tiempos{customOrderName ? `: ${customOrderName}` : ''}</p>
                            </div>
                            <button onClick={() => setIsHauteCoutureModalOpen(false)} className="text-gray-400 hover:text-brand-charcoal bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Templates Carousel */}
                        <div className="bg-brand-sand/5 border-b border-gray-100 p-4 shrink-0">
                            <span className="block text-[10px] uppercase tracking-wider text-brand-terracotta mb-3 font-semibold">Siluetas Base del Taller</span>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                                {hcTemplates.map((tpl) => (
                                    <div
                                        key={tpl.id}
                                        onClick={() => handleApplyTemplate(tpl)}
                                        className={`relative bg-white border rounded-md p-3 min-w-[120px] w-[120px] text-center cursor-pointer transition-all group flex flex-col items-center justify-between shadow-sm min-h-[110px] ${
                                            hcPrendaName === tpl.name
                                                ? 'border-brand-terracotta bg-brand-sand/25 ring-1 ring-brand-terracotta/40'
                                                : 'border-gray-200 hover:border-brand-charcoal hover:bg-neutral-50'
                                        }`}
                                    >
                                        <div 
                                            className="h-16 w-full flex items-center justify-center mb-1.5 text-brand-charcoal hover:text-brand-terracotta transition-colors"
                                            dangerouslySetInnerHTML={{ __html: tpl.svg || tpl.img || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M21 15l-4-4-6 6" /><circle cx="9" cy="9" r="2" /></svg>` }}
                                        />
                                        <p className="text-[10px] md:text-xs text-brand-charcoal font-bold truncate w-full">{tpl.name}</p>
                                        {tpl.id.startsWith('custom_') && (
                                            <button onClick={(e) => handleDeleteTemplate(tpl.id, e)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Left Column: Interactive Sketch */}
                                <div className="lg:w-1/3 flex flex-col items-center justify-start bg-brand-sand/5 p-6 rounded-md border border-brand-sand/20 sticky top-0 h-fit">
                                    {(() => {
                                        const activeTpl = hcTemplates.find(t => t.name === hcPrendaName) || hcTemplates[0] || {};
                                        const activeDetails = [];
                                        if (hcInternalArchitecture.canvas) activeDetails.push('Entretela');
                                        if (hcInternalArchitecture.lining) activeDetails.push('Forro');
                                        if (hcInternalArchitecture.cups) activeDetails.push('Copas');
                                        if (hcInternalArchitecture.bones) activeDetails.push('Ballenas');
                                        if (hcInternalArchitecture.pads) activeDetails.push('Hombreras');
                                        if (hcHandcraft.handHem) activeDetails.push('Dobladillo a mano');
                                        if (hcHandcraft.handDraping) activeDetails.push('Drapeado');
                                        if (hcHandcraft.handEmbroideryHours > 0) activeDetails.push(`Bordado ${hcHandcraft.handEmbroideryHours}h`);
                                        if (hcHandcraft.handButtonholes > 0) activeDetails.push(`${hcHandcraft.handButtonholes} Ojales`);

                                        return (
                                            <div className="relative w-full flex flex-col items-center">
                                                <div 
                                                    className="w-full h-64 flex items-center justify-center text-brand-charcoal drop-shadow-xl"
                                                    dangerouslySetInnerHTML={{ __html: activeTpl.svg || activeTpl.img || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-16 h-16 text-gray-300"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M21 15l-4-4-6 6" /><circle cx="9" cy="9" r="2" /></svg>` }}
                                                />
                                                {activeDetails.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-4 justify-center">
                                                        {activeDetails.map((detail, idx) => (
                                                            <span 
                                                                key={idx} 
                                                                className="text-[9px] uppercase tracking-wider bg-brand-charcoal text-white px-2 py-1 rounded font-bold shadow-sm"
                                                            >
                                                                {detail}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                                
                                {/* Right Column: Configuration Form */}
                                <div className="lg:w-2/3 space-y-6">
                                    {/* Garment Name */}
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Nombre de la Prenda</label>
                                        <input type="text" value={hcPrendaName} onChange={(e) => setHcPrendaName(e.target.value)} placeholder="Ej: Vestido de noche con pedrería" className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                    </div>

                            {/* Technical Parameters Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Moldería */}
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Tipo de Moldería</label>
                                    <select value={hcPatternType} onChange={(e) => setHcPatternType(e.target.value)} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta">
                                        <option value="existing">Base existente (más rápido)</option>
                                        <option value="custom">Desde cero (patronaje propio)</option>
                                        <option value="draping">Drapeado sobre maniquí</option>
                                    </select>
                                </div>
                                {/* Piezas */}
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Piezas del Patrón: {hcPatternPieces}</label>
                                    <input type="range" min="2" max="40" value={hcPatternPieces} onChange={(e) => setHcPatternPieces(Number(e.target.value))} className="w-full accent-brand-terracotta" />
                                </div>
                                {/* Tela */}
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Dificultad de Tela</label>
                                    <select value={hcTextileDifficulty} onChange={(e) => setHcTextileDifficulty(e.target.value)} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta">
                                        <option value="easy">Fácil (algodón, lino)</option>
                                        <option value="medium">Media (seda sintética, jersey)</option>
                                        <option value="hard">Difícil (terciopelo, seda natural)</option>
                                        <option value="haute">Haute (pedrería, encaje complejo)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Estructura Interna */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Estructura Interna</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {[
                                        { key: 'canvas', label: 'Entretela' },
                                        { key: 'lining', label: 'Forro' },
                                        { key: 'cups', label: 'Copas' },
                                        { key: 'bones', label: 'Ballenas' },
                                        { key: 'pads', label: 'Hombreras' }
                                    ].map(item => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => setHcInternalArchitecture(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                                            className={`py-3 px-2 text-xs font-bold rounded-sm border transition-all ${
                                                (hcInternalArchitecture as any)[item.key]
                                                    ? 'bg-brand-charcoal text-white border-brand-charcoal'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-charcoal'
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Acabados Artesanales */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Acabados Artesanales</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <button type="button" onClick={() => setHcHandcraft(prev => ({ ...prev, handHem: !prev.handHem }))} className={`py-3 px-2 text-xs font-bold rounded-sm border transition-all ${hcHandcraft.handHem ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>Dobladillo a mano</button>
                                    <button type="button" onClick={() => setHcHandcraft(prev => ({ ...prev, handDraping: !prev.handDraping }))} className={`py-3 px-2 text-xs font-bold rounded-sm border transition-all ${hcHandcraft.handDraping ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>Drapeado</button>
                                    <div>
                                        <label className="block text-[9px] text-gray-400 mb-1">Ojales a mano</label>
                                        <input type="number" min="0" max="20" value={hcHandcraft.handButtonholes} onChange={(e) => setHcHandcraft(prev => ({ ...prev, handButtonholes: Number(e.target.value) }))} className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-gray-400 mb-1">Horas de bordado</label>
                                        <input type="number" min="0" max="100" value={hcHandcraft.handEmbroideryHours} onChange={(e) => setHcHandcraft(prev => ({ ...prev, handEmbroideryHours: Number(e.target.value) }))} className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                    </div>
                                </div>
                            </div>

                            {/* Pruebas y Toile */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Sesiones de Calce: {hcFittingsCount}</label>
                                    <input type="range" min="1" max="4" value={hcFittingsCount} onChange={(e) => setHcFittingsCount(Number(e.target.value))} className="w-full accent-brand-terracotta" />
                                </div>
                                <div className="flex items-end">
                                    <button type="button" onClick={() => setHcToileNeeded(!hcToileNeeded)} className={`w-full py-3 text-xs font-bold rounded-sm border transition-all ${hcToileNeeded ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                        {hcToileNeeded ? '✓ Toile/Prueba Requerida' : 'Sin Toile'}
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Costo Materiales (CLP)</label>
                                    <input type="number" min="0" step="5000" value={hcMaterialsCost} onChange={(e) => setHcMaterialsCost(Number(e.target.value))} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                </div>
                            </div>

                            {/* Extra Cost */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Costos Extra (aviamentos, etc.)</label>
                                    <input type="number" min="0" step="1000" value={hcExtraCost} onChange={(e) => setHcExtraCost(Number(e.target.value))} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                </div>
                                {/* Save as template */}
                                <div className="flex items-end gap-2">
                                    <input type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="Nombre para guardar como plantilla..." className="flex-1 p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                    <button type="button" onClick={() => handleSaveAsTemplateInline()} className="px-4 py-3 bg-brand-charcoal text-white text-xs font-bold rounded-sm hover:bg-brand-terracotta transition-colors whitespace-nowrap">
                                        <Sparkles className="w-4 h-4 inline mr-1" /> Guardar
                                    </button>
                                </div>
                            </div>

                            {/* AI Justification */}
                            {aiAnalysisResult?.justificacion && (
                                <div className="bg-brand-sand/10 border border-brand-sand/30 rounded-sm p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-brand-terracotta font-bold mb-1">Justificación IA</p>
                                    <p className="text-xs text-gray-700 leading-relaxed">{aiAnalysisResult.justificacion}</p>
                                </div>
                            )}
                                </div>
                            </div>
                        </div>

                        {/* Footer - Fixed with totals */}
                        <div className="p-4 md:p-6 border-t border-gray-100 bg-brand-sand/5 shrink-0">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex gap-6 text-center md:text-left">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-400">Horas Estimadas</p>
                                        <p className="text-2xl font-bold text-brand-charcoal">{hcComputedHours}h</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-400">Mano de Obra</p>
                                        <p className="text-2xl font-bold text-brand-charcoal">${(hcComputedHours * hourlyRate).toLocaleString('es-CL')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-400">Total Estimado</p>
                                        <p className="text-2xl font-bold text-brand-terracotta">${hcTotalCost.toLocaleString('es-CL')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button type="button" onClick={() => setIsHauteCoutureModalOpen(false)} className="flex-1 md:flex-none px-6 py-3 border border-gray-200 text-gray-600 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-sm">
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHoursEstimated(hcComputedHours);
                                            setMaterialsCost(hcMaterialsCost);
                                            setExtraCost(hcExtraCost);
                                            if (hcPrendaName && !customOrderName) setCustomOrderName(hcPrendaName);
                                            setIsHauteCoutureModalOpen(false);
                                        }}
                                        className="flex-1 md:flex-none px-6 py-3 bg-brand-terracotta text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-charcoal transition-all rounded-sm shadow-md"
                                    >
                                        Aplicar al Pedido
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}

function WebhookSupervisorPanel({ checkoutResult, paymentConfirmed }: any) {
    const [logs, setLogs] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        if (paymentConfirmed) return;
        
        let interval: NodeJS.Timeout;
        
        const fetchLogs = async () => {
            try {
                const res = await getLatestWebhookLogsAction();
                if (res.success && res.logs) {
                    setLogs(res.logs);
                }
            } catch (err) {
                console.error("Error fetching webhook logs:", err);
            }
        };

        fetchLogs();
        interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, [paymentConfirmed]);

    if (paymentConfirmed) return null;

    return (
        <div className="border border-gray-200 rounded-sm overflow-hidden bg-white mt-4">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-50 px-4 py-3 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:bg-gray-100 transition-all border-b border-gray-100"
            >
                <span className="flex items-center gap-2">🔍 Supervisión del Webhook (Tiempo Real)</span>
                <span>{isOpen ? '▲' : '▼'}</span>
            </button>
            
            {isOpen && (
                <div className="p-4 space-y-2 max-h-[220px] overflow-y-auto font-mono text-[9px] text-gray-600 bg-gray-50/50">
                    {logs.length === 0 ? (
                        <p className="text-gray-400 italic text-center py-2">No se encontraron logs recientes de Mercado Pago.</p>
                    ) : (
                        logs.map((log: any, idx: number) => {
                            const date = new Date(log.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            let badgeColor = 'bg-blue-100 text-blue-800';
                            if (log.level === 'ERROR') badgeColor = 'bg-red-100 text-red-800';
                            if (log.level === 'WARN') badgeColor = 'bg-yellow-100 text-yellow-800';

                            return (
                                <div key={log.id || idx} className="p-2 border-b border-gray-150 last:border-0 flex flex-col gap-1 hover:bg-white rounded-sm transition-all text-left">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span className={`px-1.5 py-0.2 rounded-[2px] font-bold text-[8px] uppercase ${badgeColor}`}>{log.level}</span>
                                            <span className="font-bold text-gray-800">{log.message}</span>
                                        </span>
                                        <span className="text-gray-400 text-[8px]">{date}</span>
                                    </div>
                                    {log.payload && (
                                        <details className="mt-1">
                                            <summary className="cursor-pointer text-brand-terracotta font-semibold hover:underline text-[8px]">Ver Detalles del Payload</summary>
                                            <pre className="mt-1 bg-white p-2 border border-gray-200 rounded-[1px] max-w-full overflow-x-auto whitespace-pre-wrap leading-tight text-gray-700">
                                                {JSON.stringify(log.payload, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

// Helper component for polling so we can use useEffect cleanly inside the conditionally rendered block
function PollingComponent({ checkoutResult, paymentConfirmed, setPaymentConfirmed }: any) {
    useEffect(() => {
        if (!(checkoutResult?.method === 'mercadopago_point' || checkoutResult?.method?.startsWith('Mixto')) || paymentConfirmed) return;
        
        let interval: NodeJS.Timeout;
        
        const checkStatus = async () => {
            try {
                const orderRef = `order_${checkoutResult.orderId}`;
                const res = await checkOrderStatusAction(orderRef);
                
                // Si la orden está completamente pagada o si ya alcanzó el monto que estábamos cobrando ahora
                if (res.success && (res.status === 'paid' || (res.paidAmount !== undefined && checkoutResult?.targetPaidAmount !== undefined && res.paidAmount >= checkoutResult.targetPaidAmount))) {
                    setPaymentConfirmed(true);
                }
            } catch (err) {
                console.error("Error polling order status:", err);
            }
        };

        // Check immediately
        checkStatus();
        
        // Then every 3 seconds
        interval = setInterval(checkStatus, 3000);
        
        return () => clearInterval(interval);
    }, [checkoutResult, paymentConfirmed, setPaymentConfirmed]);

    return null;
}
