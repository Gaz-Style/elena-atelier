import fs from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import BackLink from '@/components/BackLink';
import PortfolioClient from './PortfolioClient';

export const metadata = {
  title: 'Portafolio | Elena La Costurera',
  description: 'Explora nuestro archivo de trabajos: alta costura, restauración de prendas, y diseño a medida.',
};

export default function PortfolioPage() {
  const baseDirectory = path.join(process.cwd(), 'public', 'trabajos');
  
  // Helper recursivo para obtener todos los archivos de media (imágenes y videos) dentro de una subcarpeta
  const getAllImagesInDir = (dirPath: string, relativePrefix: string): string[] => {
    let results: string[] = [];
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = `${relativePrefix}/${entry.name}`;
        if (entry.isDirectory()) {
          results = results.concat(getAllImagesInDir(fullPath, relPath));
        } else if (entry.isFile() && entry.name.match(/\.(jpg|jpeg|png|gif|webp|mp4)$/i)) {
          results.push(relPath);
        }
      }
    } catch (e) {
      console.error("Error scanning subfolder", e);
    }
    return results;
  };

  // 1. Archivos sueltos directamente en /public/trabajos/ (General / Colaboraciones)
  let generalImages: string[] = [];
  try {
    const rootFiles = fs.readdirSync(baseDirectory, { withFileTypes: true });
    generalImages = rootFiles
      .filter(dirent => dirent.isFile() && dirent.name.match(/\.(jpg|jpeg|png|gif|webp|mp4)$/i))
      .map(dirent => `/trabajos/${dirent.name}`);
  } catch (err) {
    console.error("Error reading base directory", err);
  }

  // 2. Subcarpetas en /public/trabajos/ (fiesta, novias, colaboraciones, graduacion, sastreria)
  const categoryMap: Record<string, string[]> = {};

  try {
    const subDirs = fs.readdirSync(baseDirectory, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
      
    for (const dir of subDirs) {
      const catKey = dir.name.toLowerCase();
      const catPath = path.join(baseDirectory, dir.name);
      const catImages = getAllImagesInDir(catPath, `/trabajos/${dir.name}`);
        
      if (catImages.length > 0) {
        if (categoryMap[catKey]) {
          categoryMap[catKey] = [...categoryMap[catKey], ...catImages];
        } else {
          categoryMap[catKey] = catImages;
        }
      }
    }
  } catch (err) {
    console.error("Error reading subdirectories", err);
  }

  // Filtrar y ordenar explícitamente las 3 categorías principales en orden prioritario: Novias, Fiesta, Colaboraciones
  const allowedCategories = ['novias', 'fiesta', 'colaboraciones'];
  
  const categoryData: { category: string, images: string[] }[] = allowedCategories
    .map(catKey => {
      let images: string[] = categoryMap[catKey] || [];
      // Si es colaboraciones, incluir también imágenes desparramadas
      if (catKey === 'colaboraciones' && generalImages.length > 0) {
        images = Array.from(new Set([...images, ...generalImages]));
      }
      return { category: catKey, images };
    })
    .filter(cat => cat.images.length > 0 || cat.category === 'novias' || cat.category === 'fiesta');

  return (
    <div className="min-h-screen bg-brand-charcoal text-white font-sans relative">
      <Navbar />
      
      {/* Back Link */}
      <BackLink />

      <div className="pt-32 pb-4">
        <div className="text-center mb-8 px-6">
          <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block mb-4">Producciones Editoriales & Colaboraciones de Marca</span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold uppercase tracking-tight text-white mb-6">Portafolio & Editoriales</h1>
          <p className="font-sans text-white/60 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Explora nuestras producciones exclusivas, editoriales de moda nupcial y colaboraciones de vestuario con modelos, casas de joyas y fotógrafos de autor.
          </p>
        </div>

        {/* Client Component Handles Interactive Highlights & Mobile Grid */}
        <PortfolioClient data={categoryData} generalImages={generalImages} />
      </div>
    </div>
  );
}
