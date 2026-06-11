import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { CUSTOMER_REPOSITORY } from './domain/ports/customer.repository';
import { ListOrderHistoryUseCase } from './application/use-cases/list-order-history.use-case';
import { ManageAddressesUseCase } from './application/use-cases/manage-addresses.use-case';
import { ManageFollowedSellersUseCase } from './application/use-cases/manage-followed-sellers.use-case';
import { ManagePreferencesUseCase } from './application/use-cases/manage-preferences.use-case';
import { ManagePrivacyExportsUseCase } from './application/use-cases/manage-privacy-exports.use-case';
import { ManageProfileUseCase } from './application/use-cases/manage-profile.use-case';
import { ManageWishlistUseCase } from './application/use-cases/manage-wishlist.use-case';
import { SyncCustomerFromAuthEventUseCase } from './application/use-cases/sync-customer-from-auth-event.use-case';
import { SyncOrderReferenceUseCase } from './application/use-cases/sync-order-reference.use-case';
import { PrismaCustomerRepository } from './infrastructure/persistence/prisma-customer.repository';
import { CustomerController } from './interfaces/http/customer.controller';
import { AccessTokenGuard } from './interfaces/http/guards/access-token.guard';
import { CustomerEventsConsumer } from './interfaces/kafka/customer-events.consumer';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CustomerController, CustomerEventsConsumer],
  providers: [
    PrismaService,
    ManageProfileUseCase,
    ManageAddressesUseCase,
    ManagePreferencesUseCase,
    ManageWishlistUseCase,
    ManageFollowedSellersUseCase,
    ListOrderHistoryUseCase,
    ManagePrivacyExportsUseCase,
    SyncCustomerFromAuthEventUseCase,
    SyncOrderReferenceUseCase,
    AccessTokenGuard,
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository }
  ]
})
export class CustomerModule {}
