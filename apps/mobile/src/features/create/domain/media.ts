export type MediaKind = 'IMAGE' | 'VIDEO';

export type CreateMediaItem = {
  localId: string;
  kind: MediaKind;
  uri: string;
  mimeType: string;
  byteSize: number;
  filename: string;
  assetId?: string;
  r2Key?: string;
  listingMediaId?: string;
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'attached' | 'failed';
  progress: number;
  error?: string;
};

export function newMediaId(): string {
  return `media_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
