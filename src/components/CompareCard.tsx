import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Camera,
  Sparkles,
  X,
  RefreshCw,
  Loader2,
  Flame,
  Eye,
  Activity,
  Scissors,
  ArrowRight,
  ShieldCheck,
  SplitSquareVertical,
  Lock
} from 'lucide-react';
import { CATEGORY_MODES } from '../data/samples';
import { AnalysisMode } from '../types';

interface CompareCardProps {
  selectedMode: AnalysisMode;
  onSelectMode: (mode: AnalysisMode) => void;
  imageA: string | null;
  imageB: string | null;
  onImageSelectedA: (base64: string) => void;
  onImageSelectedB: (base64: string) => void;
  onClearImageA: () => void;
  onClearImageB: () => void;
  onOpenLiveCameraFor: (target: 'A' | 'B') => void;
  onSubmitCompare: () => void;
  isLoading: boolean;
}

export function CompareCard({
  selectedMode,
  onSelectMode,
  imageA,
  imageB,
  onImageSelectedA,
  onImageSelectedB,
  onClearImageA,
  onClearImageB,
  onOpenLiveCameraFor,
  onSubmitCompare,
  isLoading,
}: CompareCardProps) {
  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const [isDraggingA, setIsDraggingA] = useState(false);
  const [isDraggingB, setIsDraggingB] = useState(false);

  function processFile(file: File, callback: (base64: string) => void) {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        callback(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function getModeIcon(id: string) {
    switch (id) {
      case 'facial':
        return <Sparkles className="w-4 h-4" />;
      case 'fisico':
        return <Activity className="w-4 h-4" />;
      case 'mirada':
        return <Eye className="w-4 h-4" />;
      case 'aura':
        return <Flame className="w-4 h-4" />;
      case 'peinado':
      default:
        return <Scissors className="w-4 h-4" />;
    }
  }

  const activeModeConfig = CATEGORY_MODES.find((m) => m.id === selectedMode) || CATEGORY_MODES[0];
  const canSubmit = Boolean(imageA && imageB && !isLoading);

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
      {/* 1. Category selector */}
      <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
            1. Selecciona la Categoría de Comparativa
          </label>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
            Antes vs. Después
          </span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
          {CATEGORY_MODES.map((modeItem) => {
            const isSelected = selectedMode === modeItem.id;
            return (
              <button
                key={modeItem.id}
                onClick={() => onSelectMode(modeItem.id as AnalysisMode)}
                className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs font-bold ring-1 ring-black/10 dark:ring-white/20'
                    : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-white/20 text-amber-300 dark:bg-black/10 dark:text-amber-600'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {getModeIcon(modeItem.id)}
                </div>
                <span className="text-xs tracking-tight">{modeItem.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dual Photo Slots */}
      <div className="p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
            2. Carga ambas fotografías
          </label>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Evaluación objetiva y simetría</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* PHOTO A (ANTES) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white font-extrabold text-[10px]">
                  FOTO A
                </span>
                Estado Base (Antes)
              </span>
              {imageA && (
                <button
                  type="button"
                  onClick={onClearImageA}
                  className="text-[11px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Quitar
                </button>
              )}
            </div>

            {!imageA ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingA(true);
                }}
                onDragLeave={() => setIsDraggingA(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingA(false);
                  if (e.dataTransfer.files?.[0]) {
                    processFile(e.dataTransfer.files[0], onImageSelectedA);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center min-h-[190px] ${
                  isDraggingA
                    ? 'border-black dark:border-white bg-neutral-100 dark:bg-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black hover:border-neutral-400 dark:hover:border-neutral-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-2.5">
                  <UploadCloud className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                </div>
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Foto Antes / Punto de Partida
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 mb-3">
                  Arrastra o selecciona tu foto base
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRefA.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer"
                  >
                    Examinar
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLiveCameraFor('A')}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Cámara
                  </button>
                </div>
                <input
                  ref={fileInputRefA}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      processFile(e.target.files[0], onImageSelectedA);
                    }
                  }}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black p-3 flex items-center gap-3">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 flex-shrink-0 bg-black">
                  <img
                    src={imageA}
                    alt="Foto Antes"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    Foto Base Cargada
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Lista para contrastar métricas y proporciones.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRefA.current?.click()}
                    className="text-[11px] text-neutral-700 dark:text-neutral-300 hover:underline flex items-center gap-1 font-semibold pt-0.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Cambiar foto
                  </button>
                </div>
                <input
                  ref={fileInputRefA}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      processFile(e.target.files[0], onImageSelectedA);
                    }
                  }}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* PHOTO B (DESPUÉS) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black font-extrabold text-[10px]">
                  FOTO B
                </span>
                Estado Evolución (Después)
              </span>
              {imageB && (
                <button
                  type="button"
                  onClick={onClearImageB}
                  className="text-[11px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Quitar
                </button>
              )}
            </div>

            {!imageB ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingB(true);
                }}
                onDragLeave={() => setIsDraggingB(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingB(false);
                  if (e.dataTransfer.files?.[0]) {
                    processFile(e.dataTransfer.files[0], onImageSelectedB);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center min-h-[190px] ${
                  isDraggingB
                    ? 'border-black dark:border-white bg-neutral-100 dark:bg-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black hover:border-neutral-400 dark:hover:border-neutral-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-2.5">
                  <UploadCloud className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                </div>
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Foto Después / Resultado Actual
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 mb-3">
                  Arrastra o selecciona tu foto reciente
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRefB.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer"
                  >
                    Examinar
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLiveCameraFor('B')}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Cámara
                  </button>
                </div>
                <input
                  ref={fileInputRefB}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      processFile(e.target.files[0], onImageSelectedB);
                    }
                  }}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black p-3 flex items-center gap-3">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 flex-shrink-0 bg-black">
                  <img
                    src={imageB}
                    alt="Foto Después"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    Foto Evolución Cargada
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Lista para contrastar métricas y proporciones.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRefB.current?.click()}
                    className="text-[11px] text-neutral-700 dark:text-neutral-300 hover:underline flex items-center gap-1 font-semibold pt-0.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Cambiar foto
                  </button>
                </div>
                <input
                  ref={fileInputRefB}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      processFile(e.target.files[0], onImageSelectedB);
                    }
                  }}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Informative callout */}
        <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-2.5">
          <SplitSquareVertical className="w-4 h-4 flex-shrink-0 text-black dark:text-white mt-0.5" />
          <p className="leading-relaxed text-[11.5px]">
            <strong>Evaluación de evolución:</strong> La IA contrastará proporciones, simetría, postura y rasgos clave para calcular el balance de evolución entre ambas tomas.
          </p>
        </div>

        {/* Submit Comparison Button */}
        <button
          type="button"
          onClick={onSubmitCompare}
          disabled={!canSubmit}
          className="w-full py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Comparando fotografías y evaluando diferencias...</span>
            </>
          ) : (
            <>
              <span>Comparar Fotografías (Antes vs. Después)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Zero-Storage Privacy Note */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] text-neutral-500 dark:text-neutral-400">
          <Lock className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
          <span>Privacidad 100%: Análisis temporal en tiempo real. No se guarda ninguna foto y nadie más las ve.</span>
        </div>
      </div>
    </div>
  );
}
