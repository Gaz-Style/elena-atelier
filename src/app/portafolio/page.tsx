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
  
  // 1. Get files directly in /public/trabajos (General / Todos)
  let generalImages: string[] = [];
  try {
    const files = fs.readdirSync(baseDirectory, { withFileTypes: true });
    generalImages = files
      .filter(dirent => dirent.isFile() && dirent.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .map(dirent => `/trabajos/${dirent.name}`);
  } catch (err) {
    console.error("Error reading base directory", err);
  }

  // 2. Read subdirectories (novias, fiesta, etc)
  const categoryData: { category: string, images: string[] }[] = [];
  
  try {
    const subDirs = fs.readdirSync(baseDirectory, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
      
    for (const dir of subDirs) {
      const catPath = path.join(baseDirectory, dir.name);
      const catFiles = fs.readdirSync(catPath, { withFileTypes: true });
      const catImages = catFiles
        .filter(dirent => dirent.isFile() && dirent.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
        .map(dirent => `/trabajos/${dir.name}/${dirent.name}`);
        
      if (catImages.length > 0) {
        categoryData.push({
          category: dir.name,
          images: catImages
        });
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
          <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block mb-4">Archivo Elena</span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold uppercase tracking-tight text-white mb-6">Portafolio</h1>
          <p className="font-sans text-white/60 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Una selección inmersiva de nuestros trabajos. Toca las categorías para explorar.
          </p>
        </div>

        {/* Client Component Handles Interactive Highlights & Mobile Grid */}
        <PortfolioClient data={categoryData} generalImages={generalImages} />
      </div>
    </div>
  );
}
