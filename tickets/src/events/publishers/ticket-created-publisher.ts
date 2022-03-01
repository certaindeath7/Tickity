import { Publisher, Subjects, ITicketCreatedEvent } from "@zenitsu/sharedlogic";

export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
