import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@fekatickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { price, title, id, version } = data;
    const ticket = await Ticket.findByEvent({ id, version });

    if (!ticket) {
      throw new Error();
    }

    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
