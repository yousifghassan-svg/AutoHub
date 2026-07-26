/**
 * Future payment foundation — interfaces only (Sprint 24).
 * No Stripe / Zain Cash / Qi Card SDKs or live charges yet.
 */

export const PaymentProviderId = {
  STRIPE: 'STRIPE',
  ZAIN_CASH: 'ZAIN_CASH',
  QI_CARD: 'QI_CARD',
  MASTERCARD: 'MASTERCARD',
  VISA: 'VISA',
  APPLE_PAY: 'APPLE_PAY',
  GOOGLE_PAY: 'GOOGLE_PAY',
} as const;

export type PaymentProviderId =
  (typeof PaymentProviderId)[keyof typeof PaymentProviderId];

export type PaymentIntentInput = {
  amount: number;
  currencyCode: string;
  listingId?: string;
  userId?: string;
  metadata?: Record<string, string>;
};

export type PaymentIntentResult = {
  provider: PaymentProviderId;
  intentId: string;
  clientSecret?: string;
  status: 'unimplemented' | 'pending' | 'succeeded' | 'failed';
};

export type CaptureInput = {
  intentId: string;
  amount?: number;
};

export type RefundInput = {
  intentId: string;
  amount?: number;
  reason?: string;
};

export interface PaymentProvider {
  readonly id: PaymentProviderId;
  readonly displayName: string;
  readonly supportedCurrencies: readonly string[];

  createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  capture(input: CaptureInput): Promise<{ ok: boolean; status: string }>;
  refund(input: RefundInput): Promise<{ ok: boolean; status: string }>;
}
