import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Download, 
  Share2, 
  RotateCcw, 
  Flame, 
  Eye, 
  Activity, 
  Scissors, 
  Heart, 
  Compass, 
  ArrowRight,
  Smile,
  Star
} from 'lucide-react';
import { DetailedReportResult, AnalysisMode } from '../types';

interface EditorialReportViewProps {
  report: DetailedReportResult;
  imageSrc: string | null;
  onExportStory: () => void;
  onDownloadPdf: () => void;
  onReset: () => void;
  onSelectSuggestedMode?: (mode: AnalysisMode) => void;
}

export function EditorialReportView({
  report,
  imageSrc,
  onExportStory,
  onDownloadPdf,
  onReset,
  onSelectSuggestedMode,
}: EditorialReportViewProps) {

  function renderRecIcon(iconType: string) {
    switch (iconType) {
      case 'makeup':
        return <Eye className="w-4 h-4 text-black dark:text-white" />;
      case 'hair':
        return <Scissors className="w-4 h-4 text-black dark:text-white" />;
      case 'brows':
        return <Sparkles className="w-4 h-4 text-black dark:text-white" />;
      case 'skincare':
        return <Heart className="w-4 h-4 text-black dark:text-white" />;
      case 'style':
      case 'posture':
        return <Activity className="w-4 h-4 text-black dark:text-white" />;
      case 'energy':
        return <Flame className="w-4 h-4 text-black dark:text-white" />;
      case 'eyes':
        return <Eye className="w-4 h-4 text-black dark:text-white" />;
      default:
        return <Smile className="w-4 h-4 text-black dark:text-white" />;
    }
  }

  const starCount = Math.round((report.overallScore / 10) * 5);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Category Suggestion Notification Banner if any */}
      {report.categorySuggestion && onSelectSuggestedMode && (
        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5 text-xs sm:text-sm">
            <Compass className="w-4 h-4 text-black dark:text-white flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-900 dark:text-white">
                Sugerencia de Evaluación:
              </span>{' '}
              <span className="text-neutral-600 dark:text-neutral-300">
                {report.categorySuggestion.reason}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectSuggestedMode(report.categorySuggestion!.suggestedMode)}
            className="px-3.5 py-1.5 rounded-xl bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs flex-shrink-0"
          >
            <span>Ver Modo {report.categorySuggestion.suggestedMode.toUpperCase()}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Editorial Sheet Container */}
      <div 
        id="editorial-report-sheet"
        className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 sm:p-8 shadow-xs space-y-5 sm:space-y-6 text-neutral-900 dark:text-neutral-100 transition-colors"
      >
        {/* 1. Header Banner */}
        <div className="text-center pb-4 sm:pb-5 border-b border-neutral-200 dark:border-neutral-800 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[10.5px] sm:text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{report.subtitle || 'REPORTE PERSONALIZADO'}</span>
          </div>

          <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-neutral-900 dark:text-white uppercase font-sans px-1">
            {report.title || 'ANÁLISIS DE BELLEZA FACIAL'}
          </h1>

          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1 rounded-full text-xs font-bold bg-black text-white dark:bg-white dark:text-black shadow-xs flex-wrap justify-center text-center">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < starCount ? 'fill-amber-400 text-amber-400' : 'text-neutral-400 opacity-40'}`}
                  />
                ))}
              </div>
              <span>{report.overallScoreLabel} • {report.overallScore.toFixed(1)} / 10</span>
            </div>
          </div>
        </div>

        {/* 2. Top Row: Image (Left) + Resumen General Metrics (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* Left: Photo Frame */}
          <div className="md:col-span-5 flex flex-col">
            <div className="relative w-full h-full min-h-[220px] max-h-[320px] sm:min-h-[260px] sm:max-h-[380px] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-black flex items-center justify-center shadow-inner">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Evaluación"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-neutral-400 text-xs">Sin fotografía</div>
              )}
            </div>
          </div>

          {/* Right: Resumen General Progress Bars */}
          <div className="md:col-span-7 bg-neutral-50/60 dark:bg-black rounded-2xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800 mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                RESUMEN GENERAL
              </h3>
              <span className="text-[10px] sm:text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                Puntuación (1-10)
              </span>
            </div>

            <div className="space-y-2.5 my-auto">
              {report.metrics.map((metric, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate pr-2">
                      {metric.name}
                    </span>
                    <span className="font-extrabold text-neutral-900 dark:text-white flex-shrink-0">
                      {metric.score.toFixed(1)} <span className="text-[10px] text-neutral-400">/ 10</span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-black dark:bg-white transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(10, (metric.score / 10) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Middle Row: Classification Card (Left) + Honest Analysis (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* Classification / Shape Card */}
          <div className="md:col-span-5 bg-neutral-50/60 dark:bg-black rounded-2xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
            <div className="text-center pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 block">
                {report.classificationTitle || 'CLASIFICACIÓN'}
              </span>
              <h4 className="text-sm sm:text-base md:text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight mt-0.5">
                {report.classificationName || 'OVALADO'}
              </h4>
            </div>

            <div className="space-y-2 my-auto">
              {report.classificationTraits.map((trait, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white flex-shrink-0" />
                  <span className="break-words min-w-0">{trait}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Honest Analysis Desglose */}
          <div className="md:col-span-7 bg-neutral-50/60 dark:bg-black rounded-2xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white pb-2 border-b border-neutral-200 dark:border-neutral-800 mb-3">
              ANÁLISIS HONESTO
            </h3>
            <div className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed my-auto">
              {report.honestAnalysis.map((item, idx) => (
                <div key={idx} className="flex items-baseline gap-1.5">
                  <strong className="text-neutral-900 dark:text-white font-bold flex-shrink-0">
                    {item.feature}:
                  </strong>
                  <span className="break-words min-w-0">{item.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Essay Summary Box */}
        {report.essaySummary && (
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/60 dark:bg-black border border-neutral-200 dark:border-neutral-800 space-y-1.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
              DIAGNÓSTICO INTEGRAL & SÍNTESIS
            </h4>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {report.essaySummary}
            </p>
          </div>
        )}

        {/* 5. Two-column: Strengths & Areas of Improvement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Puntos Fuertes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              PUNTOS FUERTES
            </h4>
            <ul className="space-y-2">
              {report.strengths.map((st, idx) => (
                <li key={idx} className="text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span>{st}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Áreas de Mejora */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ÁREAS DE MEJORA REALISTAS
            </h4>
            <ul className="space-y-2">
              {report.areasForImprovement.map((area, idx) => (
                <li key={idx} className="text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2 leading-relaxed">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 6. Practical Recommendations */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white text-center sm:text-left">
            RECOMENDACIONES PRÁCTICAS
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {report.practicalRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-neutral-50/60 dark:bg-black border border-neutral-200 dark:border-neutral-800 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                    {renderRecIcon(rec.iconType)}
                  </div>
                  <h5 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {rec.title}
                  </h5>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Footer Lema */}
        <div className="text-center pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="inline-block px-4 sm:px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10.5px] sm:text-xs font-bold tracking-wider uppercase shadow-xs">
            {report.footerQuote || 'LA BELLEZA REAL ES EQUILIBRIO Y AUTENTICIDAD'}
          </div>
        </div>
      </div>

      {/* Action Bar (Download PDF, Export Story, Reset) - Mobile Friendly Full Width */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2">
        <button
          onClick={onDownloadPdf}
          className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl font-bold text-xs bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Descargar PDF Oficial</span>
        </button>

        <button
          onClick={onExportStory}
          className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl font-bold text-xs bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Exportar Historia 9:16 (Instagram / TikTok)</span>
        </button>

        <button
          onClick={onReset}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Evaluar Otra Foto</span>
        </button>
      </div>
    </div>
  );
}
