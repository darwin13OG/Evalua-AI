import { SampleImage } from '../types';

export const CATEGORY_MODES = [
  {
    id: 'facial',
    label: 'Facial',
    title: 'Análisis de Belleza Facial',
    subtitle: 'Simetría, proporciones, forma de rostro y rasgos',
    icon: 'Sparkles',
    defaultPrompt: 'Realiza un análisis completo de belleza facial, proporciones y forma de rostro.'
  },
  {
    id: 'fisico',
    label: 'Físico',
    title: 'Análisis Físico & Estructura',
    subtitle: 'Biotipo corporal, proporciones, postura y armonía anatómica',
    icon: 'Activity',
    defaultPrompt: 'Analiza la estructura corporal, biotipo, proporciones de postura y balance físico.'
  },
  {
    id: 'mirada',
    label: 'Mirada',
    title: 'Análisis de la Mirada',
    subtitle: 'Magnetismo, intensidad ocular, apertura y expresividad',
    icon: 'Eye',
    defaultPrompt: 'Evalúa la mirada, magnetismo, simetría ocular, cejas y expresión comunicada.'
  },
  {
    id: 'aura',
    label: 'Aura & Energía',
    title: 'Análisis de Aura & Presencia',
    subtitle: 'Vibra proyectada, magnetismo personal, calidez y carisma',
    icon: 'Flame',
    defaultPrompt: 'Analiza el aura, energía proyectada, lenguaje no verbal y magnetismo de la foto.'
  },
  {
    id: 'peinado',
    label: 'Peinado',
    title: 'Análisis de Peinado & Cabello',
    subtitle: 'Corte, textura, volumen, colorimetría y armonía capilar',
    icon: 'Scissors',
    defaultPrompt: 'Evalúa el peinado, corte de cabello, volumen y cómo enmarca el rostro.'
  }
] as const;

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-facial',
    title: 'Rostro & Belleza',
    category: 'Facial',
    mode: 'facial',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    suggestedPrompt: 'Realiza un reporte personalizado de belleza facial y forma de rostro.'
  },
  {
    id: 'sample-mirada',
    title: 'Mirada & Expresión',
    category: 'Mirada',
    mode: 'mirada',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    suggestedPrompt: 'Evalúa el magnetismo de la mirada, simetría ocular y fuerza expresiva.'
  },
  {
    id: 'sample-peinado',
    title: 'Corte & Cabello',
    category: 'Peinado',
    mode: 'peinado',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    suggestedPrompt: 'Analiza el peinado, volumen capilar y cómo enmarca los rasgos.'
  },
  {
    id: 'sample-aura',
    title: 'Presencia & Aura',
    category: 'Aura',
    mode: 'aura',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
    suggestedPrompt: '¿Qué tipo de energía, magnetismo y vibra transmite esta imagen?'
  },
  {
    id: 'sample-fisico',
    title: 'Postura & Físico',
    category: 'Físico',
    mode: 'fisico',
    url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    suggestedPrompt: 'Analiza la postura corporal, proporciones y armonía física.'
  }
];
