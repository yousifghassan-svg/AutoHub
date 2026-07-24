import type { UserRole } from '@autohub/database';

/** Allowed media policies for the enterprise media platform. */

export const MEDIA_MAX_BYTES: Record<string, number> = {
  IMAGE: 15 * 1024 * 1024,
  VIDEO: 200 * 1024 * 1024,
  MEDIA_360: 100 * 1024 * 1024,
  DOCUMENT: 25 * 1024 * 1024,
};

export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
  MEDIA_360: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export const IMAGE_VARIANTS = [
  { kind: 'THUMBNAIL' as const, width: 320, quality: 75 },
  { kind: 'SMALL' as const, width: 640, quality: 80 },
  { kind: 'MEDIUM' as const, width: 1280, quality: 82 },
  { kind: 'LARGE' as const, width: 1920, quality: 85 },
];

export type VirusScanResult = {
  status: 'CLEAN' | 'INFECTED' | 'SKIPPED' | 'FAILED';
  engine?: string;
  detail?: string;
};

export interface VirusScanner {
  scan(buffer: Buffer, mimeType: string): Promise<VirusScanResult>;
}

export const VIRUS_SCANNER = Symbol('VIRUS_SCANNER');

/** Staff who can read/manage the admin media library (includes moderators). */
export function isMediaAdmin(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MODERATOR';
}

/** Soft-delete retention window before R2 objects are reaped (hours). */
export const MEDIA_SOFT_DELETE_RETENTION_HOURS = 72;

export const DOCUMENT_PURPOSES = [
  'REGISTRATION',
  'INSPECTION',
  'OWNERSHIP',
  'OTHER',
] as const;

export type DocumentPurpose = (typeof DOCUMENT_PURPOSES)[number];