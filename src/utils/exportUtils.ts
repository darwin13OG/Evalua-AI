import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DetailedReportResult, ComparisonReportResult } from '../types';

/**
 * Sanitizes strings for jsPDF standard fonts (Helvetica / ASCII / Latin1)
 * Strips Unicode quotes, stars, bullets, and emojis that cause garbled output like "'&".
 */
function cleanPdfText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’`´]/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/[•✦★◆■●▶►✓✔✗✘]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function downloadStoryImage(elementId: string, filename = 'evalua-ai-reporte.png'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemento de reporte no encontrado');
  }

  const canvas = await html2canvas(element, {
    scale: 2.2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#000000',
    logging: false,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function generateEvaluationPDF(result: DetailedReportResult, imageSrc: string | null): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Pure Crisp White Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  // Outer Precision Border
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.4);
  doc.roundedRect(8, 8, 194, 281, 3, 3, 'D');

  // 2. Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(8, 8, 194, 9, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('EVALUA AI  |  FICHA DE ANALISIS ESTETICO Y VISUAL', 12, 14);

  const todayStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`FECHA: ${cleanPdfText(todayStr)}`, 196, 14, { align: 'right' });

  // 3. Document Main Title & Subtitle
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const cleanTitle = cleanPdfText(result.title || 'ANALISIS ESTETICO PERSONALIZADO').toUpperCase();
  doc.text(cleanTitle, 105, 24, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const cleanSubtitle = cleanPdfText(result.subtitle || 'REPORTE EDITORIAL PERSONALIZADO').toUpperCase();
  doc.text(cleanSubtitle, 105, 29, { align: 'center' });

  // 4. TOP ROW (Y: 33 to 98, Height = 65mm): Photo Box (Left) + Metrics & Overall Score (Right)
  // Left: Photo Box (Width 58mm, Height 65mm)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, 33, 58, 65, 2.5, 2.5, 'FD');

  let imageRendered = false;
  if (imageSrc && imageSrc.startsWith('data:image')) {
    try {
      doc.addImage(imageSrc, 'JPEG', 14, 35, 54, 55, undefined, 'FAST');
      imageRendered = true;
    } catch {
      imageRendered = false;
    }
  }

  if (!imageRendered) {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 35, 54, 55, 'F');
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('FOTOGRAFIA', 41, 60, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('EVALUADA', 41, 65, { align: 'center' });
  }

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(`MODO: ${cleanPdfText(result.mode || 'ESTETICO').toUpperCase()}`, 41, 95, { align: 'center' });

  // Right: Metrics Summary & Global Score (Width 124mm, Height 65mm)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(74, 33, 124, 65, 2.5, 2.5, 'FD');

  // Overall Score Header inside Right Box
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(74, 33, 124, 13, 2.5, 2.5, 'F');
  doc.rect(74, 40, 124, 6, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PUNTUACION GLOBAL & VEREDICTO', 78, 41);

  const scoreText = `${result.overallScore.toFixed(1)} / 10`;
  const labelText = cleanPdfText(result.overallScoreLabel || 'Evaluado').toUpperCase();
  doc.setFontSize(8.5);
  doc.text(`${scoreText}  |  ${labelText}`, 194, 41, { align: 'right' });

  // Metrics list with clean gauge bars
  const metricsToPrint = (result.metrics || []).slice(0, 7);
  let metricY = 52;
  metricsToPrint.forEach((m) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    const safeName = cleanPdfText(m.name);
    const shortName = safeName.length > 26 ? `${safeName.substring(0, 24)}..` : safeName;
    doc.text(shortName.toUpperCase(), 78, metricY);

    // Gauge track
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(138, metricY - 2.5, 36, 2.8, 1.4, 1.4, 'F');

    // Gauge fill
    const validScore = Math.max(0, Math.min(10, m.score || 0));
    const fillWidth = (validScore / 10) * 36;
    doc.setFillColor(15, 23, 42);
    if (fillWidth > 0) {
      doc.roundedRect(138, metricY - 2.5, fillWidth, 2.8, 1.4, 1.4, 'F');
    }

    // Number score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${validScore.toFixed(1)}/10`, 194, metricY, { align: 'right' });

    metricY += 6.0;
  });

  // 5. MIDDLE ROW (Y: 102 to 154, Height = 52mm): Classification (Left) & Diagnostic Summary (Right)
  // Left: Classification Card (Width 88mm, Height 52mm)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, 102, 88, 52, 2.5, 2.5, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(12, 102, 88, 7.5, 2.5, 2.5, 'F');
  doc.rect(12, 106, 88, 3.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  const classTitle = cleanPdfText(result.classificationTitle || 'CLASIFICACION ESTRUCTURAL').toUpperCase();
  doc.text(classTitle, 56, 107, { align: 'center' });

  // Big Classification Name
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const className = cleanPdfText(result.classificationName || 'ARMONIA NATURAL').toUpperCase();
  doc.text(className, 56, 116, { align: 'center' });

  // Traits list
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  let traitY = 122;
  const traits = (result.classificationTraits || []).slice(0, 4);
  traits.forEach((trait) => {
    const cleanTrait = cleanPdfText(trait.replace(/^[•\-\*\s]+/, ''));
    const traitLines = doc.splitTextToSize(`-  ${cleanTrait}`, 80);
    doc.text(traitLines[0] || '', 16, traitY);
    traitY += 4.5;
  });

  // Right: Key Diagnostic Observations (Width 94mm, Height 52mm)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(104, 102, 94, 52, 2.5, 2.5, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(104, 102, 94, 7.5, 2.5, 2.5, 'F');
  doc.rect(104, 106, 94, 3.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('DIAGNOSTICO & ANALISIS CLAVE', 151, 107, { align: 'center' });

  let diagY = 115;
  const observations = (result.honestAnalysis || []).slice(0, 5);
  observations.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    const safeFeature = cleanPdfText(item.feature);
    const featHeader = `${safeFeature}: `;
    doc.text(featHeader, 108, diagY);

    const featWidth = doc.getTextWidth(featHeader);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const safeDetail = cleanPdfText(item.detail);
    const detailLines = doc.splitTextToSize(safeDetail, Math.max(30, 86 - featWidth));
    doc.text(detailLines[0] || '', 108 + featWidth, diagY);

    diagY += 4.8;
  });

  if (result.essaySummary && observations.length < 5) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    const cleanEssay = cleanPdfText(result.essaySummary);
    const summaryLines = doc.splitTextToSize(cleanEssay, 86);
    doc.text(summaryLines.slice(0, 2), 108, diagY);
  }

  // 6. THIRD ROW (Y: 158 to 212, Height = 54mm): Puntos Fuertes (Left) & Áreas de Mejora (Right)
  // Left: PUNTOS FUERTES
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, 158, 88, 54, 2.5, 2.5, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(12, 158, 88, 7.5, 2.5, 2.5, 'F');
  doc.rect(12, 162, 88, 3.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('PUNTOS FUERTES (+)', 56, 163, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  let strY = 171;
  const strengthsList = (result.strengths || []).slice(0, 4);
  strengthsList.forEach((st) => {
    const cleanSt = cleanPdfText(st.replace(/^[•\+\-\*\s]+/, ''));
    const lines = doc.splitTextToSize(`+  ${cleanSt}`, 80);
    doc.text(lines.slice(0, 2), 16, strY);
    strY += Math.min(2, lines.length) * 3.6 + 2.2;
  });

  // Right: ÁREAS DE OPORTUNIDAD / MEJORA
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(104, 158, 94, 54, 2.5, 2.5, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(104, 158, 94, 7.5, 2.5, 2.5, 'F');
  doc.rect(104, 162, 94, 3.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('AREAS DE OPORTUNIDAD & ENFOQUE (>)', 151, 163, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  let impY = 171;
  const improvementsList = (result.areasForImprovement || []).slice(0, 4);
  improvementsList.forEach((imp) => {
    const cleanImp = cleanPdfText(imp.replace(/^[•\>\-\*\s]+/, ''));
    const lines = doc.splitTextToSize(`>  ${cleanImp}`, 86);
    doc.text(lines.slice(0, 2), 108, impY);
    impY += Math.min(2, lines.length) * 3.6 + 2.2;
  });

  // 7. BOTTOM ROW (Y: 216 to 268, Height = 52mm): Practical Recommendations (3 Clean Balanced Columns)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, 216, 186, 52, 2.5, 2.5, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(12, 216, 186, 7.5, 2.5, 2.5, 'F');
  doc.rect(12, 220, 186, 3.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('GUIA DE RECOMENDACIONES PRACTICAS Y ESTILO', 105, 221, { align: 'center' });

  // 3 Distinct Columns
  const recItems = (result.practicalRecommendations || []).slice(0, 3);
  const colWidth = 56;
  const colPositions = [16, 77, 138];

  recItems.forEach((rec, idx) => {
    const colX = colPositions[idx] || (16 + idx * 60);

    // Column background card
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(colX - 2, 227, colWidth, 37, 2, 2, 'FD');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    const cleanRecTitle = cleanPdfText(rec.title).toUpperCase();
    const titleLines = doc.splitTextToSize(cleanRecTitle, colWidth - 4);
    doc.text(titleLines[0] || '', colX, 233);

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(colX, 236, colX + colWidth - 4, 236);

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(51, 65, 85);
    const cleanDesc = cleanPdfText(rec.description);
    const descLines = doc.splitTextToSize(cleanDesc, colWidth - 4);
    doc.text(descLines.slice(0, 6), colX, 241);
  });

  // 8. FOOTER SECTION (Y: 272 to 286)
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(12, 273, 198, 273);

  // Motto / Quote (Clean, formatted with plain quotes, no garbled Unicode symbols)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  const rawQuote = cleanPdfText(result.footerQuote || 'LA ESTETICA ES SUBJETIVA: TU AUTENTICIDAD ES TU MAYOR FUERZA').toUpperCase();
  const quoteText = `"${rawQuote}"`;
  doc.text(quoteText, 105, 278, { align: 'center' });

  // Confidentiality / Trademark
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('EVALUA AI  |  GUIA DE EVALUACION ESTETICA BASADA EN DATOS VISUALES  |  (C) 2026 TODOS LOS DERECHOS RESERVADOS', 105, 283, { align: 'center' });

  doc.save(`evalua-ai-${cleanPdfText(result.mode) || 'analisis'}-${Date.now()}.pdf`);
}

export function generateComparisonPDF(
  result: ComparisonReportResult,
  imageSrcA: string | null,
  imageSrcB: string | null
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Crisp White Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  // Outer Precision Border
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.4);
  doc.roundedRect(8, 8, 194, 281, 3, 3, 'D');

  // 2. Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(8, 8, 194, 9, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('EVALUA AI  |  INFORME COMPARATIVO ANTES VS. DESPUES', 12, 14);

  const todayStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`FECHA: ${cleanPdfText(todayStr)}`, 196, 14, { align: 'right' });

  // 3. Document Main Title & Subtitle
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const cleanTitle = cleanPdfText(result.title || 'ANALISIS COMPARATIVO').toUpperCase();
  doc.text(cleanTitle, 105, 23, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `EVALUACION DE EVOLUCION ESTETICA - MODO ${cleanPdfText(result.mode || 'FACIAL').toUpperCase()}`,
    105,
    28,
    { align: 'center' }
  );

  // 4. TOP ROW (Y: 32 to 92): Side by Side Photos + Central Evolution Delta
  // Left: Photo A (Antes)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, 32, 54, 58, 2, 2, 'FD');

  if (imageSrcA && imageSrcA.startsWith('data:image')) {
    try {
      doc.addImage(imageSrcA, 'JPEG', 14, 34, 50, 48, undefined, 'FAST');
    } catch {
      // fallback
    }
  }
  doc.setFillColor(15, 23, 42);
  doc.rect(14, 83, 50, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(`FOTO A (ANTES): ${result.overallScoreA.toFixed(1)}/10`, 39, 87.2, { align: 'center' });

  // Right: Photo B (Después)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(144, 32, 54, 58, 2, 2, 'FD');

  if (imageSrcB && imageSrcB.startsWith('data:image')) {
    try {
      doc.addImage(imageSrcB, 'JPEG', 146, 34, 50, 48, undefined, 'FAST');
    } catch {
      // fallback
    }
  }
  doc.setFillColor(15, 23, 42);
  doc.rect(146, 83, 50, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(`FOTO B (DESPUES): ${result.overallScoreB.toFixed(1)}/10`, 171, 87.2, { align: 'center' });

  // Center Box: Delta & Sincere Verdict (Width 68mm, X: 71)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(70, 32, 70, 58, 2, 2, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(70, 32, 70, 8, 2, 2, 'F');
  doc.rect(70, 37, 70, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('BALANCE DE EVOLUCION', 105, 37.5, { align: 'center' });

  // Delta Badge
  const deltaVal = result.scoreDelta;
  const deltaStr = deltaVal > 0 ? `+${deltaVal.toFixed(1)}` : `${deltaVal.toFixed(1)}`;
  doc.setFontSize(16);
  if (result.hasNotableDifferences && deltaVal > 0) {
    doc.setTextColor(16, 185, 129); // emerald
  } else if (!result.hasNotableDifferences) {
    doc.setTextColor(100, 116, 139); // slate
  } else {
    doc.setTextColor(239, 68, 68); // red
  }
  doc.setFont('helvetica', 'bold');
  doc.text(deltaStr, 105, 50, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const statusLabel = !result.hasNotableDifferences
    ? 'SIN DIFERENCIAS SIGNIFICATIVAS'
    : deltaVal > 0
    ? 'MEJORA ESTETICA DETECTADA'
    : 'VARIACION ESTABLE / NEUTRAL';
  doc.text(statusLabel, 105, 55, { align: 'center' });

  // Verdict Summary Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  const cleanVerdict = cleanPdfText(result.verdictSummary);
  const verdictLines = doc.splitTextToSize(cleanVerdict, 64);
  doc.text(verdictLines.slice(0, 7), 73, 62);

  // 5. MIDDLE ROW (Y: 94 to 148): Metrics Comparison Table
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, 94, 186, 52, 2.5, 2.5, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(12, 94, 186, 7.5, 2.5, 2.5, 'F');
  doc.rect(12, 98, 186, 3.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DESGLOSE DE METRICAS COMPARADAS (FOTO A vs. FOTO B)', 105, 99, { align: 'center' });

  let metricY = 106;
  const metricsList = (result.metricsComparison || []).slice(0, 5);
  metricsList.forEach((m, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, metricY - 3, 182, 7.5, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(cleanPdfText(m.metricName), 17, metricY + 1.5);

    // Score A
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`A: ${m.scoreA.toFixed(1)}`, 75, metricY + 1.5);

    // Score B
    doc.text(`B: ${m.scoreB.toFixed(1)}`, 95, metricY + 1.5);

    // Diff
    const diffVal = m.diff;
    const diffStr = diffVal > 0 ? `+${diffVal.toFixed(1)}` : `${diffVal.toFixed(1)}`;
    doc.setFont('helvetica', 'bold');
    if (diffVal > 0) doc.setTextColor(16, 185, 129);
    else if (diffVal < 0) doc.setTextColor(239, 68, 68);
    else doc.setTextColor(148, 163, 184);
    doc.text(`Diff: ${diffStr}`, 115, metricY + 1.5);

    // Comment
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    const commentLine = doc.splitTextToSize(cleanPdfText(m.comment || ''), 55);
    doc.text(commentLine[0] || '', 138, metricY + 1.5);

    metricY += 8;
  });

  // 6. OBSERVED CHANGES & IMPROVEMENTS (Y: 150 to 216)
  // Left Box: Observed Changes (Width 91mm)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, 150, 91, 64, 2.5, 2.5, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(12, 150, 91, 7.5, 2.5, 2.5, 'F');
  doc.rect(12, 154, 91, 3.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('OBSERVACIONES DE CAMBIO POR AREA', 57.5, 155, { align: 'center' });

  let changeY = 162;
  (result.observedChanges || []).slice(0, 4).forEach((oc) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text(`-  ${cleanPdfText(oc.area)}:`, 15, changeY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(51, 65, 85);
    const ocText = `${cleanPdfText(oc.verdict)} - Antes: ${cleanPdfText(oc.beforeState)} | Despues: ${cleanPdfText(oc.afterState)}`;
    const ocLines = doc.splitTextToSize(ocText, 84);
    doc.text(ocLines.slice(0, 2), 17, changeY + 3.8);

    changeY += 12;
  });

  // Right Box: Key Improvements & Sincere Diagnostics (Width 91mm, X: 107)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(107, 150, 91, 64, 2.5, 2.5, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(107, 150, 91, 7.5, 2.5, 2.5, 'F');
  doc.rect(107, 154, 91, 3.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('PUNTOS CLAVE & DIAGNOSTICO', 152.5, 155, { align: 'center' });

  let impY = 162;
  const imps = (result.keyImprovements || []).slice(0, 3);
  imps.forEach((imp) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(16, 185, 129);
    doc.text('*', 110, impY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    const cleanImp = cleanPdfText(imp);
    const impLines = doc.splitTextToSize(cleanImp, 80);
    doc.text(impLines.slice(0, 2), 114, impY);
    impY += 9;
  });

  // Unchanged or points to watch
  impY += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PUNTOS A MANTENER / CUIDAR:', 110, impY);
  impY += 4;

  (result.unchangedOrRegressed || []).slice(0, 2).forEach((un) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(71, 85, 105);
    const cleanUn = cleanPdfText(un);
    const unLines = doc.splitTextToSize(`- ${cleanUn}`, 84);
    doc.text(unLines.slice(0, 2), 110, impY);
    impY += 7;
  });

  // 7. PRACTICAL RECOMMENDATIONS (Y: 218 to 268)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, 218, 186, 50, 2.5, 2.5, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(12, 218, 186, 7.5, 2.5, 2.5, 'F');
  doc.rect(12, 222, 186, 3.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('PLAN DE ACCION RECOMENDADO', 105, 223, { align: 'center' });

  const recItems = (result.practicalRecommendations || []).slice(0, 3);
  const colWidth = 56;
  const colPositions = [16, 77, 138];

  recItems.forEach((rec, idx) => {
    const colX = colPositions[idx] || (16 + idx * 60);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(colX - 2, 229, colWidth, 35, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    const cleanRecTitle = cleanPdfText(rec.title).toUpperCase();
    const titleLines = doc.splitTextToSize(cleanRecTitle, colWidth - 4);
    doc.text(titleLines[0] || '', colX, 235);

    doc.setDrawColor(226, 232, 240);
    doc.line(colX, 238, colX + colWidth - 4, 238);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(51, 65, 85);
    const cleanDesc = cleanPdfText(rec.description);
    const descLines = doc.splitTextToSize(cleanDesc, colWidth - 4);
    doc.text(descLines.slice(0, 5), colX, 243);
  });

  // 8. FOOTER SECTION
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(12, 273, 198, 273);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  const rawQuote = cleanPdfText(result.footerQuote || 'LA EVOLUCION ESTETICA ES UN PROCESO PERSONAL CONSTANTE').toUpperCase();
  const quoteText = `"${rawQuote}"`;
  doc.text(quoteText, 105, 278, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'EVALUA AI  |  ANALISIS COMPARATIVO DE EVOLUCION  |  (C) 2026 TODOS LOS DERECHOS RESERVADOS',
    105,
    283,
    { align: 'center' }
  );

  doc.save(`evalua-ai-comparativa-${cleanPdfText(result.mode) || 'evolucion'}-${Date.now()}.pdf`);
}

export async function convertUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

