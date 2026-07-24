import { GOVERNORATES } from '../domain/governorates';
import type { LicensePlateProps } from '../domain/types';
import { getCachedSvg, setCachedSvg } from './svg-cache';

/**
 * Final Iraqi plate canvas — identical proportions for every plate.
 * Layout: [Code 20%] [Letter 15%] [Number 65%]
 */
const VIEW_W = 700;
const VIEW_H = 178;
const LAYOUT_VERSION = 'v5-flat-fixed';

/** Plate face inset so outer stroke is never clipped. */
const PLATE_X = 4;
const PLATE_Y = 4;
const PLATE_W = VIEW_W - PLATE_X * 2;
const PLATE_H = VIEW_H - PLATE_Y * 2;
const PLATE_RX = 4;

/** Equal left/right content margins inside the plate face. */
const CONTENT_MARGIN = 28;
const CONTENT_X = PLATE_X + CONTENT_MARGIN;
const CONTENT_W = PLATE_W - CONTENT_MARGIN * 2;

/** Fixed section widths (must sum to 100%). */
const CODE_RATIO = 0.2;
const LETTER_RATIO = 0.15;
const NUMBER_RATIO = 0.65;

const CODE_W = CONTENT_W * CODE_RATIO;
const LETTER_W = CONTENT_W * LETTER_RATIO;
const NUMBER_W = CONTENT_W * NUMBER_RATIO;

const CODE_CX = CONTENT_X + CODE_W / 2;
const LETTER_CX = CONTENT_X + CODE_W + LETTER_W / 2;
const NUMBER_CX = CONTENT_X + CODE_W + LETTER_W + NUMBER_W / 2;

const TEXT_Y = PLATE_Y + PLATE_H / 2;
const FONT_SIZE = 62;
const OUTER_STROKE = 2.25;
const INNER_STROKE = 1.25;
const INNER_INSET = 5;

const FONT_FAMILY =
  'Arial Narrow, Helvetica Condensed, Roboto Condensed, Arial Black, Arial, sans-serif';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cacheKey(input: LicensePlateProps): string {
  return [
    LAYOUT_VERSION,
    input.governorate,
    input.code.trim(),
    input.letter.trim().toUpperCase(),
    input.number.trim(),
    input.type,
  ].join('|');
}

/**
 * Flat Iraqi plate SVG.
 * Fixed grid: [Code 20%] [Letter 15%] [Number 65%]
 * No logos, badges, gradients, shadows, or metallic effects.
 */
export function generatePlateSvg(input: LicensePlateProps): string {
  const key = cacheKey(input);
  const cached = getCachedSvg(key);
  if (cached) return cached;

  const meta = GOVERNORATES[input.governorate];
  const code = escapeXml((input.code || meta.defaultCode).trim().slice(0, 4));
  const letter = escapeXml((input.letter || 'A').trim().toUpperCase().slice(0, 3));
  const number = escapeXml((input.number || '00000').trim().slice(0, 7));

  const innerX = PLATE_X + INNER_INSET;
  const innerY = PLATE_Y + INNER_INSET;
  const innerW = PLATE_W - INNER_INSET * 2;
  const innerH = PLATE_H - INNER_INSET * 2;
  const innerRx = Math.max(PLATE_RX - 2, 1);

  const textAttrs = `fill="#0B0B0B" font-family="${FONT_FAMILY}" font-size="${FONT_SIZE}" font-weight="700" text-anchor="middle" dominant-baseline="central"`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" width="100%" height="100%" role="img" aria-label="Iraqi license plate ${escapeXml(meta.nameEn)} ${code} ${letter} ${number}">
  <!-- Flat white face + thin black outer border -->
  <rect x="${PLATE_X}" y="${PLATE_Y}" width="${PLATE_W}" height="${PLATE_H}" rx="${PLATE_RX}" ry="${PLATE_RX}" fill="#FFFFFF" stroke="#0E0E0E" stroke-width="${OUTER_STROKE}"/>

  <!-- Thin inner border -->
  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerRx}" ry="${innerRx}" fill="none" stroke="#0E0E0E" stroke-width="${INNER_STROKE}"/>

  <!-- Fixed grid: 20% / 15% / 65% -->
  <text x="${CODE_CX}" y="${TEXT_Y}" ${textAttrs} letter-spacing="-0.5">${code}</text>
  <text x="${LETTER_CX}" y="${TEXT_Y}" ${textAttrs}>${letter}</text>
  <text x="${NUMBER_CX}" y="${TEXT_Y}" ${textAttrs} letter-spacing="1.5">${number}</text>
</svg>`;

  return setCachedSvg(key, svg);
}

export function plateSvgDataUrl(input: LicensePlateProps): string {
  const svg = generatePlateSvg(input);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const PLATE_VIEWBOX = { width: VIEW_W, height: VIEW_H } as const;

/** Exported for tests / tooling — fixed layout metrics. */
export const PLATE_LAYOUT = {
  codeRatio: CODE_RATIO,
  letterRatio: LETTER_RATIO,
  numberRatio: NUMBER_RATIO,
  contentMargin: CONTENT_MARGIN,
  fontSize: FONT_SIZE,
} as const;
