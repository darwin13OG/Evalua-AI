import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Sparkles, 
  Check, 
  Palette,
  Star
} from 'lucide-react';
import { DetailedReportResult, ComparisonReportResult } from '../types';
import { 
  PdfThemeId, 
  PDF_THEMES, 
  generateEvaluationPDF, 
  generateComparisonPDF 
} from '../utils/exportUtils';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleReport?: DetailedReportResult | null;
  comparisonReport?: ComparisonReportResult | null;
  imageSrc?: string | null;
  imageSrcA?: string | null;
  imageSrcB?: string | null;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  singleReport,
  comparisonReport,
  imageSrc = null,
  imageSrcA = null,
  imageSrcB = null,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<PdfThemeId>('vogue_noir');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentTheme = PDF_THEMES[selectedTheme] || PDF_THEMES.vogue_noir;

  function handleDownload() {
    setIsGenerating(true);
    setIsSuccess(false);

    try {
      if (singleReport) {
        generateEvaluationPDF(singleReport, imageSrc, selectedTheme);
      } else if (comparisonReport) {
        generateComparisonPDF(comparisonReport, imageSrcA, imageSrcB, selectedTheme);
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 3500);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      alert('Hubo un error al generar el PDF. Por favor intenta con otro tema.');
    } finally {
      setIsGenerating(false);
    }
  }

  const themeList = Object.values(PDF_THEMES);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center my-auto transition-colors">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white">
                Personalizar PDF Editorial A4
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Elige la paleta y estética visual de tu documento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Selector */}
        <div className="w-full space-y-2 mb-4">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-neutral-500" />
            Estilos y Paletas Disponibles:
          </label>

          <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
            {themeList.map((t) => {
              const isSelected = selectedTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTheme(t.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md ring-2 ring-black/20 dark:ring-white/30 scale-[1.02]'
                      : 'bg-neutral-50 dark:bg-neutral-900/60 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/20 shadow-xs flex-shrink-0"
                    style={{ backgroundColor: t.dotColor }}
                  />
                  <span className="text-[10.5px] font-bold tracking-tight leading-tight line-clamp-1">
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Mini Preview Box */}
        <div className="w-full bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-3.5 border border-neutral-200 dark:border-neutral-800 space-y-2.5 mb-5">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
            <span>Vista previa del encabezado:</span>
            <span className="text-black dark:text-white font-extrabold">{currentTheme.name}</span>
          </div>

          <div 
            className="w-full rounded-xl p-3 text-white shadow-sm flex flex-col gap-1.5 transition-colors"
            style={{
              backgroundColor: `rgb(${currentTheme.headerRgb.join(',')})`,
            }}
          >
            <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-white/80">
              <span>EVALUA AI • FICHA EDITORIAL A4</span>
              <span>2026</span>
            </div>
            <div className="text-xs font-black uppercase tracking-tight text-white line-clamp-1">
              {singleReport?.title || comparisonReport?.title || 'ANÁLISIS ESTÉTICO & VISAGISMO'}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div 
                className="px-2 py-0.5 rounded-full text-[9px] font-black text-black"
                style={{
                  backgroundColor: `rgb(${currentTheme.badgeRgb.join(',')})`,
                }}
              >
                ★ PUNTUACIÓN EDITORIAL
              </div>
              <div 
                className="h-1.5 flex-1 rounded-full overflow-hidden bg-white/20"
              >
                <div 
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: `rgb(${currentTheme.accentRgb.join(',')})`,
                    width: '85%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert if just downloaded */}
        {isSuccess && (
          <div className="w-full mb-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>¡PDF generado y descargado con éxito!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF en este estilo</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl font-semibold text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
