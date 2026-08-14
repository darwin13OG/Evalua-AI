import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, durationMs = 2000 }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start gentle fade-out 700ms before completion
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(400, durationMs - 700));

    const finishTimer = setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white select-none pointer-events-none transition-all duration-700 ease-out ${
        isFadingOut ? 'opacity-0 scale-95 blur-xs' : 'opacity-100 scale-100 blur-none'
      }`}
    >
      <div className="flex flex-col items-center text-center space-y-5 px-6 animate-fade-in max-w-sm">
        {/* Animated Brand Emblem */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-white text-black flex items-center justify-center shadow-2xl ring-1 ring-white/20 transform transition-transform animate-pulse">
            <Sparkles className="w-10 h-10 text-amber-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-black animate-ping" />
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-white font-sans">
            EVALUA AI
          </h1>
          <p className="text-xs sm:text-sm font-medium text-neutral-400 tracking-wide">
            Análisis Estético & Asesoría Visual
          </p>
        </div>

        {/* Minimal Progress Line */}
        <div className="w-32 h-1 rounded-full bg-neutral-800 overflow-hidden mt-3">
          <div className="h-full bg-white rounded-full animate-[shimmer_1.5s_infinite_linear] w-full" />
        </div>
      </div>
    </div>
  );
};

