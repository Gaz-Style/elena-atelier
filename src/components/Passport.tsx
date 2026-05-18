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
        <div className="min-h-screen bg-brand-charcoal font-sans text-white py-12 px-6">
            <div className="max-w-md mx-auto space-y-12 animate-in fade-in duration-700">
                {/* Header - Quality Badge style */}
                <div className="border border-white/10 p-8 bg-white/5 text-center space-y-4 rounded-sm shadow-2xl">
                    <span className="text-[9px] uppercase tracking-[0.4em] text-white/40 block font-semibold">Pasaporte de Calidad & Trazabilidad</span>
                    <h1 className="font-serif text-3xl text-white">{data.garmentName}</h1>
                    <p className="text-[10px] font-mono text-brand-sand/50">REG-#ID-{data.id.toUpperCase()}</p>
                </div>

                {/* Trazabilidad Section */}
                <section className="space-y-6">
                    <h3 className="font-serif text-xl border-b border-white/10 pb-2 text-white">Trazabilidad Radical</h3>
                    <div className="grid gap-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-white/40 italic">Origen de la Tela</span>
                            <span className="font-medium text-white">{data.fabricOrigin}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-white/40 italic">Mano de Obra</span>
                            <span className="font-medium text-white">{data.artisan}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-white/40 italic">Fecha de Inicio</span>
                            <span className="font-medium text-white">{data.confectionDate}</span>
                        </div>
                    </div>
                </section>

                {/* Cuidados & Longevidad */}
                <section className="space-y-6 bg-white/[0.03] p-6 border-l border-brand-sand rounded-sm shadow-xl">
                    <h3 className="font-serif text-xl text-white">Cuidados de Inversión</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                        Esta prenda ha sido diseñada para durar décadas. Recomendamos limpieza en seco especializada y almacenaje en funda de algodón orgánico.
                    </p>
                    <div className="flex gap-4 text-[9px] uppercase tracking-widest font-semibold text-brand-sand">
                        <span>⬢ No Lavar</span>
                        <span>⬢ Plancha Suave</span>
                        <span>⬢ Secado a Sombra</span>
                    </div>
                </section>

                {/* Dynamic Status Progress */}
                <section className="space-y-8">
                    <h3 className="font-serif text-xl border-b border-white/10 pb-2 text-white">Estado de Confección</h3>
                    <div className="relative pl-8 space-y-10">
                        {/* Timeline Line */}
                        <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-white/10" />

                        {steps.map((step, index) => (
                            <div key={step.key} className="relative flex items-center gap-6">
                                <div className={`absolute -left-[33px] w-4 h-4 rounded-full border-2 border-brand-charcoal shadow-sm transition-colors duration-500 ${index <= currentStepIndex ? 'bg-brand-sand' : 'bg-white/10 border-white/20'}`} />
                                <span className={`text-sm tracking-wide ${index <= currentStepIndex ? 'font-semibold text-white' : 'text-white/20'}`}>
                                    {step.label}
                                </span>
                                {index === currentStepIndex && (
                                    <motion.span
                                        animate={{ opacity: [1, 0.6, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="text-[9px] bg-brand-sand text-[#121212] px-2.5 py-0.5 rounded-[1px] uppercase font-bold tracking-wider"
                                    >
                                        En proceso
                                    </motion.span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Location Badge */}
                <div className="pt-12 text-center text-[10px] text-white/40 uppercase tracking-widest leading-loose">
                    Confeccionado éticamente en <br />
                    <span className="text-brand-sand font-semibold">Av. Tabancura 1091, Vitacura</span>
                </div>
            </div>
        </div>
    );
}
