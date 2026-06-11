import { Inject, Injectable } from '@nestjs/common';
import { customerProfileCreatedEvent } from '../../domain/customer-events';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../../domain/ports/customer.repository';

@Injectable()
export class SyncCustomerFromAuthEventUseCase {
  constructor(@Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository) {}

  async execute(payload: unknown): Promise<void> {
    if (!this.isCustomerRegisteredEvent(payload)) {
      return;
    }

    await this.customerRepository.createCustomerFromAuthEvent({
      authUserId: payload.userId,
      email: payload.email,
      displayName: payload.email,
      outboxEvent: customerProfileCreatedEvent({
        customerId: 'pending',
        authUserId: payload.userId,
        email: payload.email
      })
    });
  }

  private isCustomerRegisteredEvent(payload: unknown): payload is { userId: string; email: string; role: 'CUSTOMER' } {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as Record<string, unknown>;
    return candidate.role === 'CUSTOMER' && typeof candidate.userId === 'string' && typeof candidate.email === 'string';
  }
}

