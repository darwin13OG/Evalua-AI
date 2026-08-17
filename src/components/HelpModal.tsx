import React from 'react';
import { 
  X, 
  Sparkles, 
  Smile, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  MessageSquare, 
  Flame, 
  Eye, 
  Activity, 
  Scissors, 
  KeyRound,
  Camera
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onOpenSettings }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100 flex flex-col max-h-[90vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
              <HelpCircle className="w-4 h-4 text-amber-300 dark:text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Guía de Ayuda & Uso
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Todo lo que necesitas saber sobre EVALUA AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs leading-relaxed">
          {/* Section 1: Diferencia de Modos / Tonos de la IA */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              1. Modos de Tono: ¿Sincero o con Humor?
            </h4>
            <p className="text-neutral-600 dark:text-neutral-400 text-[11.5px]">
              Puedes cambiar el tono en cualquier momento desde <strong>Ajustes (⚙️)</strong>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sincero & Honesto */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Sincero & Honesto</span>
                </div>
                <span className="inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                  Predeterminado
                </span>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                  Evaluación objetiva y fundamentada en simetría y proporciones. Directa, constructiva y sin halagos falsos ni exageraciones.
                </p>
              </div>

              {/* Honesto con Humor */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
                  <Smile className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>Honesto con Humor</span>
                </div>
                <span className="inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Divertido
                </span>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                  Dice la misma verdad sin filtros, pero con comentarios ingeniosos, chispa y humor que hacen la lectura muy entretenida y amena.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Cómo Funciona la Aplicación */}
          <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              2. Cómo Usar la Aplicación
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <div className="w-6 h-6 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </div>
                <div>
                  <h5 className="font-bold text-neutral-900 dark:text-white">Elige la Categoría</h5>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    <strong>Facial</strong> (simetría y tercios), <strong>Físico</strong> (postura y biotipo), <strong>Mirada</strong> (magnetismo), <strong>Aura</strong> (energía y presencia) o <strong>Peinado</strong> (corte y volumen).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <div className="w-6 h-6 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </div>
                <div>
                  <h5 className="font-bold text-neutral-900 dark:text-white">Carga tu Foto o Usa la Cámara</h5>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Arrastra una foto o tómala en vivo. Asegúrate de tener buena iluminación para mejores resultados.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <div className="w-6 h-6 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </div>
                <div>
                  <h5 className="font-bold text-neutral-900 dark:text-white">Modo Comparativa (Antes vs. Después)</h5>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Pestaña superior <strong>Comparativa</strong>: Carga dos fotos para evaluar tu evolución con puntuaciones lado a lado, deltas de cambio y matriz por áreas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <div className="w-6 h-6 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs flex-shrink-0">
                  4
                </div>
                <div>
                  <h5 className="font-bold text-neutral-900 dark:text-white">Revisa tu Ficha y Descarga en PDF</h5>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Obtén calificaciones numéricas (1-10), deltas de cambio, puntos fuertes, áreas de oportunidad y descarga el PDF editorial o expórtalo a Stories.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <div className="w-6 h-6 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs flex-shrink-0">
                  5
                </div>
                <div>
                  <h5 className="font-bold text-neutral-900 dark:text-white">Pregunta en el Chat Asesor</h5>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Pestaña superior <strong>Chat Asesor</strong>: Pide consejos directos sobre corte de cabello, ropa, colorimetría y despeja cualquier inquietud.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Clave de API Gratuita */}
          <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              3. ¿Cómo funciona la API Key de Gemini?
            </h4>
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 space-y-2 text-[11.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <p>
                EVALUA AI utiliza la inteligencia artificial de <strong>Google Gemini</strong> para analizar las imágenes.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>100% Gratuita:</strong> Google ofrece un plan sin costo para desarrolladores y usuarios individuales con miles de peticiones al mes sin requerir tarjeta.</li>
                <li><strong>¿Dónde conseguirla?</strong> Puedes entrar a <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 underline font-semibold">aistudio.google.com/app/apikey</a> con tu cuenta de Google y hacer clic en <em>"Create API Key"</em>.</li>
                <li><strong>Configuración:</strong> Ve al botón de <strong>Ajustes (⚙️)</strong> en la esquina superior, pega tu clave y guárdala. Se almacena únicamente en tu navegador.</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Subjetividad */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
            <h5 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Recuerda: La belleza es subjetiva
            </h5>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
              Las métricas y observaciones de EVALUA AI son una guía estética basada en proporciones geométricas y equilibrio visual. Tu confianza y autenticidad siempre son lo más importante.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black flex items-center justify-between gap-2">
          {onOpenSettings && (
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Configurar API Key</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity font-bold text-xs shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
