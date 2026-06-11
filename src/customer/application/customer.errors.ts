export type CustomerErrorCode = 'CUSTOMER_NOT_FOUND' | 'ADDRESS_NOT_FOUND' | 'WISHLIST_ITEM_NOT_FOUND' | 'PRIVACY_EXPORT_NOT_FOUND';

export class CustomerApplicationError extends Error {
  constructor(
    readonly code: CustomerErrorCode,
    message: string
  ) {
    super(message);
  }
}

export const customerError = (code: CustomerErrorCode, message: string) => new CustomerApplicationError(code, message);

