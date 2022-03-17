import { Subjects, Listener, IPaymentCreatedEvent, OrderStatus } from '@zenitsu/sharedlogic';
import { Message } from 'node-nats-streaming';
import Order from '../../models/Orders';
import { queueGroupName } from './queue-group-names';

export class PaymentCreatedListener extends Listener<IPaymentCreatedEvent> {
  readonly subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: IPaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('No order has been paid');
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();
    msg.ack();
  }
}
