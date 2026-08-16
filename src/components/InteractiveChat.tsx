import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Image as ImageIcon, Trash2, Loader2, ArrowRight, Camera, Paperclip, X } from 'lucide-react';
import { ChatMessage, AppSettings } from '../types';
import { chatWithAdvisor } from '../services/geminiService';

interface InteractiveChatProps {
  imagePreview: string | null;
  onImageChange: (base64: string | null) => void;
  onOpenLiveCamera: () => void;
  settings: AppSettings;
}

export const InteractiveChat: React.FC<InteractiveChatProps> = ({
  imagePreview,
  onImageChange,
  onOpenLiveCamera,
  settings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: '¡Hola! Soy tu asesor estético y editorial. Puedes subir o cambiar tu foto aquí mismo y hacerme cualquier pregunta, pedirme un ensayo personalizado, consejos de estilo, colorimetría, corte de cabello o profundizar en cualquier aspecto de tu imagen.',
      timestamp: Date.now(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    'Escribe un ensayo detallado sobre mis proporciones y armonía',
    '¿Qué paleta de colores y tonos de ropa me favorecen más?',
    '¿Qué tipo de corte de cabello equilibra mejor mis rasgos?',
    '¿Cómo puedo potenciar el magnetismo de mi mirada?',
    '¿Qué recomendaciones de estilo y postura me darías?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onImageChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so user can re-select same file if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      hasImageAttached: !!imagePreview,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputPrompt('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const reply = await chatWithAdvisor({
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        image: imagePreview,
        customApiKey: settings.customApiKey,
        tone: settings.tone,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error('Error en chat:', err);
      const msg = err instanceof Error ? err.message : 'Error inesperado al conectar con el servidor.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClearChat() {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Chat reiniciado. ¿En qué aspecto te gustaría profundizar hoy?',
        timestamp: Date.now(),
      },
    ]);
    setErrorMessage(null);
  }

  return (
    <div className="w-full space-y-4 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4 text-amber-300 dark:text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
              Chat Asesor & Consultas Libres
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Sube una foto, pide ensayos, resuelve dudas estéticas o solicita recomendaciones
            </p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title="Borrar historial del chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpiar chat</span>
          </button>
        )}
      </div>

      {/* Main Chat Container */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden flex flex-col transition-colors">
        {/* Photo Bar (Always accessible to upload/change/remove photo) */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          {imagePreview ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700 flex-shrink-0 bg-neutral-900">
                <img src={imagePreview} alt="Foto activa" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs truncate">
                  <span>Foto vinculada</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 hidden xs:block truncate">
                  Evaluando esta imagen
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 min-w-0">
              <ImageIcon className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs truncate">Sube una foto para analizar:</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">{imagePreview ? 'Cambiar' : 'Subir'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenLiveCamera}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs hidden sm:inline">Cámara</span>
            </button>

            {imagePreview && (
              <button
                type="button"
                onClick={() => onImageChange(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Quitar foto"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected}
            />
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="p-4 sm:p-6 space-y-4 min-h-[340px] max-h-[480px] overflow-y-auto bg-neutral-50/50 dark:bg-black transition-colors">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-xs ${
                    isUser
                      ? 'bg-black dark:bg-neutral-800 text-white'
                      : 'bg-neutral-800 dark:bg-neutral-900 text-white'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-amber-300" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs transition-colors ${
                    isUser
                      ? 'bg-black text-white dark:bg-neutral-900 dark:text-white rounded-tr-xs'
                      : 'bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 rounded-tl-xs'
                  }`}
                >
                  {msg.hasImageAttached && isUser && (
                    <div className="flex items-center gap-1 text-[11px] opacity-80 mb-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>[Con foto adjunta]</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="w-7 h-7 rounded-lg bg-neutral-800 dark:bg-neutral-900 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 rounded-tl-xs flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                <Loader2 className="w-4 h-4 animate-spin text-black dark:text-white" />
                <span>EVALUA AI está redactando tu respuesta...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error notice if any */}
        {errorMessage && (
          <div className="mx-4 my-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Sugerencias:
            </span>
            {quickPrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(promptText)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-xs bg-white dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 transition-colors flex items-center gap-1 group whitespace-nowrap disabled:opacity-50"
              >
                <span>{promptText}</span>
                <ArrowRight className="w-2.5 h-2.5 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Input Form Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
        >
          {/* Quick attach button next to input */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors flex-shrink-0"
            title="Subir fotografía"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder={
              imagePreview
                ? 'Escribe tu consulta o pide un ensayo sobre esta foto...'
                : 'Escribe tu pregunta o sube una foto antes de enviar...'
            }
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white disabled:opacity-60 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all flex-shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Enviar</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
