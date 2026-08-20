'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Layers, 
  Settings, 
  DollarSign, 
  Printer, 
  RotateCcw, 
  Check,
  Info,
  Maximize2
} from 'lucide-react';

// Predefined Currencies
const currencySymbols: Record<string, string> = {
  CLP: '$',
  USD: '$',
  EUR: '€',
  MXN: '$',
  ARS: '$'
};

interface Pano {
  name: string;
  len: number;
  width: number;
}

export default function CalculadoraFundasPage() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'medidas' | 'telas' | 'tarifas'>('medidas');

  // Currency State
  const [currency, setCurrency] = useState('CLP');

  // Input states: Medidas
  const [anchoAsiento, setAnchoAsiento] = useState(160);
  const [profAsiento, setProfAsiento] = useState(60);
  const [caidaFrontal, setCaidaFrontal] = useState(35);
  
  const [altoFrontalResp, setAltoFrontalResp] = useState(50);
  const [grosorSupResp, setGrosorSupResp] = useState(15);
  const [altoTraseroResp, setAltoTraseroResp] = useState(75);

  const [anchoBrazo, setAnchoBrazo] = useState(25);
  const [altoIntBrazo, setAltoIntBrazo] = useState(25);
  const [altoExtBrazo, setAltoExtBrazo] = useState(60);
  const [largoBrazo, setLargoBrazo] = useState(85);

  // Cojines Sueltos
  const [tieneCojines, setTieneCojines] = useState(false);
  const [cantCojinesAsiento, setCantCojinesAsiento] = useState(2);
  const [anchoCojinAsiento, setAnchoCojinAsiento] = useState(80);
  const [profCojinAsiento, setProfCojinAsiento] = useState(60);
  const [grosorCojinAsiento, setGrosorCojinAsiento] = useState(12);

  const [cantCojinesResp, setCantCojinesResp] = useState(2);
  const [anchoCojinResp, setAnchoCojinResp] = useState(80);
  const [altoCojinResp, setAltoCojinResp] = useState(45);
  const [grosorCojinResp, setGrosorCojinResp] = useState(10);

  // Input states: Telas y Márgenes
  const [anchoRollo, setAnchoRollo] = useState(1.40);
  const [precioMetroTela, setPrecioMetroTela] = useState(8500);
  const [margenCostura, setMargenCostura] = useState(4); // in cm
  const [remetidoTuck, setRemetidoTuck] = useState(12); // in cm
  const [porcentajeDecatizado, setPorcentajeDecatizado] = useState(5); // %
  const [porcentajeCase, setPorcentajeCase] = useState(0); // %
  
  const [incluirVivos, setIncluirVivos] = useState(false);
  const [incluirFaldon, setIncluirFaldon] = useState(true);

  // Input states: Tarifario y Costos
  const [costoCorteBase, setCostoCorteBase] = useState(25000);
  const [tarifaMetroCostura, setTarifaMetroCostura] = useState(2500);
  const [tarifaMetroVivo, setTarifaMetroVivo] = useState(4500);
  const [costoInsumosFijos, setCostoInsumosFijos] = useState(12000);
  const [margenGanancia, setMargenGanancia] = useState(25); // %
  const [porcentajeIva, setPorcentajeIva] = useState(0); // %

  // Calculated Results State
  const [metrosTela140, setMetrosTela140] = useState(0);
  const [metrosTela280, setMetrosTela280] = useState(0);
  const [metrosCostura, setMetrosCostura] = useState(0);
  const [horasEstimadas, setHorasEstimadas] = useState(0);
  const [precioTotal, setPrecioTotal] = useState(0);
  const [panosCalculados, setPanosCalculados] = useState<Pano[]>([]);
  const [desgloseCostos, setDesgloseCostos] = useState({
    corteBase: 0,
    costuraRecta: 0,
    vivoPiping: 0,
    insumos: 0,
    subtotal: 0,
    ganancia: 0,
    iva: 0,
    total: 0
  });

  // Load Preset Handler
  const loadPreset = (type: 'foto' | 'estandar2' | 'poltrona') => {
    if (type === 'foto') {
      setAnchoAsiento(160);
      setProfAsiento(60);
      setCaidaFrontal(35);
      setAltoFrontalResp(50);
      setGrosorSupResp(15);
      setAltoTraseroResp(75);
      setAnchoBrazo(25);
      setAltoIntBrazo(25);
      setAltoExtBrazo(60);
      setLargoBrazo(85);
      setIncluirVivos(false);
      setIncluirFaldon(true);
      setTieneCojines(false);
    } else if (type === 'estandar2') {
      setAnchoAsiento(120);
      setProfAsiento(55);
      setCaidaFrontal(35);
      setAltoFrontalResp(45);
      setGrosorSupResp(12);
      setAltoTraseroResp(70);
      setAnchoBrazo(20);
      setAltoIntBrazo(20);
      setAltoExtBrazo(55);
      setLargoBrazo(80);
      setIncluirVivos(true);
      setTieneCojines(true);
      setCantCojinesAsiento(2);
      setAnchoCojinAsiento(60);
      setProfCojinAsiento(55);
      setGrosorCojinAsiento(12);
      setCantCojinesResp(2);
      setAnchoCojinResp(60);
      setAltoCojinResp(45);
      setGrosorCojinResp(10);
    } else if (type === 'poltrona') {
      setAnchoAsiento(60);
      setProfAsiento(50);
      setCaidaFrontal(35);
      setAltoFrontalResp(50);
      setGrosorSupResp(12);
      setAltoTraseroResp(75);
      setAnchoBrazo(15);
      setAltoIntBrazo(20);
      setAltoExtBrazo(55);
      setLargoBrazo(75);
      setIncluirVivos(true);
      setTieneCojines(true);
      setCantCojinesAsiento(1);
      setAnchoCojinAsiento(60);
      setProfCojinAsiento(50);
      setGrosorCojinAsiento(12);
      setCantCojinesResp(1);
      setAnchoCojinResp(60);
      setAltoCojinResp(50);
      setGrosorCojinResp(10);
    }
  };

  // Perform Calculations
  const calculate = () => {
    // Margins in meters
    const seamM = margenCostura / 100;
    const tuckM = remetidoTuck / 100;

    // Structure pieces sizes (in meters)
    const wSeat = (anchoAsiento / 100) + (seamM * 2);
    const lSeatDrop = (profAsiento / 100) + (caidaFrontal / 100) + tuckM + seamM;

    const lBackFront = (altoFrontalResp / 100) + (grosorSupResp / 100) + tuckM + seamM;
    const lBackRear = (altoTraseroResp / 100) + (grosorSupResp / 100) + seamM;

    const lArmWrap = (altoIntBrazo / 100) + (anchoBrazo / 100) + (altoExtBrazo / 100) + tuckM + (seamM * 2);
    const wArmDepth = (largoBrazo / 100) + (seamM * 2);

    const wArmCap = (anchoBrazo / 100) + (seamM * 2);
    const hArmCap = (altoExtBrazo / 100) + (seamM * 2);

    // Initial base panos
    const panos: Pano[] = [
      { name: "Cuerpo Asiento y Faldón", len: lSeatDrop, width: wSeat },
      { name: "Respaldo Frontal", len: lBackFront, width: wSeat },
      { name: "Respaldo Trasero", len: lBackRear, width: wSeat },
      { name: "Manto Brazo Izquierdo", len: lArmWrap, width: wArmDepth },
      { name: "Manto Brazo Derecho", len: lArmWrap, width: wArmDepth },
      { name: "Tapa Frente Brazo Izq.", len: hArmCap, width: wArmCap },
      { name: "Tapa Frente Brazo Der.", len: hArmCap, width: wArmCap }
    ];

    let extraSeamCushions = 0;
    let pipingMeters = incluirVivos ? ((anchoAsiento * 2 + largoBrazo * 4 + altoExtBrazo * 4) / 100) : 0;

    // Cojines Asiento
    if (tieneCojines && cantCojinesAsiento > 0) {
      const wCoj = (anchoCojinAsiento / 100) + (seamM * 2);
      const lCoj = (profCojinAsiento / 100) + (seamM * 2);
      const fuelleCoj = (grosorCojinAsiento / 100) + (seamM * 2);
      const lenFuelle = (anchoCojinAsiento * 2 + profCojinAsiento * 2) / 100;

      for (let i = 1; i <= cantCojinesAsiento; i++) {
        panos.push({ name: `Cojín Asiento ${i} (Caras S/I)`, len: lCoj * 2, width: wCoj });
        panos.push({ name: `Cojín Asiento ${i} (Fuelle/Banda)`, len: fuelleCoj, width: lenFuelle });
        
        const perim = ((anchoCojinAsiento + profCojinAsiento) * 2) / 100;
        extraSeamCushions += (perim * 2) + (anchoCojinAsiento / 100);
        if (incluirVivos) pipingMeters += (perim * 2);
      }
    }

    // Cojines Respaldo
    if (tieneCojines && cantCojinesResp > 0) {
      const wCoj = (anchoCojinResp / 100) + (seamM * 2);
      const lCoj = (altoCojinResp / 100) + (seamM * 2);
      const fuelleCoj = (grosorCojinResp / 100) + (seamM * 2);
      const lenFuelle = (anchoCojinResp * 2 + altoCojinResp * 2) / 100;

      for (let i = 1; i <= cantCojinesResp; i++) {
        panos.push({ name: `Cojín Respaldo ${i} (Caras F/A)`, len: lCoj * 2, width: wCoj });
        panos.push({ name: `Cojín Respaldo ${i} (Fuelle/Banda)`, len: fuelleCoj, width: lenFuelle });
        
        const perim = ((anchoCojinResp + altoCojinResp) * 2) / 100;
        extraSeamCushions += (perim * 2) + (anchoCojinResp / 100);
        if (incluirVivos) pipingMeters += (perim * 2);
      }
    }

    // Costuras de estructura estimadas
    // Uniones: Asiento a Respaldo, Asiento a Faldon, Asiento a Brazos (x2), Respaldo a Trasero, Respaldo a Brazos (x2)
    const costurasEstructura = 
      (anchoAsiento / 100) * 3 + 
      (largoBrazo / 100) * 2 + 
      (altoExtBrazo / 100) * 4 + 
      (altoFrontalResp / 100) * 2;

    const totalCosturaLineal = costurasEstructura + extraSeamCushions;

    // Faldon separado adicional
    if (incluirFaldon) {
      const perimFaldon = (anchoAsiento + (anchoBrazo * 2) + largoBrazo * 2) / 100;
      panos.push({ name: "Faldón Inferior Perimetral", len: (caidaFrontal / 100) + (seamM * 2), width: perimFaldon });
    }

    // Fabric layout logic (greedy approach to arrange into 1.40m roll)
    let totalLen140 = 0;
    let totalLen280 = 0;

    panos.forEach(p => {
      // For roll width 1.40m
      const roll140 = 1.40;
      const fitNormal = Math.ceil(p.width / roll140);
      const fitRotated = Math.ceil(p.len / roll140);

      // We choose the layout option that uses less linear meters
      const costNormal = fitNormal * p.len;
      const costRotated = fitRotated * p.width;

      if (costNormal <= costRotated) {
        totalLen140 += costNormal;
      } else {
        totalLen140 += costRotated;
      }

      // For roll width 2.80m
      const roll280 = 2.80;
      const fitNormal280 = Math.ceil(p.width / roll280);
      const fitRotated280 = Math.ceil(p.len / roll280);

      const costNormal280 = fitNormal280 * p.len;
      const costRotated280 = fitRotated280 * p.width;

      if (costNormal280 <= costRotated280) {
        totalLen280 += costNormal280;
      } else {
        totalLen280 += costRotated280;
      }
    });

    // Add decatizing and pattern matching percentages
    const multiplier = 1 + (porcentajeDecatizado / 100) + (porcentajeCase / 100);
    const finalMeters140 = Math.max(0, parseFloat((totalLen140 * multiplier).toFixed(1)));
    const finalMeters280 = Math.max(0, parseFloat((totalLen280 * multiplier).toFixed(1)));

    // Budget Calculations
    const costCorte = costoCorteBase;
    const costCostura = totalCosturaLineal * tarifaMetroCostura;
    const costVivo = pipingMeters * tarifaMetroVivo;
    const costInsumos = costoInsumosFijos;

    // Add extra price for fabric if included
    const costTela = finalMeters140 * precioMetroTela;

    const subtotal = costCorte + costCostura + costVivo + costInsumos + costTela;
    const ganancia = subtotal * (margenGanancia / 100);
    const iva = (subtotal + ganancia) * (porcentajeIva / 100);
    const total = subtotal + ganancia + iva;

    // Update States
    setMetrosTela140(finalMeters140);
    setMetrosTela280(finalMeters280);
    setMetrosCostura(parseFloat(totalCosturaLineal.toFixed(1)));
    setHorasEstimadas(parseFloat((totalCosturaLineal * 0.4).toFixed(1))); // 0.4 hours per seam meter
    setPrecioTotal(Math.round(total));
    setPanosCalculados(panos);
    setDesgloseCostos({
      corteBase: costCorte,
      costuraRecta: Math.round(costCostura),
      vivoPiping: Math.round(costVivo),
      insumos: Math.round(costInsumos + costTela),
      subtotal: Math.round(subtotal),
      ganancia: Math.round(ganancia),
      iva: Math.round(iva),
      total: Math.round(total)
    });
  };

  useEffect(() => {
    calculate();
  }, [
    anchoAsiento, profAsiento, caidaFrontal, altoFrontalResp, grosorSupResp, altoTraseroResp,
    anchoBrazo, altoIntBrazo, altoExtBrazo, largoBrazo, tieneCojines, cantCojinesAsiento,
    anchoCojinAsiento, profCojinAsiento, grosorCojinAsiento, cantCojinesResp, anchoCojinResp,
    altoCojinResp, grosorCojinResp, anchoRollo, precioMetroTela, margenCostura, remetidoTuck,
    porcentajeDecatizado, porcentajeCase, incluirVivos, incluirFaldon, costoCorteBase,
    tarifaMetroCostura, tarifaMetroVivo, costoInsumosFijos, margenGanancia, porcentajeIva
  ]);

  const symbol = currencySymbols[currency] || '$';

  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-800 font-sans pb-16">
      {/* Navbar / Header */}
      <header className="bg-zinc-950 text-white shadow-xl no-print">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-rose-400 to-amber-500 p-2.5 rounded-xl shadow-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide font-serif">Calculadora de Fundas & Tapicería</h1>
              <p className="text-xs text-zinc-400">Presupuestos técnicos y consumo de materiales de alta precisión</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mr-1">Preajustes Rápidos:</span>
            <button 
              onClick={() => loadPreset('foto')} 
              className="bg-zinc-800 hover:bg-zinc-700 text-xs px-3 py-1.5 rounded-lg text-zinc-200 border border-zinc-700 transition"
            >
              🛋️ Sillón Recto
            </button>
            <button 
              onClick={() => loadPreset('estandar2')} 
              className="bg-zinc-800 hover:bg-zinc-700 text-xs px-3 py-1.5 rounded-lg text-zinc-200 border border-zinc-700 transition"
            >
              Sofá 2 Cuerpos
            </button>
            <button 
              onClick={() => loadPreset('poltrona')} 
              className="bg-zinc-800 hover:bg-zinc-700 text-xs px-3 py-1.5 rounded-lg text-zinc-200 border border-zinc-700 transition"
            >
              Poltrona 1C
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 no-print">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Side (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-200 bg-white rounded-t-2xl px-3 pt-3 shadow-sm border border-zinc-200/80">
              {[
                { id: 'medidas', label: 'Dimensiones', icon: Layers },
                { id: 'telas', label: 'Telas y Márgenes', icon: Settings },
                { id: 'tarifas', label: 'Costos y Taller', icon: DollarSign }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 px-5 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === tab.id 
                      ? 'border-rose-400 text-zinc-950' 
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: MEDIDAS */}
            {activeTab === 'medidas' && (
              <div className="bg-white p-6 rounded-b-2xl rounded-tr-2xl shadow-sm border border-zinc-200/80 space-y-6">
                <div>
                  <h2 className="font-serif text-lg text-zinc-900">Estructura del Mueble</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Ingresa las medidas del sillón base en centímetros (cm)</p>
                </div>

                {/* Asiento */}
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-wider font-bold text-rose-500 border-b pb-1">1. Asiento y Faldón</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">Ancho Interior</label>
                      <div className="relative">
                        <input type="number" value={anchoAsiento} onChange={e => setAnchoAsiento(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-300 focus:outline-none" />
                        <span className="absolute right-3 top-2 text-xs text-zinc-400">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">Profundidad</label>
                      <div className="relative">
                        <input type="number" value={profAsiento} onChange={e => setProfAsiento(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-300 focus:outline-none" />
                        <span className="absolute right-3 top-2 text-xs text-zinc-400">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">Caída Frontal</label>
                      <div className="relative">
                        <input type="number" value={caidaFrontal} onChange={e => setCaidaFrontal(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-300 focus:outline-none" />
                        <span className="absolute right-3 top-2 text-xs text-zinc-400">cm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Respaldo */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-[10px] uppercase tracking-wider font-bold text-rose-500 border-b pb-1">2. Respaldo</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">Alto Frontal</label>
                      <div className="relative">
                        <input type="number" value={altoFrontalResp} onChange={e => setAltoFrontalResp(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-300 focus:outline-none" />
                        <span className="absolute right-3 top-2 text-xs text-zinc-400">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">Grosor Superior</label>
                      <div className="relative">
                        <input type="number" value={grosorSupResp} onChange={e => setGrosorSupResp(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-300 focus:outline-none" />
                        <span className="absolute right-3 top-2 text-xs text-zinc-400">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">Alto Trasero</label>
                      <div className="relative">
                        <input type="number" value={altoTraseroResp} onChange={e => setAltoTraseroResp(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-300 focus:outline-none" />
                        <span className="absolute right-3 top-2 text-xs text-zinc-400">cm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apoyabrazos */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-[10px] uppercase tracking-wider font-bold text-rose-500 border-b pb-1">3. Apoya Brazos (Por brazo)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">Ancho / Grosor</label>
                      <div className="relative">
                        <input type="number" value={anchoBrazo} onChange={e => setAnchoBrazo(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-300 focus:outline-none" />
                        <span className="absolute right-2 top-2 text-[10px] text-zinc-400">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">Alto Interior</label>
                      <div className="relative">
                        <input type="number" value={altoIntBrazo} onChange={e => setAltoIntBrazo(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-300 focus:outline-none" />
                        <span className="absolute right-2 top-2 text-[10px] text-zinc-400">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">Alto Exterior</label>
                      <div className="relative">
                        <input type="number" value={altoExtBrazo} onChange={e => setAltoExtBrazo(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-300 focus:outline-none" />
                        <span className="absolute right-2 top-2 text-[10px] text-zinc-400">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">Largo Total</label>
                      <div className="relative">
                        <input type="number" value={largoBrazo} onChange={e => setLargoBrazo(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rose-300 focus:outline-none" />
                        <span className="absolute right-2 top-2 text-[10px] text-zinc-400">cm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cojines Desmontables */}
                <div className="space-y-4 pt-3 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] uppercase tracking-wider font-bold text-rose-500">4. Cojines Desmontables</h3>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={tieneCojines} 
                        onChange={e => setTieneCojines(e.target.checked)} 
                        className="rounded border-zinc-300 text-rose-500 focus:ring-rose-400 h-4 w-4" 
                      />
                      <span className="text-xs font-bold text-zinc-700">Incluir Cojines Separados</span>
                    </label>
                  </div>

                  {tieneCojines && (
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-4">
                      {/* Cojines Asiento */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-zinc-700 block">Cojines de Asiento</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-0.5">Cantidad</label>
                            <input type="number" value={cantCojinesAsiento} onChange={e => setCantCojinesAsiento(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-0.5">Ancho (cm)</label>
                            <input type="number" value={anchoCojinAsiento} onChange={e => setAnchoCojinAsiento(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-0.5">Profundidad (cm)</label>
                            <input type="number" value={profCojinAsiento} onChange={e => setProfCojinAsiento(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-0.5">Fuelle/Espesor (cm)</label>
                            <input type="number" value={grosorCojinAsiento} onChange={e => setGrosorCojinAsiento(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                          </div>
                        </div>
                      </div>

                      {/* Cojines Respaldo */}
                      <div className="space-y-2 pt-2 border-t border-zinc-200/60">
                        <span className="text-xs font-bold text-zinc-700 block">Cojines de Respaldo / Decorativos</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-0.5">Cantidad</label>
                            <input type="number" value={cantCojinesResp} onChange={e => setCantCojinesResp(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-0.5">Ancho (cm)</label>
                            <input type="number" value={anchoCojinResp} onChange={e => setAnchoCojinResp(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-0.5">Alto (cm)</label>
                            <input type="number" value={altoCojinResp} onChange={e => setAltoCojinResp(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-0.5">Fuelle/Espesor (cm)</label>
                            <input type="number" value={grosorCojinResp} onChange={e => setGrosorCojinResp(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SVG Visual Schema */}
                <div className="bg-zinc-950 rounded-2xl p-5 text-white space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-rose-300">💡 Diagrama de Referencia de Calce</span>
                    <span className="font-mono text-zinc-400">
                      Cuerpo exterior total: {Math.round(anchoAsiento + (anchoBrazo * 2))} x {Math.round(largoBrazo)} x {Math.round(Math.max(altoTraseroResp, altoExtBrazo))} cm
                    </span>
                  </div>
                  <div className="relative w-full h-48 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                    <svg viewBox="0 0 500 240" className="w-full h-full max-h-44">
                      {/* Base Frame */}
                      <rect x="70" y="140" width="360" height="60" rx="4" fill="#27272a" stroke="#3f3f46" strokeWidth="2"/>
                      {/* Backrest */}
                      <rect x="70" y="50" width="360" height="90" rx="8" fill="#3f3f46" stroke="#52525b" strokeWidth="2"/>
                      {/* Armrest Left */}
                      <rect x="50" y="90" width="60" height="110" rx="6" fill="#18181b" stroke="#fb7185" strokeWidth="2"/>
                      {/* Armrest Right */}
                      <rect x="390" y="90" width="60" height="110" rx="6" fill="#18181b" stroke="#fb7185" strokeWidth="2"/>
                      {/* Seat Area */}
                      <rect x="110" y="130" width="280" height="40" rx="4" fill="#fb7185" fillOpacity="0.15" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4"/>
                      
                      {/* Dimensions labels */}
                      <line x1="110" y1="120" x2="390" y2="120" stroke="#f59e0b" strokeWidth="2" />
                      <text x="250" y="115" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">Ancho Asiento ({anchoAsiento}cm)</text>

                      <line x1="50" y1="80" x2="110" y2="80" stroke="#c084fc" strokeWidth="2"/>
                      <text x="80" y="73" textAnchor="middle" fill="#c084fc" fontSize="10">Brazo ({anchoBrazo})</text>

                      <line x1="250" y1="50" x2="250" y2="130" stroke="#38bdf8" strokeWidth="2"/>
                      <text x="255" y="90" textAnchor="start" fill="#38bdf8" fontSize="10">Alto Resp. ({altoFrontalResp})</text>

                      <line x1="250" y1="170" x2="250" y2="200" stroke="#4ade80" strokeWidth="2"/>
                      <text x="255" y="190" fill="#4ade80" fontSize="10">Faldón ({caidaFrontal})</text>
                    </svg>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: TELAS */}
            {activeTab === 'telas' && (
              <div className="bg-white p-6 rounded-b-2xl rounded-tr-2xl shadow-sm border border-zinc-200/80 space-y-6">
                <div>
                  <h2 className="font-serif text-lg text-zinc-900">Configuración de Tela y Encogimiento</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Parámetros del rollo textil y holguras técnicas</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Ancho del Rollo de Tela</label>
                    <select value={anchoRollo} onChange={e => setAnchoRollo(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                      <option value="1.40">1,40 metros (Estándar Tapicería)</option>
                      <option value="2.80">2,80 metros (Doble Ancho)</option>
                      <option value="1.50">1,50 metros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Precio por Metro de Tela</label>
                    <div className="relative">
                      <input type="number" value={precioMetroTela} onChange={e => setPrecioMetroTela(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                      <span className="absolute right-3 top-2 text-xs text-zinc-400">{symbol}</span>
                    </div>
                  </div>
                </div>

                {/* Technical Margins */}
                <div className="bg-rose-50/30 p-5 rounded-2xl border border-rose-100 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700">Holguras y Márgenes Técnicos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Margen Costura</label>
                      <div className="relative">
                        <input type="number" value={margenCostura} onChange={e => setMargenCostura(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                        <span className="absolute right-2 top-1.5 text-[10px] text-zinc-400">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Remetido (Tuck-in)</label>
                      <div className="relative">
                        <input type="number" value={remetidoTuck} onChange={e => setRemetidoTuck(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                        <span className="absolute right-2 top-1.5 text-[10px] text-zinc-400">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Encogimiento (LAVADO)</label>
                      <div className="relative">
                        <input type="number" value={porcentajeDecatizado} onChange={e => setPorcentajeDecatizado(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                        <span className="absolute right-2 top-1.5 text-[10px] text-zinc-400">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Case Estampado</label>
                      <div className="relative">
                        <input type="number" value={porcentajeCase} onChange={e => setPorcentajeCase(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                        <span className="absolute right-2 top-1.5 text-[10px] text-zinc-400">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extras options */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Opciones Adicionales de Estilo</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-start gap-3 p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl cursor-pointer hover:bg-zinc-100/50 transition">
                      <input 
                        type="checkbox" 
                        checked={incluirVivos} 
                        onChange={e => setIncluirVivos(e.target.checked)} 
                        className="rounded border-zinc-300 text-rose-500 focus:ring-rose-400 mt-1 h-4.5 w-4.5" 
                      />
                      <div className="text-xs">
                        <span className="font-bold text-zinc-800 block">Vivos / Cordón Perimetral (Piping)</span>
                        <span className="text-zinc-500 mt-0.5 block">Calcula tela extra al bies para cordón decorativo en costuras.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl cursor-pointer hover:bg-zinc-100/50 transition">
                      <input 
                        type="checkbox" 
                        checked={incluirFaldon} 
                        onChange={e => setIncluirFaldon(e.target.checked)} 
                        className="rounded border-zinc-300 text-rose-500 focus:ring-rose-400 mt-1 h-4.5 w-4.5" 
                      />
                      <div className="text-xs">
                        <span className="font-bold text-zinc-800 block">Zócalo / Faldón Base Separado</span>
                        <span className="text-zinc-500 mt-0.5 block">Añade metros de tela para una banda perimetral estética en la base.</span>
                      </div>
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: COSTOS */}
            {activeTab === 'tarifas' && (
              <div className="bg-white p-6 rounded-b-2xl rounded-tr-2xl shadow-sm border border-zinc-200/80 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-serif text-lg text-zinc-900">Tarifario de Mano de Obra</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">Parámetros de cobro del taller de costura</p>
                  </div>
                  <select 
                    value={currency} 
                    onChange={e => setCurrency(e.target.value)} 
                    className="bg-zinc-100 border border-zinc-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="CLP">CLP ($)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="MXN">MXN ($)</option>
                    <option value="ARS">ARS ($)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Base Trazado y Corte</label>
                    <div className="relative">
                      <input type="number" value={costoCorteBase} onChange={e => setCostoCorteBase(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                      <span className="absolute right-3 top-2 text-xs text-zinc-400">{symbol}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Mano de Obra Costura (x Metro Lineal)</label>
                    <div className="relative">
                      <input type="number" value={tarifaMetroCostura} onChange={e => setTarifaMetroCostura(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                      <span className="absolute right-3 top-2 text-xs text-zinc-400">{symbol}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Recargo Confección Vivo (x Metro)</label>
                    <div className="relative">
                      <input type="number" value={tarifaMetroVivo} onChange={e => setTarifaMetroVivo(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                      <span className="absolute right-3 top-2 text-xs text-zinc-400">{symbol}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Costo Insumos Fijos (Hilos, Cierres)</label>
                    <div className="relative">
                      <input type="number" value={costoInsumosFijos} onChange={e => setCostoInsumosFijos(Number(e.target.value))} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                      <span className="absolute right-3 top-2 text-xs text-zinc-400">{symbol}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/60 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">Margen Comercial e Impuestos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">Margen de Utilidad del Taller</label>
                      <div className="relative">
                        <input type="number" value={margenGanancia} onChange={e => setMargenGanancia(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                        <span className="absolute right-3 top-2 text-xs text-zinc-400">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1">Impuesto Local / IVA</label>
                      <div className="relative">
                        <input type="number" value={porcentajeIva} onChange={e => setPorcentajeIva(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                        <span className="absolute right-3 top-2 text-xs text-zinc-400">%</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Results Side (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Main Result Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 block mb-3">Resultados del Cálculo</span>
              
              <div className="space-y-4">
                
                {/* Metraje Tela */}
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Tela Consumo</span>
                    <h3 className="text-3xl font-bold mt-1 font-serif text-white">{metrosTela140} m</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Ancho {anchoRollo}m</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-white/10 px-3 py-1 rounded-lg text-xs font-mono font-bold text-zinc-300">
                      {metrosTela280} m <span className="text-[10px] text-zinc-500 font-sans font-normal">(en 2.80m)</span>
                    </span>
                  </div>
                </div>

                {/* Costura */}
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Costuras Planificadas</span>
                    <h3 className="text-3xl font-bold mt-1 font-serif text-rose-400">{metrosCostura} m</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Lineales totales</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-300 font-bold block">{horasEstimadas} hrs</span>
                    <span className="text-[9px] text-zinc-500 block">Tiempo estimado</span>
                  </div>
                </div>

                {/* Presupuesto */}
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
                  <span className="text-[10px] text-rose-300 uppercase font-bold tracking-wider">Presupuesto Estimado</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <h2 className="text-3xl font-extrabold text-emerald-400 font-serif">
                      {symbol}{precioTotal.toLocaleString('es-CL')}
                    </h2>
                    <span className="text-xs font-mono font-bold text-zinc-400">{currency}</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 mt-1">
                    Mano de obra: {symbol}{desgloseCostos.subtotal.toLocaleString('es-CL')} | Utilidad: {symbol}{desgloseCostos.ganancia.toLocaleString('es-CL')}
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-2 flex gap-3">
                <button 
                  onClick={() => window.print()} 
                  className="w-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Cotización / PDF
                </button>
              </div>

            </div>

            {/* Paños Breakdown */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b pb-2 flex justify-between items-center">
                <span>Desglose de Paños de Tela</span>
                <span className="text-[10px] font-normal text-zinc-500">Márgenes incluidos</span>
              </h3>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {panosCalculados.map((pano, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium text-zinc-700">{pano.name}</span>
                    <span className="font-mono text-zinc-500">
                      {pano.len.toFixed(2)}m x {pano.width.toFixed(2)}m
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Costs Table */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b pb-2">Desglose de Costos de Taller</h3>
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-zinc-100">
                  <tr className="py-2 flex justify-between text-zinc-600">
                    <td className="py-1">Trazado y corte fijo</td>
                    <td className="py-1 font-mono font-bold text-zinc-800">{symbol}{desgloseCostos.corteBase.toLocaleString('es-CL')}</td>
                  </tr>
                  <tr className="py-2 flex justify-between text-zinc-600">
                    <td className="py-1">Confección costura recta</td>
                    <td className="py-1 font-mono font-bold text-zinc-800">{symbol}{desgloseCostos.costuraRecta.toLocaleString('es-CL')}</td>
                  </tr>
                  <tr className="py-2 flex justify-between text-zinc-600">
                    <td className="py-1">Mano de obra vivo/piping</td>
                    <td className="py-1 font-mono font-bold text-zinc-800">{symbol}{desgloseCostos.vivoPiping.toLocaleString('es-CL')}</td>
                  </tr>
                  <tr className="py-2 flex justify-between text-zinc-600">
                    <td className="py-1">Insumos y tela del taller</td>
                    <td className="py-1 font-mono font-bold text-zinc-800">{symbol}{desgloseCostos.insumos.toLocaleString('es-CL')}</td>
                  </tr>
                  <tr className="py-2 flex justify-between font-bold text-zinc-900 border-t pt-2 mt-1">
                    <td className="py-1">Utilidad del Taller ({margenGanancia}%)</td>
                    <td className="py-1 font-mono">{symbol}{desgloseCostos.ganancia.toLocaleString('es-CL')}</td>
                  </tr>
                  {porcentajeIva > 0 && (
                    <tr className="py-2 flex justify-between text-zinc-600">
                      <td className="py-1">IVA / Impuesto ({porcentajeIva}%)</td>
                      <td className="py-1 font-mono font-bold text-zinc-800">{symbol}{desgloseCostos.iva.toLocaleString('es-CL')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </main>

      {/* PRINT-ONLY VIEW */}
      <div className="print-only p-12 max-w-4xl mx-auto space-y-8">
        <div className="border-b-2 border-zinc-950 pb-5 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-serif font-bold text-zinc-900">PRESUPUESTO DE TAPICERÍA Y CONFECCIÓN</h1>
            <p className="text-xs text-zinc-500 mt-1">Elena Atelier · Presupuesto Técnico a Medida</p>
          </div>
          <div className="text-right text-xs text-zinc-400">
            <p>Fecha de emisión: {new Date().toLocaleDateString('es-CL')}</p>
            <p>Validez: 15 días</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-xs bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
          <div>
            <h4 className="font-bold text-zinc-800 mb-1.5 uppercase tracking-wider text-[10px] text-rose-500">Detalles del Mueble</h4>
            <p className="font-semibold text-zinc-700">Sofá / Sillón de Confección Especial</p>
            <p className="text-zinc-500 mt-1">Ancho Asiento: {anchoAsiento}cm | Respaldo Trasero: {altoTraseroResp}cm | Largo Brazo: {largoBrazo}cm</p>
            <p className="text-zinc-500 mt-0.5">Dimensiones exteriores: {Math.round(anchoAsiento + (anchoBrazo * 2))}x{largoBrazo}x{Math.max(altoTraseroResp, altoExtBrazo)} cm</p>
          </div>
          <div>
            <h4 className="font-bold text-zinc-800 mb-1.5 uppercase tracking-wider text-[10px] text-rose-500">Detalles de Materiales</h4>
            <p className="text-zinc-500">Consumo estimado de tela: <strong className="text-zinc-800 font-semibold">{metrosTela140} metros</strong> (para rollo de {anchoRollo}m de ancho)</p>
            <p className="text-zinc-500 mt-1">Costura lineal efectiva: {metrosCostura} metros</p>
            <p className="text-zinc-500 mt-0.5">{incluirVivos ? 'Con terminación de vivo/piping' : 'Terminación costura recta simple'}</p>
          </div>
        </div>

        <table className="w-full text-xs text-left border-collapse border border-zinc-200">
          <thead>
            <tr className="bg-zinc-100 border-b border-zinc-200">
              <th className="p-3 font-semibold text-zinc-800">Concepto / Item</th>
              <th className="p-3 font-semibold text-zinc-800 text-center">Unidad / Metraje</th>
              <th className="p-3 font-semibold text-zinc-800 text-right">Valor Unitario</th>
              <th className="p-3 font-semibold text-zinc-800 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-zinc-700">
            <tr>
              <td className="p-3">Servicio de Trazado y Corte Base</td>
              <td className="p-3 text-center">1 Global</td>
              <td className="p-3 text-right">{symbol}{costoCorteBase.toLocaleString('es-CL')}</td>
              <td className="p-3 text-right">{symbol}{desgloseCostos.corteBase.toLocaleString('es-CL')}</td>
            </tr>
            <tr>
              <td className="p-3">Confección Costura Recta / Remalle</td>
              <td className="p-3 text-center">{metrosCostura} m</td>
              <td className="p-3 text-right">{symbol}{tarifaMetroCostura.toLocaleString('es-CL')}</td>
              <td className="p-3 text-right">{symbol}{desgloseCostos.costuraRecta.toLocaleString('es-CL')}</td>
            </tr>
            {incluirVivos && (
              <tr>
                <td className="p-3">Mano de Obra Vivo / Piping Especial</td>
                <td className="p-3 text-center">Detalle Vivo</td>
                <td className="p-3 text-right">{symbol}{tarifaMetroVivo.toLocaleString('es-CL')}</td>
                <td className="p-3 text-right">{symbol}{desgloseCostos.vivoPiping.toLocaleString('es-CL')}</td>
              </tr>
            )}
            <tr>
              <td className="p-3">Insumos y Adicionales (Cierres, Hilos, Material de Taller)</td>
              <td className="p-3 text-center">1 Global</td>
              <td className="p-3 text-right">{symbol}{costoInsumosFijos.toLocaleString('es-CL')}</td>
              <td className="p-3 text-right">{symbol}{desgloseCostos.insumos.toLocaleString('es-CL')}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end pt-4 border-t border-zinc-200">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Costo Técnico Directo:</span>
              <span>{symbol}{desgloseCostos.subtotal.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Utilidad del Diseñador/Taller ({margenGanancia}%):</span>
              <span>{symbol}{desgloseCostos.ganancia.toLocaleString('es-CL')}</span>
            </div>
            {porcentajeIva > 0 && (
              <div className="flex justify-between text-zinc-500">
                <span>Impuesto Local / IVA ({porcentajeIva}%):</span>
                <span>{symbol}{desgloseCostos.iva.toLocaleString('es-CL')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-zinc-900 border-t pt-2 mt-1">
              <span>TOTAL ESTIMADO:</span>
              <span>{symbol}{precioTotal.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        <div className="text-[9px] text-zinc-400 text-center pt-8 border-t border-zinc-100">
          <p>Este documento es un presupuesto estimativo basado en las medidas provistas y sujeto a cambios tras la inspección física del mueble.</p>
        </div>
      </div>

    </div>
  );
}
