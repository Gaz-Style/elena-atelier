'use client';

import React, { useState, useEffect } from 'react';
import { usePOS, CartItem } from './POSContext';
import { getCatalog } from '@/app/admin/catalog/actions';
import { ShoppingCart, Plus, Minus, Search, ArrowRight, ArrowLeft, Tag, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HauteCoutureModal } from './HauteCoutureModal';

const getDefaultProductionHours = (name: string, category: string): number => {
  const n = name.toLowerCase();
  if (n.includes('basta máquina') || n.includes('basta maquina')) return 0.5;
  if (n.includes('basta postizo')) return 1.0;
  if (n.includes('basta a mano')) return 1.5;
  if (n.includes('basta sesgo')) return 1.5;
  if (n.includes('basta vestido con cola')) return 3.0;
  if (n.includes('basta vestido s/cola')) return 2.0;
  if (category.toLowerCase().includes('bastas')) return 1.0;
  return 1.0; 
};

export default function Step2Cart() {
  const { cart, addToCart, removeFromCart, setCurrentStep, atelierConfig } = usePOS();
  const [catalog, setCatalog] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [showManual, setShowManual] = useState(false);
  const [isHcModalOpen, setIsHcModalOpen] = useState(false);
  const [workType, setWorkType] = useState('Arreglo Especializado');
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualHours, setManualHours] = useState('2');
  const [manualNotes, setManualNotes] = useState('');
  
  const hourlyRate = atelierConfig?.labor_hourly_rate || 25000;
  const marginPercentage = atelierConfig?.default_margin_percentage || 0;
  const suggestedPrice = React.useMemo(() => {
    const hours = Number(manualHours) || 0;
    const baseCost = hours * hourlyRate;
    return marginPercentage > 0 ? Math.round(baseCost / (1 - (marginPercentage / 100))) : baseCost;
  }, [manualHours, hourlyRate, marginPercentage]);
  
  useEffect(() => {
    getCatalog().then(res => {
      setCatalog(res);
      setIsLoading(false);
    });
  }, []);

  const categories = Array.from(new Set(catalog.map(c => c.category)));
  
  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item: any) => {
    addToCart({
      id: crypto.randomUUID(),
      name: item.name,
      price: item.price,
      category: item.category,
      isCustom: item.isCustom || false,
      details: {
        hours: getDefaultProductionHours(item.name, item.category),
        notes: ''
      }
    });
  };

  const handlePriceChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '');
    if (!digitsOnly) {
      setManualPrice('');
      return;
    }
    const parsed = parseInt(digitsOnly, 10);
    setManualPrice(parsed.toLocaleString('es-CL'));
  };

  const handleAddManual = () => {
    const finalName = manualName.trim() || workType;
    const finalPrice = Number(manualPrice.replace(/\./g, '')) || 0;

    addToCart({
      id: crypto.randomUUID(),
      name: finalName,
      price: finalPrice,
      category: workType,
      isCustom: true,
      details: { hours: Number(manualHours) || 0, notes: manualNotes.trim() }
    });
    setManualName('');
    setManualNotes('');
    setManualPrice('');
    setManualHours('2');
    setShowManual(false);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-zinc-900 mb-2">Servicios y Prendas</h2>
        <p className="text-zinc-500 text-sm">Selecciona los servicios del catálogo para esta orden.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Catálogo */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === '' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900"
                placeholder="Buscar servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant={showManual ? "default" : "outline"}
              className={`px-4 ${showManual ? "bg-zinc-900 text-white" : ""}`}
              onClick={() => setShowManual(!showManual)}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Manual</span>
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setIsHcModalOpen(true)}
            >
              <Sparkles className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Calculadora Alta Costura</span>
            </Button>
          </div>

          {showManual && (
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl flex flex-col gap-4 animate-in slide-in-from-top-2 shadow-sm">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 mb-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <h4 className="font-semibold text-zinc-900 text-sm">Ingreso Manual de Trabajo</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Tipo de Trabajo</label>
                  <select 
                    value={workType} 
                    onChange={e => setWorkType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Arreglo Especializado">Arreglo Especializado</option>
                    <option value="Diseño y Confección">Diseño y Confección</option>
                    <option value="Catálogo de Servicios">Catálogo de Servicios</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Cálculo de Horas Taller</label>
                  <input 
                    type="number" 
                    step="0.5"
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Ej: 2.5"
                    value={manualHours}
                    onChange={e => setManualHours(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Prenda / Artículo</label>
                  <input 
                    type="text" 
                    list="prendas-autocomplete"
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Ej: Pantalón, Vestido, Blusa..."
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                  />
                  <datalist id="prendas-autocomplete">
                    <option value="Pantalón" />
                    <option value="Blusa" />
                    <option value="Polera" />
                    <option value="Vestido" />
                    <option value="Chaqueta" />
                    <option value="Abrigo" />
                    <option value="Falda" />
                    <option value="Traje" />
                    <option value="Camisa" />
                    <option value="Jeans" />
                    <option value="Parka" />
                    <option value="Short" />
                    <option value="Enterito" />
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Detalle del Arreglo o Confección</label>
                <textarea 
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 custom-scrollbar resize-none h-20"
                  placeholder="Ej: Acortar basta 3cm, entubar desde la rodilla y ajustar pretina posterior..."
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-start-3">
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-medium text-zinc-700">Precio ($)</label>
                    <span className="text-[10px] text-emerald-600 font-medium">Sugerido: ${suggestedPrice.toLocaleString('es-CL')}</span>
                  </div>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="0"
                    value={manualPrice}
                    onChange={e => handlePriceChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-zinc-100 mt-2 gap-2">
                <Button variant="ghost" onClick={() => setShowManual(false)}>Cancelar</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAddManual}>
                  Añadir al Carrito
                </Button>
              </div>
            </div>
          )}

          {!showManual && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="col-span-full py-8 text-center text-zinc-500 text-sm">Cargando catálogo...</div>
              ) : filteredCatalog.length > 0 ? (
                filteredCatalog.map(item => (
                  <div key={item.id} className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col justify-between hover:border-zinc-300 transition-colors">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="font-semibold text-zinc-900 text-sm">{item.name}</h4>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-medium text-zinc-900">
                        ${item.price.toLocaleString('es-CL')}
                      </span>
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-zinc-500 text-sm">No se encontraron servicios.</div>
              )}
            </div>
          )}
        </div>

        {/* Carrito */}
        <div className="md:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-zinc-500" />
              <h3 className="font-semibold text-zinc-900">Resumen Orden</h3>
              <span className="ml-auto bg-zinc-200 text-zinc-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {cart.length}
              </span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-2">
                  <ShoppingCart className="w-8 h-8 opacity-20" />
                  <p className="text-sm">El carrito está vacío</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={item.id} className="flex gap-3 bg-zinc-50 border border-zinc-100 p-2.5 rounded-lg group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-zinc-500">{item.category}</p>
                      {item.details?.notes && (
                        <p className="text-[10px] text-zinc-400 mt-1 italic leading-tight line-clamp-2">
                          {item.details.notes}
                        </p>
                      )}
                      <p className="text-xs font-medium text-emerald-600 mt-0.5">${item.price.toLocaleString('es-CL')}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(idx)}
                      className="w-8 h-8 rounded-md bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-zinc-100 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-zinc-500">Total a Pagar</span>
                <span className="text-lg font-bold text-zinc-900">${total.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="px-3" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button 
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white" 
                  onClick={() => setCurrentStep(3)}
                  disabled={cart.length === 0}
                >
                  Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HauteCoutureModal 
        isOpen={isHcModalOpen} 
        onClose={() => setIsHcModalOpen(false)} 
        onAddToCart={addToCart} 
      />
    </div>
  );
}
