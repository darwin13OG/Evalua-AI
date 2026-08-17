import React, { useState } from 'react';
import { X, Key, Check, AlertCircle, ShieldCheck, Sparkles, Trash2, ExternalLink, HelpCircle, Gift } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(settings.customApiKey);
  const [tone, setTone] = useState<AppSettings['tone']>(settings.tone);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);

  if (!isOpen) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSaveSettings({
      customApiKey: apiKeyInput.trim(),
      tone,
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
              <Key className="w-4 h-4 text-amber-300 dark:text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Ajustes & API Key
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Personaliza la evaluación y configura tu clave de inteligencia artificial
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
          {/* Tutorial Box: Cómo conseguir API Key gratis */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 dark:border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                  ¿Cómo obtener tu API Key 100% Gratis?
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowTutorial(!showTutorial)}
                className="text-[11px] text-amber-700 dark:text-amber-300 hover:underline font-semibold"
              >
                {showTutorial ? 'Ocultar guía' : 'Ver guía'}
              </button>
            </div>

            {showTutorial && (
              <div className="space-y-2 text-[11.5px] text-neutral-700 dark:text-neutral-300 leading-relaxed pt-1">
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
                    <span>Copia tu clave (empieza con <code>AIzaSy...</code>), pégala abajo y presiona <strong>Guardar</strong>.</span>
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

          {/* Custom API Key input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                Tu Gemini API Key
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
              La clave se guarda de manera privada y segura únicamente en tu propio navegador.
            </p>
          </div>

          {/* Tone Selector */}
          <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
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
                  Directo, técnico y proporcional.
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
                  La verdad con comentarios chisposos.
                </div>
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-neutral-500 mt-0.5" />
            <p className="text-[11px]">
              Tus fotos no se almacenan de forma permanente. Se analizan en tiempo real para generar tu reporte visual.
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
