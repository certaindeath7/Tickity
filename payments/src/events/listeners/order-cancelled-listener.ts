import { Listener, IOrderCancelledEvent, Subjects, OrderStatus } from '@zenitsu/sharedlogic';
import { Message } from 'node-nats-streaming';
import Order from '../../model/Order';
import { natsWrapper } from '../../nats-wrapper';
import { queueGroupName } from '../queue-group-name';

export class OrderCancelledListener extends Listener<IOrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: IOrderCancelledEvent['data'], msg: Message) {
    // find a document that matched witht the condition
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });
    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
