import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Check, 
  Image as ImageIcon, 
  Smartphone, 
  AlertTriangle, 
  Timer, 
  Zap, 
  Grid, 
  FlipHorizontal,
  Sliders,
  Keyboard,
  Sparkles,
  Sun
} from 'lucide-react';
import { AnalysisMode } from '../types';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  mode?: AnalysisMode;
}

type TimerDuration = 0 | 3 | 5 | 10;

// Web Audio API synthesizer for crisp shutter click & countdown beeps
function playCameraSound(type: 'countdown' | 'shutter') {
  try {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'countdown') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch {
    // Ignore audio restrictions gracefully
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
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [isRingLightOn, setIsRingLightOn] = useState<boolean>(false);
  const [isShutterFlashing, setIsShutterFlashing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    setIsShutterFlashing(true);
    playCameraSound('shutter');
    setTimeout(() => setIsShutterFlashing(false), 200);

    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user' && isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedPhoto(dataUrl);
      stopCamera();
    }
  }, [facingMode, isMirrored]);

  const handleStartCountdown = useCallback(() => {
    if (timerSeconds === 0) {
      triggerCapture();
      return;
    }

    setCountingDown(timerSeconds);
    playCameraSound('countdown');

    let remaining = timerSeconds;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setCountingDown(remaining);
        playCameraSound('countdown');
      } else {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setCountingDown(null);
        triggerCapture();
      }
    }, 1000);
  }, [timerSeconds, triggerCapture]);

  const handleCancelCountdown = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setCountingDown(null);
  }, []);

  const handleCycleTimer = useCallback(() => {
    setTimerSeconds((prev) => {
      if (prev === 0) return 3;
      if (prev === 3) return 5;
      if (prev === 5) return 10;
      return 0;
    });
  }, []);

  function handleClose() {
    handleCancelCountdown();
    stopCamera();
    setCapturedPhoto(null);
    setErrorMessage(null);
    onClose();
  }

  // Keyboard shortcuts for Desktop / PC users
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        handleClose();
      } else if (e.code === 'Space' && !capturedPhoto && !errorMessage && countingDown === null) {
        e.preventDefault();
        handleStartCountdown();
      } else if (e.key.toLowerCase() === 'g' && !capturedPhoto) {
        setShowGrid((prev) => !prev);
      } else if (e.key.toLowerCase() === 't' && !capturedPhoto) {
        handleCycleTimer();
      } else if (e.key.toLowerCase() === 'm' && !capturedPhoto) {
        setIsMirrored((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, capturedPhoto, errorMessage, countingDown, handleStartCountdown, handleCycleTimer]);

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
        'Tu navegador no admite acceso directo a la cámara web. Puedes abrir la cámara de tu celular o elegir una foto de la galería.'
      );
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
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
          'Permiso de cámara no concedido. Puedes tomar la foto con la app de cámara de tu dispositivo o seleccionar una imagen.'
        );
      } else if (errName === 'NotFoundError' || errMsg.includes('not found')) {
        setErrorMessage('No se encontró una cámara conectada en tu dispositivo.');
      } else {
        setErrorMessage('No fue posible iniciar la cámara en este navegador.');
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

  function handleNativeFileInput(e: React.ChangeEvent<HTMLInputElement>) {
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

  function handleToggleCamera() {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/90 sm:backdrop-blur-md animate-fade-in select-none overflow-hidden"
      onClick={handleClose}
    >
      {/* 
        RESPONSIVE CONTAINER:
        - Mobile (< sm): Fullscreen edge-to-edge native camera app style (h-full w-full rounded-none).
        - PC / Desktop (sm & md & lg): Spacious studio window (sm:max-w-2xl md:max-w-3xl lg:max-w-4xl sm:rounded-3xl border border-neutral-800 shadow-2xl).
      */}
      <div 
        className={`bg-neutral-950 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between relative sm:border sm:border-neutral-800 transition-all ${
          isRingLightOn ? 'ring-4 sm:ring-8 ring-amber-100/90 shadow-[0_0_90px_rgba(255,255,255,0.45)]' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden inputs for native camera and gallery */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture={facingMode === 'user' ? 'user' : 'environment'}
          className="hidden"
          onChange={handleNativeFileInput}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleNativeFileInput}
        />

        {/* 
          1. TOP BAR:
          - Mobile: Translucent floating pill overlay.
          - Desktop (sm+): Full studio header bar with title, keyboard shortcuts & pro toggles.
        */}
        <div className="z-30 p-3 sm:px-6 sm:py-4 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent sm:bg-neutral-900/90 sm:border-b sm:border-neutral-800/80">
          {/* Left: Mode Badge & Studio Title */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-neutral-700">
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white tracking-wide">Estudio Fotográfico IA</span>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-black/60 sm:bg-neutral-800 backdrop-blur-md border border-white/15 sm:border-neutral-700 text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Modo: {mode}</span>
            </span>

            {/* Desktop Ring Light Quick Toggle */}
            {!capturedPhoto && !errorMessage && (
              <button
                type="button"
                onClick={() => setIsRingLightOn(!isRingLightOn)}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                  isRingLightOn 
                    ? 'bg-amber-300 text-black border-amber-300 shadow-sm' 
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white hover:bg-neutral-700'
                }`}
                title="Luz de relleno / Ring light"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isRingLightOn ? 'Luz Activa' : 'Luz Ring'}</span>
              </button>
            )}
          </div>

          {/* Center (Desktop only): Keyboard hints */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-neutral-400">
            <Keyboard className="w-3.5 h-3.5 text-neutral-500" />
            <span>Espacio: Capturar • G: Cuadrícula • T: Reloj • Esc: Salir</span>
          </div>

          {/* Right Controls: Timer, Grid, Mirror (Desktop), Close */}
          <div className="flex items-center gap-2">
            {!capturedPhoto && !errorMessage && (
              <>
                {/* Mobile Ring Light Icon Only */}
                <button
                  type="button"
                  onClick={() => setIsRingLightOn(!isRingLightOn)}
                  className={`sm:hidden p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                    isRingLightOn 
                      ? 'bg-amber-300 text-black border-amber-300 shadow-sm' 
                      : 'bg-black/60 text-white/80 border-white/15 hover:text-white hover:bg-black/80'
                  }`}
                  title="Luz de relleno"
                >
                  <Zap className="w-3.5 h-3.5" />
                </button>

                {/* Timer Cycle Pill */}
                <button
                  type="button"
                  onClick={handleCycleTimer}
                  disabled={countingDown !== null}
                  className={`px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    timerSeconds > 0
                      ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                      : 'bg-black/60 sm:bg-neutral-800 text-white/90 sm:text-neutral-300 border-white/15 sm:border-neutral-700 hover:text-white hover:bg-neutral-700'
                  }`}
                  title="Temporizador (0s, 3s, 5s, 10s)"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>{timerSeconds === 0 ? 'Sin reloj' : `${timerSeconds}s`}</span>
                </button>

                {/* Grid Overlay Toggle */}
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-full backdrop-blur-md border transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                    showGrid
                      ? 'bg-white text-black border-white shadow-sm'
                      : 'bg-black/60 sm:bg-neutral-800 text-white/80 sm:text-neutral-300 border-white/15 sm:border-neutral-700 hover:text-white hover:bg-neutral-700'
                  }`}
                  title="Cuadrícula 3x3 de composición"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Guía</span>
                </button>

                {/* Mirror Toggle (Desktop) */}
                <button
                  type="button"
                  onClick={() => setIsMirrored(!isMirrored)}
                  className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                    isMirrored
                      ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                  }`}
                  title="Efecto espejo"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Espejo</span>
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 sm:p-2 rounded-full bg-black/60 sm:bg-neutral-800 backdrop-blur-md border border-white/15 sm:border-neutral-700 text-white/90 sm:text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
              title="Cerrar cámara"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 
          2. CAMERA VIEWFINDER CANVAS:
          - Generous height on PC (sm:min-h-[460px] md:min-h-[520px]).
          - Edge-to-edge aspect ratio on Mobile.
        */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[420px] sm:min-h-[460px] md:min-h-[520px]">
          {/* Shutter White Flash Effect */}
          {isShutterFlashing && (
            <div className="absolute inset-0 z-40 bg-white pointer-events-none animate-fade-out" />
          )}

          {errorMessage ? (
            /* Error & Fallback State */
            <div className="p-6 text-center text-neutral-300 max-w-sm space-y-4 z-20">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-amber-400 flex items-center justify-center mx-auto border border-neutral-800 shadow-inner">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Cámara en Vivo no Disponible</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">{errorMessage}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="py-3 px-4 bg-white text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-md cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Cámara Nativa</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="py-3 px-4 bg-neutral-900 text-neutral-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Elegir Archivo</span>
                </button>
              </div>
            </div>
          ) : capturedPhoto ? (
            /* Captured Photo Preview */
            <div className="relative w-full h-full flex items-center justify-center bg-black animate-fade-in">
              <img
                src={capturedPhoto}
                alt="Foto Capturada"
                className="w-full h-full object-contain max-h-[75vh]"
              />
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fotografía capturada en alta resolución</span>
              </div>
            </div>
          ) : (
            /* Live Stream Video */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-transform ${
                  facingMode === 'user' && isMirrored ? 'scale-x-[-1]' : ''
                }`}
              />

              {isCameraLoading && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-white text-xs gap-3 z-20">
                  <RefreshCw className="w-7 h-7 animate-spin text-amber-400" />
                  <span className="font-medium text-neutral-300">Iniciando cámara en alta definición...</span>
                </div>
              )}

              {/* Big Cinematic Countdown Overlay */}
              {countingDown !== null && (
                <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white text-black flex items-center justify-center font-black text-5xl sm:text-6xl shadow-2xl animate-pulse ring-8 ring-amber-400/80">
                    {countingDown}
                  </div>
                  <p className="text-white text-sm font-semibold mt-4">Mantén la postura y mira a la cámara</p>
                  <button
                    type="button"
                    onClick={handleCancelCountdown}
                    className="mt-4 px-5 py-2 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-bold border border-white/30 hover:bg-neutral-900 cursor-pointer shadow-lg"
                  >
                    Cancelar Temporizador
                  </button>
                </div>
              )}

              {/* Rule of Thirds Composition Grid */}
              {showGrid && !isCameraLoading && countingDown === null && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 opacity-35">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>
              )}

              {/* Minimalist Aesthetic Center Alignment Reticle */}
              {showGuide && !isCameraLoading && countingDown === null && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
                  {mode === 'facial' ? (
                    <div className="w-[220px] sm:w-[260px] h-[300px] sm:h-[340px] rounded-[50%] border border-white/35 shadow-[0_0_20px_rgba(255,255,255,0.08)] flex flex-col items-center justify-center relative">
                      <div className="w-2/3 border-b border-white/20 mb-10" />
                      <span className="text-[10px] text-white/50 uppercase tracking-widest absolute bottom-4">
                        Alinear Rostro
                      </span>
                    </div>
                  ) : mode === 'mirada' ? (
                    <div className="w-[85%] max-w-[320px] h-[130px] rounded-2xl border border-blue-400/40 shadow-[0_0_15px_rgba(96,165,250,0.2)] flex items-center justify-center">
                      <span className="text-[10px] text-blue-300/60 uppercase tracking-wider">
                        Encuadre de Ojos
                      </span>
                    </div>
                  ) : mode === 'fisico' ? (
                    <div className="w-[80%] h-[84%] max-w-sm rounded-3xl border border-emerald-400/30 flex items-center justify-center">
                      <span className="text-[10px] text-emerald-300/60 uppercase tracking-wider">
                        Encuadre Postura / Cuello
                      </span>
                    </div>
                  ) : (
                    <div className="w-16 h-16 border-t border-l border-white/30" />
                  )}
                </div>
              )}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* 
          3. BOTTOM SHUTTER & ACTION DECK:
          - Mobile: Clean iOS/Leica circular button layout.
          - Desktop (sm+): Spacious studio console with file uploader, big central shutter with Spacebar hint, and flip/confirm buttons.
        */}
        <div className="p-4 sm:px-6 sm:py-5 bg-gradient-to-t from-black via-black/90 to-transparent sm:bg-neutral-900/90 sm:border-t sm:border-neutral-800 flex items-center justify-between gap-4 z-30 flex-shrink-0">
          {!errorMessage && !capturedPhoto ? (
            <>
              {/* Left Action: Gallery / File Upload */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-12 h-12 sm:w-auto sm:px-4 sm:py-2.5 rounded-full sm:rounded-xl bg-neutral-900/90 sm:bg-neutral-800 border border-neutral-800 sm:border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="Elegir foto existente"
                >
                  <ImageIcon className="w-5 h-5 sm:w-4 sm:h-4 text-neutral-300" />
                  <span className="hidden sm:inline text-xs font-semibold">Subir Archivo</span>
                </button>
              </div>

              {/* Center Action: Double Ring Shutter Button */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleStartCountdown}
                  disabled={countingDown !== null || isCameraLoading}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-white/90 sm:border-white p-1 flex items-center justify-center transition-all hover:scale-105 active:scale-90 cursor-pointer disabled:opacity-50 shadow-2xl group"
                  title="Tomar fotografía (o pulsa barra espaciadora)"
                >
                  <div className={`w-full h-full rounded-full transition-all flex items-center justify-center ${
                    timerSeconds > 0 ? 'bg-amber-400 group-hover:bg-amber-300' : 'bg-white group-hover:bg-neutral-200'
                  }`}>
                    {timerSeconds > 0 ? (
                      <Timer className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-black/10" />
                    )}
                  </div>
                </button>
                <span className="hidden sm:block text-[11px] text-neutral-400 font-medium mt-1.5">
                  {timerSeconds > 0 ? `Disparo en ${timerSeconds}s` : 'Clic o [Espacio]'}
                </span>
              </div>

              {/* Right Action: Camera Switcher */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="w-12 h-12 sm:w-auto sm:px-4 sm:py-2.5 rounded-full sm:rounded-xl bg-neutral-900/90 sm:bg-neutral-800 border border-neutral-800 sm:border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="Cambiar entre cámara frontal y trasera"
                >
                  <RefreshCw className="w-5 h-5 sm:w-4 sm:h-4 text-neutral-300" />
                  <span className="hidden sm:inline text-xs font-semibold">
                    {facingMode === 'user' ? 'Frontal' : 'Trasera'}
                  </span>
                </button>
              </div>
            </>
          ) : capturedPhoto ? (
            /* Review Actions */
            <div className="w-full flex items-center justify-between gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-neutral-900 sm:bg-neutral-800 border border-neutral-800 sm:border-neutral-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Repetir Foto</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 active:scale-95 transition-all shadow-xl cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Usar Foto</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-neutral-900 text-white text-xs font-bold cursor-pointer"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
