import BookingForm from "@/components/BookingForm";

export default function AppointmentPage() {
    return (
        <div className="min-h-screen bg-brand-sand/20 py-24 px-6">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-24 items-start">
                <div className="space-y-8">
                    <span className="font-sans text-sm uppercase tracking-[0.3em] text-brand-terracotta">Calidad & Transparencia</span>
                    <h1 className="font-serif text-5xl md:text-7xl leading-tight">Tu ropa merece <br />una <span className="italic">segunda vida</span></h1>
                    <p className="text-xl text-text-secondary max-w-lg leading-relaxed">
                        En elenalacosturera creemos que la elegancia está en el tiempo y el detalle. Te invitamos a vivir el proceso lento y humano de la creación textil en nuestro taller.
                    </p>

                    <div className="space-y-6 pt-12">
                        <div className="flex gap-6 items-start">
                            <div className="w-12 h-12 bg-white flex items-center justify-center font-serif text-xl shadow-sm">I</div>
                            <div>
                                <h4 className="font-serif text-xl border-b border-brand-sand pb-2 mb-2">Conversación Creativa</h4>
                                <p className="text-sm text-text-secondary">Nos tomamos el tiempo para entender tu estilo y lo que buscas en tu prenda.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start">
                            <div className="w-12 h-12 bg-white flex items-center justify-center font-serif text-xl shadow-sm">II</div>
                            <div>
                                <h4 className="font-serif text-xl border-b border-brand-sand pb-2 mb-2">Proceso Transparente</h4>
                                <p className="text-sm text-text-secondary">Iniciamos el registro de tu pedido para que conozcas cada etapa de su creación.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <BookingForm />
            </div>
        </div>
    );
}
