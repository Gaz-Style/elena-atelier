export interface InstanciaNovia {
  titulo: string;
  subtitulo: string;
  descripcion: string;
  imagen: string;
  detallesTecnicos: string[];
}

export interface HistoriaNovia {
  slug: string;
  novia: string;
  ubicacion: string;
  fecha: string;
  resumenNarrativo: string;
  citaEmocional: string;
  imagenPrincipal: string;
  etapaAtelier: {
    titulo: string;
    descripcion: string;
    imagen: string;
    mamaYMadrinas: string;
  };
  instancias: {
    civil: InstanciaNovia;
    iglesia: InstanciaNovia;
    fiesta: InstanciaNovia;
  };
  madrinasYMadre: {
    titulo: string;
    descripcion: string;
    imagen: string;
    detalles: string[];
  };
}

export const historiasNovias: HistoriaNovia[] = [
  {
    slug: 'sofia-tres-vestidos-matrimonio-las-condes',
    novia: 'Sofía Larraín',
    ubicacion: 'Las Condes & Casona Las Condes, Santiago',
    fecha: 'Temporada Nupcial 2026',
    citaEmocional: '"Una producción editorial que demuestra la versatilidad de la alta costura a medida: 3 momentos de vestuario nupcial diseñados para dialogar con la arquitectura, la joyería fina y el movimiento real."',
    resumenNarrativo: 'Producción editorial exclusiva de Elena Atelier realizada en colaboración con modelos nupciales, fotógrafos de autor y marcas asociadas. Se presenta una propuesta estética completa para los 3 hitos del matrimonio: la ceremonia civil urbana, la majestuosidad de la iglesia y la libertad nocturna de la fiesta.',
    imagenPrincipal: '/trabajos/novias/historia_sofia_iglesia.png',
    etapaAtelier: {
      titulo: 'Producción en Taller & Styling de Colaboraciones',
      descripcion: 'Detrás de cámaras de la sesión editorial en Elena Atelier. Pruebas de moldería a medida, selección de telas nobles e integración de accesorios y vestuario para la Madre de la Novia y Madrinas con firmas invitadas.',
      imagen: '/trabajos/novias/historia_sofia_atelier.png',
      mamaYMadrinas: 'Styling coordinado con vestuario a medida para la Madre de la Novia en seda azul zafiro y propuesta estética de Madrinas.'
    },
    instancias: {
      civil: {
        titulo: '01. El Matrimonio Civil',
        subtitulo: 'Traje Sastre a Medida en Crepé Marfil',
        descripcion: 'Para la ceremonia civil en la municipalidad y el almuerzo íntimo, Sofía lució un traje pantalón sastre en crepé de seda pura con una capa corta desprendible en encaje francés. Una propuesta urbana, femenina y de calce impecable.',
        imagen: '/trabajos/novias/historia_sofia_civil.png',
        detallesTecnicos: [
          'Crepé de seda natural marfil',
          'Capa en encaje chantilly desprendible',
          'Moldería anatómica de alta movilidad'
        ]
      },
      iglesia: {
        titulo: '02. La Ceremonia Religiosa',
        subtitulo: 'Vestido Sagrado en Seda Mikado & Cola Catedral',
        descripcion: 'El momento central del enlace exigía solemnidad y estructura visual. Un vestido de corte princesa sobrio en seda Mikado con escote sutil, cuerpo ajustado mediante corset interno anatómico y una cola majestuosa de 3 metros bordada a mano.',
        imagen: '/trabajos/novias/historia_sofia_iglesia.png',
        detallesTecnicos: [
          'Seda Mikado de alta densidad',
          'Bordado a mano en aplicación de velo',
          'Soporte interno de ingeniería sastre (cero rigidez)'
        ]
      },
      fiesta: {
        titulo: '03. La Fiesta & Noche de Baile',
        subtitulo: 'Slip Dress en Crepé Flotante & Espalda Profunda',
        descripcion: 'Para la fiesta, Sofía se liberó de la cola y el peso estructural. Ingresó a la pista con un vestido slip dress en crepé de seda liviana, con caída fluida, escote en la espalda y abertura lateral que le permitió saltar y bailar hasta la madrugada.',
        imagen: '/trabajos/novias/historia_sofia_fiesta.png',
        detallesTecnicos: [
          'Crepé de seda ultra liviano',
          'Espalda descubierta con tirantes joya',
          'Estructura pensada para movimiento extremo'
        ]
      }
    },
    madrinasYMadre: {
      titulo: 'Armonía Familiar: La Madre y las Madrinas',
      descripcion: 'La experiencia de Sofía en el Atelier fue compartida. Mientras se perfeccionaban los ajustes de Sofía, la madre de la novia y las madrinas crearon sus atuendos a medida, logrando una paleta de colores coherente para las fotografías familiares.',
      imagen: '/trabajos/novias/historia_sofia_atelier.png',
      detalles: [
        'Vestido de la Madre de la Novia en Seda Azul Zafiro drapeada',
        'Vestidos de Madrinas en tonos orgánicos complementarios',
        'Garantía de por vida en ajustes posboda'
      ]
    }
  }
];
