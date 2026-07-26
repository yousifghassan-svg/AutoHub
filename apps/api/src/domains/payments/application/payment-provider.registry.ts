import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  PaymentProvider,
  PaymentProviderId,
  type CaptureInput,
  type PaymentIntentInput,
  type RefundInput,
} from '../domain/payment-provider';

/**
 * Registry for future payment adapters. Phase 1 ships empty — call sites get clear NotImplemented.
 */
@Injectable()
export class PaymentProviderRegistry {
  private readonly providers = new Map<PaymentProviderId, PaymentProvider>();

  register(provider: PaymentProvider): void {
    this.providers.set(provider.id, provider);
  }

  get(id: PaymentProviderId): PaymentProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new NotImplementedException(
        `Payment provider ${id} is not configured yet`,
      );
    }
    return provider;
  }

  list(): Array<{ id: PaymentProviderId; displayName: string; supportedCurrencies: readonly string[] }> {
    return [...this.providers.values()].map((p) => ({
      id: p.id,
      displayName: p.displayName,
      supportedCurrencies: p.supportedCurrencies,
    }));
  }

  /** Planned provider catalog (architecture surface for clients / admin). */
  catalog(): Array<{
    id: PaymentProviderId;
    displayName: string;
    implemented: boolean;
  }> {
    const names: Record<PaymentProviderId, string> = {
      STRIPE: 'Stripe',
      ZAIN_CASH: 'Zain Cash',
      QI_CARD: 'Qi Card',
      MASTERCARD: 'Mastercard',
      VISA: 'Visa',
      APPLE_PAY: 'Apple Pay',
      GOOGLE_PAY: 'Google Pay',
    };
    return (Object.keys(names) as PaymentProviderId[]).map((id) => ({
      id,
      displayName: names[id],
      implemented: this.providers.has(id),
    }));
  }

  async createIntent(id: PaymentProviderId, input: PaymentIntentInput) {
    return this.get(id).createIntent(input);
  }

  async capture(id: PaymentProviderId, input: CaptureInput) {
    return this.get(id).capture(input);
  }

  async refund(id: PaymentProviderId, input: RefundInput) {
    return this.get(id).refund(input);
  }
}
