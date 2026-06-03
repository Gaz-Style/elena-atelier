import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Check, Clock, Users, Award, ChevronRight, Sparkles, Star } from 'lucide-react';

export const metadata = {
    title: 'Cursos de Costura en Vitacura | Elena Atelier',
    description: 'Aprende alta costura y sastrería a medida en el atelier más exclusivo de Santiago. Cursos presenciales en Vitacura: desde principiantes hasta patronaje avanzado y costura a máquina.',
    keywords: 'cursos costura vitacura, cursos sastrería santiago, aprender coser santiago, alta costura chile',
};

const COURSES = [
    {
        id: 'iniciacion',
        title: 'Iniciación a la Costura',
        subtitle: 'Para quienes comienzan desde cero',
        level: 'Principiante',
        levelColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        price: 70000,
        promoPrice: 52500,
        duration: '2 sesiones · 4 horas',
        groupSize: 'Grupos reducidos',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
        badge: '25% OFF',
        description: 'Aprende a usar la máquina de coser desde cero y crea tus primeros proyectos, aunque nunca hayas cosido antes.',
        includes: [
            'Uso correcto de la máquina de coser recta',
            'Funciones y partes principales',
            'Solución de problemas básicos',
            'Primer proyecto: estuche forrado con cierre',
            'Materiales incluidos',
        ],
        ideal: 'Si nunca has cosido, buscas un hobby creativo o quieres iniciarte como emprendedora.',
        schedules: ['AM: 10:30 – 12:30 h', 'PM: 15:00 – 17:00 h', 'Horario intensivo disponible'],
    },
    {
        id: 'confeccion',
        title: 'Costura & Confección',
        subtitle: 'Construye tu primera prenda completa',
        level: 'Intermedio',
        levelColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        price: 90000,
        promoPrice: 75000,
        duration: '3 sesiones · 6 horas',
        groupSize: 'Grupos reducidos',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
        badge: null,
        description: 'Domina las técnicas de confección para crear prendas con acabados impecables: mangas, cremalleras, bolsillos.',
        includes: [
            'Técnicas de corte profesional',
            'Costuras a máquina (recta y overlock)',
            'Instalación de cierres y cremalleras',
            'Confección de bolsillos y mangas',
            'Patronaje básico escala real',
        ],
        ideal: 'Si ya sabes lo básico y quieres pasar a confeccionar prendas completas.',
        schedules: ['AM: 10:30 – 12:30 h', 'PM: 15:00 – 17:00 h'],
    },
    {
        id: 'arreglos',
        title: 'Arreglos & Sastrería',
        subtitle: 'El arte de que la ropa te quede perfecta',
        level: 'Intermedio',
        levelColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        price: 80000,
        promoPrice: 65000,
        duration: '2 sesiones · 4 horas',
        groupSize: 'Grupos reducidos',
        image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=800&auto=format&fit=crop',
        badge: null,
        description: 'Aprende a realizar los arreglos más comunes: bastillas, entradas y salidas de ropa, ajustes de tiro y más.',
        includes: [
            'Bastillas a máquina e invisibles',
            'Entrada y salida de pantalones y faldas',
            'Ajuste de busto y cintura',
            'Arreglo de mangas y largos',
            'Uso de vaporizador profesional',
        ],
        ideal: 'Para quien quiere ahorrar en modista haciendo sus propios arreglos en casa.',
        schedules: ['AM: 10:30 – 12:30 h', 'PM: 15:00 – 17:00 h'],
    },
    {
        id: 'patronaje',
        title: 'Patronaje & Diseño',
        subtitle: 'Crea tus propios moldes desde cero',
        level: 'Avanzado',
        levelColor: 'text-brand-terracotta bg-brand-terracotta/10 border-brand-terracotta/20',
        price: 120000,
        promoPrice: null,
        duration: '4 sesiones · 8 horas',
        groupSize: 'Grupos muy reducidos',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
        badge: 'Exclusivo',
        description: 'Aprende el lenguaje técnico de la costura de alta gama. Traza, escala y adapta patrones a cualquier medida.',
        includes: [
            'Sistema métrico de patronaje',
            'Trazado de patrones base (cuerpo, falda, pantalón)',
            'Escalado y grading de tallas',
            'Transformaciones y variantes de diseño',
            'Correcciones sobre el maniquí',
        ],
        ideal: 'Para costureras con experiencia que quieren trabajar con medidas propias y crear diseños originales.',
        schedules: ['AM: 10:30 – 12:30 h', 'PM: 15:00 – 17:00 h'],
    },
    {
        id: 'pack',
        title: 'Pack Formación Completa',
        subtitle: 'De principiante a avanzada · Todo el año',
        level: 'Todos los niveles',
        levelColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        price: 1146000,
        promoPrice: 699999,
        duration: '12 meses de acceso continuo',
        groupSize: 'Todos los cursos incluidos',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
        badge: 'Ahorra 40%',
        description: 'Accede a todos los cursos actuales y los que abriremos durante el año. La inversión más inteligente si quieres una formación completa.',
        includes: [
            'Acceso a todos los cursos del catálogo 2026',
            'Todos los cursos nuevos que se abran en el año',
            '12 meses desde la fecha de compra',
            'Materiales incluidos en cada curso',
            'Hasta 3 cuotas precio contado',
        ],
        ideal: 'Para quien quiere una formación seria de principio a fin, con método, práctica constante y un ahorro real.',
        schedules: ['Horarios a elegir según disponibilidad'],
        featured: true,
    },
];

function formatCLP(amount: number) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

export default function CursosPage() {
    return (
        <div className="min-h-screen bg-brand-charcoal text-white font-sans">
            <Navbar />

            {/* HERO */}
            <header className="relative min-h-[70vh] flex items-end overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/cursos-hero.png"
                        alt="Taller de costura Elena Atelier Vitacura"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal/80 via-transparent to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-20 pt-40">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-brand-sand mb-6 font-bold">Vitacura, Santiago · Cursos Presenciales</p>
                    <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-none">
                        Aprende el Arte<br />
                        <span className="text-brand-sand">de Coser.</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-xl leading-relaxed mb-10">
                        Desde tus primeras puntadas hasta el patronaje avanzado. Grupos reducidos, ambiente exclusivo y materiales incluidos en cada sesión.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="#cursos" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-sand text-brand-charcoal font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors rounded-sm">
                            Ver Cursos <ChevronRight className="w-4 h-4" />
                        </a>
                        <a
                            href={`https://wa.me/56912345678?text=Hola,%20me%20interesa%20información%20sobre%20los%20cursos%20de%20costura%20de%20Elena%20Atelier`}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-colors rounded-sm"
                        >
                            Consultar por WhatsApp
                        </a>
                    </div>
                </div>
            </header>

            {/* SOCIAL PROOF BAR */}
            <div className="border-y border-white/10 bg-white/5 py-6">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-10 text-center">
                    {[
                        { label: 'Años impartiendo cursos', value: '4+' },
                        { label: 'Alumnas formadas', value: '500+' },
                        { label: 'Cursos disponibles', value: '5' },
                        { label: 'Materiales incluidos', value: '100%' },
                    ].map(item => (
                        <div key={item.label} className="space-y-1">
                            <p className="font-serif text-3xl text-brand-sand">{item.value}</p>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* COURSES GRID */}
            <section id="cursos" className="max-w-7xl mx-auto px-6 md:px-12 py-24">
                <div className="text-center mb-16">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-brand-sand mb-4 font-bold">Catálogo 2026</p>
                    <h2 className="font-serif text-4xl md:text-5xl text-white">Elige tu camino</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {COURSES.map(course => (
                        <article
                            key={course.id}
                            className={`relative flex flex-col rounded-sm overflow-hidden border transition-all duration-300 hover:-translate-y-1 group ${
                                course.featured
                                    ? 'border-brand-sand/40 shadow-[0_0_60px_rgba(245,242,235,0.08)]'
                                    : 'border-white/10 hover:border-white/20'
                            } bg-white/5 backdrop-blur-sm`}
                        >
                            {/* Badge */}
                            {course.badge && (
                                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-brand-terracotta text-white text-[9px] font-bold uppercase tracking-widest rounded-full">
                                    {course.badge}
                                </div>
                            )}

                            {/* Image */}
                            <div className="relative h-52 overflow-hidden">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 to-transparent" />
                                <div className={`absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${course.levelColor}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {course.level}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col flex-grow p-7 space-y-5">
                                <div>
                                    <h3 className="font-serif text-2xl text-white mb-1">{course.title}</h3>
                                    <p className="text-brand-sand/60 text-xs uppercase tracking-widest font-bold">{course.subtitle}</p>
                                </div>

                                <p className="text-white/60 text-sm leading-relaxed">{course.description}</p>

                                {/* Info row */}
                                <div className="flex items-center gap-5 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{course.duration}</span>
                                    <span className="flex items-center gap-1.5"><Users className="w-3 h-3" />{course.groupSize}</span>
                                </div>

                                {/* What's included */}
                                <ul className="space-y-2">
                                    {course.includes.slice(0, 4).map((item, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-xs text-white/70">
                                            <Check className="w-3.5 h-3.5 text-brand-sand shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                {/* Schedules */}
                                <div className="bg-white/5 border border-white/10 rounded-sm p-4 space-y-1.5">
                                    <p className="text-[9px] uppercase tracking-widest font-bold text-brand-sand">Horarios disponibles</p>
                                    {course.schedules.map((s, i) => (
                                        <p key={i} className="text-xs text-white/60">{s}</p>
                                    ))}
                                </div>

                                {/* Price & CTA */}
                                <div className="mt-auto pt-2 space-y-4">
                                    <div className="flex items-end gap-3">
                                        {course.promoPrice ? (
                                            <>
                                                <span className="font-serif text-3xl font-bold text-white">{formatCLP(course.promoPrice)}</span>
                                                <span className="text-sm text-white/30 line-through mb-1">{formatCLP(course.price)}</span>
                                            </>
                                        ) : (
                                            <span className="font-serif text-3xl font-bold text-white">{formatCLP(course.price)}</span>
                                        )}
                                    </div>

                                    <a
                                        href={`https://wa.me/56912345678?text=Hola,%20quiero%20inscribirme%20al%20curso:%20${encodeURIComponent(course.title)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full flex items-center justify-center gap-2 py-4 text-xs uppercase tracking-widest font-bold rounded-sm transition-all ${
                                            course.featured
                                                ? 'bg-brand-sand text-brand-charcoal hover:bg-white'
                                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                        }`}
                                    >
                                        Inscribirme <ChevronRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* WHY ELENA */}
            <section className="border-t border-white/10 bg-white/5 py-24">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-16">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-brand-sand mb-4 font-bold">¿Por qué elegirnos?</p>
                        <h2 className="font-serif text-4xl text-white">El atelier donde aprendes de verdad</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Award, title: 'Experiencia comprobada', desc: 'Más de 4 años y 500 alumnas formadas en un ambiente exclusivo de alta costura, no una academia masiva.' },
                            { icon: Users, title: 'Grupos muy reducidos', desc: 'Máximo 6 personas por clase. Tu aprendizaje tiene atención personalizada, porque nos importa que aprendas bien.' },
                            { icon: Sparkles, title: 'Materiales incluidos', desc: 'No tienes que comprar nada. Cada curso incluye todos los materiales que necesitas para completar tu proyecto.' },
                        ].map(item => (
                            <div key={item.title} className="p-8 border border-white/10 rounded-sm bg-white/5 space-y-4">
                                <div className="w-12 h-12 rounded-full bg-brand-sand/10 flex items-center justify-center">
                                    <item.icon className="w-6 h-6 text-brand-sand" />
                                </div>
                                <h3 className="font-serif text-xl text-white">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* LOCATION CTA */}
            <section className="py-24 text-center">
                <div className="max-w-2xl mx-auto px-6 space-y-6">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-brand-sand font-bold">Atelier Físico</p>
                    <h2 className="font-serif text-4xl text-white">Tabancura 1091, Oficina 319<br />Vitacura, Santiago</h2>
                    <p className="text-white/50 text-sm">Horario de clases: Lunes a Sábado, 10:30 – 19:00 hrs</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <a
                            href="https://wa.me/56912345678?text=Hola,%20quiero%20información%20sobre%20cursos%20de%20costura%20en%20Elena%20Atelier"
                            target="_blank"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-sand text-brand-charcoal font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors rounded-sm"
                        >
                            Reservar lugar por WhatsApp
                        </a>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-colors rounded-sm"
                        >
                            Conocer el Atelier
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
