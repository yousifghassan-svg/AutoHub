import { Injectable } from '@nestjs/common';
import type { VirusScanner, VirusScanResult } from '../domain/media.policies';

/**
 * Default virus-scan hook — no-op skip.
 * Swap this provider for ClamAV / cloud AV without changing MediaService.
 */
@Injectable()
export class NoOpVirusScanner implements VirusScanner {
  async scan(_buffer: Buffer, _mimeType: string): Promise<VirusScanResult> {
    return {
      status: 'SKIPPED',
      engine: 'noop',
      detail: 'Virus scanning hook idle — replace VIRUS_SCANNER provider to enable',
    };
  }
}
