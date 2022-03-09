import { Listener, IExpirationComplete, Subjects, OrderStatus } from '@zenitsu/sharedlogic';
import { Message } from 'node-nats-streaming';
import Order from '../../models/Orders';
import { queueGroupName } from './queue-group-names';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
export class ExpirationCompleteListener extends Listener<IExpirationComplete> {
  queueGroupName = queueGroupName;
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

  async onMessage(data: IExpirationComplete['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');
    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Cancelled,
    });
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      tickets: {
        id: order._id,
      },
    });
    await order.save();
    msg.ack();
  }
}
