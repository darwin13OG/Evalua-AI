import React from 'react';
import { Sparkles, Sun, Moon, RotateCcw, Settings, FileText, MessageSquare, HelpCircle, SplitSquareVertical } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  hasResult: boolean;
  hasCustomKey: boolean;
  activeTab: 'report' | 'compare' | 'chat';
  onTabChange: (tab: 'report' | 'compare' | 'chat') => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleTheme,
  onReset,
  onOpenSettings,
  onOpenHelp,
  hasResult,
  hasCustomKey,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/90 dark:bg-black/90 border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-1 sm:gap-3">
        {/* Brand Logo & Name */}
        <div 
          onClick={onReset}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300 dark:text-amber-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-base font-black tracking-tight text-neutral-900 dark:text-white truncate">
                EVALUA AI
              </h1>
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 hidden md:block">
              Análisis Estético & Visual
            </p>
          </div>
        </div>

        {/* Center Tab Navigation (Optimized for mobile with 3 tabs) */}
        <div className="flex items-center p-0.5 sm:p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => onTabChange('report')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'report'
                ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[10.5px] sm:text-xs">Individual</span>
          </button>

          <button
            onClick={() => onTabChange('compare')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[10.5px] sm:text-xs">Comparativa</span>
          </button>

          <button
            onClick={() => onTabChange('chat')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[10.5px] sm:text-xs hidden xs:inline">Chat Asesor</span>
            <span className="text-[10.5px] sm:text-xs xs:hidden">Chat</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {hasResult && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
              title="Iniciar nuevo análisis"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reiniciar</span>
            </button>
          )}

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            aria-label="Abrir guía de ayuda"
            className="p-1.5 sm:p-2 rounded-lg text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
            title="Guía de ayuda y modos"
          >
            <HelpCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-1.5 sm:p-2 rounded-lg text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
            title={darkMode ? 'Modo claro (Blanco)' : 'Modo oscuro (Negro)'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Abrir Ajustes"
            className="relative p-1.5 sm:p-2 rounded-lg text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
            title="Ajustes, Tono y API Key"
          >
            <Settings className="w-4 h-4" />
            {hasCustomKey && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

