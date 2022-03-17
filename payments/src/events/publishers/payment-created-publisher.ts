import { Publisher, Subjects, IPaymentCreatedEvent } from '@zenitsu/sharedlogic';

export class PaymentCreatedPublisher extends Publisher<IPaymentCreatedEvent> {
  readonly subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
