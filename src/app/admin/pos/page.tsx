'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShoppingCart, User, Search, CreditCard, Tag, X, Plus, MessageSquare, Mail, ClipboardList, TrendingUp, Loader2, Package, Camera, FileText } from 'lucide-react';
import { getCostSettings } from '../finance/actions';
import { getCatalog } from '../catalog/actions';
import { getCustomers, createCustomer } from '../crm/actions';
import { sendBudgetEmailAction, sendOrderConfirmationEmailAction, createPOSOrdersAction, checkOrderStatusAction, getDailyWorkloadAction, getEstimatedDatesAction, getOperatorsAction, getAtelierConfigAction, saveBudgetAction } from './actions';
import { createPaymentPreference } from '@/lib/payments';
import { createWebpayTransaction } from '@/lib/transbank';

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

export default function POSPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'mercadopago_point' | 'transbank' | 'cash' | null>(null);
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
    const [assignedOperatorId, setAssignedOperatorId] = useState<string>('unassigned');

    const addToCart = (p: any) => setCart([...cart, p]);
    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const hasUnassignedItems = cart.length > 0 && cart.some(item => !item.assignedOperatorId || item.assignedOperatorId === 'unassigned');



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
    const [clientSearch, setClientSearch] = useState('');
    const [isRegisteringClient, setIsRegisteringClient] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', phone: '56', email: '' });
    const [checkoutResult, setCheckoutResult] = useState<any>(null);
    const [orderNotes, setOrderNotes] = useState('');
    const [orderImages, setOrderImages] = useState<{ url: string; notes: string }[]>([]);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
    const [deadline, setDeadline] = useState<string>('');

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

    // Calcular reactivamente las fechas sugeridas por el taller al cambiar el carrito (por costurera)
    React.useEffect(() => {
        // 1. Group total hours by unique operator id selected
        const groupHoursMap: { [key: string]: number } = {};
        
        cart.forEach(item => {
            const opId = item.assignedOperatorId || 'unassigned';
            const hours = item.isCustom 
                ? Number(item.details?.hours || 0) 
                : getDefaultProductionHours(item.name, item.category);
            
            groupHoursMap[opId] = (groupHoursMap[opId] || 0) + hours;
        });

        const totalCartHours = Object.values(groupHoursMap).reduce((sum, h) => sum + h, 0);
        
        if (totalCartHours === 0) {
            setEstimatedDates(null);
            if (!adminOverride) {
                setDeadline('');
            }
            return;
        }

        setLoadingEstimatedDates(true);

        // 2. Fetch estimated dates for each group in parallel
        const promises = Object.entries(groupHoursMap).map(([opId, hours]) => {
            return getEstimatedDatesAction(hours, opId);
        });

        Promise.all(promises).then(results => {
            // Find the latest finalDeliveryDate
            let latestResult = results[0];
            for (let i = 1; i < results.length; i++) {
                if (new Date(results[i].finalDeliveryDate) > new Date(latestResult.finalDeliveryDate)) {
                    latestResult = results[i];
                }
            }

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
    }, []);    // Picker helpers
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
        
        const finalPrice = customPrice ? Math.round(Number(customPrice)) : Math.round(calculatedPrice);
        const hasDiscount = finalPrice < Math.round(calculatedPrice);
        const discountPct = hasDiscount ? Math.round(((Math.round(calculatedPrice) - finalPrice) / Math.round(calculatedPrice)) * 100) : 0;

        addToCart({
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
        });
        
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
        setAssignedOperatorId('unassigned');
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

    const handleCheckout = async () => {
        if (cart.length === 0 || !paymentMethod || !selectedCustomer) return;
        setIsProcessing(true);
        
        try {
            const orderId = Math.floor(Math.random() * 90000) + 10000;
            const dateStr = new Date().toLocaleDateString();

            const res = await createPOSOrdersAction({
                customerId: selectedCustomer.id,
                posOrderId: `order_${orderId}`,
                paymentMethod: paymentMethod,
                paymentStatus: 'pending',
                items: cart.map(item => ({
                    name: item.name,
                    price: item.price,
                    category: item.category,
                    notes: item.notes || '',
                    isCustom: !!item.isCustom,
                    hours: item.isCustom ? (item.details?.hours || 0) : getDefaultProductionHours(item.name, item.category),
                    assignedOperatorId: item.assignedOperatorId || 'unassigned'
                })),
                deadline: deadline || null,
                productionStartDate: adjustedDates?.productionStartDate || null,
                productionEndDate: adjustedDates?.productionEndDate || null,
                finalDeliveryDate: deadline || adjustedDates?.finalDeliveryDate || null
            });

            if (!res.success) {
                alert("Error al registrar la orden en producción: " + res.error);
                setIsProcessing(false);
                return;
            }

            // Generar link de pago solo si es Transbank (Online)
            let paymentUrl = '';
            if (paymentMethod === 'transbank') {
                try {
                    const buyOrder = `order_${orderId}`;
                    const sessionId = `session_${selectedCustomer.id}_${Date.now()}`;
                    const callbackUrl = `${window.location.origin}/admin/pos/webpay-callback`;
                    
                    console.log('Iniciando pago Transbank:', { buyOrder, sessionId, total, callbackUrl });
                    const tbkRes = await createWebpayTransaction(buyOrder, sessionId, total, callbackUrl);
                    if (tbkRes.success && tbkRes.url && tbkRes.token) {
                        paymentUrl = `${tbkRes.url}?token_ws=${tbkRes.token}`;
                    } else {
                        console.error('Error al generar la transacción de Transbank:', tbkRes.error);
                    }
                } catch (tbkErr) {
                    console.error('Excepción al generar la transacción de Transbank:', tbkErr);
                }
                
                if (!paymentUrl) {
                    paymentUrl = `https://webpay3gint.transbank.cl/webpayserver/initTransaction`;
                }
            }
            
            setCheckoutResult({
                orderId: orderId,
                customer: selectedCustomer,
                items: [...cart],
                total: total,
                method: paymentMethod,
                date: dateStr,
                deliveryDate: deadline,
                paymentUrl: paymentUrl
            });
            
            // Reset payment confirmed state for physical terminal polling
            setPaymentConfirmed(false);

            // Enviar automáticamente el correo de confirmación de orden si el cliente tiene correo
            if (selectedCustomer.email) {
                sendOrderConfirmationEmailAction({
                    customerEmail: selectedCustomer.email,
                    customerName: selectedCustomer.full_name,
                    orderId: orderId,
                    items: cart.map(item => ({
                        name: item.name,
                        price: item.price,
                        category: item.category,
                        notes: item.notes || '',
                        images: item.images || []
                    })),
                    total: total,
                    paymentMethod: paymentMethod,
                    date: dateStr,
                    deliveryDate: deadline || adjustedDates?.finalDeliveryDate || '',
                    deliveryWindowStart: adjustedDates?.config?.windowStart?.slice(0, 5) || '15:00',
                    deliveryWindowEnd: adjustedDates?.config?.windowEnd?.slice(0, 5) || '18:00',
                    paymentUrl: paymentUrl
                }).catch(err => {
                    console.error('Error al enviar correo automático de confirmación:', err);
                });
            }
            
            setCart([]);
            setPaymentMethod(null);
            setDeadline('');
            setDailyWorkload(null);
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
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
    };

    const generateBudgetLink = async () => {
        setIsProcessing(true);
        try {
            const budgetData = {
                cart: cart,
                total: total,
                date: new Date().toISOString()
            };
            const result = await saveBudgetAction(budgetData);
            
            if (result.success && result.id) {
                const baseUrl = window.location.origin;
                const link = `${baseUrl}/presupuesto?id=${result.id}`;
                setGeneratedLink(link);
                if (selectedCustomer) {
                    setClientPhone(selectedCustomer.phone || '');
                    setClientEmail(selectedCustomer.email || '');
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
                <h1 className="font-serif text-3xl text-brand-charcoal mb-8 flex items-center gap-3">
                    <ClipboardList className="w-8 h-8 text-brand-terracotta" />
                    Ingreso de Orden de Trabajo
                </h1>

                {/* Section 1: Client */}
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
                            <button onClick={() => setSelectedCustomer(null)} className="text-xs uppercase tracking-widest text-gray-400 hover:text-red-500 font-bold">Cambiar Cliente</button>
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

                            {/* Search Results Dropdown */}
                            {clientSearch && (
                                <div className="bg-white border border-gray-100 shadow-lg rounded-sm max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    {allCustomers.filter(c => c.full_name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))).map(c => (
                                        <div key={c.id} onClick={() => { setSelectedCustomer(c); setClientSearch(''); }} className="p-4 hover:bg-brand-sand/10 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center group">
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

                {/* Section 2: Service Details */}
                <div className={`bg-white p-6 md:p-8 rounded-sm border border-gray-100 shadow-sm space-y-6 transition-all ${!selectedCustomer ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand-terracotta border-b border-gray-100 pb-2 flex items-center gap-2 mb-6">
                        <Tag className="w-4 h-4" /> 2. Detalle del Trabajo
                    </h3>
                    
                    <div className="bg-brand-sand/10 border border-brand-sand/30 p-4 rounded-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-brand-charcoal uppercase tracking-wider flex items-center gap-1.5">👤 Asignar Costurera / Operaria responsable</p>
                            <p className="text-[10px] text-gray-500 leading-normal mt-0.5">Elige la costurera que realizará este trabajo para estimar la fecha de entrega según su backlog y agenda.</p>
                        </div>
                        <select
                            value={assignedOperatorId}
                            onChange={(e) => setAssignedOperatorId(e.target.value)}
                            className="text-xs uppercase font-bold text-brand-charcoal bg-white border border-gray-200 outline-none p-2.5 rounded-sm focus:border-brand-sand cursor-pointer min-w-[210px] transition-all"
                        >
                            <option value="unassigned">Sin asignar (Taller General)</option>
                            {operators.map((op: any) => (
                                <option key={op.id} value={op.id}>
                                    {op.name} ({op.daily_hours_capacity}h/d)
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Categoría Principal</label>
                            <select value={customOrderCategory} onChange={(e) => setCustomOrderCategory(e.target.value)} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta">
                                <option value="Diseño y confección">Diseño y confección</option>
                                <option value="Arreglos especializados">Arreglos especializados</option>
                                <option value="Catálogo de servicios">Catálogo de servicios</option>
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            {customOrderCategory !== 'Catálogo de servicios' && (
                                <>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Descripción del Trabajo *</label>
                                    <input type="text" value={customOrderName} onChange={(e) => setCustomOrderName(e.target.value)} placeholder="Ej. Ajuste de hombros vestido seda" className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                </>
                            )}
                        </div>
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
                                            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Notas Especiales / Especificaciones</label>
                                            <textarea 
                                                value={orderNotes}
                                                onChange={(e) => setOrderNotes(e.target.value)}
                                                placeholder="Detalles específicos para esta prenda (ej: basta con hilo invisible)..."
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

                                    {/* Action footer containing product total beside action button */}
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
                                                setAssignedOperatorId('unassigned');
                                            }}
                                            className="w-full sm:w-auto bg-brand-terracotta text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-white hover:text-brand-terracotta transition-all shadow-md active:scale-95 text-center"
                                        >
                                            Añadir a la Orden
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 pt-4 border-t border-gray-50 animate-in fade-in duration-500">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Análisis ERP de Costos y Margen</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Horas Taller Estimadas</label>
                                    <input type="number" min="0" value={hoursEstimated || ''} onChange={(e) => setHoursEstimated(Number(e.target.value))} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Insumos y Materiales</label>
                                    <input type="number" min="0" value={materialsCost || ''} onChange={(e) => setMaterialsCost(Number(e.target.value))} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Detalles / Pedrería / Extras</label>
                                    <input type="number" min="0" value={extraCost || ''} onChange={(e) => setExtraCost(Number(e.target.value))} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta" placeholder="0" />
                                </div>
                            </div>
                            
                            {/* Notes and Photo attachment for Custom Order */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-1">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Notas Especiales / Especificaciones</label>
                                    <textarea 
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        placeholder="Detalles específicos (medidas, tipo de tela, defectos a reparar, etc.)..."
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

                            <div className="flex flex-col md:flex-row justify-between items-center bg-brand-charcoal text-white p-6 rounded-sm mt-4 shadow-lg gap-6">
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
                                                type="number" 
                                                min="0" 
                                                value={customPrice} 
                                                onChange={(e) => setCustomPrice(e.target.value)} 
                                                placeholder={Math.round(calculatedPrice).toString()} 
                                                className="pl-7 pr-3 py-2.5 w-36 bg-white/10 border border-white/20 rounded-sm text-white text-sm font-bold outline-none focus:border-brand-sand focus:bg-white/15 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setCustomPrice(Math.round(calculatedPrice).toString())}
                                            className="px-3.5 py-2.5 bg-white/5 border border-white/20 hover:border-brand-sand rounded-sm text-[9px] uppercase tracking-widest font-bold text-white transition-all active:scale-95 cursor-pointer"
                                            title="Copiar precio sugerido"
                                        >
                                            Copiar Sugerido
                                        </button>
                                    </div>
                                    {/* Mostrar porcentaje de descuento */}
                                    {(() => {
                                        const finalPrice = customPrice ? Number(customPrice) : calculatedPrice;
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
                                    disabled={!customOrderName || (!hoursEstimated && !materialsCost && !extraCost)}
                                    className="w-full md:w-auto bg-brand-terracotta text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-white hover:text-brand-terracotta transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md">
                                    Añadir a la Orden
                                </button>
                            </div>
                        </div>
                    )}
                </div>
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
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">👤 Asignar:</span>
                                        <select
                                            value={item.assignedOperatorId || 'unassigned'}
                                            onChange={(e) => {
                                                const newCart = [...cart];
                                                newCart[i] = { ...newCart[i], assignedOperatorId: e.target.value };
                                                setCart(newCart);
                                            }}
                                            className="text-[9px] uppercase font-semibold text-brand-charcoal bg-white border border-gray-200 outline-none p-1 rounded-sm focus:border-brand-sand cursor-pointer max-w-[170px]"
                                        >
                                            <option value="unassigned">Sin asignar (Taller)</option>
                                            {operators.map((op: any) => (
                                                <option key={op.id} value={op.id}>
                                                    {op.name} ({op.daily_hours_capacity}h/d)
                                                </option>
                                            ))}
                                        </select>
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

                    {hasUnassignedItems && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-sm flex items-start gap-2 mt-6">
                            <span className="text-sm shrink-0 leading-none">⚠</span>
                            <div>
                                <strong className="font-bold block mb-0.5">Asignación Requerida</strong>
                                Debes asignar una costurera a cada una de las prendas en el carrito para poder habilitar el pago y emisión de boleta.
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-3 mt-6">
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
                            Mercado Pago Point
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
                            <CreditCard className="w-4 h-4 text-red-500" />
                            Webpay Plus
                        </button>
                        <button 
                            type="button"
                            disabled={hasUnassignedItems}
                            onClick={() => setPaymentMethod('cash')}
                            className={`flex flex-col items-center justify-center gap-2 py-3.5 text-[9px] uppercase tracking-widest transition-all rounded-sm border ${
                                hasUnassignedItems
                                    ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                                    : paymentMethod === 'cash'
                                        ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-sm font-bold'
                                        : 'border-gray-200 hover:border-brand-charcoal text-brand-charcoal bg-white cursor-pointer font-bold'
                            }`}>
                            <span className="text-sm leading-none">💵</span>
                            Efectivo / Transf
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-4">
                        <button 
                            type="button"
                            onClick={generateBudgetLink}
                            disabled={cart.length === 0}
                            className="w-full border border-brand-charcoal text-brand-charcoal py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            Generar Presupuesto Web (Link)
                        </button>
                        <button 
                            type="button"
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || !paymentMethod || !selectedCustomer || !deadline || isProcessing || hasUnassignedItems}
                            className={`w-full py-4 text-[10px] uppercase tracking-widest font-bold transition-all ${
                                cart.length === 0 || !paymentMethod || !selectedCustomer || !deadline || isProcessing || hasUnassignedItems
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                            }`}>
                            {isProcessing
                                ? 'Procesando...'
                                : hasUnassignedItems
                                    ? '⚠ Falta Asignar Costurera'
                                    : !selectedCustomer
                                        ? 'Falta Identificar Cliente'
                                        : !deadline
                                            ? '⚠ Falta Fecha y Hora de Entrega'
                                            : paymentMethod === 'mercadopago_point'
                                                ? 'Enviar a Terminal Físico'
                                                : paymentMethod === 'transbank'
                                                    ? 'Generar Link de Pago'
                                                    : 'Cobrar y Emitir Boleta'
                            }
                        </button>
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
                                    onClick={() => setIsBudgetModalOpen(false)}
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
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
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

                        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
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
                                    <p className="text-[10px] text-brand-terracotta font-bold uppercase mt-1">Metodo: {checkoutResult.method === 'mercadopago_point' ? 'Mercado Pago Point' : checkoutResult.method === 'transbank' ? 'Webpay Plus' : 'Efectivo'}</p>
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
                                                    <div>
                                                        <p className="text-[9px] uppercase text-gray-400">Horas Estimadas</p>
                                                        <p className="text-xs font-bold">{item.details.hours} hrs</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] uppercase text-gray-400">Costo Mat.</p>
                                                        <p className="text-xs font-bold">{formatCurrency(item.details.materials)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] uppercase text-gray-400">Extras</p>
                                                        <p className="text-xs font-bold">{formatCurrency(item.details.extra)}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Item-specific Notes and Image inside the Success/Print Modal */}
                                            {(item.notes || (item.images && item.images.length > 0)) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 print:break-inside-avoid">
                                                    {item.notes && (
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest font-bold text-brand-terracotta">Instrucciones Especiales</p>
                                                            <p className="text-xs text-gray-700 whitespace-pre-line italic leading-relaxed">
                                                                "{item.notes}"
                                                            </p>
                                                        </div>
                                                    )}
                                                    {item.images && item.images.length > 0 && (
                                                        <div className="space-y-3">
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
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-brand-sand/10 p-4 rounded-sm border border-brand-sand/30 text-center">
                                <p className="text-[10px] uppercase tracking-widest text-brand-charcoal mb-1">Total de la Orden</p>
                                <p className="text-3xl font-serif text-brand-terracotta">{formatCurrency(checkoutResult.total)}</p>
                            </div>

                            {!(checkoutResult.method === 'mercadopago_point' && !paymentConfirmed) && (
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
                                                            deliveryDate: checkoutResult.deliveryDate || ''
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
                                    <span>💳</span> {checkoutResult.method === 'transbank' ? 'Pagar con Webpay' : 'Pagar con Mercado Pago'}
                                </a>
                            )}
                            
                            {(checkoutResult.method === 'mercadopago_point' && !paymentConfirmed) ? (
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
                                </div>
                            ) : (
                                <button onClick={() => window.print()} className="flex-1 py-3 border border-brand-charcoal text-brand-charcoal text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all rounded-sm">
                                    {checkoutResult.method === 'mercadopago_point' ? '✅ Imprimir (Aprobado)' : 'Imprimir Orden (Taller)'}
                                </button>
                            )}
                            
                            <button onClick={handleCloseCheckout} className="flex-1 py-3 bg-brand-charcoal text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all rounded-sm">
                                Finalizar y Nueva Orden
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}

// Helper component for polling so we can use useEffect cleanly inside the conditionally rendered block
function PollingComponent({ checkoutResult, paymentConfirmed, setPaymentConfirmed }: any) {
    useEffect(() => {
        if (checkoutResult?.method !== 'mercadopago_point' || paymentConfirmed) return;
        
        let interval: NodeJS.Timeout;
        
        const checkStatus = async () => {
            try {
                const orderRef = `order_${checkoutResult.orderId}`;
                const res = await checkOrderStatusAction(orderRef);
                if (res.success && res.status === 'PAGADO') {
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
