import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ITicketCreatedEvent } from '@zenitsu/sharedlogic';
import { queueGroupName } from './queue-group-names';
import Ticket from '../../models/Ticket';

export class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: ITicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    await ticket.save();
    msg.ack();
  }
}
