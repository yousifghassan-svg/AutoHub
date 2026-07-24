import { Injectable, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppConfigService } from '../config/app-config.service';
import { AppLoggerService } from '../logger/app-logger.service';

/**
 * Cloudflare R2 (S3-compatible) storage adapter.
 * Supports put/get/delete/copy and signed URLs for public/private objects.
 */
@Injectable()
export class R2StorageService implements OnModuleInit {
  private client: S3Client | null = null;
  private bucket: string | undefined;
  private publicBaseUrl: string | undefined;
  private endpoint: string | undefined;

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(R2StorageService.name);
  }

  onModuleInit(): void {
    const { accountId, accessKeyId, secretAccessKey, bucket, endpoint, publicBaseUrl } =
      this.appConfig.app.r2;

    if (!accessKeyId || !secretAccessKey || !bucket) {
      this.logger.warn(
        'Cloudflare R2 credentials incomplete — media storage integration idle until configured',
      );
      return;
    }

    const resolvedEndpoint =
      endpoint ??
      (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

    if (!resolvedEndpoint) {
      this.logger.warn('R2 endpoint/accountId missing — storage integration idle');
      return;
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: resolvedEndpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
    this.bucket = bucket;
    this.endpoint = resolvedEndpoint;
    this.publicBaseUrl = publicBaseUrl;
    this.logger.log('Cloudflare R2 client initialized');
  }

  isConfigured(): boolean {
    return this.client !== null && Boolean(this.bucket);
  }

  getClient(): S3Client | null {
    return this.client;
  }

  getBucket(): string | undefined {
    return this.bucket;
  }

  assertConfigured(): void {
    if (!this.isConfigured() || !this.client || !this.bucket) {
      throw new ServiceUnavailableException(
        'Cloudflare R2 is not configured on this server',
      );
    }
  }

  async putObject(input: {
    key: string;
    body: Buffer;
    contentType: string;
    isPublic?: boolean;
  }): Promise<void> {
    this.assertConfigured();
    await this.client!.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        ACL: input.isPublic ? 'public-read' : undefined,
      }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    if (!this.isConfigured()) return;
    await this.client!.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  /** Server-side copy within the same bucket (useful for replace / key rewrite). */
  async copyObject(input: {
    sourceKey: string;
    destinationKey: string;
    contentType?: string;
    isPublic?: boolean;
  }): Promise<void> {
    this.assertConfigured();
    await this.client!.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${input.sourceKey}`,
        Key: input.destinationKey,
        ContentType: input.contentType,
        MetadataDirective: input.contentType ? 'REPLACE' : 'COPY',
        ACL: input.isPublic ? 'public-read' : undefined,
      }),
    );
  }

  async createPresignedUploadUrl(input: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<string> {
    this.assertConfigured();
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: input.key,
      ContentType: input.contentType,
    });
    return getSignedUrl(this.client!, command, {
      expiresIn: input.expiresInSeconds ?? 900,
    });
  }

  async createPresignedDownloadUrl(input: {
    key: string;
    expiresInSeconds?: number;
  }): Promise<string> {
    this.assertConfigured();
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: input.key,
    });
    return getSignedUrl(this.client!, command, {
      expiresIn: input.expiresInSeconds ?? 900,
    });
  }

  getPublicUrl(key: string): string | null {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
    }
    if (this.endpoint && this.bucket) {
      return `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/${key.replace(/^\//, '')}`;
    }
    return null;
  }

  async getObjectBuffer(key: string): Promise<Buffer | null> {
    if (!this.isConfigured()) return null;
    try {
      const response = await this.client!.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      const bytes = await response.Body?.transformToByteArray();
      return bytes ? Buffer.from(bytes) : null;
    } catch {
      return null;
    }
  }
}
