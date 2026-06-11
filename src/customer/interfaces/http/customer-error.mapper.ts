import { NotFoundException } from '@nestjs/common';
import { CustomerApplicationError } from '../../application/customer.errors';

export function mapCustomerError(error: unknown): never {
  if (!(error instanceof CustomerApplicationError)) {
    throw error;
  }

  throw new NotFoundException(error.message);
}

