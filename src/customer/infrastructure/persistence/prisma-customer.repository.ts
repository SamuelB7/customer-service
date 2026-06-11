import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { customerProfileCreatedEvent } from '../../domain/customer-events';
import { DomainEventDraft } from '../../domain/domain-event';
import {
  AddressInput,
  AddressPatch,
  CustomerActor,
  CustomerAddressView,
  CustomerPreferencesPatch,
  CustomerPreferencesView,
  CustomerProfile,
  CustomerRepository,
  FollowedSellerView,
  OrderReferenceView,
  PageInput,
  PagedResult,
  PrivacyExportView,
  WishlistItemInput,
  WishlistItemView
} from '../../domain/ports/customer.repository';

type PrismaCustomer = Prisma.CustomerGetPayload<object>;
type PrismaAddress = Prisma.CustomerAddressGetPayload<object>;
type PrismaPreferences = Prisma.CustomerPreferencesGetPayload<object>;
type PrismaWishlistItem = Prisma.WishlistItemGetPayload<object>;
type PrismaFollowedSeller = Prisma.FollowedSellerGetPayload<object>;
type PrismaOrderReference = Prisma.CustomerOrderReferenceGetPayload<object>;
type PrismaPrivacyExport = Prisma.PrivacyExportRequestGetPayload<object>;

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCustomerByAuthUserId(authUserId: string): Promise<CustomerProfile | null> {
    const customer = await this.prisma.customer.findUnique({ where: { authUserId } });
    return customer ? this.mapCustomer(customer) : null;
  }

  async findCustomerById(customerId: string): Promise<CustomerProfile | null> {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    return customer ? this.mapCustomer(customer) : null;
  }

  async findCustomerByShareToken(shareToken: string): Promise<CustomerProfile | null> {
    const share = await this.prisma.wishlistShare.findUnique({
      where: { shareToken },
      include: { customer: true }
    });

    if (!share || (share.expiresAt && share.expiresAt <= new Date())) {
      return null;
    }

    return this.mapCustomer(share.customer);
  }

  ensureCustomer(input: CustomerActor): Promise<CustomerProfile> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.customer.findUnique({
        where: { authUserId: input.authUserId }
      });

      if (existing) {
        return this.mapCustomer(existing);
      }

      const customer = await tx.customer.create({
        data: {
          authUserId: input.authUserId,
          email: input.email,
          displayName: input.email
        }
      });

      await tx.customerPreferences.create({
        data: { customerId: customer.id }
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate(
          customerProfileCreatedEvent({
            customerId: customer.id,
            authUserId: customer.authUserId,
            email: customer.email
          })
        )
      });

      return this.mapCustomer(customer);
    });
  }

  createCustomerFromAuthEvent(input: {
    authUserId: string;
    email: string;
    displayName?: string;
    outboxEvent: DomainEventDraft;
  }): Promise<CustomerProfile> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.customer.findUnique({
        where: { authUserId: input.authUserId }
      });

      if (existing) {
        return this.mapCustomer(existing);
      }

      const customer = await tx.customer.create({
        data: {
          authUserId: input.authUserId,
          email: input.email,
          displayName: input.displayName
        }
      });

      await tx.customerPreferences.create({
        data: { customerId: customer.id }
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate({
          ...input.outboxEvent,
          payload: {
            ...input.outboxEvent.payload,
            customerId: customer.id
          }
        })
      });

      return this.mapCustomer(customer);
    });
  }

  updateProfile(input: {
    authUserId: string;
    displayName?: string;
    phone?: string;
    birthDate?: Date | null;
    outboxEvent: DomainEventDraft;
  }): Promise<CustomerProfile> {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.update({
        where: { authUserId: input.authUserId },
        data: {
          displayName: input.displayName,
          phone: input.phone,
          birthDate: input.birthDate
        }
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate(input.outboxEvent)
      });

      return this.mapCustomer(customer);
    });
  }

  async listAddresses(customerId: string): Promise<CustomerAddressView[]> {
    const addresses = await this.prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });

    return addresses.map((address) => this.mapAddress(address));
  }

  addAddress(input: { customerId: string; address: AddressInput; outboxEvent: DomainEventDraft }): Promise<CustomerAddressView> {
    return this.prisma.$transaction(async (tx) => {
      if (input.address.isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId: input.customerId },
          data: { isDefault: false }
        });
      }

      const address = await tx.customerAddress.create({
        data: {
          ...this.toAddressCreate(input.address),
          customerId: input.customerId
        }
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate({
          ...input.outboxEvent,
          payload: { ...input.outboxEvent.payload, addressId: address.id }
        })
      });

      return this.mapAddress(address);
    });
  }

  updateAddress(input: { customerId: string; addressId: string; address: AddressPatch; outboxEvent: DomainEventDraft }): Promise<CustomerAddressView | null> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.customerAddress.findFirst({
        where: { id: input.addressId, customerId: input.customerId }
      });

      if (!existing) {
        return null;
      }

      if (input.address.isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId: input.customerId },
          data: { isDefault: false }
        });
      }

      const address = await tx.customerAddress.update({
        where: { id: input.addressId },
        data: this.toAddressUpdate(input.address)
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate(input.outboxEvent)
      });

      return this.mapAddress(address);
    });
  }

  deleteAddress(input: { customerId: string; addressId: string; outboxEvent: DomainEventDraft }): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.customerAddress.deleteMany({
        where: { id: input.addressId, customerId: input.customerId }
      });

      if (result.count === 0) {
        return false;
      }

      await tx.outboxEvent.create({
        data: this.toOutboxCreate(input.outboxEvent)
      });

      return true;
    });
  }

  setDefaultAddress(input: { customerId: string; addressId: string; outboxEvent: DomainEventDraft }): Promise<CustomerAddressView | null> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.customerAddress.findFirst({
        where: { id: input.addressId, customerId: input.customerId }
      });

      if (!existing) {
        return null;
      }

      await tx.customerAddress.updateMany({
        where: { customerId: input.customerId },
        data: { isDefault: false }
      });

      const address = await tx.customerAddress.update({
        where: { id: input.addressId },
        data: { isDefault: true }
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate(input.outboxEvent)
      });

      return this.mapAddress(address);
    });
  }

  async getPreferences(customerId: string): Promise<CustomerPreferencesView> {
    const preferences = await this.prisma.customerPreferences.upsert({
      where: { customerId },
      update: {},
      create: { customerId }
    });

    return this.mapPreferences(preferences);
  }

  updatePreferences(input: {
    customerId: string;
    preferences: CustomerPreferencesPatch;
    outboxEvent: DomainEventDraft;
  }): Promise<CustomerPreferencesView> {
    return this.prisma.$transaction(async (tx) => {
      const preferences = await tx.customerPreferences.upsert({
        where: { customerId: input.customerId },
        update: input.preferences,
        create: {
          customerId: input.customerId,
          ...input.preferences
        }
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate(input.outboxEvent)
      });

      return this.mapPreferences(preferences);
    });
  }

  async listWishlistItems(customerId: string): Promise<WishlistItemView[]> {
    const items = await this.prisma.wishlistItem.findMany({
      where: { customerId },
      orderBy: { addedAt: 'desc' }
    });

    return items.map((item) => this.mapWishlistItem(item));
  }

  addWishlistItem(input: { customerId: string; item: WishlistItemInput; outboxEvent: DomainEventDraft }): Promise<WishlistItemView> {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.wishlistItem.upsert({
        where: {
          customerId_listingId: {
            customerId: input.customerId,
            listingId: input.item.listingId
          }
        },
        update: {
          sellerId: input.item.sellerId,
          notes: input.item.notes
        },
        create: {
          customerId: input.customerId,
          listingId: input.item.listingId,
          sellerId: input.item.sellerId,
          notes: input.item.notes
        }
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate(input.outboxEvent)
      });

      return this.mapWishlistItem(item);
    });
  }

  removeWishlistItem(input: { customerId: string; itemId: string; outboxEvent: DomainEventDraft }): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.wishlistItem.deleteMany({
        where: { id: input.itemId, customerId: input.customerId }
      });

      if (result.count === 0) {
        return false;
      }

      await tx.outboxEvent.create({
        data: this.toOutboxCreate(input.outboxEvent)
      });

      return true;
    });
  }

  createWishlistShare(input: { customerId: string; shareToken: string; outboxEvent: DomainEventDraft }): Promise<{ shareToken: string }> {
    return this.prisma.$transaction(async (tx) => {
      const share = await tx.wishlistShare.create({
        data: {
          customerId: input.customerId,
          shareToken: input.shareToken
        }
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate(input.outboxEvent)
      });

      return { shareToken: share.shareToken };
    });
  }

  async listSharedWishlistItems(shareToken: string): Promise<WishlistItemView[]> {
    const customer = await this.findCustomerByShareToken(shareToken);

    if (!customer) {
      return [];
    }

    return this.listWishlistItems(customer.id);
  }

  async listFollowedSellers(customerId: string): Promise<FollowedSellerView[]> {
    const sellers = await this.prisma.followedSeller.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });

    return sellers.map((seller) => this.mapFollowedSeller(seller));
  }

  followSeller(input: { customerId: string; sellerId: string; outboxEvent: DomainEventDraft }): Promise<FollowedSellerView> {
    return this.prisma.$transaction(async (tx) => {
      const seller = await tx.followedSeller.upsert({
        where: {
          customerId_sellerId: {
            customerId: input.customerId,
            sellerId: input.sellerId
          }
        },
        update: {},
        create: {
          customerId: input.customerId,
          sellerId: input.sellerId
        }
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate(input.outboxEvent)
      });

      return this.mapFollowedSeller(seller);
    });
  }

  unfollowSeller(input: { customerId: string; sellerId: string; outboxEvent: DomainEventDraft }): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.followedSeller.deleteMany({
        where: {
          customerId: input.customerId,
          sellerId: input.sellerId
        }
      });

      if (result.count > 0) {
        await tx.outboxEvent.create({
          data: this.toOutboxCreate(input.outboxEvent)
        });
      }

      return result.count > 0;
    });
  }

  async listOrderReferences(customerId: string, page: PageInput): Promise<PagedResult<OrderReferenceView>> {
    const skip = (page.page - 1) * page.pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.customerOrderReference.findMany({
        where: { customerId },
        orderBy: { placedAt: 'desc' },
        skip,
        take: page.pageSize
      }),
      this.prisma.customerOrderReference.count({ where: { customerId } })
    ]);

    return {
      items: items.map((item) => this.mapOrderReference(item)),
      page: page.page,
      pageSize: page.pageSize,
      total
    };
  }

  upsertOrderReference(input: {
    authUserId: string;
    email: string;
    orderId: string;
    status: string;
    totalAmountCents?: number;
    currency?: string;
    placedAt?: Date;
  }): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findUnique({
        where: { authUserId: input.authUserId }
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            authUserId: input.authUserId,
            email: input.email,
            displayName: input.email
          }
        });

        await tx.customerPreferences.create({
          data: { customerId: customer.id }
        });
      }

      await tx.customerOrderReference.upsert({
        where: { orderId: input.orderId },
        update: {
          status: input.status,
          totalAmountCents: input.totalAmountCents,
          currency: input.currency,
          placedAt: input.placedAt
        },
        create: {
          customerId: customer.id,
          orderId: input.orderId,
          status: input.status,
          totalAmountCents: input.totalAmountCents,
          currency: input.currency,
          placedAt: input.placedAt
        }
      });
    }).then(() => undefined);
  }

  updateOrderReferenceStatus(input: { orderId: string; status: string }): Promise<void> {
    return this.prisma.customerOrderReference
      .updateMany({
        where: { orderId: input.orderId },
        data: { status: input.status }
      })
      .then(() => undefined);
  }

  createPrivacyExport(input: { customerId: string; outboxEvent: DomainEventDraft }): Promise<PrivacyExportView> {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.privacyExportRequest.create({
        data: { customerId: input.customerId }
      });

      await tx.outboxEvent.create({
        data: this.toOutboxCreate({
          ...input.outboxEvent,
          payload: { ...input.outboxEvent.payload, requestId: request.id }
        })
      });

      return this.mapPrivacyExport(request);
    });
  }

  async listPrivacyExports(customerId: string): Promise<PrivacyExportView[]> {
    const requests = await this.prisma.privacyExportRequest.findMany({
      where: { customerId },
      orderBy: { requestedAt: 'desc' }
    });

    return requests.map((request) => this.mapPrivacyExport(request));
  }

  async getPrivacyExport(input: { customerId: string; requestId: string }): Promise<PrivacyExportView | null> {
    const request = await this.prisma.privacyExportRequest.findFirst({
      where: {
        id: input.requestId,
        customerId: input.customerId
      }
    });

    return request ? this.mapPrivacyExport(request) : null;
  }

  private mapCustomer(customer: PrismaCustomer): CustomerProfile {
    return {
      id: customer.id,
      authUserId: customer.authUserId,
      email: customer.email,
      displayName: customer.displayName,
      phone: customer.phone,
      birthDate: customer.birthDate,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  }

  private mapAddress(address: PrismaAddress): CustomerAddressView {
    return {
      id: address.id,
      label: address.label ?? undefined,
      recipientName: address.recipientName,
      phone: address.phone ?? undefined,
      country: address.country,
      state: address.state,
      city: address.city,
      neighborhood: address.neighborhood ?? undefined,
      street: address.street,
      number: address.number,
      complement: address.complement ?? undefined,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt
    };
  }

  private mapPreferences(preferences: PrismaPreferences): CustomerPreferencesView {
    return {
      marketingEmailOptIn: preferences.marketingEmailOptIn,
      marketingSmsOptIn: preferences.marketingSmsOptIn,
      marketingPushOptIn: preferences.marketingPushOptIn,
      orderUpdatesOptIn: preferences.orderUpdatesOptIn,
      sellerUpdatesOptIn: preferences.sellerUpdatesOptIn,
      locale: preferences.locale,
      currency: preferences.currency
    };
  }

  private mapWishlistItem(item: PrismaWishlistItem): WishlistItemView {
    return {
      id: item.id,
      listingId: item.listingId,
      sellerId: item.sellerId,
      notes: item.notes,
      addedAt: item.addedAt
    };
  }

  private mapFollowedSeller(seller: PrismaFollowedSeller): FollowedSellerView {
    return {
      id: seller.id,
      sellerId: seller.sellerId,
      createdAt: seller.createdAt
    };
  }

  private mapOrderReference(order: PrismaOrderReference): OrderReferenceView {
    return {
      id: order.id,
      orderId: order.orderId,
      status: order.status,
      totalAmountCents: order.totalAmountCents,
      currency: order.currency,
      placedAt: order.placedAt,
      updatedAt: order.updatedAt
    };
  }

  private mapPrivacyExport(request: PrismaPrivacyExport): PrivacyExportView {
    return {
      id: request.id,
      status: request.status,
      requestedAt: request.requestedAt,
      completedAt: request.completedAt,
      downloadUrl: request.downloadUrl
    };
  }

  private toAddressCreate(address: AddressInput) {
    return {
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      country: address.country,
      state: address.state,
      city: address.city,
      neighborhood: address.neighborhood,
      street: address.street,
      number: address.number,
      complement: address.complement,
      postalCode: address.postalCode,
      isDefault: address.isDefault ?? false
    };
  }

  private toAddressUpdate(address: AddressPatch) {
    return {
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      country: address.country,
      state: address.state,
      city: address.city,
      neighborhood: address.neighborhood,
      street: address.street,
      number: address.number,
      complement: address.complement,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    };
  }

  private toOutboxCreate(event: DomainEventDraft) {
    return {
      topic: event.topic,
      type: event.type,
      payload: event.payload as Prisma.InputJsonValue
    };
  }
}

