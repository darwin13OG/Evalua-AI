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
    <header className="sticky top-0 z-30 w-full max-w-full backdrop-blur-md bg-white/95 dark:bg-black/95 border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-3 w-full">
        {/* Brand Logo & Name */}
        <div 
          onClick={onReset}
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 dark:text-amber-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h1 className="text-xs sm:text-base font-black tracking-tight text-neutral-900 dark:text-white truncate">
                EVALUA<span className="text-amber-500 text-[10px] sm:text-xs ml-0.5 font-bold">AI</span>
              </h1>
            </div>
            <p className="text-[9px] text-neutral-500 dark:text-neutral-400 hidden lg:block -mt-0.5">
              Análisis Estético
            </p>
          </div>
        </div>

        {/* Center Tab Navigation (Compact on mobile) */}
        <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-900 rounded-lg sm:rounded-xl border border-neutral-200 dark:border-neutral-800 flex-shrink-1 min-w-0">
          <button
            onClick={() => onTabChange('report')}
            className={`flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'report'
                ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="hidden xs:inline">Individual</span>
            <span className="xs:hidden">Ficha</span>
          </button>

          <button
            onClick={() => onTabChange('compare')}
            className={`flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'compare'
                ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="hidden xs:inline">Comparar</span>
            <span className="xs:hidden">VS</span>
          </button>

          <button
            onClick={() => onTabChange('chat')}
            className={`flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span>Chat</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {hasResult && (
            <button
              onClick={onReset}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
              title="Iniciar nuevo análisis"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reiniciar</span>
            </button>
          )}

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            aria-label="Abrir guía de ayuda"
            className="p-1.5 sm:p-2 rounded-lg text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
            title="Guía de ayuda y modos"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 dark:text-amber-400" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-1.5 sm:p-2 rounded-lg text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Abrir Ajustes"
            className="relative p-1.5 sm:p-2 rounded-lg text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
            title="Ajustes y Personalización"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {hasCustomKey && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

