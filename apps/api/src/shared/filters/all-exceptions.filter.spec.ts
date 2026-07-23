import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@autohub/database';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({
        method: 'GET',
        url: '/v1/test',
        requestId: 'req-1',
        headers: {},
      }),
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns HttpException message as-is', () => {
    filter.catch(new BadRequestException('bad input'), host as never);
    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ message: 'bad input' }),
      }),
    );
  });

  it('maps Prisma unique conflicts to 409 without leaking internals', () => {
    const err = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    });
    filter.catch(err, host as never);
    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json.mock.calls[0][0].error.message).toBe('Resource already exists');
    expect(json.mock.calls[0][0].error.message).not.toContain('Unique');
  });

  it('never echoes raw Error.message for unexpected failures', () => {
    filter.catch(new Error('secret table "User" exploded'), host as never);
    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json.mock.calls[0][0].error.message).toBe('Internal server error');
  });
});
