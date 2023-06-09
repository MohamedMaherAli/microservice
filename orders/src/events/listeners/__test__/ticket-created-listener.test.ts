import request from 'supertest';
import { TicketCreatedListener } from '../ticket-created-listener';
import { TicketCreatedEvent } from '@fekatickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // creates an instance of a listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'concert',
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
  };
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage func with data object and message object
  await listener.onMessage(data, msg);
  // write assertions to make sure the ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage func with data object and message object
  await listener.onMessage(data, msg);
  // write assertions to make sure the ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
