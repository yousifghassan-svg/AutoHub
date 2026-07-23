import { ValidationPipe } from '@nestjs/common';

/** Factory for the global validation pipe (DTO whitelist + transform). */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  });
}
