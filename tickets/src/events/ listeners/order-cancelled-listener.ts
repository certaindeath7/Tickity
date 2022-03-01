import { Listener, IOrderCancelledEvent, Subjects } from '@zenitsu/sharedlogic';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-names';
import { TicketUpdatePublisher } from '../publishers/ticket-update-publisher';
import Ticket from '../../models/Tickets';
import { natsWrapper } from '../../nats-wrapper';

export class OrderCancelledListener extends Listener<IOrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: IOrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.tickets.id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ orderId: undefined });
    await ticket.save();

    await new TicketUpdatePublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      version: ticket.version,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
