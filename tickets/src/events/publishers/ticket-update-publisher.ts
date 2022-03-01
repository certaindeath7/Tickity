import { Publisher, Subjects, ITicketUpdatedEvent } from '@zenitsu/sharedlogic';

export class TicketUpdatePublisher extends Publisher<ITicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
