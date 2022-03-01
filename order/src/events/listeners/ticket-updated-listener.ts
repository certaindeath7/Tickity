import { Subjects, Listener, ITicketUpdatedEvent } from '@zenitsu/sharedlogic';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-names';
import Ticket from '../../models/Ticket';

export class TicketUpdatedlistener extends Listener<ITicketUpdatedEvent> {
  readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: ITicketUpdatedEvent['data'], msg: Message) {
    // since this is updating the ticket
    // we need to find the ticket first
    const ticket = await Ticket.findTicketEvent(data);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();
    msg.ack();
  }
}
