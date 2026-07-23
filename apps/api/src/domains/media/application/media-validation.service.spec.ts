import { BadRequestException } from '@nestjs/common';
import { MediaValidationService } from './media-validation.service';

describe('MediaValidationService', () => {
  const service = new MediaValidationService();

  it('normalizes 360_MEDIA to MEDIA_360', () => {
    expect(service.assertMediaType('360_MEDIA')).toBe('MEDIA_360');
  });

  it('rejects disallowed mime types', () => {
    expect(() =>
      service.assertMimeAndSize('IMAGE', 'application/zip', 100),
    ).toThrow(BadRequestException);
  });

  it('rejects oversized files', () => {
    expect(() =>
      service.assertMimeAndSize('IMAGE', 'image/jpeg', 50 * 1024 * 1024),
    ).toThrow(BadRequestException);
  });

  it('builds object keys under media/{type}/{owner}/{asset}/', () => {
    const key = service.buildObjectKey({
      mediaType: 'IMAGE',
      ownerId: 'u1',
      filename: 'Photo 1.JPG',
      assetId: 'abc',
    });
    expect(key).toMatch(/^media\/image\/u1\/abc\/photo-1.jpg$/);
  });
});
