import BookingForm from "@/components/BookingForm";
import Navbar from "@/components/Navbar";
import BackLink from "@/components/BackLink";

export default function AppointmentPage() {
    return (
        <div className="min-h-screen bg-brand-charcoal text-white font-sans relative">
            <Navbar />

            {/* Back Link */}
            <BackLink />
            
            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
                    <div className="space-y-8 mt-4">
                        <span className="font-sans text-xs uppercase tracking-[0.35em] text-brand-sand block">Calidad & Transparencia</span>
                        <h1 className="font-serif text-5xl md:text-7xl leading-tight text-white">
                            Aprender <br />
                            <span className="italic text-brand-sand">Haciendo</span>
                        </h1>
                        <p className="text-base md:text-lg text-white/60 max-w-lg leading-relaxed font-light">
                            Un espacio donde el aprendizaje ocurre entre telas, pruebas y oficio real.
                        </p>

                        <div className="space-y-8 pt-6">
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center font-serif text-xl rounded-sm text-brand-sand shrink-0 shadow-md">I</div>
                                <div className="space-y-1">
                                    <h4 className="font-serif text-xl border-b border-white/10 pb-2 text-white">Conversación Creativa</h4>
                                    <p className="text-sm text-white/60">Nos tomamos el tiempo para entender tu estilo y lo que buscas en tu prenda.</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center font-serif text-xl rounded-sm text-brand-sand shrink-0 shadow-md">II</div>
                                <div className="space-y-1">
                                    <h4 className="font-serif text-xl border-b border-white/10 pb-2 text-white">Proceso Transparente</h4>
                                    <p className="text-sm text-white/60">Iniciamos el registro de tu pedido para que conozcas cada etapa de su creación.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <BookingForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
