import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@fekatickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  // create a ticket and save it to database
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();
  //  create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'concert50',
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 50,
  };
  // create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return all
  return { data, msg, listener };
};

it('finds updates and saves a ticket', async () => {
  const { data, msg, listener } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(data.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage func with data object and message object
  await listener.onMessage(data, msg);
  // write assertions to make sure the ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it('doesnt call an ack if the event has skipped a version', async () => {
  const { data, msg, listener } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (error) {
    expect(error).toBeDefined();
  }
  expect(msg.ack).not.toHaveBeenCalled();
});
