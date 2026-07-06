const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'trabajos', 'fiesta');
const files = fs.readdirSync(dir);

const vestidosMap = new Map();

files.forEach(file => {
    if (file === '.gitkeep') return;
    
    // Example: "1. Clara Celeste Azul Royal Espalda.png"
    const match = file.match(/^(\d+(?:\.\d+)?)\.\s+(.*?)(?:\s+Espalda|\s+Frente|(?:\.\.))?(?:\s+\d)?\.png$/i);
    
    if (match) {
        const idStr = match[1];
        const id = parseFloat(idStr);
        const nameAndColor = match[2].trim();
        
        let nombre = nameAndColor;
        let color = "";
        
        // Extract color if possible (very basic heuristic)
        const parts = nameAndColor.split(' ');
        if (parts.length > 1) {
            nombre = parts[0]; // Assume first word is name
            color = parts.slice(1).join(' '); // Rest is color
        }
        
        if (!vestidosMap.has(id)) {
            vestidosMap.set(id, {
                id,
                nombre,
                color,
                colorCategoria: 'Varios', // Default
                silueta: 'A-Line', // Default
                tejido: 'Seda', // Default
                descripcion: `Vestido elegante ${nombre} en color ${color}. Ideal para eventos de noche y fiestas.`,
                imagenFrente: `/trabajos/fiesta/${file}`,
                imagenEspalda: `/trabajos/fiesta/${file}`, // Default to same, update if Espalda found
                imagenesExtra: [],
                precio: 250000 // Default price
            });
        }
        
        const v = vestidosMap.get(id);
        
        if (file.toLowerCase().includes('espalda')) {
            // If it's a second espalda image
            if (v.imagenEspalda !== v.imagenFrente && v.imagenEspalda.includes('Espalda')) {
                v.imagenesExtra.push(`/trabajos/fiesta/${file}`);
            } else {
                v.imagenEspalda = `/trabajos/fiesta/${file}`;
            }
        } else if (file.toLowerCase().includes('frente') || !file.toLowerCase().includes('espalda')) {
            v.imagenFrente = `/trabajos/fiesta/${file}`;
        }
    }
});

const vestidosList = Array.from(vestidosMap.values()).sort((a, b) => a.id - b.id);

const tsContent = `export type ColorCategoria = 'Negro' | 'Rojo' | 'Azul' | 'Verde' | 'Rosa' | 'Plata' | 'Dorado' | 'Varios';
export type Silueta = 'Sirena' | 'A-Line' | 'Princesa' | 'Recto' | 'Imperio' | 'Asimétrico';
export type Tejido = 'Satén' | 'Seda' | 'Lentejuelas' | 'Terciopelo' | 'Gasa' | 'Crepé' | 'Encaje' | 'Metalizado';

export interface Vestido {
  id: number;
  nombre: string;
  color: string;
  colorCategoria: ColorCategoria;
  silueta: Silueta;
  tejido: Tejido;
  descripcion: string;
  imagenFrente: string;
  imagenEspalda: string;
  imagenesExtra?: string[];
  precio: number;
}

export const colores: ColorCategoria[] = ['Negro', 'Rojo', 'Azul', 'Verde', 'Rosa', 'Plata', 'Dorado', 'Varios'];
export const siluetas: Silueta[] = ['Sirena', 'A-Line', 'Princesa', 'Recto', 'Imperio', 'Asimétrico'];
export const tejidos: Tejido[] = ['Satén', 'Seda', 'Lentejuelas', 'Terciopelo', 'Gasa', 'Crepé', 'Encaje', 'Metalizado'];

export const vestidosFiesta: Vestido[] = ${JSON.stringify(vestidosList, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'src', 'lib', 'fiesta-data.ts'), tsContent);
console.log('fiesta-data.ts generated successfully with ' + vestidosList.length + ' products.');
