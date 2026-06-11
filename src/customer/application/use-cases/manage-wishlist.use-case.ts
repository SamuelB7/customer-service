import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { wishlistItemAddedEvent, wishlistItemRemovedEvent, wishlistSharedEvent } from '../../domain/customer-events';
import {
  CUSTOMER_REPOSITORY,
  CustomerActor,
  CustomerRepository,
  WishlistItemInput,
  WishlistItemView
} from '../../domain/ports/customer.repository';
import { customerError } from '../customer.errors';

@Injectable()
export class ManageWishlistUseCase {
  constructor(@Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository) {}

  async list(actor: CustomerActor): Promise<WishlistItemView[]> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    return this.customerRepository.listWishlistItems(customer.id);
  }

  async add(actor: CustomerActor, item: WishlistItemInput): Promise<WishlistItemView> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    return this.customerRepository.addWishlistItem({
      customerId: customer.id,
      item,
      outboxEvent: wishlistItemAddedEvent({ customerId: customer.id, listingId: item.listingId })
    });
  }

  async remove(actor: CustomerActor, itemId: string): Promise<{ removed: true }> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    const removed = await this.customerRepository.removeWishlistItem({
      customerId: customer.id,
      itemId,
      outboxEvent: wishlistItemRemovedEvent({ customerId: customer.id, itemId })
    });

    if (!removed) {
      throw customerError('WISHLIST_ITEM_NOT_FOUND', 'Wishlist item not found.');
    }

    return { removed: true };
  }

  async share(actor: CustomerActor): Promise<{ shareToken: string; url: string }> {
    const customer = await this.customerRepository.ensureCustomer(actor);
    const shareToken = randomUUID();
    const share = await this.customerRepository.createWishlistShare({
      customerId: customer.id,
      shareToken,
      outboxEvent: wishlistSharedEvent({ customerId: customer.id, shareToken })
    });

    return {
      shareToken: share.shareToken,
      url: `/wishlists/${share.shareToken}`
    };
  }

  getSharedItems(shareToken: string): Promise<WishlistItemView[]> {
    return this.customerRepository.listSharedWishlistItems(shareToken);
  }
}

