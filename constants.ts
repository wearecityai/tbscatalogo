import { Product, CollectionData, SiteConfig } from './types';

export const COLLECTIONS: CollectionData[] = [
  {
    name: 'Todas',
    description: ''
  },
  {
    name: 'Aurora',
    description: 'Inspirada en el amanecer, piezas con acabados dorados y cálidos que iluminan.'
  },
  {
    name: 'Nocturna',
    description: 'Elegancia misteriosa con tonos plateados, cristales y líneas geométricas modernas.'
  },
  {
    name: 'Orgánica',
    description: 'Conexión con la naturaleza mediante formas irregulares, perlas y texturas crudas.'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Gargantilla Solar',
    category: 'Collares',
    collection: 'Aurora',
    price: '25.00 €',
    description: 'Una pieza central radiante con acabado dorado mate. Perfecta para escotes profundos.',
    material: 'Aleación de zinc con baño de oro 14k',
    imageUrl: 'https://picsum.photos/seed/j1/600/800'
  },
  {
    id: '2',
    name: 'Aretes Luna Creciente',
    category: 'Aretes',
    collection: 'Nocturna',
    price: '15.00 €',
    description: 'Diseño minimalista en forma de luna. Ligeros y elegantes para el uso diario.',
    material: 'Acero inoxidable pulido',
    imageUrl: 'https://picsum.photos/seed/j2/600/800'
  },
  {
    id: '3',
    name: 'Pulsera Eslabón Grueso',
    category: 'Pulseras',
    collection: 'Aurora',
    price: '18.00 €',
    description: 'Una declaración de estilo audaz. Eslabones entrelazados con cierre invisible.',
    material: 'Latón chapado en oro',
    imageUrl: 'https://picsum.photos/seed/j3/600/800'
  },
  {
    id: '4',
    name: 'Anillo Sello Botánico',
    category: 'Anillos',
    collection: 'Orgánica',
    price: '12.00 €',
    description: 'Grabado con motivos florales sutiles. Un toque vintage para manos modernas.',
    material: 'Baño de plata envejecida',
    imageUrl: 'https://picsum.photos/seed/j4/600/800'
  },
  {
    id: '5',
    name: 'Collar Perla Irregular',
    category: 'Collares',
    collection: 'Orgánica',
    price: '22.00 €',
    description: 'Cadena fina con una perla de río central de forma orgánica. Delicadeza pura.',
    material: 'Perla de río y cadena dorada',
    imageUrl: 'https://picsum.photos/seed/j5/600/800'
  },
  {
    id: '6',
    name: 'Aretes Gota de Lluvia',
    category: 'Aretes',
    collection: 'Nocturna',
    price: '14.00 €',
    description: 'Cristal facetado transparente que atrapa la luz maravillosamente.',
    material: 'Cristal y poste hipoalergénico',
    imageUrl: 'https://picsum.photos/seed/j6/600/800'
  },
  {
    id: '7',
    name: 'Brazalete Rígido Minimal',
    category: 'Pulseras',
    collection: 'Aurora',
    price: '16.00 €',
    description: 'Líneas limpias y estructura abierta. Ideal para combinar con otros brazaletes.',
    material: 'Acero inoxidable dorado',
    imageUrl: 'https://picsum.photos/seed/j7/600/800'
  },
  {
    id: '8',
    name: 'Set de Anillos Midi',
    category: 'Anillos',
    collection: 'Nocturna',
    price: '10.00 €',
    description: 'Juego de 3 anillos finos para usar en diferentes falanges.',
    material: 'Aleación mixta plateada',
    imageUrl: 'https://picsum.photos/seed/j8/600/800'
  },
  {
    id: '9',
    name: 'Collar Cascadas',
    category: 'Collares',
    collection: 'Aurora',
    price: '30.00 €',
    description: 'Múltiples capas de cadenas finas que crean un efecto de cascada elegante.',
    material: 'Baño de oro rosa',
    imageUrl: 'https://picsum.photos/seed/j9/600/800'
  },
  {
    id: '10',
    name: 'Aretes Aro Geométrico',
    category: 'Aretes',
    collection: 'Nocturna',
    price: '17.00 €',
    description: 'Una reinterpretación moderna del clásico aro con ángulos definidos.',
    material: 'Acetato y metal',
    imageUrl: 'https://picsum.photos/seed/j10/600/800'
  },
  {
    id: '11',
    name: 'Colgante Hoja Real',
    category: 'Collares',
    collection: 'Orgánica',
    price: '24.00 €',
    description: 'Una hoja real metalizada, preservando sus nervaduras naturales únicas.',
    material: 'Baño de oro mate',
    imageUrl: 'https://picsum.photos/seed/j11/600/800'
  }
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: 'Catálogo',
  logoUrl: null,
  footerText: '© 2024. Todos los derechos reservados.',
  socialLinks: [
    { platform: 'Instagram', url: '#' },
    { platform: 'Pinterest', url: '#' },
    { platform: 'Contacto', url: 'mailto:hola@thebrightsoul.com' }
  ]
};