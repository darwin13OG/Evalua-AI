import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, UploadCloud, Smartphone, AlertTriangle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export function CameraCaptureModal({ isOpen, onClose, onCapture }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        'Tu navegador o este entorno no admite la cámara en vivo por navegador. Usa la cámara nativa de tu dispositivo.'
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
          'Permiso de cámara denegado por el navegador o entorno. Puedes activar la cámara nativa de tu dispositivo o seleccionar un archivo.'
        );
      } else if (errName === 'NotFoundError' || errMsg.includes('not found')) {
        setErrorMessage('No se encontró ninguna cámara conectada a este dispositivo.');
      } else {
        setErrorMessage('No fue posible abrir la cámara en vivo en este navegador.');
      }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-neutral-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-white" />
            <h3 className="font-bold text-sm sm:text-base">Tomar Fotografía</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
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
        <div className="relative bg-black flex-1 min-h-[320px] flex items-center justify-center overflow-hidden">
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
                  onClick={startCamera}
                  className="text-[11px] text-neutral-500 hover:text-neutral-300 pt-1 underline block mx-auto cursor-pointer"
                >
                  Reintentar permiso en vivo
                </button>
              </div>
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Foto capturada"
              className="w-full h-full max-h-[450px] object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full max-h-[450px] object-contain"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />
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
                onClick={() => nativeCameraInputRef.current?.click()}
                className="p-2 sm:px-3 sm:py-2.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Abrir cámara del sistema"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cámara Nativa</span>
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
              className="ml-auto px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs font-semibold"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
