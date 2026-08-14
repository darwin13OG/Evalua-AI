import { useState } from 'react';
import { X, Download, Share2, Sparkles, CheckCircle2, Scissors, Eye, Heart, Activity, Flame, Check } from 'lucide-react';
import { DetailedReportResult } from '../types';
import { downloadStoryImage } from '../utils/exportUtils';

interface StoryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DetailedReportResult;
  imageSrc: string | null;
}

export function StoryExportModal({
  isOpen,
  onClose,
  result,
  imageSrc,
}: StoryExportModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await downloadStoryImage('story-canvas-export', `evalua-ai-${result.mode}-story.png`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error al exportar historia:', err);
      alert('Hubo un problema al exportar la imagen. Intenta descargando el reporte en PDF.');
    } finally {
      setIsDownloading(false);
    }
  }

  function renderRecIcon(iconType: string) {
    switch (iconType) {
      case 'makeup':
        return <Eye className="w-3.5 h-3.5 text-white" />;
      case 'hair':
        return <Scissors className="w-3.5 h-3.5 text-white" />;
      case 'brows':
        return <Sparkles className="w-3.5 h-3.5 text-white" />;
      case 'skincare':
        return <Heart className="w-3.5 h-3.5 text-white" />;
      case 'energy':
        return <Flame className="w-3.5 h-3.5 text-white" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-white" />;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col items-center my-auto">
        {/* Top bar */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Historia 9:16 para Redes</h3>
              <p className="text-[10px] text-neutral-400">Optimizada para Instagram y TikTok</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9:16 Canvas Wrapper */}
        <div className="w-full flex justify-center overflow-hidden py-2">
          <div
            id="story-canvas-export"
            className="w-[310px] h-[550px] bg-black text-white p-5 rounded-3xl border border-neutral-800 flex flex-col justify-between relative shadow-2xl overflow-hidden font-sans"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 0%, #171717 0%, #000000 75%)',
            }}
          >
            {/* Header in Story */}
            <div className="space-y-1 text-center border-b border-neutral-800 pb-3">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[9px] font-extrabold uppercase tracking-widest text-neutral-300">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>EVALUA AI • EDITORIAL</span>
              </div>
              <h2 className="text-sm font-black tracking-tight text-white uppercase mt-1">
                {result.title}
              </h2>
              <div className="inline-block bg-white text-black font-extrabold text-[10px] px-3 py-0.5 rounded-full mt-0.5">
                {result.overallScoreLabel} • {result.overallScore.toFixed(1)} / 10
              </div>
            </div>

            {/* Photo & Classification Row */}
            <div className="grid grid-cols-2 gap-3 my-2 items-center">
              {/* Photo */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-md">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Foto evaluada"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500">
                    Sin foto
                  </div>
                )}
              </div>

              {/* Classification & Top Metrics */}
              <div className="space-y-2">
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-2.5 text-center">
                  <span className="text-[8px] uppercase tracking-wider text-neutral-400 block font-bold">
                    {result.classificationTitle || 'TIPO'}
                  </span>
                  <span className="text-xs font-black text-white uppercase block mt-0.5 truncate">
                    {result.classificationName || 'ARMONIOSO'}
                  </span>
                </div>

                <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-2 space-y-1.5">
                  {result.metrics.slice(0, 3).map((m, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between text-[9px] font-bold">
                        <span className="text-neutral-300 truncate">{m.name}</span>
                        <span className="text-white">{m.score.toFixed(1)}</span>
                      </div>
                      <div className="h-1 rounded-full bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full"
                          style={{ width: `${(m.score / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths highlight */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-2.5 space-y-1">
              <div className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>PUNTOS FUERTES CLAVE</span>
              </div>
              <ul className="space-y-0.5">
                {result.strengths.slice(0, 2).map((st, i) => (
                  <li key={i} className="text-[9px] text-neutral-300 truncate flex items-center gap-1">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations preview */}
            <div className="grid grid-cols-2 gap-2">
              {result.practicalRecommendations.slice(0, 2).map((rec, i) => (
                <div key={i} className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-2 space-y-0.5">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-neutral-200 truncate">
                    {renderRecIcon(rec.iconType)}
                    <span className="truncate">{rec.title}</span>
                  </div>
                  <p className="text-[8px] text-neutral-400 line-clamp-2 leading-tight">
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Story Footer quote & watermark */}
            <div className="border-t border-neutral-800 pt-2 text-center flex items-center justify-between">
              <span className="text-[9px] font-bold text-neutral-400 tracking-wider">
                EVALUA AI
              </span>
              <span className="text-[8px] text-neutral-500 font-semibold">
                Análisis Estético
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full mt-4 flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-white hover:bg-neutral-200 text-black shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>¡Imagen Descargada!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Generando Imagen...' : 'Guardar Imagen 9:16'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
