import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { SyncCustomerFromAuthEventUseCase } from '../../application/use-cases/sync-customer-from-auth-event.use-case';
import { SyncOrderReferenceUseCase } from '../../application/use-cases/sync-order-reference.use-case';

@Controller()
export class CustomerEventsConsumer {
  constructor(
    private readonly syncCustomerFromAuthEventUseCase: SyncCustomerFromAuthEventUseCase,
    private readonly syncOrderReferenceUseCase: SyncOrderReferenceUseCase
  ) {}

  @EventPattern('auth.user.registered.v1')
  async handleUserRegistered(@Payload() payload: unknown, @Ctx() context: KafkaContext): Promise<void> {
    await this.syncCustomerFromAuthEventUseCase.execute(payload);
    this.logConsumed(context, payload);
  }

  @EventPattern('orders.order.created.v1')
  async handleOrderCreated(@Payload() payload: unknown, @Ctx() context: KafkaContext): Promise<void> {
    await this.syncOrderReferenceUseCase.upsertFromOrderCreated(payload);
    this.logConsumed(context, payload);
  }

  @EventPattern('orders.order.status_changed.v1')
  async handleOrderStatusChanged(@Payload() payload: unknown, @Ctx() context: KafkaContext): Promise<void> {
    await this.syncOrderReferenceUseCase.updateFromStatusChanged(payload);
    this.logConsumed(context, payload);
  }

  private logConsumed(context: KafkaContext, payload: unknown): void {
    console.log('[customer-service] consumed integration event', {
      topic: context.getTopic(),
      partition: context.getPartition(),
      offset: context.getMessage().offset,
      payload
    });
  }
}

