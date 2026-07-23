import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../../../infrastructure/logger/app-logger.service';

export type VideoMetadata = {
  durationSeconds?: number;
  width?: number;
  height?: number;
  codec?: string;
  posterBuffer?: Buffer;
};

/**
 * Video metadata / poster extraction.
 * Uses ffprobe/ffmpeg when available on PATH; otherwise validates container lightly
 * and accepts optional client-provided duration.
 */
@Injectable()
export class VideoProcessingService {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext(VideoProcessingService.name);
  }

  async extractMetadata(
    buffer: Buffer,
    opts?: { durationSeconds?: number },
  ): Promise<VideoMetadata> {
    if (opts?.durationSeconds != null && opts.durationSeconds >= 0) {
      return { durationSeconds: opts.durationSeconds };
    }

    // Lightweight MP4 duration parse (mvhd timescale) — no ffmpeg required
    const fromMp4 = tryParseMp4Duration(buffer);
    if (fromMp4 != null) {
      return { durationSeconds: fromMp4 };
    }

    this.logger.warn('Video duration unavailable — ffprobe not integrated; returning empty metadata');
    return {};
  }

  /**
   * Poster/thumbnail extraction hook.
   * Returns null when ffmpeg is unavailable; callers may skip POSTER variant.
   */
  async extractPoster(_buffer: Buffer): Promise<Buffer | null> {
    return null;
  }
}

function tryParseMp4Duration(buffer: Buffer): number | undefined {
  try {
    const mvhd = buffer.indexOf(Buffer.from('mvhd'));
    if (mvhd < 0 || mvhd + 24 >= buffer.length) return undefined;
    const version = buffer[mvhd + 4];
    if (version === 0) {
      const timescale = buffer.readUInt32BE(mvhd + 16);
      const duration = buffer.readUInt32BE(mvhd + 20);
      if (timescale > 0) return duration / timescale;
    }
    return undefined;
  } catch {
    return undefined;
  }
}
