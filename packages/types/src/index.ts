/** Shared TypeScript types for AutoHub clients and API (no business logic). */

export type Locale = 'ar' | 'ku' | 'en';
/** Phase-1 codes. Additional codes (AED, EUR, SAR, TRY, GBP, …) come from the DB catalog. */
export type CurrencyCode = 'IQD' | 'USD' | (string & {});

export type ApiSuccess<T> = {
  data: T;
};

export type ApiErrorBody = {
  statusCode: number;
  message: string;
  correlationId?: string;
};

export type HealthStatus = {
  status: 'ok' | 'degraded';
  timestamp: string;
  checks: {
    database: 'up' | 'down';
    redis?: 'up' | 'down' | 'memory';
  };
};
