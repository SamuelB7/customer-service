import { DomainEventDraft } from '../domain-event';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export type CustomerActor = {
  authUserId: string;
  email: string;
};

export type CustomerProfile = {
  id: string;
  authUserId: string;
  email: string;
  displayName?: string | null;
  phone?: string | null;
  birthDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AddressInput = {
  label?: string;
  recipientName: string;
  phone?: string;
  country: string;
  state: string;
  city: string;
  neighborhood?: string;
  street: string;
  number: string;
  complement?: string;
  postalCode: string;
  isDefault?: boolean;
};

export type AddressPatch = Partial<AddressInput>;

export type CustomerAddressView = AddressInput & {
  id: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerPreferencesView = {
  marketingEmailOptIn: boolean;
  marketingSmsOptIn: boolean;
  marketingPushOptIn: boolean;
  orderUpdatesOptIn: boolean;
  sellerUpdatesOptIn: boolean;
  locale: string;
  currency: string;
};

export type CustomerPreferencesPatch = Partial<CustomerPreferencesView>;

export type WishlistItemView = {
  id: string;
  listingId: string;
  sellerId?: string | null;
  notes?: string | null;
  addedAt: Date;
};

export type WishlistItemInput = {
  listingId: string;
  sellerId?: string;
  notes?: string;
};

export type FollowedSellerView = {
  id: string;
  sellerId: string;
  createdAt: Date;
};

export type OrderReferenceView = {
  id: string;
  orderId: string;
  status: string;
  totalAmountCents?: number | null;
  currency?: string | null;
  placedAt?: Date | null;
  updatedAt: Date;
};

export type PrivacyExportView = {
  id: string;
  status: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  requestedAt: Date;
  completedAt?: Date | null;
  downloadUrl?: string | null;
};

export type PageInput = {
  page: number;
  pageSize: number;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export interface CustomerRepository {
  findCustomerByAuthUserId(authUserId: string): Promise<CustomerProfile | null>;
  findCustomerById(customerId: string): Promise<CustomerProfile | null>;
  findCustomerByShareToken(shareToken: string): Promise<CustomerProfile | null>;
  ensureCustomer(input: CustomerActor): Promise<CustomerProfile>;
  createCustomerFromAuthEvent(input: { authUserId: string; email: string; displayName?: string; outboxEvent: DomainEventDraft }): Promise<CustomerProfile>;
  updateProfile(input: { authUserId: string; displayName?: string; phone?: string; birthDate?: Date | null; outboxEvent: DomainEventDraft }): Promise<CustomerProfile>;
  listAddresses(customerId: string): Promise<CustomerAddressView[]>;
  addAddress(input: { customerId: string; address: AddressInput; outboxEvent: DomainEventDraft }): Promise<CustomerAddressView>;
  updateAddress(input: { customerId: string; addressId: string; address: AddressPatch; outboxEvent: DomainEventDraft }): Promise<CustomerAddressView | null>;
  deleteAddress(input: { customerId: string; addressId: string; outboxEvent: DomainEventDraft }): Promise<boolean>;
  setDefaultAddress(input: { customerId: string; addressId: string; outboxEvent: DomainEventDraft }): Promise<CustomerAddressView | null>;
  getPreferences(customerId: string): Promise<CustomerPreferencesView>;
  updatePreferences(input: { customerId: string; preferences: CustomerPreferencesPatch; outboxEvent: DomainEventDraft }): Promise<CustomerPreferencesView>;
  listWishlistItems(customerId: string): Promise<WishlistItemView[]>;
  addWishlistItem(input: { customerId: string; item: WishlistItemInput; outboxEvent: DomainEventDraft }): Promise<WishlistItemView>;
  removeWishlistItem(input: { customerId: string; itemId: string; outboxEvent: DomainEventDraft }): Promise<boolean>;
  createWishlistShare(input: { customerId: string; shareToken: string; outboxEvent: DomainEventDraft }): Promise<{ shareToken: string }>;
  listSharedWishlistItems(shareToken: string): Promise<WishlistItemView[]>;
  listFollowedSellers(customerId: string): Promise<FollowedSellerView[]>;
  followSeller(input: { customerId: string; sellerId: string; outboxEvent: DomainEventDraft }): Promise<FollowedSellerView>;
  unfollowSeller(input: { customerId: string; sellerId: string; outboxEvent: DomainEventDraft }): Promise<boolean>;
  listOrderReferences(customerId: string, page: PageInput): Promise<PagedResult<OrderReferenceView>>;
  upsertOrderReference(input: {
    authUserId: string;
    email: string;
    orderId: string;
    status: string;
    totalAmountCents?: number;
    currency?: string;
    placedAt?: Date;
  }): Promise<void>;
  updateOrderReferenceStatus(input: { orderId: string; status: string }): Promise<void>;
  createPrivacyExport(input: { customerId: string; outboxEvent: DomainEventDraft }): Promise<PrivacyExportView>;
  listPrivacyExports(customerId: string): Promise<PrivacyExportView[]>;
  getPrivacyExport(input: { customerId: string; requestId: string }): Promise<PrivacyExportView | null>;
}

