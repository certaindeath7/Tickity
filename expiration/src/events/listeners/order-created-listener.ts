import { Listener, Subjects, IOrderCreatedEvent } from '@zenitsu/sharedlogic';
import { queueGroupName } from './queue-group-names';
import { Message } from 'node-nats-streaming';
import expirationQueue from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: IOrderCreatedEvent['data'], msg: Message) {
    // get the difference time between when the order is expired and current time in miliseconds
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(delay);

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      }
    );

    msg.ack();
  }
}
