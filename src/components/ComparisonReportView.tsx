import { useState } from 'react';
import {
  FileText,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Minus,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Eye,
  Activity,
  Scissors,
  Heart,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ComparisonReportResult } from '../types';
import { generateComparisonPDF } from '../utils/exportUtils';

interface ComparisonReportViewProps {
  result: ComparisonReportResult;
  imageA: string | null;
  imageB: string | null;
  onReset: () => void;
}

export function ComparisonReportView({
  result,
  imageA,
  imageB,
  onReset,
}: ComparisonReportViewProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  function handleDownloadPDF() {
    setIsExportingPDF(true);
    try {
      generateComparisonPDF(result, imageA, imageB);
    } catch (err) {
      console.error('Error generando PDF de comparativa:', err);
      alert('Hubo un problema al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setIsExportingPDF(false);
    }
  }

  const delta = result.scoreDelta;
  const isPositive = delta > 0;
  const isZero = delta === 0 || !result.hasNotableDifferences;

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
      case 'energy':
        return <Flame className="w-4 h-4 text-black dark:text-white" />;
      default:
        return <Activity className="w-4 h-4 text-black dark:text-white" />;
    }
  }

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="w-full space-y-5 sm:space-y-6 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 pb-1">
        <span className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Ficha Comparativa Generada
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nueva Comparativa</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExportingPDF ? 'Generando...' : 'Descargar PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Editorial Sheet Container */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden">
        {/* Editorial Sheet Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-black uppercase tracking-widest">
                <Layers className="w-3 h-3" />
                <span>EVALUA AI • COMPARATIVA ANTES VS. DESPUÉS</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white uppercase">
                {result.title}
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                {result.subtitle} • MODO {result.mode.toUpperCase()}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentDate.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Photos and Delta Score Block */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
            {/* Foto A */}
            <div className="md:col-span-4 flex flex-col items-center text-center space-y-2">
              <div className="relative w-full max-w-[200px] aspect-square rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 shadow-inner">
                {imageA ? (
                  <img
                    src={imageA}
                    alt="Foto Antes"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                    Foto A
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                  FOTO A (ANTES)
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                <span>Puntuación Base:</span>
                <strong className="text-base font-black">{result.overallScoreA.toFixed(1)}</strong>
                <span className="text-neutral-400">/ 10</span>
              </div>
            </div>

            {/* Delta Indicator in the Middle */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                Balance de Evolución
              </span>

              {/* Delta Badge */}
              <div className="flex items-center gap-2">
                {isZero ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-black text-xl sm:text-2xl">
                    <Minus className="w-5 h-5" />
                    <span>0.0</span>
                  </div>
                ) : isPositive ? (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-black text-xl sm:text-2xl border border-emerald-200 dark:border-emerald-800">
                    <TrendingUp className="w-5 h-5" />
                    <span>+{delta.toFixed(1)}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-black text-xl sm:text-2xl border border-red-200 dark:border-red-800">
                    <TrendingDown className="w-5 h-5" />
                    <span>{delta.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 capitalize">
                {!result.hasNotableDifferences
                  ? 'Sin Diferencias Significativas'
                  : isPositive
                  ? 'Evolución Favorable Detectada'
                  : 'Variación de Estilo / Neutra'}
              </span>

              <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
                <span>{result.overallScoreA.toFixed(1)}</span>
                <ArrowRight className="w-3 h-3 text-neutral-400" />
                <span className="font-bold text-black dark:text-white">{result.overallScoreB.toFixed(1)}</span>
              </div>
            </div>

            {/* Foto B */}
            <div className="md:col-span-4 flex flex-col items-center text-center space-y-2">
              <div className="relative w-full max-w-[200px] aspect-square rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 shadow-inner">
                {imageB ? (
                  <img
                    src={imageB}
                    alt="Foto Después"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                    Foto B
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                  FOTO B (DESPUÉS)
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                <span>Puntuación Actual:</span>
                <strong className="text-base font-black">{result.overallScoreB.toFixed(1)}</strong>
                <span className="text-neutral-400">/ 10</span>
              </div>
            </div>
          </div>

          {/* Verdict Callout Box */}
          <div className={`mt-5 p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
            !result.hasNotableDifferences
              ? 'bg-amber-50 dark:bg-neutral-900 border-amber-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100'
              : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200'
          }`}>
            <div className="flex items-start gap-2.5">
              {!result.hasNotableDifferences ? (
                <Info className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-black dark:text-white mt-0.5" />
              )}
              <div className="space-y-1">
                <strong className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  Diagnóstico de Evolución
                </strong>
                <p>{result.verdictSummary}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Comparison Table */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
              Comparativa Detallada de Métricas
            </h3>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Escala 1.0 a 10.0
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 text-[10.5px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Métrica</th>
                  <th className="py-2.5 px-3 text-center">Foto A (Antes)</th>
                  <th className="py-2.5 px-3 text-center">Foto B (Después)</th>
                  <th className="py-2.5 px-3 text-center">Delta</th>
                  <th className="py-2.5 px-3">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                {result.metricsComparison.map((m, idx) => {
                  const mDiff = m.diff;
                  const isDiffPos = mDiff > 0;
                  const isDiffZero = mDiff === 0;

                  return (
                    <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-neutral-900 dark:text-white">
                        {m.metricName}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-neutral-600 dark:text-neutral-400">
                        {m.scoreA.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-neutral-900 dark:text-white">
                        {m.scoreB.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-extrabold text-[10.5px] ${
                          isDiffZero
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                            : isDiffPos
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400'
                        }`}>
                          {isDiffPos ? `+${mDiff.toFixed(1)}` : mDiff.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300 text-[11.5px]">
                        {m.comment}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observed Changes Matrix */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
            Matriz de Cambios Observados por Área
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {result.observedChanges.map((oc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-black dark:text-white uppercase tracking-tight">
                    {oc.area}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                    {oc.verdict}
                  </span>
                </div>
                <div className="text-[11.5px] space-y-1 text-neutral-600 dark:text-neutral-300">
                  <p>
                    <strong className="text-neutral-800 dark:text-neutral-200">Antes:</strong> {oc.beforeState}
                  </p>
                  <p>
                    <strong className="text-neutral-800 dark:text-neutral-200">Después:</strong> {oc.afterState}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Improvements & Points to Watch */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Key Improvements */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Puntos de Evolución Positiva
            </h4>
            <div className="space-y-2">
              {result.keyImprovements.map((imp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2"
                >
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✦</span>
                  <p>{imp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Points to Watch / Unchanged */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-neutral-500" />
              Aspectos a Mantener o Perfeccionar
            </h4>
            <div className="space-y-2">
              {result.unchangedOrRegressed.map((un, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2"
                >
                  <span className="text-neutral-400 font-bold mt-0.5">–</span>
                  <p>{un}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Practical Recommendations */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
            Plan de Acción y Recomendaciones Futuras
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {result.practicalRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black space-y-2"
              >
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                  {renderRecIcon(rec.iconType)}
                </div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
                  {rec.title}
                </h4>
                <p className="text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="p-4 sm:p-6 bg-neutral-50/80 dark:bg-black text-center space-y-2">
          <p className="text-xs sm:text-sm font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-wide max-w-lg mx-auto">
            ✦ {result.footerQuote} ✦
          </p>
          <p className="text-[10px] text-neutral-400 tracking-wider">
            EVALUA AI • ANÁLISIS COMPARATIVO DE EVOLUCIÓN ESTÉTICA
          </p>
        </div>
      </div>
    </div>
  );
}
