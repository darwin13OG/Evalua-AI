import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AnalyzerCard } from './components/AnalyzerCard';
import { EditorialReportView } from './components/EditorialReportView';
import { CompareCard } from './components/CompareCard';
import { ComparisonReportView } from './components/ComparisonReportView';
import { InteractiveChat } from './components/InteractiveChat';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { SplashScreen } from './components/SplashScreen';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { StoryExportModal } from './components/StoryExportModal';
import { DetailedReportResult, ComparisonReportResult, AnalysisMode, AppSettings } from './types';
import { generateEvaluationPDF, convertUrlToBase64 } from './utils/exportUtils';
import { analyzeImage, compareImages } from './services/geminiService';
import { AlertCircle, Loader2, MessageSquare, SplitSquareVertical } from 'lucide-react';

export default function App() {
  // Splash Screen Intro State (lasts ~2 seconds with smooth fade-out)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Dark mode by default (true = pure black, false = pure white)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('evalua_dark_mode');
    return saved !== null ? saved === 'true' : false;
  });

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedKey = localStorage.getItem('evalua_custom_api_key') || '';
    const savedTone = (localStorage.getItem('evalua_tone') as AppSettings['tone']) || 'honest';
    return {
      customApiKey: savedKey,
      tone: savedTone,
    };
  });

  // Menu / Tab navigation: 'report' | 'compare' | 'chat'
  const [activeTab, setActiveTab] = useState<'report' | 'compare' | 'chat'>('report');

  // Single mode state
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('facial');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detailedReport, setDetailedReport] = useState<DetailedReportResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Comparison mode state
  const [compareMode, setCompareMode] = useState<AnalysisMode>('facial');
  const [compareImageA, setCompareImageA] = useState<string | null>(null);
  const [compareImageB, setCompareImageB] = useState<string | null>(null);
  const [comparisonReport, setComparisonReport] = useState<ComparisonReportResult | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [cameraTarget, setCameraTarget] = useState<'single' | 'compareA' | 'compareB'>('single');
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('evalua_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('evalua_dark_mode', 'false');
    }
  }, [darkMode]);

  function handleToggleTheme() {
    setDarkMode((prev) => !prev);
  }

  function handleSaveSettings(newSettings: AppSettings) {
    setSettings(newSettings);
    localStorage.setItem('evalua_custom_api_key', newSettings.customApiKey);
    localStorage.setItem('evalua_tone', newSettings.tone);
  }

  // Single analysis handlers
  function handleImageSelected(base64OrUrl: string) {
    setImagePreview(base64OrUrl);
    setErrorMessage(null);
  }

  function handleClearImage() {
    setImagePreview(null);
    setErrorMessage(null);
    setDetailedReport(null);
  }

  function handleReset() {
    setImagePreview(null);
    setDetailedReport(null);
    setCompareImageA(null);
    setCompareImageB(null);
    setComparisonReport(null);
    setErrorMessage(null);
  }

  function handleResetCompare() {
    setCompareImageA(null);
    setCompareImageB(null);
    setComparisonReport(null);
    setErrorMessage(null);
  }

  function handleOpenLiveCamera(target: 'single' | 'compareA' | 'compareB' = 'single') {
    setCameraTarget(target);
    setIsCameraModalOpen(true);
  }

  function handleCameraCapture(base64: string) {
    if (cameraTarget === 'compareA') {
      setCompareImageA(base64);
    } else if (cameraTarget === 'compareB') {
      setCompareImageB(base64);
    } else {
      handleImageSelected(base64);
    }
    setIsCameraModalOpen(false);
    setErrorMessage(null);
  }

  async function handleAnalyze() {
    if (!imagePreview) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      let payloadImage = imagePreview;
      if (imagePreview.startsWith('http')) {
        payloadImage = await convertUrlToBase64(imagePreview);
      }

      const reportData = await analyzeImage({
        image: payloadImage,
        mode: selectedMode,
        customApiKey: settings.customApiKey,
        tone: settings.tone,
      });

      if (!reportData) {
        throw new Error('No se devolvió una estructura de reporte válida.');
      }

      setDetailedReport(reportData);
      setActiveTab('report');
    } catch (err: unknown) {
      console.error('Error al analizar imagen:', err);
      const msg = err instanceof Error ? err.message : 'Error inesperado durante la evaluación.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCompare() {
    if (!compareImageA || !compareImageB) return;

    setIsComparing(true);
    setErrorMessage(null);

    try {
      let payloadA = compareImageA;
      if (compareImageA.startsWith('http')) {
        payloadA = await convertUrlToBase64(compareImageA);
      }

      let payloadB = compareImageB;
      if (compareImageB.startsWith('http')) {
        payloadB = await convertUrlToBase64(compareImageB);
      }

      const reportData = await compareImages({
        imageA: payloadA,
        imageB: payloadB,
        mode: compareMode,
        customApiKey: settings.customApiKey,
        tone: settings.tone,
      });

      if (!reportData) {
        throw new Error('No se devolvió una estructura de comparativa válida.');
      }

      setComparisonReport(reportData);
      setActiveTab('compare');
    } catch (err: unknown) {
      console.error('Error al realizar comparativa:', err);
      const msg = err instanceof Error ? err.message : 'Error inesperado durante la comparativa.';
      setErrorMessage(msg);
    } finally {
      setIsComparing(false);
    }
  }

  function handleDownloadPdf() {
    if (!detailedReport) return;
    generateEvaluationPDF(detailedReport, imagePreview);
  }

  function handleSelectSuggestedMode(newMode: AnalysisMode) {
    setSelectedMode(newMode);
    setDetailedReport(null);
    if (imagePreview) {
      setTimeout(() => {
        handleAnalyze();
      }, 50);
    }
  }

  const hasAnyResult = Boolean(detailedReport || comparisonReport);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* 2-Second Intro Splash Screen with Fade-Out */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} durationMs={2000} />}

      {/* Top Header with Tab Switcher and Controls */}
      <Header
        darkMode={darkMode}
        onToggleTheme={handleToggleTheme}
        onReset={handleReset}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        hasResult={hasAnyResult}
        hasCustomKey={!!settings.customApiKey.trim()}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col justify-start">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-5 sm:mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-neutral-900 border border-amber-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fade-in w-full">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200">Aviso del Sistema</p>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex-shrink-0 hover:opacity-90 transition-opacity text-center cursor-pointer"
            >
              Ajustes (API Key)
            </button>
          </div>
        )}

        {/* Tab 1: SINGLE REPORT VIEW */}
        {activeTab === 'report' && (
          <div className="w-full space-y-5 sm:space-y-6 animate-fade-in">
            {detailedReport ? (
              /* Editorial Report Output View */
              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                  <span className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Ficha Editorial Generada
                  </span>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Hacer preguntas en el Chat Asesor</span>
                  </button>
                </div>

                <EditorialReportView
                  report={detailedReport}
                  imageSrc={imagePreview}
                  onExportStory={() => setIsStoryModalOpen(true)}
                  onDownloadPdf={handleDownloadPdf}
                  onReset={handleReset}
                  onSelectSuggestedMode={handleSelectSuggestedMode}
                />
              </div>
            ) : (
              /* Initial Input & Analysis Launcher */
              <div className="w-full space-y-5 sm:space-y-6">
                <div className="text-center space-y-2 pb-2">
                  <h2 className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight uppercase px-2">
                    Generador de Reportes Estéticos
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto px-3 leading-relaxed">
                    Selecciona una categoría y sube tu fotografía para obtener una evaluación personalizada con métricas, puntos clave y recomendaciones.
                  </p>
                </div>

                <AnalyzerCard
                  selectedMode={selectedMode}
                  onSelectMode={setSelectedMode}
                  imagePreview={imagePreview}
                  onImageSelected={handleImageSelected}
                  onClearImage={handleClearImage}
                  onOpenLiveCamera={() => handleOpenLiveCamera('single')}
                  onSubmit={handleAnalyze}
                  isLoading={isLoading}
                />

                {isLoading && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-xs text-center space-y-3 animate-fade-in">
                    <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-black dark:text-white animate-spin mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        Analizando proporciones y generando ficha...
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Calculando métricas, forma, simetría, puntos fuertes y recomendaciones.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: COMPARATIVA ANTES VS. DESPUÉS */}
        {activeTab === 'compare' && (
          <div className="w-full space-y-5 sm:space-y-6 animate-fade-in">
            {comparisonReport ? (
              <ComparisonReportView
                result={comparisonReport}
                imageA={compareImageA}
                imageB={compareImageB}
                onReset={handleResetCompare}
              />
            ) : (
              <div className="w-full space-y-5 sm:space-y-6">
                <div className="text-center space-y-2 pb-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 mb-1">
                    <SplitSquareVertical className="w-3.5 h-3.5" />
                    <span>Modo Evolución</span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight uppercase px-2">
                    Comparativa Antes vs. Después
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto px-3 leading-relaxed">
                    Sube dos fotos para contrastar proporciones, cambios de estilo y balance estético.
                  </p>
                </div>

                <CompareCard
                  selectedMode={compareMode}
                  onSelectMode={setCompareMode}
                  imageA={compareImageA}
                  imageB={compareImageB}
                  onImageSelectedA={(b64) => {
                    setCompareImageA(b64);
                    setErrorMessage(null);
                  }}
                  onImageSelectedB={(b64) => {
                    setCompareImageB(b64);
                    setErrorMessage(null);
                  }}
                  onClearImageA={() => setCompareImageA(null)}
                  onClearImageB={() => setCompareImageB(null)}
                  onOpenLiveCameraFor={(target) => handleOpenLiveCamera(target === 'A' ? 'compareA' : 'compareB')}
                  onSubmitCompare={handleCompare}
                  isLoading={isComparing}
                />

                {isComparing && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-xs text-center space-y-3 animate-fade-in">
                    <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-black dark:text-white animate-spin mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        Comparando fotografías y evaluando métricas...
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Contrastando rasgos y proporciones de Foto A vs Foto B.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: CHAT ASESOR VIEW */}
        {activeTab === 'chat' && (
          <div className="w-full space-y-4 animate-fade-in">
            <InteractiveChat
              imagePreview={imagePreview || compareImageB || compareImageA}
              onImageChange={setImagePreview}
              onOpenLiveCamera={() => handleOpenLiveCamera('single')}
              settings={settings}
            />
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-4 bg-white dark:bg-black text-xs text-neutral-500 dark:text-neutral-400 transition-colors mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="font-semibold text-neutral-900 dark:text-white">
            EVALUA AI
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
            © 2026 EVALUA AI. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Live Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* 9:16 Instagram/TikTok Stories Export Modal */}
      {detailedReport && (
        <StoryExportModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          result={detailedReport}
          imageSrc={imagePreview}
        />
      )}
    </div>
  );
}

