import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DetailedReportResult, ComparisonReportResult } from '../types';

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
  doc.text('EVALUA AI  |  FICHA DE ANÁLISIS ESTÉTICO Y VISUAL', 12, 14);

  const todayStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`FECHA: ${todayStr}`, 196, 14, { align: 'right' });

  // 3. Document Main Title & Subtitle
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text((result.title || 'ANÁLISIS ESTÉTICO PERSONALIZADO').toUpperCase(), 105, 24, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text((result.subtitle || 'REPORTE EDITORIAL PERSONALIZADO').toUpperCase(), 105, 29, { align: 'center' });

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
    doc.text('FOTOGRAFÍA', 41, 60, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('EVALUADA', 41, 65, { align: 'center' });
  }

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(`MODO: ${(result.mode || 'ESTÉTICO').toUpperCase()}`, 41, 95, { align: 'center' });

  // Right: Metrics Summary & Global Score (Width 124mm, Height 65mm)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(74, 33, 124, 65, 2.5, 2.5, 'FD');

  // Overall Score Header inside Right Box
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(74, 33, 124, 13, 2.5, 2.5, 'F');
  // Overlap bottom rounded corners with rect to keep bottom flat
  doc.rect(74, 40, 124, 6, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PUNTUACIÓN GLOBAL & ARMONÍA', 78, 41);

  const scoreText = `${result.overallScore.toFixed(1)} / 10`;
  const labelText = (result.overallScoreLabel || 'Excelente').toUpperCase();
  doc.setFontSize(9);
  doc.text(`${scoreText}  •  ${labelText}`, 194, 41, { align: 'right' });

  // Metrics list with clean gauge bars
  const metricsToPrint = result.metrics.slice(0, 7);
  let metricY = 52;
  metricsToPrint.forEach((m) => {
    // Metric Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    const safeName = m.name.length > 28 ? `${m.name.substring(0, 26)}..` : m.name;
    doc.text(safeName.toUpperCase(), 78, metricY);

    // Gauge track
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(140, metricY - 2.5, 34, 2.8, 1.4, 1.4, 'F');

    // Gauge fill
    const validScore = Math.max(0, Math.min(10, m.score));
    const fillWidth = (validScore / 10) * 34;
    doc.setFillColor(15, 23, 42);
    if (fillWidth > 0) {
      doc.roundedRect(140, metricY - 2.5, fillWidth, 2.8, 1.4, 1.4, 'F');
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
  doc.text((result.classificationTitle || 'CLASIFICACIÓN ESTRUCTURAL').toUpperCase(), 56, 107, { align: 'center' });

  // Big Classification Name
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text((result.classificationName || 'ARMONÍA NATURAL').toUpperCase(), 56, 116, { align: 'center' });

  // Traits list (clean bullets, bounded width)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  let traitY = 122;
  const traits = result.classificationTraits.slice(0, 4);
  traits.forEach((trait) => {
    const cleanTrait = trait.replace(/^[•\-\*\s]+/, '');
    const traitLines = doc.splitTextToSize(`• ${cleanTrait}`, 80);
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
  doc.text('DIAGNÓSTICO & ANÁLISIS CLAVE', 151, 107, { align: 'center' });

  let diagY = 115;
  const observations = result.honestAnalysis.slice(0, 5);
  observations.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    const featHeader = `${item.feature}: `;
    doc.text(featHeader, 108, diagY);

    const featWidth = doc.getTextWidth(featHeader);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const detailLines = doc.splitTextToSize(item.detail, 86 - featWidth);
    doc.text(detailLines[0] || '', 108 + featWidth, diagY);

    diagY += 4.8;
  });

  if (result.essaySummary && observations.length < 5) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(result.essaySummary, 86);
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
  doc.text('PUNTOS FUERTES & ARMONÍA (+)', 56, 163, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  let strY = 171;
  const strengthsList = result.strengths.slice(0, 4);
  strengthsList.forEach((st) => {
    const cleanSt = st.replace(/^[•\+\-\*\s]+/, '');
    const lines = doc.splitTextToSize(`+  ${cleanSt}`, 80);
    // Draw only up to 2 lines per bullet to guarantee zero overflow
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
  doc.text('ÁREAS DE OPORTUNIDAD & ENFOQUE (>)', 151, 163, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  let impY = 171;
  const improvementsList = result.areasForImprovement.slice(0, 4);
  improvementsList.forEach((imp) => {
    const cleanImp = imp.replace(/^[•\>\-\*\s]+/, '');
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
  doc.text('GUÍA DE RECOMENDACIONES PRÁCTICAS Y ESTILO', 105, 221, { align: 'center' });

  // 3 Distinct Columns (Width 56mm each, X starts: 16, 77, 138)
  const recItems = result.practicalRecommendations.slice(0, 3);
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
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(rec.title.toUpperCase(), colWidth - 4);
    doc.text(titleLines[0] || '', colX, 233);

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(colX, 236, colX + colWidth - 4, 236);

    // Description (cleanly formatted, clamped to box)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(rec.description, colWidth - 4);
    doc.text(descLines.slice(0, 6), colX, 241);
  });

  // 8. FOOTER SECTION (Y: 272 to 286)
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(12, 273, 198, 273);

  // Motto / Quote
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const quoteText = `✦  ${(result.footerQuote || 'LA ESTÉTICA ES SUBJETIVA: TU AUTENTICIDAD ES TU MAYOR VALOR').toUpperCase()}  ✦`;
  doc.text(quoteText, 105, 278, { align: 'center' });

  // Confidentiality / Trademark
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('EVALUA AI  •  GUÍA DE EVALUACIÓN ESTÉTICA BASADA EN DATOS VISUALES  •  © 2026 TODOS LOS DERECHOS RESERVADOS', 105, 283, { align: 'center' });

  doc.save(`evalua-ai-${result.mode || 'analisis'}-${Date.now()}.pdf`);
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
  doc.text('EVALUA AI  |  INFORME COMPARATIVO ANTES VS. DESPUÉS', 12, 14);

  const todayStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`FECHA: ${todayStr}`, 196, 14, { align: 'right' });

  // 3. Document Main Title & Subtitle
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text((result.title || 'ANÁLISIS COMPARATIVO').toUpperCase(), 105, 23, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `EVALUACIÓN DE EVOLUCIÓN ESTÉTICA • MODO ${(result.mode || 'FACIAL').toUpperCase()}`,
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
  doc.text(`FOTO B (DESPUÉS): ${result.overallScoreB.toFixed(1)}/10`, 171, 87.2, { align: 'center' });

  // Center Box: Delta & Sincere Verdict (Width 68mm, X: 71)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(70, 32, 70, 58, 2, 2, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(70, 32, 70, 8, 2, 2, 'F');
  doc.rect(70, 37, 70, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('BALANCE DE EVOLUCIÓN', 105, 37.5, { align: 'center' });

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
    ? 'MEJORA ESTÉTICA DETECTADA'
    : 'VARIACIÓN ESTABLE / NEUTRAL';
  doc.text(statusLabel, 105, 55, { align: 'center' });

  // Verdict Summary Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  const verdictLines = doc.splitTextToSize(result.verdictSummary, 64);
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
  doc.text('DESGLOSE DE MÉTRICAS COMPARADAS (FOTO A vs. FOTO B)', 105, 99, { align: 'center' });

  let metricY = 106;
  const metricsList = result.metricsComparison.slice(0, 5);
  metricsList.forEach((m, idx) => {
    // Alternating row background
    if (idx % 2 === 0) {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, metricY - 3, 182, 7.5, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(m.metricName, 17, metricY + 1.5);

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
    const commentLine = doc.splitTextToSize(m.comment || '', 55);
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
  doc.text('OBSERVACIONES DE CAMBIO POR ÁREA', 57.5, 155, { align: 'center' });

  let changeY = 162;
  result.observedChanges.slice(0, 4).forEach((oc) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${oc.area}:`, 15, changeY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(51, 65, 85);
    const ocText = `${oc.verdict} — Antes: ${oc.beforeState} | Después: ${oc.afterState}`;
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
  doc.text('PUNTOS CLAVE & DIAGNÓSTICO', 152.5, 155, { align: 'center' });

  let impY = 162;
  const imps = result.keyImprovements.slice(0, 3);
  imps.forEach((imp) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(16, 185, 129);
    doc.text('✦', 110, impY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    const impLines = doc.splitTextToSize(imp, 80);
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

  result.unchangedOrRegressed.slice(0, 2).forEach((un) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(71, 85, 105);
    const unLines = doc.splitTextToSize(`– ${un}`, 84);
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
  doc.text('PLAN DE ACCIÓN RECOMENDADO', 105, 223, { align: 'center' });

  const recItems = result.practicalRecommendations.slice(0, 3);
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
    const titleLines = doc.splitTextToSize(rec.title.toUpperCase(), colWidth - 4);
    doc.text(titleLines[0] || '', colX, 235);

    doc.setDrawColor(226, 232, 240);
    doc.line(colX, 238, colX + colWidth - 4, 238);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(rec.description, colWidth - 4);
    doc.text(descLines.slice(0, 5), colX, 243);
  });

  // 8. FOOTER SECTION
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(12, 273, 198, 273);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const quoteText = `✦  ${(result.footerQuote || 'LA EVOLUCIÓN ESTÉTICA ES UN PROCESO PERSONAL CONSTANTE').toUpperCase()}  ✦`;
  doc.text(quoteText, 105, 278, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'EVALUA AI  •  ANÁLISIS COMPARATIVO DE EVOLUCIÓN  •  © 2026 TODOS LOS DERECHOS RESERVADOS',
    105,
    283,
    { align: 'center' }
  );

  doc.save(`evalua-ai-comparativa-${result.mode || 'evolucion'}-${Date.now()}.pdf`);
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
