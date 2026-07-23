import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { FirebaseAuthService } from '../firebase/firebase-auth.service';
import { R2StorageService } from '../storage/r2-storage.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
          },
        },
        {
          provide: RedisService,
          useValue: {
            mode: 'memory',
            ping: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: FirebaseAuthService,
          useValue: { isConfigured: () => false },
        },
        {
          provide: R2StorageService,
          useValue: { isConfigured: () => false },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('returns ok when database is up', async () => {
    const result = await controller.check();
    expect(result.status).toBe('ok');
    expect(result.checks.database).toBe('up');
    expect(result.checks.redis).toBe('memory');
    expect(result.integrations.firebase).toBe('idle');
    expect(result.integrations.r2).toBe('idle');
  });
});
