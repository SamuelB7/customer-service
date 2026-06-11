import { Inject, Injectable } from '@nestjs/common';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../../domain/ports/customer.repository';

@Injectable()
export class SyncOrderReferenceUseCase {
  constructor(@Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository) {}

  async upsertFromOrderCreated(payload: unknown): Promise<void> {
    if (!this.isOrderCreatedEvent(payload)) {
      return;
    }

    await this.customerRepository.upsertOrderReference({
      authUserId: payload.customerAuthUserId,
      email: payload.customerEmail,
      orderId: payload.orderId,
      status: payload.status,
      totalAmountCents: payload.totalAmountCents,
      currency: payload.currency,
      placedAt: payload.placedAt ? new Date(payload.placedAt) : undefined
    });
  }

  async updateFromStatusChanged(payload: unknown): Promise<void> {
    if (!this.isOrderStatusChangedEvent(payload)) {
      return;
    }

    await this.customerRepository.updateOrderReferenceStatus({
      orderId: payload.orderId,
      status: payload.status
    });
  }

  private isOrderCreatedEvent(payload: unknown): payload is {
    customerAuthUserId: string;
    customerEmail: string;
    orderId: string;
    status: string;
    totalAmountCents?: number;
    currency?: string;
    placedAt?: string;
  } {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as Record<string, unknown>;
    return (
      typeof candidate.customerAuthUserId === 'string' &&
      typeof candidate.customerEmail === 'string' &&
      typeof candidate.orderId === 'string' &&
      typeof candidate.status === 'string'
    );
  }

  private isOrderStatusChangedEvent(payload: unknown): payload is { orderId: string; status: string } {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as Record<string, unknown>;
    return typeof candidate.orderId === 'string' && typeof candidate.status === 'string';
  }
}

