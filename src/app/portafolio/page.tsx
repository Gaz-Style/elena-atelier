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
  const rootTrabajos = path.join(process.cwd(), 'public', 'trabajos');
  const baseDirectory = path.join(rootTrabajos, 'Portafolio');
  
  // 1. Obtener archivos desparramados en /public/trabajos/ y /public/trabajos/Portafolio/
  let generalImages: string[] = [];
  try {
    const rootFiles = fs.readdirSync(rootTrabajos, { withFileTypes: true });
    const rootLoose = rootFiles
      .filter(dirent => dirent.isFile() && dirent.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .map(dirent => `/trabajos/${dirent.name}`);

    let portafolioLoose: string[] = [];
    if (fs.existsSync(baseDirectory)) {
      const portFiles = fs.readdirSync(baseDirectory, { withFileTypes: true });
      portafolioLoose = portFiles
        .filter(dirent => dirent.isFile() && dirent.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
        .map(dirent => `/trabajos/Portafolio/${dirent.name}`);
    }

    generalImages = [...rootLoose, ...portafolioLoose];
  } catch (err) {
    console.error("Error reading base directory", err);
  }

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

  // 2. Read subdirectories (Colaboraciones, fiesta, novias, etc)
  const categoryData: { category: string, images: string[] }[] = [];

  // Si existen imágenes desparramadas en /public/trabajos, asignarlas a la categoría "colaboraciones"
  if (generalImages.length > 0) {
    categoryData.push({
      category: 'colaboraciones',
      images: generalImages
    });
  }
  
  try {
    if (fs.existsSync(baseDirectory)) {
      const subDirs = fs.readdirSync(baseDirectory, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());
        
      for (const dir of subDirs) {
        const catPath = path.join(baseDirectory, dir.name);
        const catImages = getAllImagesInDir(catPath, `/trabajos/Portafolio/${dir.name}`);
          
        if (catImages.length > 0) {
          categoryData.push({
            category: dir.name.toLowerCase(),
            images: catImages
          });
        }
      }
    }
  } catch (err) {
    console.error("Error reading subdirectories", err);
  }

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
