export type AddMediaInput = {
  mediaType: string;
  r2Key: string;
  sortOrder?: number;
  mimeType?: string;
  byteSize?: number;
  confirmed?: boolean;
  sourceBuffer?: Buffer;
};
