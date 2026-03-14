/**
 * lib/exportPDF.ts
 * Export manga pages as PDF, PNG, or Webtoon (vertical scroll) format.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export all manga pages as a multi-page PDF.
 * Each page becomes one A4-sized PDF page.
 */
export async function exportAsPDF(
  pageElements: HTMLElement[],
  title: string = 'manga'
): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pageElements.length; i++) {
    const canvas = await html2canvas(pageElements[i], {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  }

  pdf.save(`${title}.pdf`);
}

/**
 * Export individual pages as PNG images.
 * Downloads one PNG per page.
 */
export async function exportAsPNG(
  pageElements: HTMLElement[],
  title: string = 'manga'
): Promise<void> {
  for (let i = 0; i < pageElements.length; i++) {
    const canvas = await html2canvas(pageElements[i], {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const link = document.createElement('a');
    link.download = `${title}_page_${i + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

/**
 * Export as Webtoon format — vertically stitched single PNG.
 */
export async function exportAsWebtoon(
  pageElements: HTMLElement[],
  title: string = 'manga'
): Promise<void> {
  const canvases: HTMLCanvasElement[] = [];
  let totalHeight = 0;
  let maxWidth = 0;

  for (const el of pageElements) {
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
    canvases.push(canvas);
    totalHeight += canvas.height;
    maxWidth = Math.max(maxWidth, canvas.width);
  }

  const stitched = document.createElement('canvas');
  stitched.width = maxWidth;
  stitched.height = totalHeight;
  const ctx = stitched.getContext('2d')!;

  let yOffset = 0;
  for (const canvas of canvases) {
    ctx.drawImage(canvas, 0, yOffset);
    yOffset += canvas.height;
  }

  const link = document.createElement('a');
  link.download = `${title}_webtoon.png`;
  link.href = stitched.toDataURL('image/png');
  link.click();
}
