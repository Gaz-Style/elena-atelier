import Link from 'next/link';
import { Settings, ShieldCheck, Activity, Users, Database, Globe } from 'lucide-react';

export default function SettingsPage() {
  const configSections = [
    {
      title: "Seguridad y Accesos",
      description: "Gestiona quién entra al sistema y supervisa la actividad de las cuentas.",
      icon: ShieldCheck,
      color: "bg-blue-50 text-blue-600",
      links: [
        { name: "Sesiones & Accesos", href: "/admin/sessions", desc: "Monitorea dispositivos y direcciones IP conectados." },
        { name: "Usuarios Administradores", href: "/admin/settings/users", desc: "Añade o revoca permisos a tu equipo de trabajo." }
      ]
    },
    {
      title: "Sistema y Logs",
      description: "Revisa los registros técnicos, errores y el comportamiento de las integraciones.",
      icon: Activity,
      color: "bg-amber-50 text-amber-600",
      links: [
        { name: "Ver Logs del Sistema", href: "/admin/logs", desc: "Registros de Mercado Pago, WhatsApp y errores." },
        { name: "Estado de la Base de Datos", href: "#", desc: "Próximamente: Métricas de almacenamiento.", disabled: true }
      ]
    },
    {
      title: "Preferencias Generales",
      description: "Configuraciones básicas de tu aplicación y de la marca Elena Atalier.",
      icon: Settings,
      color: "bg-zinc-100 text-zinc-600",
      links: [
        { name: "Información del Negocio", href: "#", desc: "Próximamente: Actualiza direcciones y teléfonos.", disabled: true },
        { name: "Dominios y SEO", href: "#", desc: "Próximamente: Gestiona cómo te ven en Google.", disabled: true }
      ]
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-charcoal/5 flex items-center justify-center">
            <Settings className="text-brand-charcoal w-5 h-5" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">Configuraciones del Sistema</h1>
        </div>
        <p className="text-zinc-500 text-sm ml-13">
          Administra la seguridad, revisa los registros técnicos y personaliza tu entorno de trabajo.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {configSections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${section.color}`}>
                <section.icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">{section.title}</h2>
            </div>
            
            <p className="text-sm text-zinc-500 mb-6 flex-1">
              {section.description}
            </p>

            <div className="space-y-3">
              {section.links.map((link, linkIdx) => (
                link.disabled ? (
                  <div key={linkIdx} className="block p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 opacity-60 cursor-not-allowed">
                    <div className="font-semibold text-zinc-700 text-sm">{link.name}</div>
                    <div className="text-xs text-zinc-500 mt-1">{link.desc}</div>
                  </div>
                ) : (
                  <Link key={linkIdx} href={link.href} className="block p-4 rounded-xl border border-zinc-200 hover:border-brand-terracotta/50 hover:shadow-sm transition-all group bg-white">
                    <div className="font-semibold text-zinc-900 text-sm group-hover:text-brand-terracotta transition-colors">
                      {link.name}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 group-hover:text-zinc-600 transition-colors">
                      {link.desc}
                    </div>
                  </Link>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
