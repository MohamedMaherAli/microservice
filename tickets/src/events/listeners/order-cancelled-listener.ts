import { Listener, OrderCancelledEvent, Subjects } from '@fekatickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // find the ticket
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error('ticket not found');
    }

    // update it
    ticket.set({ orderId: undefined });
    await ticket.save();

    // publish an event
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      userId: ticket.userId,
      price: ticket.price,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
