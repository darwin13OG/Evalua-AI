import { useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  Scissors, 
  Eye, 
  Heart, 
  Activity, 
  Flame, 
  Check, 
  Palette,
  Globe
} from 'lucide-react';
import { DetailedReportResult } from '../types';
import { downloadStoryImage, shareStoryImage } from '../utils/exportUtils';

interface StoryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DetailedReportResult;
  imageSrc: string | null;
}

type CardThemeId = 'instagram' | 'tiktok' | 'facebook' | 'rose_gold' | 'midnight' | 'noir' | 'light';

interface CardThemeOption {
  id: CardThemeId;
  name: string;
  dotColor: string;
  bgGradient: string;
  borderClass: string;
  cardBg: string;
  textColor: string;
  subTextColor: string;
  badgeBg: string;
  badgeText: string;
  accentText: string;
  progressTrack: string;
  progressFill: string;
}

const CARD_THEMES: CardThemeOption[] = [
  {
    id: 'instagram',
    name: 'Instagram Sunset',
    dotColor: '#e1306c',
    bgGradient: 'linear-gradient(145deg, #405DE6 0%, #833AB4 30%, #E1306C 65%, #FD1D1D 85%, #F56040 100%)',
    borderClass: 'border-white/30',
    cardBg: 'bg-black/60 border border-white/20 shadow-lg backdrop-blur-md',
    textColor: 'text-white font-bold',
    subTextColor: 'text-pink-100',
    badgeBg: 'bg-white text-black font-black',
    badgeText: 'text-black',
    accentText: 'text-amber-300 font-bold',
    progressTrack: 'bg-white/20',
    progressFill: 'bg-gradient-to-r from-amber-300 to-rose-300',
  },
  {
    id: 'tiktok',
    name: 'TikTok Dark Glow',
    dotColor: '#00f2fe',
    bgGradient: 'linear-gradient(160deg, #050608 0%, #0d0f17 40%, #071520 100%)',
    borderClass: 'border-[#00f2fe]/40',
    cardBg: 'bg-[#11131c]/90 border border-[#00f2fe]/30 shadow-lg',
    textColor: 'text-white font-bold',
    subTextColor: 'text-cyan-200/90',
    badgeBg: 'bg-[#00f2fe] text-black font-black',
    badgeText: 'text-black',
    accentText: 'text-[#fe0979] font-black',
    progressTrack: 'bg-neutral-800',
    progressFill: 'bg-gradient-to-r from-[#00f2fe] to-[#fe0979]',
  },
  {
    id: 'facebook',
    name: 'Facebook Royal',
    dotColor: '#1877f2',
    bgGradient: 'linear-gradient(150deg, #1877F2 0%, #0c4a9e 50%, #041a38 100%)',
    borderClass: 'border-blue-300/40',
    cardBg: 'bg-black/55 border border-blue-300/30 shadow-lg backdrop-blur-md',
    textColor: 'text-white font-bold',
    subTextColor: 'text-blue-100',
    badgeBg: 'bg-white text-[#1877F2] font-black',
    badgeText: 'text-[#1877F2]',
    accentText: 'text-blue-200 font-bold',
    progressTrack: 'bg-white/20',
    progressFill: 'bg-gradient-to-r from-white to-blue-300',
  },
  {
    id: 'rose_gold',
    name: 'Femenino Rose Gold',
    dotColor: '#fb7185',
    bgGradient: 'linear-gradient(145deg, #3d0c24 0%, #200411 60%, #120109 100%)',
    borderClass: 'border-rose-400/40',
    cardBg: 'bg-[#2a0819]/85 border border-rose-400/30 shadow-lg',
    textColor: 'text-rose-50 font-bold',
    subTextColor: 'text-rose-200/90',
    badgeBg: 'bg-gradient-to-r from-rose-300 to-amber-200 text-neutral-950 font-black',
    badgeText: 'text-neutral-950',
    accentText: 'text-rose-300 font-bold',
    progressTrack: 'bg-rose-950/80',
    progressFill: 'bg-gradient-to-r from-rose-400 to-amber-300',
  },
  {
    id: 'midnight',
    name: 'Masculino Titanium',
    dotColor: '#38bdf8',
    bgGradient: 'linear-gradient(150deg, #0f172a 0%, #020617 60%, #000000 100%)',
    borderClass: 'border-slate-700/80',
    cardBg: 'bg-slate-900/90 border border-slate-700/60 shadow-xl',
    textColor: 'text-white font-bold',
    subTextColor: 'text-slate-300',
    badgeBg: 'bg-sky-400 text-slate-950 font-black',
    badgeText: 'text-slate-950',
    accentText: 'text-sky-400 font-bold',
    progressTrack: 'bg-slate-800',
    progressFill: 'bg-gradient-to-r from-sky-400 to-indigo-400',
  },
  {
    id: 'noir',
    name: 'Obsidian Noir & Gold',
    dotColor: '#f59e0b',
    bgGradient: 'radial-gradient(circle at 50% 0%, #1c1c1c 0%, #050505 100%)',
    borderClass: 'border-neutral-700/80',
    cardBg: 'bg-neutral-900/90 border border-neutral-700/60 shadow-xl',
    textColor: 'text-white font-bold',
    subTextColor: 'text-neutral-300',
    badgeBg: 'bg-amber-400 text-black font-black',
    badgeText: 'text-black',
    accentText: 'text-amber-400 font-bold',
    progressTrack: 'bg-neutral-800',
    progressFill: 'bg-gradient-to-r from-amber-400 to-amber-200',
  },
  {
    id: 'light',
    name: 'Editorial White',
    dotColor: '#e2e8f0',
    bgGradient: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
    borderClass: 'border-neutral-300',
    cardBg: 'bg-white/95 border border-neutral-300 shadow-md',
    textColor: 'text-neutral-950 font-bold',
    subTextColor: 'text-neutral-600',
    badgeBg: 'bg-black text-white font-black',
    badgeText: 'text-white',
    accentText: 'text-neutral-950 font-black',
    progressTrack: 'bg-neutral-200',
    progressFill: 'bg-black',
  },
];

export function StoryExportModal({
  isOpen,
  onClose,
  result,
  imageSrc,
}: StoryExportModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<CardThemeId>('instagram');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTheme = CARD_THEMES.find((t) => t.id === selectedTheme) || CARD_THEMES[0];

  async function handleShare() {
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      const shared = await shareStoryImage('story-canvas-export', `EVALUA AI - ${result.title}`);
      if (shared) {
        setActionFeedback('¡Compartido con éxito!');
      } else {
        setActionFeedback('¡Imagen descargada!');
      }
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error('Error al compartir historia:', err);
      setActionFeedback('No se pudo compartir automáticamente. Usa "Descargar PNG".');
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDownload() {
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      const dataUrl = await downloadStoryImage('story-canvas-export', `evalua-ai-${result.mode}-${selectedTheme}.png`);
      setPreviewDataUrl(dataUrl);
      setActionFeedback('¡Imagen descargada con éxito!');
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error('Error al descargar historia:', err);
      setActionFeedback('Error al procesar descarga.');
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  }

  function renderRecIcon(iconType: string) {
    switch (iconType) {
      case 'makeup':
        return <Eye className="w-3 h-3" />;
      case 'hair':
        return <Scissors className="w-3 h-3" />;
      case 'brows':
        return <Sparkles className="w-3 h-3" />;
      case 'skincare':
        return <Heart className="w-3 h-3" />;
      case 'energy':
        return <Flame className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col items-center my-auto">
        {/* Top bar */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Tarjeta 9:16 para Redes</h3>
              <p className="text-[10px] text-neutral-400">Personaliza el tono y comparte en Stories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Color / Theme Selector Bar */}
        <div className="w-full mb-3">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Palette className="w-3 h-3 text-neutral-300" />
              Tono de la tarjeta
            </span>
            <span className="text-[10px] font-semibold text-neutral-400">
              {currentTheme.name}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1.5 bg-neutral-900/90 p-1.5 rounded-2xl border border-neutral-800">
            {CARD_THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme.id)}
                  title={theme.name}
                  className={`flex-1 py-1.5 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-800 ring-2 ring-white/80 scale-105 shadow-xs'
                      : 'hover:bg-neutral-800/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/40 shadow-xs"
                    style={{ backgroundColor: theme.dotColor }}
                  />
                  <span className="text-[8px] font-bold text-neutral-300 uppercase tracking-tighter truncate max-w-[42px]">
                    {theme.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 9:16 Canvas Wrapper */}
        <div className="w-full max-w-full flex justify-center overflow-x-auto py-1">
          <div
            id="story-canvas-export"
            className={`w-[290px] xs:w-[305px] h-[515px] xs:h-[540px] p-3.5 xs:p-4 rounded-3xl border ${currentTheme.borderClass} flex flex-col justify-between relative shadow-2xl overflow-hidden font-sans select-none flex-shrink-0`}
            style={{
              backgroundImage: currentTheme.bgGradient,
            }}
          >
            {/* Header in Story */}
            <div className="space-y-1 text-center border-b border-white/10 pb-2.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-[8.5px] font-extrabold uppercase tracking-widest text-neutral-300">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>EVALUA AI • FICHA EDITORIAL</span>
              </div>
              <h2 className={`text-xs font-black tracking-tight uppercase mt-0.5 line-clamp-1 ${currentTheme.textColor}`}>
                {result.title}
              </h2>
              <div className={`inline-block font-black text-[9.5px] px-3 py-0.5 rounded-full mt-0.5 shadow-xs ${currentTheme.badgeBg}`}>
                {result.overallScoreLabel} • {result.overallScore.toFixed(1)} / 10
              </div>
            </div>

            {/* Photo & Classification Row */}
            <div className="grid grid-cols-2 gap-2.5 my-1.5 items-center">
              {/* Photo */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 bg-black/50 shadow-md">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Foto evaluada"
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                    Sin foto
                  </div>
                )}
              </div>

              {/* Classification & Top Metrics */}
              <div className="space-y-1.5">
                <div className={`rounded-xl p-2 text-center ${currentTheme.cardBg}`}>
                  <span className={`text-[7.5px] uppercase tracking-wider block font-bold ${currentTheme.subTextColor}`}>
                    {result.classificationTitle || 'TIPO'}
                  </span>
                  <span className={`text-[11px] font-black uppercase block mt-0.5 truncate ${currentTheme.textColor}`}>
                    {result.classificationName || 'ARMONIOSO'}
                  </span>
                </div>

                <div className={`rounded-xl p-2 space-y-1.5 ${currentTheme.cardBg}`}>
                  {result.metrics.slice(0, 3).map((m, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between text-[8.5px] font-bold">
                        <span className={`truncate ${currentTheme.subTextColor}`}>{m.name}</span>
                        <span className={currentTheme.textColor}>{m.score.toFixed(1)}</span>
                      </div>
                      <div className={`h-1 rounded-full overflow-hidden ${currentTheme.progressTrack}`}>
                        <div
                          className={`h-full rounded-full ${currentTheme.progressFill}`}
                          style={{ width: `${(m.score / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths highlight */}
            <div className={`rounded-2xl p-2.5 space-y-1 ${currentTheme.cardBg}`}>
              <div className="flex items-center gap-1 text-[8.5px] font-black uppercase text-emerald-400">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                <span>PUNTOS FUERTES CLAVE</span>
              </div>
              <ul className="space-y-0.5">
                {result.strengths.slice(0, 2).map((st, i) => (
                  <li key={i} className={`text-[8.5px] truncate flex items-center gap-1 ${currentTheme.subTextColor}`}>
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations preview */}
            <div className="grid grid-cols-2 gap-2">
              {result.practicalRecommendations.slice(0, 2).map((rec, i) => (
                <div key={i} className={`rounded-xl p-2 space-y-0.5 ${currentTheme.cardBg}`}>
                  <div className={`flex items-center gap-1 text-[8px] font-bold truncate ${currentTheme.textColor}`}>
                    {renderRecIcon(rec.iconType)}
                    <span className="truncate">{rec.title}</span>
                  </div>
                  <p className={`text-[7.5px] line-clamp-2 leading-tight ${currentTheme.subTextColor}`}>
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Story Footer quote & watermark */}
            <div className="border-t border-white/10 pt-2 text-center flex items-center justify-between">
              <div className="flex items-center gap-1 text-[8.5px] font-bold tracking-wider opacity-80">
                <span className={currentTheme.textColor}>EVALUA AI</span>
                <span className={currentTheme.subTextColor}>• Reporte</span>
              </div>
              
              {/* Sutil y elegante dirección de la web */}
              <div className="flex items-center gap-1 text-[8px] font-mono tracking-tight text-neutral-400 bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                <Globe className="w-2.5 h-2.5 opacity-60" />
                <span>evalua-ai.pages.dev</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-3 space-y-2">
          {actionFeedback && (
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>{actionFeedback}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              disabled={isProcessing}
              className="flex-1 py-3 px-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-white hover:bg-neutral-200 text-black shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartir en Redes</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isProcessing}
              className="py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              title="Guardar archivo PNG en el dispositivo"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Descargar PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
