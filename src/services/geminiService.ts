import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisMode, DetailedReportResult, ComparisonReportResult } from '../types';

interface AnalyzeParams {
  image: string;
  mimeType?: string;
  mode: AnalysisMode;
  question?: string;
  customApiKey?: string;
  tone?: 'honest' | 'humor';
}

interface CompareParams {
  imageA: string;
  imageB: string;
  mimeTypeA?: string;
  mimeTypeB?: string;
  mode: AnalysisMode;
  customApiKey?: string;
  tone?: 'honest' | 'humor';
}

interface ChatParams {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  image?: string | null;
  customApiKey?: string;
  tone?: 'honest' | 'humor';
}

// Client-side fallback helper
function getClientGenAI(customApiKey?: string): GoogleGenAI {
  // Vite replaces static import.meta.env.VITE_* during build time
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';
  const apiKey = customApiKey?.trim() || envKey;
  if (!apiKey) {
    throw new Error(
      'API_KEY_REQUIRED: Para generar reportes con IA, necesitas vincular una clave de API de Gemini. ¡Es 100% gratuita y la obtienes en 30 segundos desde Ajustes!'
    );
  }
  return new GoogleGenAI({
    apiKey,
  });
}

function extractBase64(dataUrl: string): { data: string; mime: string } {
  if (dataUrl.startsWith('data:')) {
    const parts = dataUrl.split(',');
    const match = dataUrl.match(/data:(.*?);base64/);
    return {
      data: parts[1] || dataUrl,
      mime: match && match[1] ? match[1] : 'image/jpeg',
    };
  }
  return { data: dataUrl, mime: 'image/jpeg' };
}

/**
 * 1. Single Image Analysis (Server with fallback to Client)
 */
export async function analyzeImage(params: AnalyzeParams): Promise<DetailedReportResult> {
  // Step 1: Try server endpoint first
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (response.ok && data.success && (data.report || data.evaluation)) {
        return data.report || data.evaluation;
      }
      if (data.error) {
        throw new Error(data.error);
      }
    }
  } catch (err: unknown) {
    const errStr = err instanceof Error ? err.message : String(err);
    // If it was a real API error from backend (like quota), don't mask it unless backend doesn't exist
    if (!errStr.includes('Failed to execute') && !errStr.includes('Unexpected') && !errStr.includes('404') && !errStr.includes('Failed to fetch')) {
      throw err;
    }
    // Otherwise fallback to client-side GenAI
    console.info('Servidor API no disponible o estático (Cloudflare Pages). Usando fallback cliente de Gemini.');
  }

  // Step 2: Client-side GenAI invocation
  const ai = getClientGenAI(params.customApiKey);
  const { data: pureBase64, mime: detectedMime } = extractBase64(params.image);

  let modeInstructions = '';
  let defaultTitle = 'ANÁLISIS DE BELLEZA FACIAL';
  let defaultClassification = 'FORMA DEL ROSTRO';

  switch (params.mode) {
    case 'facial':
      defaultTitle = 'ANÁLISIS DE BELLEZA FACIAL';
      defaultClassification = 'FORMA DEL ROSTRO';
      modeInstructions = `MODO: ANÁLISIS FACIAL.
- Métricas en 'metrics': Simetría Facial, Proporción Tercios, Definición Mandibular, Armonía Ojos/Cejas, Proyección Pómulos, Balance Nasolabial, Calidad de Piel.
- classificationTitle: "FORMA DEL ROSTRO".
- classificationName: Identifica la forma geométrica facial (ej: "OVALADO", "CUADRADO", "DIAMANTE", "REDONDO", "CORAZÓN", "RECTANGULAR").
- classificationTraits: 4 características concisas de esa forma de rostro.
- honestAnalysis: Desglosa cada elemento facial con 1 frase breve y sincera.
- practicalRecommendations: 3-4 recomendaciones prácticas de estilo.`;
      break;

    case 'fisico':
      defaultTitle = 'ANÁLISIS FÍSICO Y ESTRUCTURA';
      defaultClassification = 'BIOTIPO CORPORAL';
      modeInstructions = `MODO: ANÁLISIS FÍSICO Y ESTRUCTURA CORPORAL.
- Métricas en 'metrics': Proporción Hombros-Cintura, Alineación Postural, Definición Muscular / Tono, Balance Simétrico, Porte & Proyección, Armonía Corporal Global.
- classificationTitle: "BIOTIPO & ESTRUCTURA".
- classificationName: Biotipo/Somatotipo identificado (ej: "MESOMORFO / ATLÉTICO", "ECTOMORFO ESBELTO", "ENDOMORFO NATURAL").
- classificationTraits: 4 rasgos clave de su estructura física.
- honestAnalysis: Desglose analítico conciso de postura y proporciones.
- practicalRecommendations: 3-4 recomendaciones de porte y estilo.`;
      break;

    case 'mirada':
      defaultTitle = 'ANÁLISIS DE LA MIRADA Y MAGNETISMO';
      defaultClassification = 'TIPO DE MIRADA';
      modeInstructions = `MODO: ANÁLISIS DE LA MIRADA.
- Métricas en 'metrics': Intensidad Ocular, Magnetismo, Simetría de Ojos, Definición de Cejas, Apertura / Profundidad, Expresividad Emocional, Armonía Periocular.
- classificationTitle: "TIPO DE MIRADA".
- classificationName: Clasificación estética de la mirada (ej: "PROFUNDA Y MAGNÉTICA", "CÁLIDA Y EXPRESIVA").
- classificationTraits: 4 rasgos de cómo proyecta su mirada.
- honestAnalysis: Desglose de ojos, párpados y cejas.
- practicalRecommendations: 3-4 recomendaciones para potenciar la mirada.`;
      break;

    case 'aura':
      defaultTitle = 'ANÁLISIS DE AURA Y PRESENCIA';
      defaultClassification = 'ESENCIA & ENERGÍA';
      modeInstructions = `MODO: ANÁLISIS DE AURA, ENERGÍA Y PRESENCIA.
- Métricas en 'metrics': Magnetismo Personal, Calidez & Cercanía, Confianza Proyectada, Misterio & Intriga, Serenidad, Carisma No Verbal, Impacto Visual.
- classificationTitle: "ESENCIA DE AURA".
- classificationName: Arquetipo de energía proyectada (ej: "AURA SOLAR Y RADIANTE", "AURA MAGNÉTICA Y MISTERIOSA").
- classificationTraits: 4 rasgos de la vibra que transmite.
- honestAnalysis: Desglose de lenguaje corporal y presencia.
- practicalRecommendations: 3-4 recomendaciones para alinear el aura.`;
      break;

    case 'peinado':
    default:
      defaultTitle = 'ANÁLISIS CAPILAR Y PEINADO';
      defaultClassification = 'TIPO DE CORTE Y TEXTURA';
      modeInstructions = `MODO: ANÁLISIS DE PEINADO Y CABELLO.
- Métricas en 'metrics': Enmarcado Facial, Volumen y Textura, Brillo y Salud Capilar, Simetría del Corte, Definición de Líneas, Colorimetría / Tono, Versatilidad de Estilo.
- classificationTitle: "ESTILO DE CORTE".
- classificationName: Clasificación del corte/peinado (ej: "CAPAS LARGAS CON MOVIMIENTO", "FADE MODERNO", "BOB ESTRUCTURADO").
- classificationTraits: 4 rasgos de cómo el cabello favorece sus facciones.
- honestAnalysis: Desglose de textura, volumen y enmarcado.
- practicalRecommendations: 3-4 recomendaciones capilares.`;
      break;
  }

  const toneInstruction =
    params.tone === 'humor'
      ? `MODALIDAD DE TONO: HONESTO CON HUMOR (ROAST CÓMICO, SÁTIRA E INGENIO DIVERTIDO).
- Di la verdad sin censura ni filtros, pero VIÉNDOLE EL CHISTE A TODO y usando remates cómicos, comparaciones divertidas, sarcasmo fino y estilo "roast" que hagan reír con gracia y honestidad.
- Búscale la gracia a las muecas, expresiones raras, ojos entrecerrados, ángulos extraños, poses forzadas, despeinados, miradas perdidas o expresiones faciales peculiares que la persona esté haciendo en la foto:
  * Ejemplos de estilo: "Esa ceja tiene más iniciativa que yo los lunes", "Mirada de sospechoso en documental de Netflix", "Sonrisa de foto obligada en fiesta familiar", "El cabello está librando una batalla campal contra la gravedad", "Expresión de cuando te acuerdas de que dejaste la estufa encendida", "Pose de foto de carnet de 1995 con filtro retro".
- No inventes cosas falsas: básate en lo que REALMENTE se ve en la foto pero con punchlines cómicos, ironía y remates ingeniosos.
- overallScoreLabel debe ser cómica y ocurrente (ej: "Potencial de modelo, pose de meme", "Galán en baja resolución", "Guapo pero confundido", "8/10 con el peinado correcto").
- footerQuote debe ser un remate o chiste memorable (ej: "No eres feo, solo estás a un buen corte de pelo y 3 litros de agua de triunfar").
- En honestAnalysis, strengths y areasForImprovement incluye comentarios ingeniosos con humor y verdad sin pelos en la lengua.`
      : `MODALIDAD DE TONO: HONESTO Y SINCERO (CERO CONDICENDENCIA, CERO ENDULZAR, CRUDEZA ANATÓMICA).
- Di la verdad clara, directa y fundamentada en lo que se ve en la imagen, SIN intentar hacer sentir bien al usuario con elogios vacíos o halagos cliché como "piel digna de envidia", "belleza deslumbrante" o "facciones perfectas".
- Si la persona está haciendo caras raras, muecas, arrugando la frente, forzando la sonrisa, con postura jorobada, ojos desalineados o entrecerrados, frente dominante, mandíbula poco definida o peinado desfavorecedor, DILO DIRECTAMENTE y explica con precisión cómo esa expresión o rasgo afecta negativamente la armonía visual.
- Puntuaciones (overallScore y metrics) estrictas y realistas: una persona promedio tiene 5.5 a 6.8. Solo proporciones verdaderamente simétricas y destacadas reciben 8.0+.
- strengths: solo rasgos anatómicamente sobresalientes de forma genuina.
- areasForImprovement: defectos o aspectos desfavorables reales sin rodeos (muecas, peinado, asimetría, postura, corte).`;

  const systemInstruction = `Eres EVALUA AI, un analizador estético visual sincero y honesto.
Generas un reporte claro, conciso y directo en formato JSON.
${toneInstruction}
${modeInstructions}

Instrucciones generales obligatorias:
1. title: "${defaultTitle}"
2. subtitle: "REPORTE PERSONALIZADO"
3. mode: "${params.mode}"
4. overallScore: número decimal 1.0 a 10.0
5. overallScoreLabel: veredicto en 2 a 4 palabras
6. metrics: 6 a 8 métricas con name y score (1.0 a 10.0)
7. classificationTitle: "${defaultClassification}"
8. classificationName: nombre del tipo identificado
9. classificationTraits: exactamente 4 viñetas cortas
10. honestAnalysis: 5 a 6 objetos { feature, detail }
11. essaySummary: síntesis de 1 párrafo conciso
12. strengths: 4 a 5 puntos fuertes breves
13. areasForImprovement: 3 a 4 áreas de oportunidad realistas
14. practicalRecommendations: 3 a 4 objetos { title, iconType, description }
15. footerQuote: frase memorable y concisa
16. categorySuggestion: { suggestedMode, reason }`;

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
          required: ['name', 'score'],
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
          required: ['feature', 'detail'],
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
              enum: ['makeup', 'hair', 'brows', 'skincare', 'style', 'posture', 'energy', 'eyes', 'general'],
            },
            description: { type: Type.STRING },
          },
          required: ['title', 'iconType', 'description'],
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
      'title',
      'subtitle',
      'mode',
      'overallScore',
      'overallScoreLabel',
      'categoryDetected',
      'metrics',
      'classificationTitle',
      'classificationName',
      'classificationTraits',
      'honestAnalysis',
      'essaySummary',
      'strengths',
      'areasForImprovement',
      'practicalRecommendations',
      'footerQuote',
    ],
  };

  const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.7-flash'];
  let lastError: unknown = null;

  for (const model of candidateModels) {
    try {
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
              text: `Modo seleccionado: "${params.mode}". Realiza el reporte editorial completo en JSON.`,
            },
          ],
        },
        config: {
          systemInstruction,
          temperature: 0.35,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      if (response.text) {
        let cleaned = response.text.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        return JSON.parse(cleaned) as DetailedReportResult;
      }
    } catch (err: unknown) {
      lastError = err;
    }
  }

  throw lastError || new Error('No se pudo procesar la imagen con los modelos de IA disponibles.');
}

/**
 * 2. Before vs. After Comparison (Server with fallback to Client)
 */
export async function compareImages(params: CompareParams): Promise<ComparisonReportResult> {
  // Step 1: Try server endpoint first
  try {
    const response = await fetch('/api/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (response.ok && data.success && (data.report || data.evaluation)) {
        return data.report || data.evaluation;
      }
      if (data.error) {
        throw new Error(data.error);
      }
    }
  } catch (err: unknown) {
    const errStr = err instanceof Error ? err.message : String(err);
    if (!errStr.includes('Failed to execute') && !errStr.includes('Unexpected') && !errStr.includes('404') && !errStr.includes('Failed to fetch')) {
      throw err;
    }
    console.info('Servidor API no disponible o estático. Usando fallback cliente de Gemini para comparativa.');
  }

  // Step 2: Client-side GenAI invocation
  const ai = getClientGenAI(params.customApiKey);
  const { data: base64A, mime: mimeA } = extractBase64(params.imageA);
  const { data: base64B, mime: mimeB } = extractBase64(params.imageB);

  const toneInstruction =
    params.tone === 'humor'
      ? `MODALIDAD DE TONO: HONESTO CON HUMOR (ROAST CÓMICO & SÁTIRA REALISTA). Di la verdad con total franqueza, pero haciendo comentarios divertidos, ocurrentes y estilo roast que destaquen con gracia las diferencias o la falta de ellas.`
      : `MODALIDAD DE TONO: HONESTO Y SINCERO (CERO CONDICENDENCIA). Di la verdad anatómica y visual cruda, clara y fundamentada en lo que se ve en ambas fotos, sin suavizar ni inventar.`;

  const systemInstruction = `Eres EVALUA AI en modo ANÁLISIS COMPARATIVO DE EVOLUCIÓN (Foto A: "Antes/Base" vs. Foto B: "Después/Evolución").
Categoría a evaluar: "${params.mode.toUpperCase()}".
${toneInstruction}

*** REGLA DE ORO DE VERACIDAD Y HONESTIDAD ABSOLUTA ***
- Si ambas fotos son la misma imagen o no presentan cambios reales:
  * hasNotableDifferences: false
  * evolutionStatus: "estable_sin_cambios"
  * overallScoreA y overallScoreB deben ser iguales o diferir en máximo 0.1 (scoreDelta cercano a 0.0).
  * verdictSummary: "No se aprecian cambios o diferencias significativas entre ambas fotografías. La estructura, rasgos, peinado y proporciones son idénticos o prácticamente iguales sin evolución medible."
  * No inventes mejoras si no existen.
- Si SÍ existen diferencias visibles:
  * hasNotableDifferences: true
  * evolutionStatus: "mejora" | "involucion" | "cambio_estilo_neutral"
  * Calcula overallScoreA y overallScoreB justificadamente. scoreDelta = overallScoreB - overallScoreA.`;

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
        enum: ['mejora', 'estable_sin_cambios', 'involucion', 'cambio_estilo_neutral'],
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
          required: ['metricName', 'scoreA', 'scoreB', 'diff', 'comment'],
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
          required: ['area', 'beforeState', 'afterState', 'verdict'],
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
              enum: ['makeup', 'hair', 'brows', 'skincare', 'style', 'posture', 'energy', 'eyes', 'general'],
            },
            description: { type: Type.STRING },
          },
          required: ['title', 'iconType', 'description'],
        },
      },
      footerQuote: { type: Type.STRING },
    },
    required: [
      'title',
      'subtitle',
      'mode',
      'hasNotableDifferences',
      'overallScoreA',
      'overallScoreB',
      'scoreDelta',
      'evolutionStatus',
      'verdictSummary',
      'metricsComparison',
      'observedChanges',
      'keyImprovements',
      'unchangedOrRegressed',
      'practicalRecommendations',
      'footerQuote',
    ],
  };

  const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.7-flash'];
  let lastError: unknown = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeA,
                data: base64A,
              },
            },
            {
              inlineData: {
                mimeType: mimeB,
                data: base64B,
              },
            },
            {
              text: `Compara Foto A (Antes) y Foto B (Después) en modo "${params.mode}". Evalúa con honestidad y genera el JSON.`,
            },
          ],
        },
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      if (response.text) {
        let cleaned = response.text.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        return JSON.parse(cleaned) as ComparisonReportResult;
      }
    } catch (err: unknown) {
      lastError = err;
    }
  }

  throw lastError || new Error('No se pudo procesar la comparativa.');
}

/**
 * 3. Interactive Advisor Chat (Server with fallback to Client)
 */
export async function chatWithAdvisor(params: ChatParams): Promise<string> {
  // Step 1: Try server endpoint first
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (response.ok && data.success && data.reply) {
        return data.reply;
      }
      if (data.error) {
        throw new Error(data.error);
      }
    }
  } catch (err: unknown) {
    const errStr = err instanceof Error ? err.message : String(err);
    if (!errStr.includes('Failed to execute') && !errStr.includes('Unexpected') && !errStr.includes('404') && !errStr.includes('Failed to fetch')) {
      throw err;
    }
    console.info('Servidor API no disponible. Usando fallback cliente de Gemini para el chat.');
  }

  // Step 2: Client-side GenAI invocation
  const ai = getClientGenAI(params.customApiKey);

  const parts: any[] = [];
  if (params.image) {
    const { data, mime } = extractBase64(params.image);
    parts.push({
      inlineData: {
        mimeType: mime,
        data,
      },
    });
  }

  const conversationText = params.messages
    .map((m) => `${m.role === 'user' ? 'Usuario' : 'Asesor'}: ${m.content}`)
    .join('\n\n');

  parts.push({
    text: `Historial de conversación:\n${conversationText}\n\nResponde al último mensaje del usuario como asesor estético profesional, claro y conciso.`,
  });

  const toneInstruction =
    params.tone === 'humor'
      ? 'MODALIDAD DE TONO EN EL CHAT: HONESTO CON HUMOR (SÁTIRA, ROAST CÓMICO Y PUNCHLINES OCURRENTES). Responde diciendo la verdad sin censura, pero viéndole el chiste a todo con humor ácido, ingenioso y gracioso sobre lo que ves en las fotos o lo que te preguntan.'
      : 'MODALIDAD DE TONO EN EL CHAT: HONESTO Y SINCERO (CERO CONDICENDENCIA). Responde con objetividad, sinceridad directa y cruda sin halagos vacíos, analizando la realidad visual y estética.';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts,
    },
    config: {
      systemInstruction: `Eres el asesor de EVALUA AI. ${toneInstruction} Eres experto en estética, corte de cabello, proporciones y estilo sin pelos en la lengua.`,
      temperature: 0.5,
    },
  });

  return response.text || 'No se pudo generar una respuesta en este momento.';
}
