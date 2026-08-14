import { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export function CameraCaptureModal({ isOpen, onClose, onCapture }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
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
      console.error('Error accediendo a la cámara:', err);
      setErrorMessage(
        'No se pudo acceder a la cámara. Verifica los permisos del navegador o usa la opción de subir archivo.'
      );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-white" />
            <h3 className="font-bold text-sm sm:text-base">Tomar Foto con la Cámara</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Camera Viewport */}
        <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          {errorMessage ? (
            <div className="p-6 text-center text-neutral-300 max-w-xs">
              <p className="text-sm text-red-400 mb-4">{errorMessage}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800"
              >
                Reintentar
              </button>
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
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3">
          {!capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="p-2.5 rounded-xl bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors flex items-center gap-2 text-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Girar Cámara</span>
              </button>

              <button
                type="button"
                onClick={handleTakePhoto}
                className="px-6 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capturar</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs font-semibold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tomar de Nuevo</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Usar Esta Foto</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
