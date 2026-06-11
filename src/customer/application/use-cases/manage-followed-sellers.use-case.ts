import { Inject, Injectable } from '@nestjs/common';
import { sellerFollowedEvent, sellerUnfollowedEvent } from '../../domain/customer-events';
import {
  CUSTOMER_REPOSITORY,
  CustomerActor,
  CustomerRepository,
  FollowedSellerView
} from '../../domain/ports/customer.repository';

@Injectable()
export class ManageFollowedSellersUseCase {
  constructor(@Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository) {}

  async list(actor: CustomerActor): Promise<FollowedSellerView[]> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    return this.customerRepository.listFollowedSellers(customer.id);
  }

  async follow(actor: CustomerActor, sellerId: string): Promise<FollowedSellerView> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    return this.customerRepository.followSeller({
      customerId: customer.id,
      sellerId,
      outboxEvent: sellerFollowedEvent({ customerId: customer.id, sellerId })
    });
  }

  async unfollow(actor: CustomerActor, sellerId: string): Promise<{ removed: true }> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    await this.customerRepository.unfollowSeller({
      customerId: customer.id,
      sellerId,
      outboxEvent: sellerUnfollowedEvent({ customerId: customer.id, sellerId })
    });

    return { removed: true };
  }
}

