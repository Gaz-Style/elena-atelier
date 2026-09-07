import React from 'react';

interface BrandCarouselProps {
    comuna?: string;
}

export default function BrandCarousel({ comuna }: BrandCarouselProps) {
    // Excluimos Versace (1), Levi's (10), Under Armour (5, 6, 16) y Brooks Brothers (14) a solicitud expresa del usuario
    const validBrandIds = [2, 3, 4, 7, 8, 9, 11, 12, 13, 15];
    
    // IDs de logotipos destacados (+100% / +50% / +30%)
    const doubleScaleIds = [7, 12]; // Polo, Zegna (+100%)
    const midScaleIds = [3, 4, 8, 9, 11, 13, 15]; // MaxMara, Giorgio Armani, Burberry, Dior, La Martina (+30% / +50%)
    const reducedScaleIds = [2]; // ZARA (reducido en un 30%)

    const brands = validBrandIds.map((id) => ({
        id,
        src: `/Marcas/clean1x1/brand_${id}.png`,
        alt: `Marca de vestir de prestigio ${id}`,
        scale: doubleScaleIds.includes(id) 
            ? 'double' 
            : midScaleIds.includes(id) 
            ? 'mid' 
            : reducedScaleIds.includes(id) 
            ? 'reduced' 
            : 'standard'
    }));

    // Duplicamos el array para lograr un bucle infinito continuo e imperceptible
    const doubleBrands = [...brands, ...brands, ...brands];

    return (
        <section className="py-12 sm:py-16 md:py-20 my-4 sm:my-8 relative z-10 overflow-hidden pointer-events-none select-none">
            <div className="max-w-4xl mx-auto text-center px-4 mb-8 sm:mb-12 md:mb-14">
                <span className="text-xs text-[#C17F5F] uppercase tracking-widest font-bold">
                    Trabajamos con tus marcas preferidas {comuna ? `en ${comuna}` : ''}
                </span>
            </div>

            {/* CONTENEDOR MASCARADO DEL CARRUSEL INFINITO CON GRADIENT FADE EN BORDES */}
            <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_48px,_black_calc(100%-48px),transparent_100%)] sm:[mask-image:_linear-gradient(to_right,transparent_0,_black_96px,_black_calc(100%-96px),transparent_100%)]">
                <div className="animate-marquee flex items-center gap-16 sm:gap-24 md:gap-32 py-6 sm:py-8">
                    {doubleBrands.map((brand, idx) => (
                        <div
                            key={`brand-${brand.id}-${idx}`}
                            className={`flex items-center justify-center shrink-0 px-2 sm:px-4 ${
                                brand.scale === 'double'
                                    ? 'h-10 sm:h-12 md:h-14 opacity-100'
                                    : brand.scale === 'mid'
                                    ? 'h-8 sm:h-10 md:h-12 opacity-95'
                                    : brand.scale === 'reduced'
                                    ? 'h-3 sm:h-3.5 md:h-4 opacity-75'
                                    : 'h-4.5 sm:h-5.5 md:h-6 opacity-85'
                            }`}
                        >
                            {/* Logotipos en blanco ceniza: Tamaño general reducido al 50% */}
                            <img
                                src={brand.src}
                                alt={brand.alt}
                                className={`h-full w-auto object-contain filter drop-shadow-md ${
                                    brand.scale === 'double'
                                        ? 'max-w-[120px] sm:max-w-[150px]'
                                        : brand.scale === 'mid'
                                        ? 'max-w-[105px] sm:max-w-[135px]'
                                        : brand.scale === 'reduced'
                                        ? 'max-w-[45px] sm:max-w-[60px]'
                                        : 'max-w-[65px] sm:max-w-[85px]'
                                }`}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
