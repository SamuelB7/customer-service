import { Inject, Injectable } from '@nestjs/common';
import { customerAddressCreatedEvent, customerAddressDeletedEvent, customerAddressUpdatedEvent } from '../../domain/customer-events';
import {
  AddressInput,
  AddressPatch,
  CUSTOMER_REPOSITORY,
  CustomerActor,
  CustomerAddressView,
  CustomerRepository
} from '../../domain/ports/customer.repository';
import { customerError } from '../customer.errors';

@Injectable()
export class ManageAddressesUseCase {
  constructor(@Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository) {}

  async list(actor: CustomerActor): Promise<CustomerAddressView[]> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    return this.customerRepository.listAddresses(customer.id);
  }

  async add(actor: CustomerActor, address: AddressInput): Promise<CustomerAddressView> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    return this.customerRepository.addAddress({
      customerId: customer.id,
      address,
      outboxEvent: customerAddressCreatedEvent({ customerId: customer.id, addressId: 'pending' })
    });
  }

  async update(actor: CustomerActor, addressId: string, address: AddressPatch): Promise<CustomerAddressView> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    const updated = await this.customerRepository.updateAddress({
      customerId: customer.id,
      addressId,
      address,
      outboxEvent: customerAddressUpdatedEvent({ customerId: customer.id, addressId })
    });

    if (!updated) {
      throw customerError('ADDRESS_NOT_FOUND', 'Address not found.');
    }

    return updated;
  }

  async remove(actor: CustomerActor, addressId: string): Promise<{ deleted: true }> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    const deleted = await this.customerRepository.deleteAddress({
      customerId: customer.id,
      addressId,
      outboxEvent: customerAddressDeletedEvent({ customerId: customer.id, addressId })
    });

    if (!deleted) {
      throw customerError('ADDRESS_NOT_FOUND', 'Address not found.');
    }

    return { deleted: true };
  }

  async setDefault(actor: CustomerActor, addressId: string): Promise<CustomerAddressView> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    const updated = await this.customerRepository.setDefaultAddress({
      customerId: customer.id,
      addressId,
      outboxEvent: customerAddressUpdatedEvent({ customerId: customer.id, addressId })
    });

    if (!updated) {
      throw customerError('ADDRESS_NOT_FOUND', 'Address not found.');
    }

    return updated;
  }
}

