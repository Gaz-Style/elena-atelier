import fs from 'fs';
import path from 'path';
import Image from 'next/image';

export const metadata = {
  title: 'Portafolio | Elena La Costurera',
  description: 'Explora nuestro archivo de trabajos: alta costura, restauración de prendas, y diseño a medida.',
};

export default function PortfolioPage() {
  const directoryPath = path.join(process.cwd(), 'public', 'trabajos');
  let images: string[] = [];
  try {
    const files = fs.readdirSync(directoryPath);
    // Filtrar solo imágenes (ignorando archivos ocultos o carpetas)
    images = files.filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  } catch (err) {
    console.error("Error reading directory", err);
  }

  return (
    <div className="pt-20 min-h-screen bg-brand-sand/10">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16 md:mb-24">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-terracotta block mb-4">Archivo Histórico</span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold uppercase tracking-tight text-brand-charcoal mb-6">Portafolio</h1>
          <p className="font-sans text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
            Una selección de nuestros trabajos más destacados. Cada prenda es un testimonio de la maestría técnica, el tiempo y la dedicación que requiere el verdadero oficio de la costura.
          </p>
        </div>

        {/* CSS Columns (Masonry) Layout */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {images.map((img, idx) => (
            <div key={idx} className="break-inside-avoid relative group rounded-sm overflow-hidden bg-brand-sand shadow-sm hover:shadow-xl transition-all duration-500">
              <Image 
                src={`/trabajos/${img}`} 
                alt={`Trabajo Elena La Costurera ${idx + 1}`} 
                width={600} 
                height={800} 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
        
        {images.length === 0 && (
          <div className="text-center py-20 text-brand-charcoal/50">
            <p>Aún no hay imágenes en el portafolio.</p>
          </div>
        )}
      </div>
    </div>
  );
}
