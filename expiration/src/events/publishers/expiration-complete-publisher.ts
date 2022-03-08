import { Publisher, Subjects, IExpirationComplete } from '@zenitsu/sharedlogic';

export class ExpirationCompletePublisher extends Publisher<IExpirationComplete> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
