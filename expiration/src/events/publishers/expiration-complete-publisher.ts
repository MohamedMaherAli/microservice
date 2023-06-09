import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from '@fekatickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
