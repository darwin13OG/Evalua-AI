import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with support for large base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Helper to get GoogleGenAI client (either with custom key or server default)
function getGenAI(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_REQUIRED");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Analyze image endpoint for structured editorial reports
app.post("/api/analyze", async (req, res) => {
  try {
    const { image, mimeType = "image/jpeg", mode = "facial", question = "", customApiKey = "", tone = "honest" } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No se proporcionó ninguna imagen para analizar." });
    }

    // Extract pure base64 data if it contains data URL header
    let pureBase64 = image;
    let detectedMime = mimeType;
    if (image.startsWith("data:")) {
      const parts = image.split(",");
      const mimeMatch = image.match(/data:(.*?);base64/);
      if (mimeMatch && mimeMatch[1]) {
        detectedMime = mimeMatch[1];
      }
      pureBase64 = parts[1] || image;
    }

    const ai = getGenAI(customApiKey);

    let modeInstructions = "";
    let defaultTitle = "ANÁLISIS DE BELLEZA FACIAL";
    let defaultClassification = "FORMA DEL ROSTRO";

    switch (mode) {
      case "facial":
        defaultTitle = "ANÁLISIS DE BELLEZA FACIAL";
        defaultClassification = "FORMA DEL ROSTRO";
        modeInstructions = `MODO: ANÁLISIS FACIAL.
- Métricas en 'metrics': Simetría Facial, Proporción Tercios, Definición Mandibular, Armonía Ojos/Cejas, Proyección Pómulos, Balance Nasolabial, Calidad de Piel.
- classificationTitle: "FORMA DEL ROSTRO".
- classificationName: Identifica la forma geométrica facial (ej: "OVALADO", "CUADRADO", "DIAMANTE", "REDONDO", "CORAZÓN", "RECTANGULAR").
- classificationTraits: 4 características concisas de esa forma de rostro.
- honestAnalysis: Desglosa cada elemento facial con 1 frase breve y sincera (Simetría, Proporciones, Mandíbula, Piel, Ojos, Cejas, Nariz, Labios).
- practicalRecommendations: 3-4 recomendaciones prácticas de estilo (Corte/enmarcado, Cejas, Cuidado de piel, Estilo general).`;
        break;

      case "fisico":
        defaultTitle = "ANÁLISIS FÍSICO Y ESTRUCTURA";
        defaultClassification = "BIOTIPO CORPORAL";
        modeInstructions = `MODO: ANÁLISIS FÍSICO Y ESTRUCTURA CORPORAL.
- Métricas en 'metrics': Proporción Hombros-Cintura, Alineación Postural, Definición Muscular / Tono, Balance Simétrico, Porte & Proyección, Armonía Corporal Global.
- classificationTitle: "BIOTIPO & ESTRUCTURA".
- classificationName: Biotipo/Somatotipo identificado (ej: "MESOMORFO / ATLÉTICO", "ECTOMORFO ESBELTO", "ENDOMORFO NATURAL", "PROPORCIÓN RELOJ DE ARENA", "TRIÁNGULO INVERTIDO").
- classificationTraits: 4 rasgos clave de su estructura física.
- honestAnalysis: Desglose analítico conciso de Postura, Hombros, Cintura/Cadera, Silueta y Armonía Anatómica.
- practicalRecommendations: 3-4 recomendaciones en (Postura / Alineación, Rutina / Ejercicio, Elección de Ropa / Corte, Cuidado Corporal).`;
        break;

      case "mirada":
        defaultTitle = "ANÁLISIS DE LA MIRADA Y MAGNETISMO";
        defaultClassification = "TIPO DE MIRADA";
        modeInstructions = `MODO: ANÁLISIS DE LA MIRADA.
- Métricas en 'metrics': Intensidad Ocular, Magnetismo, Simetría de Ojos, Definición de Cejas, Apertura / Profundidad, Expresividad Emocional, Armonía Periocular.
- classificationTitle: "TIPO DE MIRADA".
- classificationName: Clasificación estética de la mirada (ej: "PROFUNDA Y MAGNÉTICA", "CÁLIDA Y EXPRESIVA", "ALMENDRADA ATRAYENTE", "SERENA Y ENFOCADA", "FELINA / INTENSA").
- classificationTraits: 4 rasgos de cómo proyecta su mirada.
- honestAnalysis: Desglose de Forma de Ojos, Inclinación de párpados, Enmarcado de Cejas, Expresión y Magnetismo.
- practicalRecommendations: 3-4 recomendaciones para potenciar la mirada (Técnica de Cejas, Iluminación Periocular, Cuidado Periocular, Contacto Visual).`;
        break;

      case "aura":
        defaultTitle = "ANÁLISIS DE AURA Y PRESENCIA";
        defaultClassification = "ESENCIA & ENERGÍA";
        modeInstructions = `MODO: ANÁLISIS DE AURA, ENERGÍA Y PRESENCIA.
- Métricas en 'metrics': Magnetismo Personal, Calidez & Cercanía, Confianza Proyectada, Misterio & Intriga, Serenidad, Carisma No Verbal, Impacto Visual.
- classificationTitle: "ESENCIA DE AURA".
- classificationName: Arquetipo de energía proyectada (ej: "AURA SOLAR Y RADIANTE", "AURA MAGNÉTICA Y MISTERIOSA", "AURA SERENA Y ELEGANTE", "AURA ENÉRGICA Y VIBRANTE").
- classificationTraits: 4 rasgos de la vibra que transmite la persona/foto.
- honestAnalysis: Desglose de Lenguaje Corporal, Expresión Facial, Vibra Energética, Sensación Transmitida y Presencia.
- practicalRecommendations: 3-4 recomendaciones para alinear el aura (Paleta de Colores favorecedora, Lenguaje Corporal, Presencia, Accesorios / Estilo).`;
        break;

      case "peinado":
      default:
        defaultTitle = "ANÁLISIS CAPILAR Y PEINADO";
        defaultClassification = "TIPO DE CORTE Y TEXTURA";
        modeInstructions = `MODO: ANÁLISIS DE PEINADO Y CABELLO.
- Métricas en 'metrics': Enmarcado Facial, Volumen y Textura, Brillo y Salud Capilar, Simetría del Corte, Definición de Líneas, Colorimetría / Tono, Versatilidad de Estilo.
- classificationTitle: "ESTILO DE CORTE".
- classificationName: Clasificación del corte/peinado (ej: "CAPAS LARGAS CON MOVIMIENTO", "FADE DESVANECIDO MODERNO", "BOB ESTRUCTURADO", "ONDAS NATURALES SUAVES", "TEXTURED CROP").
- classificationTraits: 4 rasgos de cómo el cabello favorece sus facciones.
- honestAnalysis: Desglose de Textura, Volumen en coronilla/laterales, Enmarcado de pómulos/mandíbula, Color y Mantenimiento.
- practicalRecommendations: 3-4 recomendaciones capilares (Cortes sugeridos, Productos de acabado / Styling, Cuidado e hidratación).`;
        break;
    }

    const toneInstruction = tone === "humor"
      ? `MODALIDAD DE TONO: HONESTO CON HUMOR. Di la verdad con total sinceridad, pero usando comentarios ingeniosos, chisposos y divertidos que hagan sonreír sin ofender (humor inteligente sobre la estética).`
      : `MODALIDAD DE TONO: HONESTO Y SINCERO (PREDETERMINADO). Di la verdad clara, directa y fundamentada en datos visuales, sin exageraciones ni solemnidades, recordando que la belleza es subjetiva.`;

    const systemInstruction = `Eres EVALUA AI, un analizador estético visual sincero y honesto.
Generas un reporte claro, conciso y directo.
IMPORTANTE SOBRE EL ESTILO Y ACTITUD:
- No exageres ni prometas certezas absolutas; la evaluación es una referencia basada en proporciones y rasgos evidentes. Recordatorio implícito: la estética es subjetiva.
- Mantén la lectura ágil: nada de muros de texto ni párrafos pesados.
- ${toneInstruction}
- Prioriza números claros (del 1.0 al 10.0), observaciones directas y viñetas rápidas.

${modeInstructions}

Instrucciones generales obligatorias:
1. title: Título en mayúsculas (ej: "${defaultTitle}").
2. subtitle: "REPORTE PERSONALIZADO".
3. mode: "${mode}".
4. overallScore: Calificación general decimal del 1.0 al 10.0 (ej: 7.4, 8.2, 8.8).
5. overallScoreLabel: Veredicto en 2 a 4 palabras (ej: "Armonía Destacada", "Buen Potencial Estético", "Estructura Equilibrada").
6. metrics: Array de 6 a 8 métricas clave del modo, cada una con "name" y "score" (del 1.0 al 10.0).
7. classificationTitle: Título de la tarjeta de clasificación (ej: "${defaultClassification}").
8. classificationName: Nombre específico del tipo identificado (ej: "OVALADO CLÁSICO", "MESOMORFO ATLÉTICO", "MIRADA MAGNÉTICA").
9. classificationTraits: Exactamente 4 viñetas cortas (máximo 8-10 palabras cada una) describiendo los rasgos clave.
10. honestAnalysis: Array de 5 a 6 objetos { feature: string, detail: string } con observaciones concisas de 1 sola frase potente y sincera cada una.
11. essaySummary: Síntesis de 1 solo párrafo conciso (3-4 oraciones) de diagnóstico integral sin relleno.
12. strengths: Exactamente 4 o 5 puntos fuertes redactados en viñetas cortas y sinceras.
13. areasForImprovement: Exactamente 3 o 4 áreas de oportunidad realistas en viñetas breves.
14. practicalRecommendations: Exactamente 3 o 4 recomendaciones prácticas y aplicables con "title", "iconType" y "description" (máximo 2 líneas breves por recomendación).
15. footerQuote: Frase lema memorable y concisa (ej: "LA ESTÉTICA ES SUBJETIVA: TU AUTENTICIDAD ES TU MAYOR FUERZA").
16. categorySuggestion: Sugerencia opcional { suggestedMode: "facial"|"fisico"|"mirada"|"aura"|"peinado", reason: "motivo breve" }.`;

    const userPrompt = question.trim()
      ? `Solicitud del usuario: "${question.trim()}". Modo seleccionado: "${mode}". Realiza el análisis completo en formato de reporte editorial.`
      : `Modo seleccionado: "${mode}". Realiza el reporte editorial completo y exhaustivo sobre la foto adjunta.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        mode: { type: Type.STRING },
        overallScore: { type: Type.NUMBER },
        overallScoreLabel: { type: Type.STRING },
        categoryDetected: { type: Type.STRING },
        metrics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              score: { type: Type.NUMBER },
              comment: { type: Type.STRING },
            },
            required: ["name", "score"],
          },
        },
        classificationTitle: { type: Type.STRING },
        classificationName: { type: Type.STRING },
        classificationTraits: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        honestAnalysis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              feature: { type: Type.STRING },
              detail: { type: Type.STRING },
            },
            required: ["feature", "detail"],
          },
        },
        essaySummary: { type: Type.STRING },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        areasForImprovement: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        practicalRecommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              iconType: {
                type: Type.STRING,
                enum: [
                  "makeup",
                  "hair",
                  "brows",
                  "skincare",
                  "style",
                  "posture",
                  "energy",
                  "eyes",
                  "general",
                ],
              },
              description: { type: Type.STRING },
            },
            required: ["title", "iconType", "description"],
          },
        },
        footerQuote: { type: Type.STRING },
        categorySuggestion: {
          type: Type.OBJECT,
          properties: {
            suggestedMode: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
        },
      },
      required: [
        "title",
        "subtitle",
        "mode",
        "overallScore",
        "overallScoreLabel",
        "categoryDetected",
        "metrics",
        "classificationTitle",
        "classificationName",
        "classificationTraits",
        "honestAnalysis",
        "essaySummary",
        "strengths",
        "areasForImprovement",
        "practicalRecommendations",
        "footerQuote",
      ],
    };

    const candidateModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.7-flash"];
    let lastError: unknown = null;
    let responseText: string | null | undefined = null;

    for (const model of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }

          const response = await ai.models.generateContent({
            model,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: detectedMime,
                    data: pureBase64,
                  },
                },
                {
                  text: userPrompt,
                },
              ],
            },
            config: {
              systemInstruction,
              temperature: 0.35,
              responseMimeType: "application/json",
              responseSchema,
            },
          });

          responseText = response.text;
          if (responseText) {
            break;
          }
        } catch (err: unknown) {
          console.warn(`Intento fallido con ${model}:`, err);
          lastError = err;
        }
      }

      if (responseText) {
        break;
      }
    }

    if (!responseText) {
      throw lastError || new Error("No se pudo obtener respuesta del modelo de IA.");
    }

    let cleanedJson = responseText.trim();
    if (cleanedJson.startsWith("```json")) {
      cleanedJson = cleanedJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedJson.startsWith("```")) {
      cleanedJson = cleanedJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const evaluation = JSON.parse(cleanedJson);
    return res.json({ success: true, report: evaluation, evaluation });
  } catch (error: unknown) {
    console.error("Error en /api/analyze:", error);
    const errStr = error instanceof Error ? error.message : String(error);
    
    // Check if error is related to quota, saturation, 429, resource exhausted or missing key
    if (
      errStr.includes("API_KEY_REQUIRED") ||
      errStr.includes("429") ||
      errStr.includes("RESOURCE_EXHAUSTED") ||
      errStr.includes("quota") ||
      errStr.includes("rate limit") ||
      errStr.includes("overloaded") ||
      errStr.includes("UNAVAILABLE")
    ) {
      return res.status(429).json({
        error: "El servicio público está temporalmente saturado por alta demanda. Puedes ingresar tu propia API Key de Gemini en el botón de Ajustes (⚙️) arriba a la derecha para continuar sin límites de inmediato.",
        isQuotaError: true,
      });
    }

    const message = error instanceof Error ? error.message : "Error interno procesando el reporte.";
    return res.status(500).json({ error: message });
  }
});

// Compare two images endpoint (Antes vs. Después / Evolución)
app.post("/api/compare", async (req, res) => {
  try {
    const {
      imageA,
      imageB,
      mimeTypeA = "image/jpeg",
      mimeTypeB = "image/jpeg",
      mode = "facial",
      customApiKey = "",
      tone = "honest",
    } = req.body;

    if (!imageA || !imageB) {
      return res.status(400).json({
        error: "Se requieren dos imágenes (Foto Antes y Foto Después) para realizar la comparativa.",
      });
    }

    // Process base64 for image A
    let pureBase64A = imageA;
    let detectedMimeA = mimeTypeA;
    if (imageA.startsWith("data:")) {
      const parts = imageA.split(",");
      const match = imageA.match(/data:(.*?);base64/);
      if (match && match[1]) detectedMimeA = match[1];
      pureBase64A = parts[1] || imageA;
    }

    // Process base64 for image B
    let pureBase64B = imageB;
    let detectedMimeB = mimeTypeB;
    if (imageB.startsWith("data:")) {
      const parts = imageB.split(",");
      const match = imageB.match(/data:(.*?);base64/);
      if (match && match[1]) detectedMimeB = match[1];
      pureBase64B = parts[1] || imageB;
    }

    const ai = getGenAI(customApiKey);

    const toneInstruction =
      tone === "humor"
        ? `MODALIDAD DE TONO: HONESTO CON TOQUES DE HUMOR. Di la verdad con total sinceridad, con comentarios ingeniosos y amenos, pero SIN inventar cambios inexistentes.`
        : `MODALIDAD DE TONO: HONESTO Y SINCERO (PREDETERMINADO). Di la verdad objetiva, clara y fundamentada en lo que se ve en ambas fotos.`;

    const systemInstruction = `Eres EVALUA AI en modo ANÁLISIS COMPARATIVO DE EVOLUCIÓN (Foto A: "Antes/Base" vs. Foto B: "Después/Evolución").
Categoría a evaluar: "${mode.toUpperCase()}".
${toneInstruction}

*** REGLA DE ORO DE VERACIDAD Y HONESTIDAD ABSOLUTA (CRÍTICO) ***
- Si ambas fotos son la misma imagen, o fueron tomadas en el mismo instante, o no presentan cambios físicos/estéticos reales (solo ligerísima variación de ángulo o compresión):
  * DEBES DECLARAR obligatoriamente "hasNotableDifferences": false.
  * evolutionStatus: "estable_sin_cambios".
  * overallScoreA y overallScoreB deben ser iguales o diferir en máximo 0.1 (scoreDelta cercano a 0.0).
  * verdictSummary: Di claramente y sin rodeos: "No se aprecian cambios o diferencias significativas entre ambas fotografías. La estructura, rasgos, peinado y proporciones son idénticos o prácticamente iguales sin evolución medible."
  * ESTÁ ESTRICTAMENTE PROHIBIDO inventar mejoras ficticias o cambios que no existen. Sé sincero y transparente.

- Si por el contrario SÍ existen diferencias reales y visibles (ejemplo: corte de cabello diferente, cambio de barba, ganancia o pérdida de peso/masa muscular, mejor postura, expresión más confiada, diferente cuidado de piel o maquillaje):
  * Declara "hasNotableDifferences": true.
  * evolutionStatus: "mejora" (si B es mejor), "involucion" (si B desfavorece) o "cambio_estilo_neutral" (si es un cambio de look equivalente).
  * Calcula overallScoreA y overallScoreB justificadamente. scoreDelta = overallScoreB - overallScoreA.
  * En 'verdictSummary' explica con precisión y dinamismo qué cambió y cómo afectó la armonía visual.

Estructura requerida:
1. title: "ANÁLISIS COMPARATIVO • ${mode.toUpperCase()}".
2. subtitle: "EVOLUCIÓN & CAMBIO ESTÉTICO".
3. mode: "${mode}".
4. hasNotableDifferences: boolean (true si hay cambios reales, false si no hay diferencias).
5. overallScoreA: Puntuación decimal (1.0 a 10.0) para la Foto A.
6. overallScoreB: Puntuación decimal (1.0 a 10.0) para la Foto B.
7. scoreDelta: Diferencia numérica exacta (overallScoreB - overallScoreA), ej: +0.8, -0.3, o 0.0.
8. evolutionStatus: "mejora" | "estable_sin_cambios" | "involucion" | "cambio_estilo_neutral".
9. verdictSummary: Párrafo conciso (2-3 oraciones) con el veredicto sincero.
10. metricsComparison: Array de 5 a 6 métricas relevantes del modo "${mode}", cada una con { metricName, scoreA, scoreB, diff, comment }. (Si no hay cambios, diff = 0 y comment = "Sin variación observable").
11. observedChanges: Array de 4 a 5 objetos { area, beforeState, afterState, verdict } comparando áreas concretas (ej: "Corte / Peinado", "Postura & Porte", "Línea Mandibular", "Mirada / Expresión", "Calidad de Piel").
12. keyImprovements: Array de 3-4 viñetas con avances reales (o si no hay diferencias, indicar explícitamente "Sin cambios apreciables detectados").
13. unchangedOrRegressed: Array de 2-3 viñetas con aspectos que permanecen iguales o que podrían optimizarse.
14. practicalRecommendations: 3 recomendaciones prácticas futuras para seguir evolucionando.
15. footerQuote: Frase lema memorable y directa.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        mode: { type: Type.STRING },
        hasNotableDifferences: { type: Type.BOOLEAN },
        overallScoreA: { type: Type.NUMBER },
        overallScoreB: { type: Type.NUMBER },
        scoreDelta: { type: Type.NUMBER },
        evolutionStatus: {
          type: Type.STRING,
          enum: [
            "mejora",
            "estable_sin_cambios",
            "involucion",
            "cambio_estilo_neutral",
          ],
        },
        verdictSummary: { type: Type.STRING },
        metricsComparison: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              metricName: { type: Type.STRING },
              scoreA: { type: Type.NUMBER },
              scoreB: { type: Type.NUMBER },
              diff: { type: Type.NUMBER },
              comment: { type: Type.STRING },
            },
            required: ["metricName", "scoreA", "scoreB", "diff", "comment"],
          },
        },
        observedChanges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              area: { type: Type.STRING },
              beforeState: { type: Type.STRING },
              afterState: { type: Type.STRING },
              verdict: { type: Type.STRING },
            },
            required: ["area", "beforeState", "afterState", "verdict"],
          },
        },
        keyImprovements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        unchangedOrRegressed: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        practicalRecommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              iconType: {
                type: Type.STRING,
                enum: [
                  "makeup",
                  "hair",
                  "brows",
                  "skincare",
                  "style",
                  "posture",
                  "energy",
                  "eyes",
                  "general",
                ],
              },
              description: { type: Type.STRING },
            },
            required: ["title", "iconType", "description"],
          },
        },
        footerQuote: { type: Type.STRING },
      },
      required: [
        "title",
        "subtitle",
        "mode",
        "hasNotableDifferences",
        "overallScoreA",
        "overallScoreB",
        "scoreDelta",
        "evolutionStatus",
        "verdictSummary",
        "metricsComparison",
        "observedChanges",
        "keyImprovements",
        "unchangedOrRegressed",
        "practicalRecommendations",
        "footerQuote",
      ],
    };

    const userPrompt = `Foto A (Primera imagen adjunta: ESTADO ANTES / BASE).
Foto B (Segunda imagen adjunta: ESTADO DESPUÉS / EVOLUCIÓN).
Modo: "${mode}".
Compara ambas imágenes con rigor y total sinceridad visual. Si no ves diferencias reales, decláralo abiertamente. Si ves diferencias, desglósalas métrica por métrica.`;

    const candidateModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.7-flash"];
    let lastError: unknown = null;
    let responseText: string | null | undefined = null;

    for (const model of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }

          const response = await ai.models.generateContent({
            model,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: detectedMimeA,
                    data: pureBase64A,
                  },
                },
                {
                  inlineData: {
                    mimeType: detectedMimeB,
                    data: pureBase64B,
                  },
                },
                {
                  text: userPrompt,
                },
              ],
            },
            config: {
              systemInstruction,
              temperature: 0.2, // Lower temperature for high consistency and factual honesty
              responseMimeType: "application/json",
              responseSchema,
            },
          });

          responseText = response.text;
          if (responseText) {
            break;
          }
        } catch (err: unknown) {
          console.warn(`Intento fallido de comparativa con ${model}:`, err);
          lastError = err;
        }
      }

      if (responseText) {
        break;
      }
    }

    if (!responseText) {
      throw lastError || new Error("No se pudo obtener respuesta del modelo de IA para la comparativa.");
    }

    let cleanedJson = responseText.trim();
    if (cleanedJson.startsWith("```json")) {
      cleanedJson = cleanedJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedJson.startsWith("```")) {
      cleanedJson = cleanedJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const evaluation = JSON.parse(cleanedJson);
    return res.json({ success: true, report: evaluation, evaluation });
  } catch (error: unknown) {
    console.error("Error en /api/compare:", error);
    const errStr = error instanceof Error ? error.message : String(error);

    if (
      errStr.includes("API_KEY_REQUIRED") ||
      errStr.includes("429") ||
      errStr.includes("RESOURCE_EXHAUSTED") ||
      errStr.includes("quota") ||
      errStr.includes("rate limit") ||
      errStr.includes("overloaded") ||
      errStr.includes("UNAVAILABLE")
    ) {
      return res.status(429).json({
        error:
          "El servicio público está temporalmente saturado por alta demanda. Puedes ingresar tu propia API Key de Gemini en el botón de Ajustes (⚙️) para continuar de inmediato.",
        isQuotaError: true,
      });
    }

    const message = error instanceof Error ? error.message : "Error interno procesando la comparativa.";
    return res.status(500).json({ error: message });
  }
});

// Interactive Conversational Chat Endpoint (Free chat, follow-ups, essay requests, advice)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], image = null, mimeType = "image/jpeg", customApiKey = "", tone = "honest" } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No se proporcionaron mensajes para la conversación." });
    }

    const ai = getGenAI(customApiKey);

    const toneInstruction = tone === "humor"
      ? `MODALIDAD DE TONO EN EL CHAT: HONESTO CON TOQUES DE HUMOR. Responde con la verdad sincera, pero con respuestas amenas, divertidas, sin rodeos y con toques de humor inteligente.`
      : `MODALIDAD DE TONO EN EL CHAT: HONESTO Y SINCERO (PREDETERMINADO). Responde con objetividad, sinceridad y frescura, sin exageraciones ni solemnidades, recordando que la estética es subjetiva.`;

    const systemInstruction = `Eres EVALUA AI, el asistente en análisis visual, estético, proporciones y estilo.
${toneInstruction}
Tu misión en este chat:
- Sé conciso, claro y directo.
- Si el usuario pide un ensayo, desglósalo en 2-3 párrafos dinámicos y bien enfocados.
- Si pide consejos específicos (corte, peinado, ropa, postura), da tips rápidos y aplicables sin exagerar.
- Recuerda que la belleza y la percepción estética siempre son subjetivas.`;

    const contents = [];

    // Build chat contents for Gemini
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const isLast = i === messages.length - 1;
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      // If there is an image attached and this is the latest user message or the initial message
      if (image && msg.role === "user" && isLast) {
        let pureBase64 = image;
        let detectedMime = mimeType;
        if (image.startsWith("data:")) {
          const splitParts = image.split(",");
          const mimeMatch = image.match(/data:(.*?);base64/);
          if (mimeMatch && mimeMatch[1]) {
            detectedMime = mimeMatch[1];
          }
          pureBase64 = splitParts[1] || image;
        }
        parts.push({
          inlineData: {
            mimeType: detectedMime,
            data: pureBase64,
          },
        });
      }

      parts.push({ text: msg.content });

      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts,
      });
    }

    const candidateModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.7-flash"];
    let lastError: unknown = null;
    let replyText: string | null = null;

    for (const model of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }

          const response = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.6,
            },
          });

          replyText = response.text;
          if (replyText) {
            break;
          }
        } catch (err: unknown) {
          console.warn(`Chat fallo con ${model}:`, err);
          lastError = err;
        }
      }

      if (replyText) {
        break;
      }
    }

    if (!replyText) {
      throw lastError || new Error("No se pudo generar respuesta en el chat.");
    }

    return res.json({ success: true, reply: replyText });
  } catch (error: unknown) {
    console.error("Error en /api/chat:", error);
    const errStr = error instanceof Error ? error.message : String(error);

    if (
      errStr.includes("API_KEY_REQUIRED") ||
      errStr.includes("429") ||
      errStr.includes("RESOURCE_EXHAUSTED") ||
      errStr.includes("quota") ||
      errStr.includes("rate limit") ||
      errStr.includes("overloaded") ||
      errStr.includes("UNAVAILABLE")
    ) {
      return res.status(429).json({
        error: "El servicio público está temporalmente saturado por alta demanda. Puedes ingresar tu propia API Key de Gemini en el botón de Ajustes (⚙️) para continuar sin límites.",
        isQuotaError: true,
      });
    }

    const message = error instanceof Error ? error.message : "Error procesando el mensaje de chat.";
    return res.status(500).json({ error: message });
  }
});

// Vite middleware / Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EVALUA AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
