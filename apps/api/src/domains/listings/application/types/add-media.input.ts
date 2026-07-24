export type AddMediaInput = {
  mediaType: string;
  mediaAssetId?: string;
  r2Key?: string;
  sortOrder?: number;
  mimeType?: string;
  byteSize?: number;
  confirmed?: boolean;
  documentPurpose?: string;
  sourceBuffer?: Buffer;
};
