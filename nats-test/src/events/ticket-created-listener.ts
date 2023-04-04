import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';

export class ticketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName: string = 'payments-service-queue-group';
  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    console.log('event data', data);
    msg.ack();
  }
}
