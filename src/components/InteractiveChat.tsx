import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Image as ImageIcon, 
  Trash2, 
  Loader2, 
  Camera, 
  Paperclip, 
  X, 
  Lock, 
  Copy, 
  Check, 
  FileText, 
  Scissors, 
  Palette, 
  Eye,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
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
      content: '¡Hola! Soy tu **Asesor Estético y Redactor Editorial** de EVALUA AI.\n\nPuedes subir tu fotografía y hacerme cualquier pregunta: pedir un **ensayo editorial completo**, un diagnóstico de visagismo facial, recomendaciones de corte de cabello o una paleta de colorimetría personalizada.',
      timestamp: Date.now(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestionChips = [
    {
      id: 'essay',
      label: 'Redactar Ensayo Completo',
      icon: <FileText className="w-3.5 h-3.5 text-amber-500" />,
      prompt: 'Por favor redacta un ensayo editorial completo estructurado evaluando mis proporciones anatómicas, armonía de rasgos, puntos fuertes y un plan de acción de estilo con base en la foto adjunta.',
    },
    {
      id: 'visagismo',
      label: 'Visagismo y Cortes',
      icon: <Scissors className="w-3.5 h-3.5 text-emerald-500" />,
      prompt: 'Realiza un diagnóstico de visagismo: determina la forma geométrica de mi rostro y recomienda qué cortes de cabello, peinados y estilo de cejas equilibran mejor mis facciones.',
    },
    {
      id: 'colors',
      label: 'Paleta de Ropa y Colorimetría',
      icon: <Palette className="w-3.5 h-3.5 text-purple-500" />,
      prompt: 'Analiza mi tonalidad y contraste para sugerirme mi paleta de colores de ropa más favorecedora y combinaciones recomendadas.',
    },
    {
      id: 'eyes',
      label: 'Mirada y Expresión',
      icon: <Eye className="w-3.5 h-3.5 text-blue-500" />,
      prompt: 'Escribe un análisis profundo sobre la proyección, simetría y magnetismo de mi mirada, junto con técnicas para potenciarla.',
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function handleCopyMessage(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

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
        detailLevel: settings.detailLevel,
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
        content: 'Chat reiniciado. ¿En qué aspecto de tu estilo o proporciones te gustaría profundizar hoy?',
        timestamp: Date.now(),
      },
    ]);
    setErrorMessage(null);
  }

  return (
    <div className="w-full max-w-full flex flex-col animate-fade-in space-y-2.5">
      {/* Native Messenger Card */}
      <div className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden flex flex-col transition-colors">
        
        {/* Chat Top App Header Bar */}
        <div className="px-3 sm:px-5 py-3 bg-neutral-50 dark:bg-neutral-900/90 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* AI Avatar with Live Pulsing Dot */}
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300 dark:text-amber-500" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                  Asesor Editorial AI
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 hidden xs:inline-block">
                  En línea
                </span>
              </div>
              <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 truncate">
                {imagePreview ? 'Foto vinculada a la conversación' : 'Consultas estéticas y ensayos'}
              </p>
            </div>
          </div>

          {/* Top Actions: Clear Chat & Quick Camera */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {messages.length > 1 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Limpiar conversación"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages Stream Container (Responsive Height for Mobile) */}
        <div className="p-3 sm:p-5 space-y-3.5 min-h-[380px] h-[calc(100dvh-280px)] sm:h-[460px] max-h-[600px] overflow-y-auto bg-neutral-50/60 dark:bg-black/50 transition-colors">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 sm:gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-xs mb-1 ${
                    isUser
                      ? 'bg-neutral-800 dark:bg-neutral-700'
                      : 'bg-black dark:bg-white text-white dark:text-black'
                  }`}
                >
                  {isUser ? (
                    <User className="w-3 h-3 text-white" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-amber-300 dark:text-amber-500" />
                  )}
                </div>

                {/* Message Bubble Container */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-[13px] leading-relaxed shadow-xs transition-colors ${
                    isUser
                      ? 'bg-black text-white dark:bg-neutral-800 dark:text-white rounded-br-xs'
                      : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200/90 dark:border-neutral-800 rounded-bl-xs'
                  }`}
                >
                  {/* Attached photo tag in user message */}
                  {msg.hasImageAttached && isUser && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-300 mb-1 font-medium">
                      <ImageIcon className="w-3 h-3" />
                      <span>Con foto adjunta</span>
                    </div>
                  )}

                  {isUser ? (
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="markdown-content text-xs sm:text-[13px] leading-relaxed break-words">
                        <Markdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            strong: ({ children }) => (
                              <strong className="font-bold text-neutral-950 dark:text-white underline decoration-amber-500/60 dark:decoration-amber-400 decoration-1 underline-offset-2">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic text-amber-700 dark:text-amber-300 font-medium">
                                {children}
                              </em>
                            ),
                            ul: ({ children }) => (
                              <ul className="my-1.5 space-y-1 pl-1 list-none">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="my-1.5 space-y-1 list-decimal pl-4">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="flex items-start gap-1.5 leading-relaxed">
                                <span className="text-amber-500 dark:text-amber-400 font-bold select-none">•</span>
                                <div className="flex-1">{children}</div>
                              </li>
                            ),
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-sm sm:text-base font-black tracking-tight mt-2.5 mb-1 text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-1">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-xs sm:text-sm font-extrabold tracking-tight mt-2 mb-1 text-neutral-900 dark:text-white">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider mt-1.5 mb-0.5 text-neutral-800 dark:text-neutral-200">
                                {children}
                              </h3>
                            ),
                            code: ({ children }) => (
                              <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-amber-600 dark:text-amber-400">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {msg.content}
                        </Markdown>
                      </div>

                      {/* Message Action Footer: Copy button */}
                      <div className="flex items-center justify-end pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1 text-[10.5px] font-semibold text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          title="Copiar respuesta"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500 font-bold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-end gap-2 animate-fade-in">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center flex-shrink-0 shadow-xs mb-1">
                <Bot className="w-3 h-3 text-amber-300 dark:text-amber-500" />
              </div>
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-3.5 py-2.5 rounded-bl-xs flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300 shadow-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black dark:text-white" />
                <span>EVALUA AI está redactando tu respuesta...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mx-3 my-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2">
            <span className="truncate">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Suggestion Chips Horizontal Bar */}
        <div className="px-2.5 sm:px-4 py-2 bg-neutral-100/70 dark:bg-neutral-900/60 border-t border-neutral-200 dark:border-neutral-800 overflow-x-auto no-scrollbar w-full max-w-full">
          <div className="flex items-center gap-1.5 min-w-max">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1 pr-1 select-none">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Consultas:
            </span>
            {suggestionChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleSendMessage(chip.prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-neutral-950 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 transition-all flex items-center gap-1.5 whitespace-nowrap disabled:opacity-40 shadow-xs cursor-pointer active:scale-95"
              >
                {chip.icon}
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Attached Image Bar if active */}
        {imagePreview && (
          <div className="px-3 sm:px-4 py-1.5 bg-amber-500/10 dark:bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md overflow-hidden border border-amber-500/40 flex-shrink-0 bg-neutral-900">
                <img src={imagePreview} alt="Foto activa" className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 truncate">
                Foto adjunta vinculada al análisis
              </span>
            </div>
            <button
              type="button"
              onClick={() => onImageChange(null)}
              className="p-1 rounded-md text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors"
              title="Desvincular foto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom Input Composer (WhatsApp / ChatGPT Style) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-2.5 sm:p-3 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5 sm:gap-2 w-full max-w-full"
        >
          {/* Paperclip / File Picker Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 sm:p-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors flex-shrink-0 cursor-pointer"
            title="Adjuntar o cambiar foto"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Camera Button */}
          <button
            type="button"
            onClick={onOpenLiveCamera}
            className="p-2 sm:p-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors flex-shrink-0 cursor-pointer"
            title="Tomar foto con cámara"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelected}
          />

          {/* Text Input Field */}
          <input
            type="text"
            placeholder={
              imagePreview
                ? 'Escribe tu pregunta o pide un ensayo...'
                : 'Escribe tu consulta estética...'
            }
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 text-base sm:text-xs md:text-sm rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white disabled:opacity-60 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all flex-shrink-0 cursor-pointer"
            title="Enviar mensaje"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Enviar</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Zero-Storage Privacy Footnote */}
        <div className="px-3 py-1.5 bg-neutral-50 dark:bg-black border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400 text-center">
          <Lock className="w-2.5 h-2.5 text-neutral-500 flex-shrink-0" />
          <span>Privado y efímero: Los mensajes y fotos se procesan temporalmente y no se almacenan.</span>
        </div>
      </div>
    </div>
  );
};
