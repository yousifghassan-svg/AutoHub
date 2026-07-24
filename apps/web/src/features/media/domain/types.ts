export type MediaType = 'IMAGE' | 'VIDEO' | 'MEDIA_360' | 'DOCUMENT' | '360_MEDIA';

export type MediaVariantKind =
  | 'ORIGINAL'
  | 'THUMBNAIL'
  | 'SMALL'
  | 'MEDIUM'
  | 'LARGE'
  | 'WEBP'
  | 'POSTER';

export type MediaVariant = {
  kind: MediaVariantKind | string;
  r2Key: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  byteSize?: number;
};

export type MediaAsset = {
  id: string;
  mediaType: MediaType | string;
  visibility: string;
  status: string;
  originalKey: string;
  filename: string | null;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  durationSeconds?: number | null;
  blurDataUrl?: string | null;
  documentPurpose?: string | null;
  variants: MediaVariant[];
  urls?: Record<string, string | null>;
  createdAt: string;
  updatedAt?: string;
};

export type PresignResult = {
  asset: MediaAsset;
  upload: {
    method: string;
    url: string | null;
    headers: Record<string, string>;
    key: string;
    mode: 'signed_url' | 'server_upload_required' | string;
  };
};

export type GalleryItem = {
  id: string;
  url: string | null;
  kind: string;
  blurDataUrl?: string | null;
  variants?: MediaVariant[];
  urls?: Record<string, string | null>;
  isPrimary?: boolean;
};

export type UploadFileState = {
  localId: string;
  file: File;
  progress: number;
  status: 'queued' | 'compressing' | 'uploading' | 'processing' | 'done' | 'error' | 'cancelled';
  error?: string;
  asset?: MediaAsset;
  previewUrl?: string;
  isPrimary?: boolean;
};
