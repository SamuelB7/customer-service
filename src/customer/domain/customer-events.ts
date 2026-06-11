import { DomainEventDraft } from './domain-event';

const occurredAt = () => new Date().toISOString();

export function customerProfileCreatedEvent(input: { customerId: string; authUserId: string; email: string }): DomainEventDraft {
  return {
    topic: 'customer.profile.created.v1',
    type: 'customer.profile.created.v1',
    payload: { ...input, occurredAt: occurredAt() }
  };
}

export function customerProfileUpdatedEvent(input: { customerId: string; authUserId: string }): DomainEventDraft {
  return {
    topic: 'customer.profile.updated.v1',
    type: 'customer.profile.updated.v1',
    payload: { ...input, occurredAt: occurredAt() }
  };
}

export function customerAddressCreatedEvent(input: { customerId: string; addressId: string }): DomainEventDraft {
  return {
    topic: 'customer.address.created.v1',
    type: 'customer.address.created.v1',
    payload: { ...input, occurredAt: occurredAt() }
  };
}

export function customerAddressUpdatedEvent(input: { customerId: string; addressId: string }): DomainEventDraft {
  return {
    topic: 'customer.address.updated.v1',
    type: 'customer.address.updated.v1',
    payload: { ...input, occurredAt: occurredAt() }
  };
}

export function customerAddressDeletedEvent(input: { customerId: string; addressId: string }): DomainEventDraft {
  return {
    topic: 'customer.address.deleted.v1',
    type: 'customer.address.deleted.v1',
    payload: { ...input, occurredAt: occurredAt() }
  };
}

export function customerPreferencesUpdatedEvent(input: { customerId: string }): DomainEventDraft {
  return {
    topic: 'customer.preferences.updated.v1',
    type: 'customer.preferences.updated.v1',
    payload: { ...input, occurredAt: occurredAt() }
  };
}

export function wishlistItemAddedEvent(input: { customerId: string; listingId: string }): DomainEventDraft {
  return {
    topic: 'customer.wishlist.item_added.v1',
    type: 'customer.wishlist.item_added.v1',
    payload: { ...input, occurredAt: occurredAt() }
  };
}

export function wishlistItemRemovedEvent(input: { customerId: string; itemId: string }): DomainEventDraft {
  return {
    topic: 'customer.wishlist.item_removed.v1',
    type: 'customer.wishlist.item_removed.v1',
    payload: { ...input, occurredAt: occurredAt() }
  };
}

export function wishlistSharedEvent(input: { customerId: string; shareToken: string }): DomainEventDraft {
  return {
    topic: 'customer.wishlist.shared.v1',
    type: 'customer.wishlist.shared.v1',
    payload: { ...input, occurredAt: occurredAt() }
  };
}

export function sellerFollowedEvent(input: { customerId: string; sellerId: string }): DomainEventDraft {
  return {
    topic: 'customer.seller.followed.v1',
    type: 'customer.seller.followed.v1',
    payload: { ...input, occurredAt: occurredAt() }
  };
}

export function sellerUnfollowedEvent(input: { customerId: string; sellerId: string }): DomainEventDraft {
  return {
    topic: 'customer.seller.unfollowed.v1',
    type: 'customer.seller.unfollowed.v1',
    payload: { ...input, occurredAt: occurredAt() }
  };
}

export function privacyExportRequestedEvent(input: { customerId: string; requestId: string }): DomainEventDraft {
  return {
    topic: 'customer.privacy_export_requested.v1',
    type: 'customer.privacy_export_requested.v1',
    payload: { ...input, occurredAt: occurredAt() }
  };
}

