'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type POSStep = 1 | 2 | 3 | 4 | 5;

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  measurements?: any;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isCustom?: boolean;
  assignedOperatorId?: string;
  scheduledStartDate?: string;
  details?: any;
}

interface POSState {
  currentStep: POSStep;
  setCurrentStep: (step: POSStep) => void;
  posMode: 'new_sale' | 'pay_balance';
  setPosMode: (mode: 'new_sale' | 'pay_balance') => void;
  
  // Step 1: Customer
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  
  // Step 2: Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  updateCartItem: (index: number, updates: Partial<CartItem>) => void;
  
  // Step 3: Production & Dates
  deadline: string;
  setDeadline: (date: string) => void;
  estimatedDates: any;
  setEstimatedDates: (dates: any) => void;
  
  // Step 4: Payments
  paymentMethod: 'mercadopago_point' | 'transbank' | 'cash' | 'split' | null;
  setPaymentMethod: (method: any) => void;
  initialPaymentType: 'total' | '50percent' | 'zero';
  setInitialPaymentType: (type: any) => void;
  splitCardAmount: number;
  setSplitCardAmount: (amount: number) => void;
  splitCashAmount: number;
  setSplitCashAmount: (amount: number) => void;
  
  // General Data
  atelierConfig: any;
  setAtelierConfig: (config: any) => void;
  operators: any[];
  setOperators: (ops: any[]) => void;
  isCajaOpen: boolean | null;
  setIsCajaOpen: (isOpen: boolean) => void;

  checkoutResult: any;
  setCheckoutResult: (result: any) => void;

  pendingOrderToPay: { internal_id: string, balance: number, sale_id: number } | null;
  setPendingOrderToPay: (order: any) => void;
}

const POSContext = createContext<POSState | undefined>(undefined);

export function POSProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<POSStep>(1);
  const [posMode, setPosMode] = useState<'new_sale' | 'pay_balance'>('new_sale');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const addToCart = (item: CartItem) => setCart(prev => [...prev, item]);
  const removeFromCart = (index: number) => {
    setCart(prev => {
      const n = [...prev];
      n.splice(index, 1);
      return n;
    });
  };
  const clearCart = () => setCart([]);
  const updateCartItem = (index: number, updates: Partial<CartItem>) => {
    setCart(prev => {
      const n = [...prev];
      n[index] = { ...n[index], ...updates };
      return n;
    });
  };

  const [deadline, setDeadline] = useState('');
  const [estimatedDates, setEstimatedDates] = useState<any>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [initialPaymentType, setInitialPaymentType] = useState<any>('total');
  const [splitCardAmount, setSplitCardAmount] = useState(0);
  const [splitCashAmount, setSplitCashAmount] = useState(0);

  const [atelierConfig, setAtelierConfig] = useState<any>(null);
  const [operators, setOperators] = useState<any[]>([]);
  const [isCajaOpen, setIsCajaOpen] = useState<boolean | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [pendingOrderToPay, setPendingOrderToPay] = useState<any>(null);

  return (
    <POSContext.Provider value={{
      currentStep, setCurrentStep,
      posMode, setPosMode,
      selectedCustomer, setSelectedCustomer,
      cart, addToCart, removeFromCart, clearCart, updateCartItem,
      deadline, setDeadline,
      estimatedDates, setEstimatedDates,
      paymentMethod, setPaymentMethod,
      initialPaymentType, setInitialPaymentType,
      splitCardAmount, setSplitCardAmount,
      splitCashAmount, setSplitCashAmount,
      atelierConfig, setAtelierConfig,
      operators, setOperators,
      isCajaOpen, setIsCajaOpen,
      checkoutResult, setCheckoutResult,
      pendingOrderToPay, setPendingOrderToPay
    }}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
