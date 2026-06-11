import { Inject, Injectable } from '@nestjs/common';
import { customerPreferencesUpdatedEvent } from '../../domain/customer-events';
import {
  CUSTOMER_REPOSITORY,
  CustomerActor,
  CustomerPreferencesPatch,
  CustomerPreferencesView,
  CustomerRepository
} from '../../domain/ports/customer.repository';

@Injectable()
export class ManagePreferencesUseCase {
  constructor(@Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository) {}

  async get(actor: CustomerActor): Promise<CustomerPreferencesView> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    return this.customerRepository.getPreferences(customer.id);
  }

  async update(actor: CustomerActor, preferences: CustomerPreferencesPatch): Promise<CustomerPreferencesView> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    return this.customerRepository.updatePreferences({
      customerId: customer.id,
      preferences,
      outboxEvent: customerPreferencesUpdatedEvent({ customerId: customer.id })
    });
  }
}

