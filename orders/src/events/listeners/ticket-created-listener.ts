import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketCreatedEvent } from '@fekatickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { price, title, id } = data;
    const ticket = Ticket.build({ title, price, id });
    await ticket.save();
    msg.ack();
  }
}
