const fs = require('fs');
const filePath = "c:/Users/ADMIN/Downloads/IA trabajaos/Elena Atalier/src/app/admin/pos/page.tsx";

let content = fs.readFileSync(filePath, 'utf8');

// Normalize all CRLF to LF for robust matching in memory
const originalLineEndings = content.includes('\r\n') ? '\r\n' : '\n';
content = content.split('\r\n').join('\n');

// 1. Replace DEFAULT_HC_TEMPLATES
const oldTemplatesBlock = `const DEFAULT_HC_TEMPLATES = [
  {
    id: 'vestido_gala',
    name: 'Vestido Gala',
    svg: \`<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M35,20 C35,20 40,15 50,22 C60,15 65,20 65,20 L68,40 C65,55 68,70 75,120 L25,120 C32,70 35,55 32,40 Z" /><path d="M36,23 C36,23 41,18 50,24 C59,18 64,23 64,23 L66,41 C63,55 66,70 72,117 L28,117 C34,70 37,55 34,41 Z" stroke-dasharray="2 2" stroke-width="0.8" /></svg>\`,
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
    svg: \`<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M30,20 L40,15 L50,25 L60,15 L70,20 L75,60 L70,105 L30,105 L25,60 Z" /><path d="M40,15 L45,40 L50,25 L55,40 L60,15" /><path d="M30,20 L22,65 L26,95 L30,95 L28,60" /><path d="M70,20 L78,65 L74,95 L70,95 L72,60" /></svg>\`,
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
    svg: \`<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M35,20 C35,20 40,15 50,22 C60,15 65,20 65,20 L68,40 C65,55 68,70 82,135 L18,135 C32,70 35,55 32,40 Z" /><path d="M28,60 C38,62 62,62 72,60" stroke-width="0.8" /><path d="M18,135 L12,145 L88,145 L82,135" /></svg>\`,
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
    svg: \`<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M35,20 L65,20 L68,135 L52,135 L50,60 L48,135 L32,135 Z" /><path d="M35,28 L65,28" /></svg>\`,
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
    svg: \`<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M30,20 L40,15 L50,25 L60,15 L70,20 L73,80 L68,135 L32,135 L27,80 Z" /><path d="M40,15 L45,40 L50,25 L55,40 L60,15" /><path d="M30,20 L22,70 L28,125" /><path d="M70,20 L78,70 L72,125" /></svg>\`,
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
    svg: \`<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M35,30 C40,27 60,27 65,30 L61,110 L39,110 Z" /></svg>\`,
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
    svg: \`<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M32,35 C37,32 63,32 68,35 L64,105 C57,107 43,107 36,105 Z" /><path d="M40,35 L42,104 M46,34 L47,105 M50,33 L50,105 M54,34 L53,105 M60,35 L58,104" stroke-width="0.8" /></svg>\`,
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
    svg: \`<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M30,30 L40,25 L50,35 L60,25 L70,30 L66,85 L50,95 L34,85 Z" /><path d="M40,25 L45,45 L50,35 L55,45 L60,25" /></svg>\`,
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
    svg: \`<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M40,30 C45,28 55,28 60,30 L85,115 C70,125 30,125 15,115 Z" /></svg>\`,
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
];`.split('\r\n').join('\n');

const newTemplatesBlock = `const DEFAULT_HC_TEMPLATES = [
  {
    id: 'vestido_gala',
    name: 'Vestido Gala',
    img: '/assets/siluetas/vestido_gala.png',
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
    img: '/assets/siluetas/chaqueta_sastre.png',
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
    img: '/assets/siluetas/vestido_novia.png',
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
    img: '/assets/siluetas/pantalon_sastre.png',
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
    img: '/assets/siluetas/abrigo_sastre.png',
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
    img: '/assets/siluetas/falda_tubo.png',
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
    img: '/assets/siluetas/corse_clasico.png',
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
    img: '/assets/siluetas/chaleco_sastre.png',
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
    img: '/assets/siluetas/falda_vuelo.png',
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
];`.split('\r\n').join('\n');

const origLength = content.length;
content = content.replace(oldTemplatesBlock, newTemplatesBlock);
if (content.length === origLength) console.log("WARNING: Failed to replace DEFAULT_HC_TEMPLATES");

// 2. Update renderInteractiveSketch & template save logic
const oldInteractiveSketchAndSave = `    const handleSaveAsTemplate = () => {
        const tplName = prompt("Ingresa el nombre para guardar este diseño como plantilla reutilizable:", hcPrendaName || "Diseño Especial");
        if (!tplName) return;

        const newTpl = {
            id: \`custom_\${Date.now()}\`,
            name: tplName,
            svg: \`<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M25,35 C35,25 65,25 75,35 L80,135 C70,140 30,140 20,135 Z" /><path d="M20,65 C35,75 65,75 80,65" stroke-width="0.8" /></svg>\`,
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
        alert(\`¡Plantilla "\${tplName}" guardada en el taller!\`);
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
            id: \`custom_\${Date.now()}\`,
            name: tplName,
            svg: tplName.toLowerCase().includes('chaqueta') || tplName.toLowerCase().includes('sastre') || tplName.toLowerCase().includes('blazer') || tplName.toLowerCase().includes('saco')
                ? \`<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M30,30 L70,30 L75,85 L25,85 Z" /><path d="M30,30 L40,55 L50,30 L60,55 L70,30" /></svg>\`
                : \`<svg viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width="1.2" class="w-12 h-16"><path d="M40,25 C45,20 55,20 60,25 L65,40 C60,50 40,50 35,40 Z" /><path d="M35,40 C42,48 58,48 65,40 L75,130 C65,140 35,140 25,130 Z" /><path d="M38,45 C48,60 52,70 34,100 M62,45 C52,65 48,85 66,110" stroke-width="0.7" /></svg>\`,
            molderia: hcPatternType,
            pieces: hcPatternPieces,
            tela: hcTextileDifficulty,
            estructura: hcInternalArchitecture,
            acabados: hcHandcraft,
            pruebas: hcFittingsCount,
            toile: hcToileNeeded,
            materiales: hcMaterialsCost,
            extra: hcExtraCost,
            escote: hcNeckline,
            manga: hcSleeve,
            largo: hcLength
        };

        const customOnly = hcTemplates.filter(t => t.id.startsWith('custom_'));
        const updated = [...customOnly, newTpl];
        localStorage.setItem('elena_hc_custom_templates', JSON.stringify(updated));
        setHcTemplates([...DEFAULT_HC_TEMPLATES, ...updated]);
        setNewTemplateName('');
        alert(\`¡Plantilla "\${tplName}" guardada con éxito!\`);
    };

    const renderInteractiveSketch = () => {
        const nameLower = hcPrendaName.toLowerCase();
        const isJacket = nameLower.includes('chaqueta') || nameLower.includes('sastre') || nameLower.includes('saco') || nameLower.includes('blazer') || nameLower.includes('abrigo');
        const isPants = nameLower.includes('pantalon') || nameLower.includes('pantalón') || nameLower.includes('calza') || nameLower.includes('jean');
        const isSkirt = nameLower.includes('falda') || nameLower.includes('pollera') || nameLower.includes('skirt');
        const isCorset = nameLower.includes('corsé') || nameLower.includes('corse') || nameLower.includes('corset');

        // Color mapping for clean luxury styling (dark slate shapes on light warm background)
        const outlineColor = "stroke-[#2d2d2d]";
        const fillColor = "fill-neutral-100/40";
        const accentColor = "stroke-neutral-400";
        const detailColor = "stroke-brand-terracotta/75";
        
        if (isJacket) {
            return (
                <svg viewBox="0 0 100 130" className="w-full h-64 drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M 30,20 L 40,15 L 50,25 L 60,15 L 70,20 L 75,60 L 70,105 L 30,105 L 25,60 Z" className={\`\${outlineColor} \${fillColor}\`} />
                    <path d="M 40,15 L 45,40 L 50,25 L 55,40 L 60,15" className={accentColor} />
                    {hcInternalArchitecture.canvas && (
                        <path d="M 39,17 L 44,42 M 61,17 L 56,42" strokeDasharray="1.5 1.5" className="stroke-neutral-400" strokeWidth="1" />
                    )}
                    <path d="M 30,20 L 22,65 L 26,95 L 30,95 L 28,60" className={accentColor} />
                    <path d="M 70,20 L 78,65 L 74,95 L 70,95 L 72,60" className={accentColor} />
                    {hcInternalArchitecture.pads && (
                        <>
                            <path d="M 28,19 C 32,17 38,19 40,21" className={detailColor} strokeWidth="2.5" />
                            <path d="M 72,19 C 68,17 62,19 60,21" className={detailColor} strokeWidth="2.5" />
                        </>
                    )}
                    {hcInternalArchitecture.lining && (
                        <path d="M 33,23 L 42,19 L 50,28 L 58,19 L 67,23 L 71,59 L 67,101 L 33,101 L 29,59 Z" strokeDasharray="3 3" className="stroke-neutral-300" strokeWidth="1" />
                    )}
                    {Array.from({ length: Math.min(6, hcHandcraft.handButtonholes) }).map((_, idx) => (
                        <line key={idx} x1="47" y1={55 + idx * 8} x2="53" y2={55 + idx * 8} className="stroke-neutral-500" strokeWidth="2" />
                    ))}
                </svg>
            );
        } else if (isPants) {
            return (
                <svg viewBox="0 0 100 130" className="w-full h-64 drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {/* Pants Outline */}
                    <path d="M 35,20 L 65,20 L 68,110 L 52,110 L 50,45 L 48,110 L 32,110 Z" className={\`\${outlineColor} \${fillColor}\`} />
                    {/* Waistband and fly */}
                    <path d="M 35,26 L 65,26 M 50,20 L 50,45" className={accentColor} />
                    {/* Belt loops (Pasadores) */}
                    <path d="M 38,20 L 38,26 M 46,20 L 46,26 M 54,20 L 54,26 M 62,20 L 62,26" className="stroke-neutral-400" strokeWidth="1" />
                    {hcInternalArchitecture.lining && (
                        <path d="M 36,27 L 64,27 L 66,70 L 51,70 L 50,45 L 49,70 L 34,70 Z" strokeDasharray="3 3" className="stroke-neutral-300" strokeWidth="1" />
                    )}
                    {hcHandcraft.handHem && (
                        <>
                            <line x1="32" y1="105" x2="48" y2="105" strokeDasharray="2 2" className={detailColor} strokeWidth="1.2" />
                            <line x1="52" y1="105" x2="68" y2="105" strokeDasharray="2 2" className={detailColor} strokeWidth="1.2" />
                        </>
                    )}
                </svg>
            );
        } else if (isSkirt) {
            return (
                <svg viewBox="0 0 100 130" className="w-full h-64 drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {/* Skirt Outline */}
                    <path d="M 35,25 C 40,22 60,22 65,25 L 62,100 L 38,100 Z" className={\`\${outlineColor} \${fillColor}\`} />
                    {/* Waistband */}
                    <path d="M 34,30 C 40,27 60,27 66,30" className={accentColor} />
                    {hcInternalArchitecture.lining && (
                        <path d="M 36,33 C 40,31 60,31 64,33 L 61,94 L 39,94 Z" strokeDasharray="3 3" className="stroke-neutral-300" strokeWidth="1" />
                    )}
                    {hcHandcraft.handHem && (
                        <path d="M 39,95 L 61,95" strokeDasharray="2 2" className={detailColor} strokeWidth="1.5" />
                    )}
                </svg>
            );
        } else if (isCorset) {
            return (
                <svg viewBox="0 0 100 130" className="w-full h-64 drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {/* Corset outline */}
                    <path d="M 32,30 C 37,27 63,27 68,30 L 64,85 C 57,87 43,87 36,85 Z" className={\`\${outlineColor} \${fillColor}\`} />
                    {hcInternalArchitecture.bones && (
                        <>
                            <path d="M 40,30 L 42,84 M 46,29 L 47,85 M 50,28 L 50,85 M 54,29 L 53,85 M 60,30 L 58,84" className="stroke-neutral-400" strokeWidth="1" />
                        </>
                    )}
                    {hcInternalArchitecture.cups && (
                        <>
                            <path d="M 34,33 C 36,40 46,40 48,33" className={detailColor} strokeWidth="1.5" />
                            <path d="M 52,33 C 54,40 64,40 66,33" className={detailColor} strokeWidth="1.5" />
                        </>
                    )}
                    {hcInternalArchitecture.lining && (
                        <path d="M 34,34 C 38,32 62,32 66,34 L 62,81 Z" strokeDasharray="3 3" className="stroke-neutral-300" strokeWidth="1" />
                    )}
                </svg>
            );
        } else {
            // Dress
            return (
                <svg viewBox="0 0 100 130" className="w-full h-64 drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M 35,20 C 35,20 40,15 50,22 C 60,15 65,20 65,20 L 68,40 C 65,55 68,70 75,120 L 25,120 C 32,70 35,55 32,40 Z" className={\`\${outlineColor} \${fillColor}\`} />
                    {hcInternalArchitecture.lining && (
                        <path d="M 36,23 C 36,23 41,18 50,24 C 59,18 64,23 64,23 L 66,41 C 63,55 66,70 72,117 L 28,117 C 34,70 37,55 34,41 Z" strokeDasharray="3 3" className="stroke-neutral-300" strokeWidth="1" />
                    )}
                    {hcInternalArchitecture.bones && (
                        <>
                            <path d="M 44,22 L 44,40 C 44,47 45,52 46,58" className="stroke-neutral-400" strokeWidth="1" />
                            <path d="M 50,25 L 50,58" className="stroke-neutral-400" strokeWidth="1" />
                            <path d="M 56,22 L 56,40 C 56,47 55,52 54,58" className="stroke-neutral-400" strokeWidth="1" />
                        </>
                    )}
                    {hcInternalArchitecture.cups && (
                        <>
                            <path d="M 37,25 C 39,32 46,32 48,25" className={detailColor} strokeWidth="1.5" />
                            <path d="M 52,25 C 54,32 61,32 63,25" className={detailColor} strokeWidth="1.5" />
                        </>
                    )}
                    {hcHandcraft.handDraping && (
                        <>
                            <path d="M 33,35 Q 48,42 67,35" className="stroke-neutral-400" strokeWidth="1" />
                            <path d="M 32,43 Q 48,51 68,43" className="stroke-neutral-400" strokeWidth="1" />
                            <path d="M 33,52 Q 48,59 67,52" className="stroke-neutral-400" strokeWidth="1" />
                        </>
                    )}
                    {hcHandcraft.handHem && (
                        <path d="M 26,117 L 74,117" strokeDasharray="2 2" className={detailColor} strokeWidth="1.5" />
                    )}
                    {hcHandcraft.handEmbroideryHours > 0 && (
                        <>
                            {Array.from({ length: Math.min(15, Math.ceil(hcHandcraft.handEmbroideryHours / 2)) }).map((_, idx) => {
                                const x = 32 + (idx * 7.5) % 36;
                                const y = 65 + (idx * 13) % 45;
                                return (
                                    <g key={idx} className="stroke-amber-600/60">
                                        <circle cx={x} cy={y} r="1" className="fill-amber-500" />
                                        <line x1={x-2} y1={y} x2={x+2} y2={y} strokeWidth="0.5" />
                                        <line x1={x} y1={y-2} x2={x} y2={y+2} strokeWidth="0.5" />
                                    </g>
                                );
                            })}
                        </>
                    )}
                </svg>
            );
        }
    };`.split('\r\n').join('\n');

const newInteractiveSketchAndSave = `const getGarmentImage = (name) => {
        const nl = name.toLowerCase()
            .normalize("NFD")
            .replace(/[\\u0300-\\u036f]/g, "");
        if (nl.includes('chaqueta') || nl.includes('blazer') || nl.includes('saco')) {
            return '/assets/siluetas/chaqueta_sastre.png';
        } else if (nl.includes('abrigo')) {
            return '/assets/siluetas/abrigo_sastre.png';
        } else if (nl.includes('pantalon') || nl.includes('calza') || nl.includes('jean')) {
            return '/assets/siluetas/pantalon_sastre.png';
        } else if (nl.includes('falda') && (nl.includes('vuelo') || nl.includes('circular'))) {
            return '/assets/siluetas/falda_vuelo.png';
        } else if (nl.includes('falda') || nl.includes('pollera') || nl.includes('tubo')) {
            return '/assets/siluetas/falda_tubo.png';
        } else if (nl.includes('corse') || nl.includes('corset')) {
            return '/assets/siluetas/corse_clasico.png';
        } else if (nl.includes('chaleco') || nl.includes('vest')) {
            return '/assets/siluetas/chaleco_sastre.png';
        } else if (nl.includes('novia') || nl.includes('nupcial') || nl.includes('boda')) {
            return '/assets/siluetas/vestido_novia.png';
        }
        return '/assets/siluetas/vestido_gala.png';
    };

    const handleSaveAsTemplate = () => {
        const tplName = prompt("Ingresa el nombre para guardar este diseño como plantilla reutilizable:", hcPrendaName || "Diseño Especial");
        if (!tplName) return;

        const newTpl = {
            id: \`custom_\${Date.now()}\`,
            name: tplName,
            img: getGarmentImage(tplName),
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
        alert(\`¡Plantilla "\${tplName}" guardada en el taller!\`);
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
            id: \`custom_\${Date.now()}\`,
            name: tplName,
            img: getGarmentImage(tplName),
            molderia: hcPatternType,
            pieces: hcPatternPieces,
            tela: hcTextileDifficulty,
            estructura: hcInternalArchitecture,
            acabados: hcHandcraft,
            pruebas: hcFittingsCount,
            toile: hcToileNeeded,
            materiales: hcMaterialsCost,
            extra: hcExtraCost,
            escote: hcNeckline,
            manga: hcSleeve,
            largo: hcLength
        };

        const customOnly = hcTemplates.filter(t => t.id.startsWith('custom_'));
        const updated = [...customOnly, newTpl];
        localStorage.setItem('elena_hc_custom_templates', JSON.stringify(updated));
        setHcTemplates([...DEFAULT_HC_TEMPLATES, ...updated]);
        setNewTemplateName('');
        alert(\`¡Plantilla "\${tplName}" guardada con éxito!\`);
    };

    const renderInteractiveSketch = () => {
        const imgSrc = getGarmentImage(hcPrendaName);

        // Collect active construction details for overlay badges
        const activeDetails = [];
        if (hcInternalArchitecture.canvas) activeDetails.push('Entretela');
        if (hcInternalArchitecture.lining) activeDetails.push('Forro');
        if (hcInternalArchitecture.cups) activeDetails.push('Copas');
        if (hcInternalArchitecture.bones) activeDetails.push('Ballenas');
        if (hcInternalArchitecture.pads) activeDetails.push('Hombreras');
        if (hcHandcraft.handHem) activeDetails.push('Dobladillo a mano');
        if (hcHandcraft.handDraping) activeDetails.push('Drapeado');
        if (hcHandcraft.handEmbroideryHours > 0) activeDetails.push(\`Bordado \${hcHandcraft.handEmbroideryHours}h\`);
        if (hcHandcraft.handButtonholes > 0) activeDetails.push(\`\${hcHandcraft.handButtonholes} Ojales\`);

        return (
            <div className="relative w-full flex flex-col items-center">
                <img 
                    src={imgSrc} 
                    alt={hcPrendaName || 'Silueta de prenda'} 
                    className="w-full h-56 object-contain transition-all duration-300" 
                />
                {activeDetails.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 justify-center">
                        {activeDetails.map((detail, idx) => (
                            <span 
                                key={idx} 
                                className="text-[8px] uppercase tracking-wider bg-brand-charcoal text-white px-1.5 py-0.5 rounded font-bold"
                            >
                                {detail}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };`.split('\r\n').join('\n');

const origLength2 = content.length;
content = content.replace(oldInteractiveSketchAndSave, newInteractiveSketchAndSave);
if (content.length === origLength2) console.log("WARNING: Failed to replace oldInteractiveSketchAndSave");

// 3. Update the carousel loop to use img tags instead of rendering innerHTML svg
const oldCarouselItem = `                                            <div
                                                key={tpl.id}
                                                onClick={() => handleApplyTemplate(tpl)}
                                                className={\`relative bg-white border rounded-md p-3 min-w-[145px] w-[145px] text-center cursor-pointer transition-all group flex flex-col items-center justify-between shadow-sm min-h-[125px] \${
                                                    hcPrendaName === tpl.name 
                                                        ? 'border-brand-terracotta bg-brand-sand/25 ring-1 ring-brand-terracotta/40' 
                                                        : 'border-[#C6C2BA] hover:border-brand-charcoal hover:bg-neutral-50'
                                                }\`}
                                            >
                                                <div 
                                                    className="h-16 w-full flex items-center justify-center mb-1.5 text-brand-charcoal hover:text-brand-terracotta transition-colors"
                                                    dangerouslySetInnerHTML={{ __html: tpl.svg }}
                                                />
                                                <p className="text-xs md:text-sm text-brand-charcoal font-extrabold truncate w-full">{tpl.name}</p>`.split('\r\n').join('\n');

const newCarouselItem = `                                            <div
                                                key={tpl.id}
                                                onClick={() => handleApplyTemplate(tpl)}
                                                className={\`relative bg-white border rounded-md p-3 min-w-[145px] w-[145px] text-center cursor-pointer transition-all group flex flex-col items-center justify-between shadow-sm min-h-[125px] \${
                                                    hcPrendaName === tpl.name 
                                                        ? 'border-brand-terracotta bg-brand-sand/25 ring-1 ring-brand-terracotta/40' 
                                                        : 'border-[#C6C2BA] hover:border-brand-charcoal hover:bg-neutral-50'
                                                }\`}
                                            >
                                                <div className="h-16 w-full flex items-center justify-center mb-1.5 overflow-hidden rounded">
                                                    {tpl.img ? (
                                                        <img src={tpl.img} alt={tpl.name} className="h-full w-auto object-contain" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-neutral-200 rounded flex items-center justify-center text-neutral-400">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs md:text-sm text-brand-charcoal font-extrabold truncate w-full">{tpl.name}</p>`.split('\r\n').join('\n');

const origLength3 = content.length;
content = content.replace(oldCarouselItem, newCarouselItem);
if (content.length === origLength3) console.log("WARNING: Failed to replace oldCarouselItem");

// 4. Update the header logo box (remove black box)
const oldHeaderLogo = `                        {/* Header (Sticky top) - Compact & Elegant */}
                        <div className="py-4 px-5 border-b border-[#C6C2BA] flex justify-between items-center bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="bg-black p-1 rounded">
                                    <img src="/logotipo.png" alt="Elena La Costurera" className="h-8 md:h-9 w-auto object-contain brightness-0 invert" />
                                </div>
                                <div className="h-7 w-[1px] bg-[#C6C2BA] hidden md:block"></div>`.split('\r\n').join('\n');

const newHeaderLogo = `                        {/* Header (Sticky top) - Compact & Elegant */}
                        <div className="py-4 px-5 border-b border-[#C6C2BA] flex justify-between items-center bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <img src="/logotipo.png" alt="Elena La Costurera" className="h-9 md:h-10 w-auto object-contain" />
                                <div className="h-7 w-[1px] bg-[#C6C2BA] hidden md:block"></div>`.split('\r\n').join('\n');

const origLength4 = content.length;
content = content.replace(oldHeaderLogo, newHeaderLogo);
if (content.length === origLength4) console.log("WARNING: Failed to replace oldHeaderLogo");

// Restore carriage return style
content = content.split('\n').join(originalLineEndings);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Upgrades successfully applied with line ending normalization!");
