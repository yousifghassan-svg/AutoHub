import { validate } from 'class-validator';
import {
  ForbidListingStatusOnContentUpdate,
  LISTING_STATUS_CONTENT_UPDATE_FORBIDDEN_MESSAGE,
} from './forbid-listing-status-on-content-update';

class SampleContentUpdateDto {
  @ForbidListingStatusOnContentUpdate()
  status?: string;

  title?: string;
}

describe('ForbidListingStatusOnContentUpdate', () => {
  it('allows requests that omit status', async () => {
    const dto = Object.assign(new SampleContentUpdateDto(), { title: 'Ok' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects client-supplied status with the architectural message', async () => {
    const dto = Object.assign(new SampleContentUpdateDto(), {
      title: 'Ok',
      status: 'ACTIVE',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
    expect(messages).toContain(LISTING_STATUS_CONTENT_UPDATE_FORBIDDEN_MESSAGE);
  });
});
