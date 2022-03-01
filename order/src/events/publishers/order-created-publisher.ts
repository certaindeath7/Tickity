import { Publisher, Subjects, IOrderCreatedEvent } from '@zenitsu/sharedlogic';

export class OrderCreatedPublisher extends Publisher<IOrderCreatedEvent> {
  readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
