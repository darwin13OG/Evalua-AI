import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Check, 
  UploadCloud, 
  Smartphone, 
  AlertTriangle, 
  Eye, 
  Sparkles, 
  Activity, 
  Scissors, 
  Flame, 
  Lock,
  Focus
} from 'lucide-react';
import { AnalysisMode } from '../types';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  mode?: AnalysisMode;
}

export function CameraCaptureModal({ 
  isOpen, 
  onClose, 
  onCapture,
  mode = 'facial'
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedPhoto]);

  async function startCamera() {
    stopCamera();
    setErrorMessage(null);
    setIsCameraLoading(true);

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsCameraLoading(false);
      setErrorMessage(
        'Tu navegador o este entorno no admite la cámara en vivo directa. Usa la cámara nativa de tu dispositivo o selecciona una foto.'
      );
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      const errName = err instanceof Error ? err.name : '';
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('Permiso o acceso de cámara en vivo restringido:', errName || errMsg);

      if (errName === 'NotAllowedError' || errMsg.includes('Permission denied') || errMsg.includes('not allowed')) {
        setErrorMessage(
          'Permiso de cámara restringido por el navegador. Puedes abrir la cámara de tu dispositivo o seleccionar un archivo.'
        );
      } else if (errName === 'NotFoundError' || errMsg.includes('not found')) {
        setErrorMessage('No se detectó cámara activa conectada.');
      } else {
        setErrorMessage('No fue posible abrir la cámara en vivo en este navegador.');
      }
    } finally {
      setIsCameraLoading(false);
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }

  function handleTakePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhoto(dataUrl);
      stopCamera();
    }
  }

  function handleNativeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setCapturedPhoto(event.target.result);
          stopCamera();
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleConfirmPhoto() {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      handleClose();
    }
  }

  function handleRetake() {
    setCapturedPhoto(null);
  }

  function handleToggleFacingMode() {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }

  function handleClose() {
    stopCamera();
    setCapturedPhoto(null);
    setErrorMessage(null);
    onClose();
  }

  if (!isOpen) return null;

  // Category specific tips and silhouettes
  function getCategoryGuideInfo() {
    switch (mode) {
      case 'facial':
        return {
          title: 'Guía Facial',
          tip: 'Centra tu rostro en el óvalo, mantén mirada al frente y expresión relajada.',
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'fisico':
        return {
          title: 'Guía de Físico & Postura',
          tip: 'Encuadre de medio cuerpo o cuerpo completo con postura natural y hombros relajados.',
          icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'mirada':
        return {
          title: 'Guía de Mirada',
          tip: 'Enfoca tus ojos dentro de la franja central con buena luz frontal sin reflejos.',
          icon: <Eye className="w-3.5 h-3.5 text-blue-400" />,
        };
      case 'peinado':
        return {
          title: 'Guía de Peinado & Corte',
          tip: 'Asegúrate de que se aprecie todo el volumen superior y los laterales del cabello.',
          icon: <Scissors className="w-3.5 h-3.5 text-purple-400" />,
        };
      case 'aura':
      default:
        return {
          title: 'Guía Estética',
          tip: 'Captura tu expresión y presencia espontánea en tu pose habitual.',
          icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
        };
    }
  }

  const guideInfo = getCategoryGuideInfo();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-neutral-800 flex items-center justify-between text-white bg-neutral-900/90">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-white" />
            <h3 className="font-bold text-sm sm:text-base">Tomar Fotografía</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
              {mode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!errorMessage && !capturedPhoto && (
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  showGuide 
                    ? 'bg-white text-black shadow-xs' 
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
                title="Mostrar u ocultar silueta de guía"
              >
                <Focus className="w-3 h-3" />
                <span>{showGuide ? 'Guía ON' : 'Guía OFF'}</span>
              </button>
            )}

            {/* Prominent Close button at top */}
            <button
              type="button"
              onClick={handleClose}
              className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Cerrar y volver a la app"
            >
              <X className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* Hidden file inputs for Native Camera & Gallery Fallback */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture={facingMode === 'user' ? 'user' : 'environment'}
          className="hidden"
          onChange={handleNativeFile}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleNativeFile}
        />

        {/* Modal Body / Camera Viewport */}
        <div className="relative bg-black flex-1 min-h-[320px] sm:min-h-[380px] flex items-center justify-center overflow-hidden select-none">
          {errorMessage ? (
            <div className="p-5 sm:p-6 text-center text-neutral-300 max-w-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-amber-400 flex items-center justify-center mx-auto border border-neutral-800 shadow-inner">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Acceso a Cámara Restringido</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">{errorMessage}</p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="w-full px-4 py-2.5 bg-white text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-xs cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Abrir Cámara del Dispositivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full px-4 py-2.5 bg-neutral-900 text-neutral-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Elegir Foto de Galería / Archivos</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-medium rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar y Volver
                </button>
              </div>
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Foto capturada"
              className="w-full h-full max-h-[460px] object-contain"
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center min-h-[320px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full max-h-[460px] object-cover sm:object-contain"
              />

              {isCameraLoading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Iniciando cámara...</span>
                </div>
              )}

              {/* Dynamic Camera Silhouettes by Category */}
              {showGuide && !isCameraLoading && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 animate-fade-in">
                  {mode === 'facial' && (
                    <div className="relative w-[210px] h-[280px] sm:w-[240px] sm:h-[310px] rounded-[50%] border-2 border-dashed border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center">
                      {/* Eyes horizontal line */}
                      <div className="w-3/4 border-b border-white/40 mb-8 flex justify-between px-2">
                        <span className="text-[8px] font-mono text-white/70 -mt-3.5">OJOS</span>
                        <span className="text-[8px] font-mono text-white/70 -mt-3.5">OJOS</span>
                      </div>
                      {/* Mouth line */}
                      <div className="w-1/3 border-b border-white/30" />
                    </div>
                  )}

                  {mode === 'mirada' && (
                    <div className="w-[85%] max-w-[320px] h-[130px] rounded-2xl border-2 border-dashed border-blue-400/70 shadow-[0_0_15px_rgba(96,165,250,0.2)] flex flex-col items-center justify-center relative">
                      <div className="w-full border-b border-blue-400/40" />
                      <span className="absolute bottom-2 text-[9px] font-mono text-blue-300 font-bold uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-full">
                        ALINEAR MIRADA AQUÍ
                      </span>
                    </div>
                  )}

                  {mode === 'fisico' && (
                    <div className="w-[80%] max-w-[280px] h-[85%] border-2 border-dashed border-emerald-400/60 rounded-3xl flex flex-col justify-between p-3 relative">
                      {/* Shoulders alignment line */}
                      <div className="w-full border-b border-emerald-400/40 pt-10 flex justify-between text-[8px] font-mono text-emerald-300">
                        <span>HOMBRO</span>
                        <span>HOMBRO</span>
                      </div>
                      <span className="text-[8px] font-mono text-emerald-300 text-center uppercase tracking-wider bg-black/60 py-0.5 rounded">
                        POSTURA & TORSO CENTRADO
                      </span>
                    </div>
                  )}

                  {mode === 'peinado' && (
                    <div className="relative w-[230px] h-[300px] flex flex-col items-center justify-center">
                      {/* Hair volume outer arc */}
                      <div className="w-full h-[60%] border-t-2 border-x-2 border-dashed border-purple-400/70 rounded-t-[70px]" />
                      <div className="w-[70%] h-[40%] border-b-2 border-x-2 border-dashed border-purple-400/40 rounded-b-[50px] -mt-1 flex items-center justify-center">
                        <span className="text-[8px] font-mono text-purple-300 font-bold">ROSTRO</span>
                      </div>
                      <span className="absolute top-2 text-[8px] font-mono text-purple-300 font-bold bg-black/60 px-2 py-0.5 rounded-full">
                        VOLUMEN & CORTE
                      </span>
                    </div>
                  )}

                  {mode === 'aura' && (
                    <div className="w-[85%] h-[85%] border border-rose-400/30 rounded-3xl relative flex items-center justify-center">
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-rose-400" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-rose-400" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-rose-400" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-rose-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Dynamic Contextual Tip bar (Appears smoothly below camera) */}
        {!errorMessage && !capturedPhoto && (
          <div className="px-4 py-2 bg-neutral-900/90 border-t border-neutral-800/80 flex items-center justify-between gap-2 text-xs text-neutral-300 animate-fade-in">
            <div className="flex items-center gap-2">
              {guideInfo.icon}
              <p className="text-[11px] text-neutral-300 leading-tight">
                <strong className="text-white">{guideInfo.title}:</strong> {guideInfo.tip}
              </p>
            </div>
          </div>
        )}

        {/* Privacy micro-banner */}
        <div className="px-4 py-1.5 bg-black border-t border-neutral-900 flex items-center justify-center gap-1.5 text-[10.5px] text-neutral-400">
          <Lock className="w-3 h-3 text-neutral-400" />
          <span>No se guardan fotos: análisis temporal en tiempo real y 100% privado.</span>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3.5 sm:p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-2 sm:gap-3">
          {!errorMessage && !capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="p-2 sm:px-3 sm:py-2.5 rounded-xl bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
                title="Alternar entre cámara frontal y trasera"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {facingMode === 'user' ? 'Frontal' : 'Trasera'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleTakePhoto}
                className="px-5 sm:px-7 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Capturar</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="p-2 sm:px-3 sm:py-2.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </>
          ) : capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tomar de Nuevo</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="px-5 sm:px-6 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Usar Esta Foto</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="ml-auto px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
