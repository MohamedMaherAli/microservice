import { OrderCancelledEvent } from '@fekatickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedPublisher } from '../../publishers/ticket-created-publisher';
import { OrderCancelledListener } from '../order-cancelled-listener';
const setup = async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  // create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 50,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  ticket.set({ orderId: orderId });
  await ticket.save();

  // listener
  const listener = new OrderCancelledListener(natsWrapper.client);
  // data
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };
  // msg
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, listener };
};

it('cancels order, publishes event, acks the message', async () => {
  const { data, msg, listener } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.ticket.id);

  expect(ticket!.orderId).not.toBeDefined();

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  expect(msg.ack).toHaveBeenCalled();
});
