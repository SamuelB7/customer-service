import { Inject, Injectable } from '@nestjs/common';
import { privacyExportRequestedEvent } from '../../domain/customer-events';
import {
  CUSTOMER_REPOSITORY,
  CustomerActor,
  CustomerRepository,
  PrivacyExportView
} from '../../domain/ports/customer.repository';
import { customerError } from '../customer.errors';

@Injectable()
export class ManagePrivacyExportsUseCase {
  constructor(@Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository) {}

  async create(actor: CustomerActor): Promise<PrivacyExportView> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    return this.customerRepository.createPrivacyExport({
      customerId: customer.id,
      outboxEvent: privacyExportRequestedEvent({ customerId: customer.id, requestId: 'pending' })
    });
  }

  async list(actor: CustomerActor): Promise<PrivacyExportView[]> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    return this.customerRepository.listPrivacyExports(customer.id);
  }

  async get(actor: CustomerActor, requestId: string): Promise<PrivacyExportView> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    const request = await this.customerRepository.getPrivacyExport({ customerId: customer.id, requestId });

    if (!request) {
      throw customerError('PRIVACY_EXPORT_NOT_FOUND', 'Privacy export request not found.');
    }

    return request;
  }
}

