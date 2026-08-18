export type AnalysisMode = 'facial' | 'fisico' | 'mirada' | 'aura' | 'peinado';

export interface MetricItem {
  name: string;
  score: number; // 1.0 - 10.0
  comment?: string;
}

export interface PracticalRecommendation {
  title: string;
  iconType: 'makeup' | 'hair' | 'brows' | 'skincare' | 'style' | 'posture' | 'energy' | 'eyes' | 'general';
  description: string;
}

export interface DetailedReportResult {
  title: string;
  subtitle: string;
  mode: AnalysisMode;
  overallScore: number;
  overallScoreLabel: string;
  categoryDetected: string;
  
  // Resumen General (Métricas con barras del 1 al 10)
  metrics: MetricItem[];
  
  // Tipo / Clasificación (Ej: Forma del Rostro, Biotipo Corporal, Tipo de Mirada, etc.)
  classificationTitle: string;
  classificationName: string;
  classificationTraits: string[];
  
  // Análisis Honesto (Punto por punto)
  honestAnalysis: Array<{
    feature: string;
    detail: string;
  }>;
  
  // Ensayo o diagnóstico central
  essaySummary: string;
  
  // Puntos Fuertes
  strengths: string[];
  
  // Áreas de Mejora Realistas
  areasForImprovement: string[];
  
  // Recomendaciones Prácticas (bloques de pie)
  practicalRecommendations: PracticalRecommendation[];
  
  // Frase lema
  footerQuote: string;

  // Recomendación de otra categoría si aplica
  categorySuggestion?: {
    suggestedMode: AnalysisMode;
    reason: string;
  };
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  mode: AnalysisMode;
  url: string;
  suggestedPrompt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  hasImageAttached?: boolean;
}

export interface AppSettings {
  customApiKey: string;
  tone: 'honest' | 'humor';
  detailLevel?: 'concise' | 'detailed';
}

export interface MetricComparisonItem {
  metricName: string;
  scoreA: number; // 1.0 - 10.0
  scoreB: number; // 1.0 - 10.0
  diff: number;   // e.g. +0.5, 0.0, -0.2
  comment: string;
}

export interface ObservedChangeItem {
  area: string;
  beforeState: string;
  afterState: string;
  verdict: string;
}

export interface ComparisonReportResult {
  title: string;
  subtitle: string;
  mode: AnalysisMode;
  hasNotableDifferences: boolean;
  overallScoreA: number;
  overallScoreB: number;
  scoreDelta: number;
  evolutionStatus: 'mejora' | 'estable_sin_cambios' | 'involucion' | 'cambio_estilo_neutral';
  verdictSummary: string;
  metricsComparison: MetricComparisonItem[];
  observedChanges: ObservedChangeItem[];
  keyImprovements: string[];
  unchangedOrRegressed: string[];
  practicalRecommendations: PracticalRecommendation[];
  footerQuote: string;
}
