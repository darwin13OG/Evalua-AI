import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  ExternalLink, 
  Gift, 
  Moon, 
  Sun, 
  FileText,
  SlidersHorizontal,
  Lock
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  darkMode,
  onToggleTheme,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(settings.customApiKey);
  const [tone, setTone] = useState<AppSettings['tone']>(settings.tone);
  const [detailLevel, setDetailLevel] = useState<'concise' | 'detailed'>(settings.detailLevel || 'detailed');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  if (!isOpen) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSaveSettings({
      customApiKey: apiKeyInput.trim(),
      tone,
      detailLevel,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  }

  function handleClearKey() {
    setApiKeyInput('');
    onSaveSettings({
      customApiKey: '',
      tone,
      detailLevel,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden transition-colors flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Ajustes & Personalización
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Tema visual, extensión de reportes, tono y clave API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* 1. Tema Visual (Modo Oscuro / Modo Claro) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                {darkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                Tema Visual
              </label>
              <span className="text-[11px] text-neutral-500 font-medium">
                {darkMode ? 'Modo Oscuro activo' : 'Modo Claro activo'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (darkMode) onToggleTheme();
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  !darkMode
                    ? 'border-black bg-neutral-100 font-bold ring-1 ring-black text-black'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold">Modo Claro</span>
                </div>
                {!darkMode && <Check className="w-3.5 h-3.5 text-black" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!darkMode) onToggleTheme();
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  darkMode
                    ? 'border-white bg-neutral-900 font-bold ring-1 ring-white text-white'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-neutral-300" />
                  <span className="text-xs font-semibold">Modo Oscuro</span>
                </div>
                {darkMode && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
          </div>

          {/* 2. Extensión / Detalle del Análisis */}
          <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              Extensión del Reporte
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDetailLevel('concise')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  detailLevel === 'concise'
                    ? 'border-black bg-neutral-100 dark:border-white dark:bg-neutral-900 font-bold ring-1 ring-black dark:ring-white'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="text-xs text-neutral-900 dark:text-white flex items-center justify-between">
                  <span>Sintético & Directo</span>
                  {detailLevel === 'concise' && (
                    <span className="text-[9px] uppercase px-1 rounded bg-black text-white dark:bg-white dark:text-black">
                      Activo
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">
                  Puntos breves y lectura rápida de 30 segundos.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDetailLevel('detailed')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  detailLevel === 'detailed'
                    ? 'border-black bg-neutral-100 dark:border-white dark:bg-neutral-900 font-bold ring-1 ring-black dark:ring-white'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="text-xs text-neutral-900 dark:text-white flex items-center justify-between">
                  <span>Detallado & Completo</span>
                  {detailLevel === 'detailed' && (
                    <span className="text-[9px] uppercase px-1 rounded bg-black text-white dark:bg-white dark:text-black">
                      Activo
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">
                  Diagnóstico exhaustivo y recomendaciones completas.
                </div>
              </button>
            </div>
          </div>

          {/* 3. Tone Selector */}
          <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              Tono de la Evaluación
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTone('honest')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  tone === 'honest'
                    ? 'border-black bg-neutral-100 dark:border-white dark:bg-neutral-900 font-bold ring-1 ring-black dark:ring-white'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="text-xs text-neutral-900 dark:text-white flex items-center justify-between">
                  <span>Sincero & Honesto</span>
                  {tone === 'honest' && <span className="text-[9px] uppercase px-1 rounded bg-black text-white dark:bg-white dark:text-black">Activo</span>}
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">
                  Directo, técnico y anatómico sin filtros.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTone('humor')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  tone === 'humor'
                    ? 'border-black bg-neutral-100 dark:border-white dark:bg-neutral-900 font-bold ring-1 ring-black dark:ring-white'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="text-xs text-neutral-900 dark:text-white flex items-center justify-between">
                  <span>Honesto con Humor</span>
                  {tone === 'humor' && <span className="text-[9px] uppercase px-1 rounded bg-black text-white dark:bg-white dark:text-black">Activo</span>}
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">
                  Roast cómico, sátira y remates ingeniosos.
                </div>
              </button>
            </div>
          </div>

          {/* 4. Custom API Key input */}
          <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                Tu Gemini API Key (Opcional)
              </label>
              {apiKeyInput && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-[11px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Borrar clave
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Pega aquí tu clave: AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
              />
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Opcional para cuota ilimitada. Se almacena únicamente en tu propio navegador.
            </p>
          </div>

          {/* Guía Desplegable Colapsada Debajo de la Clave */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 dark:border-amber-500/20 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowTutorial(!showTutorial)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-amber-500/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  ¿Cómo obtener tu API Key 100% Gratis?
                </span>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md">
                {showTutorial ? 'Ocultar guía ▲' : 'Ver guía paso a paso ▼'}
              </span>
            </button>

            {showTutorial && (
              <div className="p-4 pt-1 border-t border-amber-500/20 space-y-3 text-[11.5px] text-neutral-700 dark:text-neutral-300 leading-relaxed animate-fade-in">
                <p className="text-neutral-600 dark:text-neutral-400">
                  Google ofrece acceso gratuito a Gemini para realizar miles de análisis al mes sin costo ni tarjeta de crédito:
                </p>

                <div className="space-y-1.5 bg-white/70 dark:bg-black/50 p-3 rounded-xl border border-amber-500/20">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <span>Entra a <strong>Google AI Studio</strong> con tu cuenta de Google / Gmail.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <span>Haz clic en el botón azul <strong>"Create API key"</strong> (Crear clave).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <span>Copia tu clave (empieza con <code>AIzaSy...</code>), pégala arriba y presiona <strong>Guardar</strong>.</span>
                  </div>
                </div>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-xs"
                >
                  <span>Obtener Clave Gratis en Google AI Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
            <Lock className="w-4 h-4 flex-shrink-0 text-neutral-500 mt-0.5" />
            <p className="text-[11px]">
              Tus fotos no se almacenan de forma permanente. Se analizan temporalmente en tiempo real para generar tu reporte visual.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Guardado</span>
                </>
              ) : (
                <span>Guardar Cambios</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
