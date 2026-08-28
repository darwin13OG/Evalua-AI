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
  Focus,
  Timer,
  Sun,
  Grid,
  FlipHorizontal,
  Zap,
  Play
} from 'lucide-react';
import { AnalysisMode } from '../types';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  mode?: AnalysisMode;
}

type TimerDuration = 0 | 3 | 5 | 10;
type GuideType = 'silhouette' | 'grid' | 'none';

// Web Audio API synth sound generator (No external assets required)
function playCameraAudio(type: 'countdown' | 'shutter') {
  try {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'countdown') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else {
      // Shutter click sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch {
    // Ignore audio errors if browser autoplay policies block
  }
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
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [timerSeconds, setTimerSeconds] = useState<TimerDuration>(0);
  const [countingDown, setCountingDown] = useState<number | null>(null);
  const [guideMode, setGuideMode] = useState<GuideType>('silhouette');
  const [isScreenFlashOn, setIsScreenFlashOn] = useState<boolean>(false);
  const [isShutterEffect, setIsShutterEffect] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, facingMode, capturedPhoto]);

  async function startCamera() {
    stopCamera();
    setErrorMessage(null);
    setIsCameraLoading(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsCameraLoading(false);
      setErrorMessage(
        'Tu navegador o este entorno no admite la cámara en vivo directa. Puedes usar la cámara nativa de tu dispositivo o seleccionar una foto.'
      );
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1920 },
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
      console.warn('Acceso a cámara en vivo:', errName || errMsg);

      if (errName === 'NotAllowedError' || errMsg.includes('Permission denied') || errMsg.includes('not allowed')) {
        setErrorMessage(
          'Permiso de cámara denegado. Puedes abrir la cámara de tu dispositivo o seleccionar una foto de tu galería.'
        );
      } else if (errName === 'NotFoundError' || errMsg.includes('not found')) {
        setErrorMessage('No se detectó cámara disponible en el dispositivo.');
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

  function triggerShutterCapture() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Flash animation & Shutter sound
    setIsShutterEffect(true);
    playCameraAudio('shutter');
    setTimeout(() => setIsShutterEffect(false), 200);

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If front camera and mirrored, flip horizontally on canvas
      if (facingMode === 'user' && isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedPhoto(dataUrl);
      stopCamera();
    }
  }

  function handleStartCaptureFlow() {
    if (timerSeconds === 0) {
      triggerShutterCapture();
      return;
    }

    setCountingDown(timerSeconds);
    playCameraAudio('countdown');

    let current = timerSeconds;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountingDown(current);
        playCameraAudio('countdown');
      } else {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setCountingDown(null);
        triggerShutterCapture();
      }
    }, 1000);
  }

  function handleCancelTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setCountingDown(null);
  }

  function handleCycleTimer() {
    setTimerSeconds((prev) => {
      if (prev === 0) return 3;
      if (prev === 3) return 5;
      if (prev === 5) return 10;
      return 0;
    });
  }

  function handleCycleGuide() {
    setGuideMode((prev) => {
      if (prev === 'silhouette') return 'grid';
      if (prev === 'grid') return 'none';
      return 'silhouette';
    });
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
    setCountingDown(null);
  }

  function handleToggleFacingMode() {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }

  function handleClose() {
    handleCancelTimer();
    stopCamera();
    setCapturedPhoto(null);
    setErrorMessage(null);
    onClose();
  }

  if (!isOpen) return null;

  function getCategoryGuideInfo() {
    switch (mode) {
      case 'facial':
        return {
          title: 'Guía Facial',
          tip: 'Centra tu rostro en el óvalo, mirada fija al frente y hombros alineados.',
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'fisico':
        return {
          title: 'Guía de Físico & Postura',
          tip: 'Encuadre de medio o cuerpo entero con postura erguida natural.',
          icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'mirada':
        return {
          title: 'Guía de Mirada',
          tip: 'Enfoca tus ojos en la franja central con buena luz sin sombras.',
          icon: <Eye className="w-3.5 h-3.5 text-blue-400" />,
        };
      case 'peinado':
        return {
          title: 'Guía de Peinado',
          tip: 'Asegúrate de mostrar todo el volumen superior y líneas de patillas/laterales.',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className={`bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[96vh] relative ${
          isScreenFlashOn ? 'ring-8 ring-amber-100/90 shadow-[0_0_80px_rgba(255,255,255,0.4)]' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="px-3.5 py-3 sm:px-5 sm:py-3.5 border-b border-neutral-800 flex items-center justify-between text-white bg-neutral-900/90 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-black text-amber-400 flex items-center justify-center border border-neutral-800 flex-shrink-0">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm truncate">Cámara Inteligente</h3>
              <p className="text-[10px] text-neutral-400 font-mono uppercase truncate">
                Modo: {mode} • {facingMode === 'user' ? 'Frontal' : 'Trasera'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Quick Native Camera shortcut */}
            {!capturedPhoto && (
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="px-2 sm:px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Abrir cámara del celular del sistema"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">App Nativa</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Cerrar cámara"
            >
              <X className="w-4 h-4" />
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

        {/* Camera Quick Control Toolbar (Timer, Guides, Flash, Mirror) */}
        {!errorMessage && !capturedPhoto && (
          <div className="px-3 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar flex-shrink-0 text-xs">
            <div className="flex items-center gap-1.5">
              {/* Timer button */}
              <button
                type="button"
                onClick={handleCycleTimer}
                disabled={countingDown !== null}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                  timerSeconds > 0
                    ? 'bg-amber-500 text-black shadow-xs'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
                title="Temporizador de captura (0s, 3s, 5s, 10s)"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{timerSeconds === 0 ? 'Sin reloj' : `${timerSeconds}s`}</span>
              </button>

              {/* Guide Mode Toggle */}
              <button
                type="button"
                onClick={handleCycleGuide}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                  guideMode !== 'none'
                    ? 'bg-white text-black shadow-xs'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
                title="Alternar Guías de alineación"
              >
                {guideMode === 'grid' ? <Grid className="w-3.5 h-3.5" /> : <Focus className="w-3.5 h-3.5" />}
                <span className="hidden xs:inline">
                  {guideMode === 'silhouette' ? 'Silueta' : guideMode === 'grid' ? 'Cuadrícula' : 'Sin Guía'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Screen Flash / Ring Light */}
              <button
                type="button"
                onClick={() => setIsScreenFlashOn(!isScreenFlashOn)}
                className={`p-1.5 sm:px-2 sm:py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                  isScreenFlashOn
                    ? 'bg-amber-300 text-black shadow-xs'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
                title="Luz de pantalla / Ring light para selfies oscuras"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Luz Ring</span>
              </button>

              {/* Mirror selfie toggle (only for front camera) */}
              {facingMode === 'user' && (
                <button
                  type="button"
                  onClick={() => setIsMirrored(!isMirrored)}
                  className={`p-1.5 sm:px-2 sm:py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                    isMirrored
                      ? 'bg-neutral-800 text-white border border-neutral-700'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                  title="Efecto espejo en cámara frontal"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isMirrored ? 'Espejo' : 'Real'}</span>
                </button>
              )}

              {/* Camera Flip button */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Cambiar entre cámara frontal y trasera"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{facingMode === 'user' ? 'Frontal' : 'Trasera'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body / Camera Viewport Area */}
        <div className="relative bg-black flex-1 min-h-[340px] sm:min-h-[420px] flex items-center justify-center overflow-hidden select-none">
          {/* Shutter White Flash Effect */}
          {isShutterEffect && (
            <div className="absolute inset-0 z-40 bg-white pointer-events-none animate-fade-out" />
          )}

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
                  <span>Tomar con la Cámara de tu Celular</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full px-4 py-2.5 bg-neutral-900 text-neutral-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Elegir Foto de Galería</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-medium rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : capturedPhoto ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedPhoto}
                alt="Foto capturada"
                className="w-full h-full max-h-[480px] object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm border border-white/20 text-white text-[10.5px] px-2.5 py-1 rounded-full font-bold">
                ✓ Foto Lista para Evaluar
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center min-h-[340px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full max-h-[480px] object-cover sm:object-contain transition-transform ${
                  facingMode === 'user' && isMirrored ? 'scale-x-[-1]' : ''
                }`}
              />

              {isCameraLoading && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-xs gap-2 z-20">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Iniciando cámara en vivo...</span>
                </div>
              )}

              {/* Big Animated Countdown Overlay */}
              {countingDown !== null && (
                <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center animate-fade-in pointer-events-auto">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/90 text-black flex items-center justify-center font-black text-5xl sm:text-6xl shadow-2xl animate-pulse ring-8 ring-amber-400/80">
                    {countingDown}
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelTimer}
                    className="mt-6 px-4 py-2 rounded-xl bg-black/80 text-white text-xs font-bold border border-white/30 hover:bg-neutral-900 cursor-pointer shadow-lg"
                  >
                    Cancelar Temporizador
                  </button>
                </div>
              )}

              {/* Rule of Thirds Grid Guide */}
              {guideMode === 'grid' && !isCameraLoading && countingDown === null && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-b border-white/30" />
                  <div className="border-r border-white/30" />
                  <div className="border-r border-white/30" />
                  <div />
                </div>
              )}

              {/* Dynamic Category Silhouette Guides */}
              {guideMode === 'silhouette' && !isCameraLoading && countingDown === null && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4 z-10 animate-fade-in">
                  {mode === 'facial' && (
                    <div className="relative w-[210px] h-[280px] sm:w-[240px] sm:h-[310px] rounded-[50%] border-2 border-dashed border-white/70 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex flex-col items-center justify-center">
                      <div className="w-3/4 border-b border-white/50 mb-8 flex justify-between px-2">
                        <span className="text-[8px] font-mono text-white/90 -mt-3.5 bg-black/50 px-1 rounded">OJOS</span>
                        <span className="text-[8px] font-mono text-white/90 -mt-3.5 bg-black/50 px-1 rounded">OJOS</span>
                      </div>
                      <div className="w-1/3 border-b border-white/40" />
                    </div>
                  )}

                  {mode === 'mirada' && (
                    <div className="w-[88%] max-w-[320px] h-[130px] rounded-2xl border-2 border-dashed border-blue-400/80 shadow-[0_0_20px_rgba(96,165,250,0.3)] flex flex-col items-center justify-center relative">
                      <div className="w-full border-b border-blue-400/50" />
                      <span className="absolute bottom-2 text-[9px] font-mono text-blue-200 font-bold uppercase tracking-wider bg-black/70 px-2.5 py-0.5 rounded-full border border-blue-400/40">
                        ALINEAR OJOS Y CEJAS
                      </span>
                    </div>
                  )}

                  {mode === 'fisico' && (
                    <div className="w-[82%] max-w-[280px] h-[85%] border-2 border-dashed border-emerald-400/70 rounded-3xl flex flex-col justify-between p-3 relative shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                      <div className="w-full border-b border-emerald-400/50 pt-10 flex justify-between text-[8px] font-mono text-emerald-200">
                        <span className="bg-black/60 px-1 rounded">HOMBRO</span>
                        <span className="bg-black/60 px-1 rounded">HOMBRO</span>
                      </div>
                      <span className="text-[8px] font-mono text-emerald-200 text-center uppercase tracking-wider bg-black/70 py-1 rounded border border-emerald-400/30">
                        POSTURA & TORSO CENTRADO
                      </span>
                    </div>
                  )}

                  {mode === 'peinado' && (
                    <div className="relative w-[230px] h-[300px] flex flex-col items-center justify-center">
                      <div className="w-full h-[60%] border-t-2 border-x-2 border-dashed border-purple-400/80 rounded-t-[70px] shadow-[0_0_20px_rgba(192,132,252,0.25)]" />
                      <div className="w-[70%] h-[40%] border-b-2 border-x-2 border-dashed border-purple-400/50 rounded-b-[50px] -mt-1 flex items-center justify-center">
                        <span className="text-[8px] font-mono text-purple-200 font-bold bg-black/60 px-1 rounded">ROSTRO</span>
                      </div>
                      <span className="absolute top-2 text-[8px] font-mono text-purple-200 font-bold bg-black/70 px-2.5 py-0.5 rounded-full border border-purple-400/40">
                        VOLUMEN SUPERIOR & LATERALES
                      </span>
                    </div>
                  )}

                  {mode === 'aura' && (
                    <div className="w-[85%] h-[85%] border border-rose-400/40 rounded-3xl relative flex items-center justify-center">
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

        {/* Dynamic Contextual Tip bar */}
        {!errorMessage && !capturedPhoto && (
          <div className="px-3.5 py-2 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-2 text-xs text-neutral-300 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {guideInfo.icon}
              <p className="text-[11px] text-neutral-300 leading-tight truncate">
                <strong className="text-white">{guideInfo.title}:</strong> {guideInfo.tip}
              </p>
            </div>
          </div>
        )}

        {/* Privacy Note */}
        <div className="px-3 py-1 bg-black border-t border-neutral-900 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 flex-shrink-0">
          <Lock className="w-3 h-3 text-neutral-400" />
          <span>Privacidad total: foto procesada en memoria sin guardarse en servidores.</span>
        </div>

        {/* Bottom Shutter Controls Bar */}
        <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-2 sm:gap-3 flex-shrink-0">
          {!errorMessage && !capturedPhoto ? (
            <>
              {/* Gallery Shortcut Button */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="p-2 sm:px-3 sm:py-2.5 rounded-xl bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Elegir desde la galería"
              >
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Galería</span>
              </button>

              {/* Main Shutter Button with Countdown indicator */}
              <button
                type="button"
                onClick={handleStartCaptureFlow}
                disabled={countingDown !== null}
                className="flex-1 max-w-[200px] py-3 rounded-2xl bg-white text-black hover:bg-neutral-200 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {timerSeconds > 0 ? (
                  <>
                    <Timer className="w-4 h-4 text-amber-600" />
                    <span>Capturar ({timerSeconds}s)</span>
                  </>
                ) : (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full bg-red-600 animate-pulse" />
                    <span>Disparar</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="p-2 sm:px-3 sm:py-2.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </>
          ) : capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 text-neutral-200 hover:bg-neutral-800 hover:text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Tomar de Nuevo</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95"
              >
                <Check className="w-4 h-4 text-black" />
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
