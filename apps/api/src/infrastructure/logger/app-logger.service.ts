import { ConsoleLogger, Injectable, LogLevel, Scope } from '@nestjs/common';

/**
 * Injectable structured logger for domain/infrastructure services.
 * Nest system logging remains available via NestFactory logger options.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService extends ConsoleLogger {
  override setContext(context: string): void {
    super.setContext(context);
  }

  setLevels(levels: LogLevel[]): void {
    this.setLogLevels(levels);
  }
}
