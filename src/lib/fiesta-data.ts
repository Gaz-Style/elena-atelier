export type ColorCategoria = 'Negro' | 'Rojo' | 'Azul' | 'Verde' | 'Rosa' | 'Plata' | 'Dorado' | 'Varios';
export type Silueta = 'Sirena' | 'A-Line' | 'Princesa' | 'Recto' | 'Imperio' | 'Asimétrico';
export type Tejido = 'Satén' | 'Seda' | 'Lentejuelas' | 'Terciopelo' | 'Gasa' | 'Crepé' | 'Encaje' | 'Metalizado';

export interface Vestido {
  id: number;
  nombre: string;
  color: string;
  colorCategoria: ColorCategoria;
  silueta: Silueta;
  tejido: Tejido;
  descripcion: string;
  imagenFrente: string;
  imagenEspalda: string;
  imagenesExtra?: string[];
  precio: number;
}

export const colores: ColorCategoria[] = ['Negro', 'Rojo', 'Azul', 'Verde', 'Rosa', 'Plata', 'Dorado', 'Varios'];
export const siluetas: Silueta[] = ['Sirena', 'A-Line', 'Princesa', 'Recto', 'Imperio', 'Asimétrico'];
export const tejidos: Tejido[] = ['Satén', 'Seda', 'Lentejuelas', 'Terciopelo', 'Gasa', 'Crepé', 'Encaje', 'Metalizado'];

export const vestidosFiesta: Vestido[] = [
  {
    "id": 1,
    "nombre": "Clara",
    "color": "Celeste  Azul Royal",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Clara en color Celeste  Azul Royal. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/1. Clara Celeste  Azul Royal Frente.png",
    "imagenEspalda": "/trabajos/fiesta/1. Clara Celeste  Azul Royal Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 2,
    "nombre": "Lola",
    "color": "Verde Esmeralda",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Lola en color Verde Esmeralda. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/2. Lola Verde Esmeralda.png",
    "imagenEspalda": "/trabajos/fiesta/2. Lola Verde Esmeralda Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 3,
    "nombre": "Tomasa",
    "color": "Azul Marino",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Tomasa en color Azul Marino. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/3. Tomasa Azul Marino.png",
    "imagenEspalda": "/trabajos/fiesta/3. Tomasa Azul Marino Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 4,
    "nombre": "Rebecca",
    "color": "Verde Sage",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Rebecca en color Verde Sage. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/4. Rebecca Verde Sage.png",
    "imagenEspalda": "/trabajos/fiesta/4. Rebecca Verde Sage Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 5,
    "nombre": "Camila",
    "color": "Negro Ajustado",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Camila en color Negro Ajustado. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/5. Camila Negro Ajustado.png",
    "imagenEspalda": "/trabajos/fiesta/5. Camila Negro Ajustado Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 6,
    "nombre": "Olivia",
    "color": "Azul Navy",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Olivia en color Azul Navy. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/6. Olivia Azul Navy.png",
    "imagenEspalda": "/trabajos/fiesta/6. Olivia Azul Navy Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 7,
    "nombre": "Estrella",
    "color": "Plata",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Estrella en color Plata. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/7. Estrella Plata.png",
    "imagenEspalda": "/trabajos/fiesta/7. Estrella Plata Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 8,
    "nombre": "Marta",
    "color": "Gold Mist",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Marta en color Gold Mist. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/8. Marta Gold Mist.png",
    "imagenEspalda": "/trabajos/fiesta/8. Marta Gold Mist Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 9,
    "nombre": "Majadas",
    "color": "Lentejuelas",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Majadas en color Lentejuelas. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/9. Majadas Lentejuelas.png",
    "imagenEspalda": "/trabajos/fiesta/9. Majadas Lentejuelas Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 10,
    "nombre": "Majadas",
    "color": "Clásico",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Majadas en color Clásico. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/10. Majadas Clásico.png",
    "imagenEspalda": "/trabajos/fiesta/10. Majadas Clásico Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 11,
    "nombre": "Isabel",
    "color": "Velvet",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Isabel en color Velvet. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/11. Isabel Velvet.png",
    "imagenEspalda": "/trabajos/fiesta/11. Isabel Velvet Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 12,
    "nombre": "Antonieta",
    "color": "Velvet",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Antonieta en color Velvet. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/12. Antonieta Velvet.png",
    "imagenEspalda": "/trabajos/fiesta/12. Antonieta Velvet Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 13,
    "nombre": "Caroline",
    "color": "Fiesta",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Caroline en color Fiesta. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/13. Caroline Fiesta.png",
    "imagenEspalda": "/trabajos/fiesta/13. Caroline Fiesta Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 14,
    "nombre": "Faustina",
    "color": "Turquesa",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Faustina en color Turquesa. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/14. Faustina Turquesa.png",
    "imagenEspalda": "/trabajos/fiesta/14. Faustina Turquesa Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 15,
    "nombre": "Julianna",
    "color": "Magenta",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Julianna en color Magenta. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/15. Julianna Magenta.png",
    "imagenEspalda": "/trabajos/fiesta/15. Julianna Magenta Espalda 2.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 16,
    "nombre": "Camille",
    "color": "Granate",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Camille en color Granate. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/16. Camille Granate..png",
    "imagenEspalda": "/trabajos/fiesta/16. Camille Granate Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 17,
    "nombre": "Isabella",
    "color": "Azul Rey",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Isabella en color Azul Rey. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/17. Isabella Azul Rey.png",
    "imagenEspalda": "/trabajos/fiesta/17. Isabella Azul Rey Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 18,
    "nombre": "Catarina",
    "color": "Floral",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Catarina en color Floral. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/18. Catarina Floral.png",
    "imagenEspalda": "/trabajos/fiesta/18. Catarina Floral Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 19,
    "nombre": "Marlene",
    "color": "Morado",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Marlene en color Morado. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/19. Marlene Morado.png",
    "imagenEspalda": "/trabajos/fiesta/19. Marlene Morado Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 20,
    "nombre": "Renatta",
    "color": "Verde Botella",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Renatta en color Verde Botella. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/20. Renatta Verde Botella.png",
    "imagenEspalda": "/trabajos/fiesta/20. Renatta Verde Botella Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 21,
    "nombre": "Arella",
    "color": "Rose Gold",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Arella en color Rose Gold. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/21. Arella Rose Gold.png",
    "imagenEspalda": "/trabajos/fiesta/21. Arella Rose Gold Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 21.1,
    "nombre": "Arella",
    "color": "Rose Gold Drapeado",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Arella en color Rose Gold Drapeado. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/21.1. Arella Rose Gold Drapeado.png",
    "imagenEspalda": "/trabajos/fiesta/21.1. Arella Rose Gold Drapeado Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 22,
    "nombre": "Madison",
    "color": "Largo Negro",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Madison en color Largo Negro. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/22. Madison Largo Negro.png",
    "imagenEspalda": "/trabajos/fiesta/22. Madison Largo Negro Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 23,
    "nombre": "Aliana",
    "color": "Terracota",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Aliana en color Terracota. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/23. Aliana Terracota.png",
    "imagenEspalda": "/trabajos/fiesta/23. Aliana Terracota Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  },
  {
    "id": 26,
    "nombre": "Valentina",
    "color": "Midnight Navy",
    "colorCategoria": "Varios",
    "silueta": "A-Line",
    "tejido": "Seda",
    "descripcion": "Vestido elegante Valentina en color Midnight Navy. Ideal para eventos de noche y fiestas.",
    "imagenFrente": "/trabajos/fiesta/26. Valentina Midnight Navy.png",
    "imagenEspalda": "/trabajos/fiesta/26. Valentina Midnight Navy Espalda.png",
    "imagenesExtra": [],
    "precio": 250000
  }
];
