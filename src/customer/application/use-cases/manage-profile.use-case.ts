import { Inject, Injectable } from '@nestjs/common';
import { customerProfileUpdatedEvent } from '../../domain/customer-events';
import { CUSTOMER_REPOSITORY, CustomerActor, CustomerProfile, CustomerRepository } from '../../domain/ports/customer.repository';

@Injectable()
export class ManageProfileUseCase {
  constructor(@Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository) {}

  getProfile(actor: CustomerActor): Promise<CustomerProfile> {
    return this.customerRepository.ensureCustomer(actor);
  }

  async updateProfile(
    actor: CustomerActor,
    input: { displayName?: string; phone?: string; birthDate?: Date | null }
  ): Promise<CustomerProfile> {
    const customer = await this.customerRepository.ensureCustomer(actor);

    return this.customerRepository.updateProfile({
      authUserId: actor.authUserId,
      displayName: input.displayName,
      phone: input.phone,
      birthDate: input.birthDate,
      outboxEvent: customerProfileUpdatedEvent({
        customerId: customer.id,
        authUserId: actor.authUserId
      })
    });
  }
}

