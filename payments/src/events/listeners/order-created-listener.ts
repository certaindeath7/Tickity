import { Listener, Subjects, IOrderCreatedEvent } from '@zenitsu/sharedlogic';
import { queueGroupName } from '../queue-group-name';
import { Message } from 'node-nats-streaming';
import Order from '../../model/Order';

export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: IOrderCreatedEvent['data'], msg: Message) {
    // find the order that is pending to be paid
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });

    await order.save();

    msg.ack();
  }
}
