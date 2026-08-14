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
  Scissors
} from 'lucide-react';
import { CATEGORY_MODES } from '../data/samples';
import { AnalysisMode } from '../types';

interface AnalyzerCardProps {
  selectedMode: AnalysisMode;
  onSelectMode: (mode: AnalysisMode) => void;
  imagePreview: string | null;
  onImageSelected: (base64: string) => void;
  onClearImage: () => void;
  onOpenLiveCamera: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function AnalyzerCard({
  selectedMode,
  onSelectMode,
  imagePreview,
  onImageSelected,
  onClearImage,
  onOpenLiveCamera,
  onSubmit,
  isLoading,
}: AnalyzerCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onImageSelected(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }

  const activeModeConfig = CATEGORY_MODES.find((m) => m.id === selectedMode) || CATEGORY_MODES[0];

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

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
      {/* Category selector row */}
      <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
            1. Selecciona la Categoría
          </label>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
            Formato Ficha
          </span>
        </div>

        {/* Categories grid (Spacious, scroll-free on mobile) */}
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

      {/* Upload or Preview Section */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
            2. Cargar Fotografía
          </label>
        </div>

        {/* Image Dropzone or Image Preview */}
        {!imagePreview ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
              isDragging
                ? 'border-black dark:border-white bg-neutral-100 dark:bg-neutral-900'
                : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black hover:border-neutral-400 dark:hover:border-neutral-700'
            }`}
          >
            <div className="max-w-xs mx-auto space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center justify-center mx-auto shadow-inner">
                <UploadCloud className="w-6 h-6 text-neutral-800 dark:text-neutral-200" />
              </div>

              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  Arrastra tu fotografía aquí
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Formatos soportados: JPG, PNG, WEBP
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs cursor-pointer"
                >
                  Examinar Archivo
                </button>
                <button
                  type="button"
                  onClick={onOpenLiveCamera}
                  className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
                  <span>Cámara</span>
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 animate-fade-in">
            {/* Thumbnail */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xs flex-shrink-0 bg-neutral-950">
              <img
                src={imagePreview}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1.5 right-1.5">
                <button
                  onClick={onClearImage}
                  className="p-1 rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors"
                  title="Eliminar foto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Photo info and mode descriptor */}
            <div className="flex-1 space-y-2.5 text-center sm:text-left w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black text-white dark:bg-white dark:text-black">
                {getModeIcon(activeModeConfig.id)}
                <span>{activeModeConfig.title}</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {activeModeConfig.subtitle}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Cambiar Foto
                </button>
                <button
                  type="button"
                  onClick={onOpenLiveCamera}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  Tomar con Cámara
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Submit Generate Report Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!imagePreview || isLoading}
            className="w-full py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando Ficha Editorial...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 dark:text-amber-600" />
                <span>Generar Reporte de {activeModeConfig.label}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
