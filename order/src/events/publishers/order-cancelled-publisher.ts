import { Publisher, Subjects, IOrderCancelledEvent } from '@zenitsu/sharedlogic';

export class OrderCancelledPublisher extends Publisher<IOrderCancelledEvent> {
  readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
