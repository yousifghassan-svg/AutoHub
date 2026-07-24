import type { LicensePlateProps } from '../domain/types';
import { generatePlateSvg, PLATE_VIEWBOX } from './generate-plate-svg';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function fileStem(input: LicensePlateProps): string {
  return `iraq-plate-${input.governorate}-${input.code}-${input.letter}-${input.number}`
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load plate SVG'));
    img.src = src;
  });
}

async function drawPlateCanvas(
  input: LicensePlateProps,
  scale: number,
): Promise<HTMLCanvasElement> {
  const svg = generatePlateSvg(input);
  const width = PLATE_VIEWBOX.width * scale;
  const height = PLATE_VIEWBOX.height * scale;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportPlatePng(input: LicensePlateProps, scale = 3): Promise<void> {
  const canvas = await drawPlateCanvas(input, scale);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png');
  });
  downloadBlob(blob, `${fileStem(input)}.png`);
}

export async function exportPlatePdf(input: LicensePlateProps, scale = 3): Promise<void> {
  const canvas = await drawPlateCanvas(input, scale);
  const jpegBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('JPEG export failed'))),
      'image/jpeg',
      0.92,
    );
  });
  const jpeg = new Uint8Array(await jpegBlob.arrayBuffer());
  const pdf = embedJpegPdf(jpeg, canvas.width, canvas.height);
  downloadBlob(
    new Blob([pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer], {
      type: 'application/pdf',
    }),
    `${fileStem(input)}.pdf`,
  );
}

function embedJpegPdf(jpeg: Uint8Array, widthPx: number, heightPx: number): Uint8Array {
  const pageW = 595;
  const pageH = 842;
  const maxW = pageW - 72;
  const maxH = pageH - 72;
  const scale = Math.min(maxW / widthPx, maxH / heightPx);
  const drawW = widthPx * scale;
  const drawH = heightPx * scale;
  const x = (pageW - drawW) / 2;
  const y = (pageH - drawH) / 2;

  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [0];
  let cursor = 0;

  const push = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === 'string' ? encoder.encode(chunk) : chunk;
    parts.push(bytes);
    cursor += bytes.length;
  };

  const startObj = () => {
    offsets.push(cursor);
    return offsets.length - 1;
  };

  push('%PDF-1.4\n');
  startObj();
  push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  startObj();
  push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  startObj();
  push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n`,
  );
  const content = `q\n${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im1 Do\nQ\n`;
  startObj();
  push(
    `4 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`,
  );
  startObj();
  push(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  );
  push(jpeg);
  push('\nendstream\nendobj\n');

  const xrefStart = cursor;
  push(`xref\n0 ${offsets.length}\n`);
  push('0000000000 65535 f \n');
  for (let i = 1; i < offsets.length; i += 1) {
    push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  push(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

  const out = new Uint8Array(cursor);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}
