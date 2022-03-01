import { Listener, IOrderCreatedEvent, Subjects } from '@zenitsu/sharedlogic';
import { queueGroupName } from './queue-group-names';
import { Message } from 'node-nats-streaming';
import Ticket from '../../models/Tickets';
import { TicketUpdatePublisher } from '../publishers/ticket-update-publisher';
export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: IOrderCreatedEvent['data'], msg: Message) {
    // find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.tickets.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // mark the ticket as being reserved
    ticket.set({ orderId: data.id });

    // save the ticket
    await ticket.save();

    await new TicketUpdatePublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      version: ticket.version,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });
    // ack the message
    msg.ack();
  }
}
