import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { MediaVisibility } from '@autohub/database';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { MediaService } from '../application/media.service';
import { PresignMediaDto } from './dto/presign-media.dto';
import { CompleteMediaDto } from './dto/complete-media.dto';
import { ListMediaDto } from './dto/list-media.dto';

@ApiTags('media')
@ApiBearerAuth('access-token')
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  @Permissions(Permission.MEDIA_READ)
  @ApiOperation({ summary: 'List own media assets' })
  listMine(@CurrentUser() user: AuthenticatedUser, @Query() query: ListMediaDto) {
    return this.media.listMine(user, {
      page: query.page,
      pageSize: query.pageSize,
      mediaType: query.mediaType,
      status: query.status,
    });
  }

  @Post('presign')
  @Permissions(Permission.MEDIA_UPLOAD)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Create pending media asset + signed upload URL (direct-to-R2)',
  })
  presign(@CurrentUser() user: AuthenticatedUser, @Body() body: PresignMediaDto) {
    return this.media.presign(user, body);
  }

  @Post('upload')
  @Permissions(Permission.MEDIA_UPLOAD)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'mediaType'],
      properties: {
        file: { type: 'string', format: 'binary' },
        mediaType: {
          type: 'string',
          enum: ['IMAGE', 'VIDEO', 'MEDIA_360', 'DOCUMENT'],
        },
        visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE'] },
        ownerModule: { type: 'string' },
        ownerEntityId: { type: 'string' },
        documentPurpose: {
          type: 'string',
          enum: ['REGISTRATION', 'INSPECTION', 'OWNERSHIP', 'OTHER'],
        },
        durationSeconds: { type: 'number' },
      },
    },
  })
  @ApiOperation({ summary: 'Direct multipart upload through the API' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('mediaType') mediaType: string,
    @Body('visibility') visibility?: MediaVisibility,
    @Body('ownerModule') ownerModule?: string,
    @Body('ownerEntityId') ownerEntityId?: string,
    @Body('documentPurpose') documentPurpose?: string,
    @Body('durationSeconds') durationSeconds?: string,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    return this.media.upload(user, {
      mediaType,
      mimeType: file.mimetype,
      filename: file.originalname,
      buffer: file.buffer,
      visibility,
      ownerModule,
      ownerEntityId,
      documentPurpose,
      durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
    });
  }

  @Post('complete')
  @Permissions(Permission.MEDIA_UPLOAD)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Finalize presigned upload and run processing pipeline',
  })
  complete(@CurrentUser() user: AuthenticatedUser, @Body() body: CompleteMediaDto) {
    return this.media.complete(user, {
      mediaId: body.mediaId,
      buffer: body.fileBase64 ? Buffer.from(body.fileBase64, 'base64') : undefined,
      durationSeconds: body.durationSeconds,
    });
  }

  @Post(':id/replace')
  @Permissions(Permission.MEDIA_UPLOAD)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        durationSeconds: { type: 'number' },
      },
    },
  })
  @ApiOperation({
    summary: 'Replace media bytes (re-process, keep same asset id)',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  replace(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('durationSeconds') durationSeconds?: string,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    return this.media.replace(id, user, {
      buffer: file.buffer,
      mimeType: file.mimetype,
      filename: file.originalname,
      durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
    });
  }

  @Post(':id/restore')
  @Permissions(Permission.MEDIA_DELETE)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Restore soft-deleted media within the 72h retention window',
  })
  restore(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.media.restore(id, user);
  }

  @Get(':id')
  @Permissions(Permission.MEDIA_READ)
  @ApiOperation({ summary: 'Get media asset metadata and access URLs' })
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.media.getById(id, user);
  }

  @Delete(':id')
  @Permissions(Permission.MEDIA_DELETE)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Soft-delete media asset (R2 objects retained for 72h restore window)',
  })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.media.delete(id, user);
  }
}
