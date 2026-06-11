import { Inject, Injectable } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  CustomerActor,
  CustomerRepository,
  OrderReferenceView,
  PagedResult
} from '../../domain/ports/customer.repository';

@Injectable()
export class ListOrderHistoryUseCase {
  constructor(@Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository) {}

  async execute(actor: CustomerActor, page: { page: number; pageSize: number }): Promise<PagedResult<OrderReferenceView>> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    return this.customerRepository.listOrderReferences(customer.id, page);
  }
}

