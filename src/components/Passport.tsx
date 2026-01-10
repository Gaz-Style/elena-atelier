import { motion } from 'framer-motion';

interface PassportProps {
    id: string;
    garmentName: string;
    artisan: string;
    fabricOrigin: string;
    confectionDate: string;
    status: 'cutting' | 'sewing' | 'finishing' | 'ready';
}

export default function DigitalPassport({ data }: { data: PassportProps }) {
    const steps = [
        { key: 'cutting', label: 'Corte de Precisión' },
        { key: 'sewing', label: 'Ensamblado Artesanal' },
        { key: 'finishing', label: 'Acabados Premium' },
        { key: 'ready', label: 'Listo para Entrega' }
    ];

    const currentStepIndex = steps.findIndex(s => s.key === data.status);

    return (
        <div className="min-h-screen bg-white font-sans text-brand-charcoal py-12 px-6">
            <div className="max-w-md mx-auto space-y-12">
                {/* Header - Quality Badge style */}
                <div className="border border-brand-sand p-8 bg-brand-sand/10 text-center space-y-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-text-secondary">Pasaporte de Calidad & Trazabilidad</span>
                    <h1 className="font-serif text-3xl">{data.garmentName}</h1>
                    <p className="text-xs font-mono text-text-secondary opacity-50">REG-#ID-{data.id.toUpperCase()}</p>
                </div>

                {/* Trazabilidad Section */}
                <section className="space-y-6">
                    <h3 className="font-serif text-xl border-b border-brand-sand pb-2">Trazabilidad Radical</h3>
                    <div className="grid gap-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-secondary italic">Origen de la Tela</span>
                            <span className="font-medium">{data.fabricOrigin}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-secondary italic">Mano de Obra</span>
                            <span className="font-medium">{data.artisan}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-secondary italic">Fecha de Inicio</span>
                            <span className="font-medium">{data.confectionDate}</span>
                        </div>
                    </div>
                </section>

                {/* Cuidados & Longevidad */}
                <section className="space-y-6 bg-brand-sand/5 p-6 border-l-2 border-brand-terracotta">
                    <h3 className="font-serif text-xl">Cuidados de Inversión</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Esta prenda ha sido diseñada para durar décadas. Recomendamos limpieza en seco especializada y almacenaje en funda de algodón orgánico.
                    </p>
                    <div className="flex gap-4 text-[10px] uppercase tracking-widest font-medium">
                        <span>⬢ No Lavar</span>
                        <span>⬢ Plancha Suave</span>
                        <span>⬢ Secado a Sombra</span>
                    </div>
                </section>

                {/* Dynamic Status Progress */}
                <section className="space-y-8">
                    <h3 className="font-serif text-xl border-b border-brand-sand pb-2">Estado de Confección</h3>
                    <div className="relative pl-8 space-y-10">
                        {/* Timeline Line */}
                        <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-brand-sand" />

                        {steps.map((step, index) => (
                            <div key={step.key} className="relative flex items-center gap-6">
                                <div className={`absolute -left-[33px] w-4 h-4 rounded-full border-2 border-white shadow-sm transition-colors duration-500 ${index <= currentStepIndex ? 'bg-brand-terracotta' : 'bg-gray-200'}`} />
                                <span className={`text-sm tracking-wide ${index <= currentStepIndex ? 'font-medium text-brand-charcoal' : 'text-gray-300'}`}>
                                    {step.label}
                                </span>
                                {index === currentStepIndex && (
                                    <motion.span
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="text-[10px] bg-brand-sand text-brand-terracotta px-2 py-0.5 rounded-full uppercase"
                                    >
                                        En proceso
                                    </motion.span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Location Badge */}
                <div className="pt-12 text-center text-[10px] text-text-secondary uppercase tracking-widest leading-loose">
                    Confeccionado éticamente en <br />
                    <span className="text-brand-charcoal">Av. Tabancura 1091, Vitacura</span>
                </div>
            </div>
        </div>
    );
}
