import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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

@ApiTags('media')
@ApiBearerAuth('access-token')
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

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

  @Get(':id')
  @Permissions(Permission.MEDIA_READ)
  @ApiOperation({ summary: 'Get media asset metadata and access URLs' })
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.media.getById(id, user);
  }

  @Delete(':id')
  @Permissions(Permission.MEDIA_DELETE)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Soft-delete media asset and remove R2 objects' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.media.delete(id, user);
  }
}
