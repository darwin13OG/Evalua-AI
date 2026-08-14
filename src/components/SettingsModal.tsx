import React, { useState } from 'react';
import { X, Key, Check, AlertCircle, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden transition-colors"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
              <Key className="w-4 h-4 text-amber-300 dark:text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Ajustes & Configuración
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Personaliza la evaluación y las llaves de acceso
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Tone Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              Tono de la Evaluación
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTone('honest')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  tone === 'honest'
                    ? 'border-black bg-neutral-100 dark:border-white dark:bg-neutral-900 font-bold ring-1 ring-black dark:ring-white'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="text-xs text-neutral-900 dark:text-white flex items-center justify-between">
                  <span>Sincero & Honesto</span>
                  {tone === 'honest' && <span className="text-[9px] uppercase px-1 rounded bg-black text-white dark:bg-white dark:text-black">Por defecto</span>}
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">
                  Directo, objetivo y sin adornos innecesarios.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTone('humor')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  tone === 'humor'
                    ? 'border-black bg-neutral-100 dark:border-white dark:bg-neutral-900 font-bold ring-1 ring-black dark:ring-white'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="text-xs text-neutral-900 dark:text-white">Honesto con Humor</div>
                <div className="text-[10px] text-neutral-500 mt-1">
                  Dice toda la verdad pero con chispa y comentarios divertidos.
                </div>
              </button>
            </div>
          </div>

          {/* Custom API Key input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                Gemini API Key (Opcional)
              </label>
              {apiKeyInput && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-[11px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Borrar
                </button>
              )}
            </div>

            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
            />
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Si el servidor está ocupado o prefieres usar tu propia cuota, ingresa tu API Key de Google AI Studio. Se guarda de forma local en tu navegador.
            </p>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-neutral-500 mt-0.5" />
            <p className="text-[11px]">
              Tus fotos y datos no se almacenan de forma permanente. Se procesan únicamente para la generación en tiempo real de tu reporte.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
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
