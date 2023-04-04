import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Order, OrderStatus } from '../../../models/order';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteEvent } from '@fekatickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  await ticket.save();

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket: ticket,
  });

  await order.save();

  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // data
  const data: ExpirationCompleteEvent['data'] = { orderId: order.id };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { data, listener, msg };
};

it('sets order status to cancellled', async () => {
  const { listener, msg, data } = await setup();
  await listener.onMessage(data, msg);
  const order = await Order.findById(data.orderId);
  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, msg, data } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('emits order cancelled event', async () => {
  const { listener, msg, data } = await setup();
  await listener.onMessage(data, msg);
  const order = await Order.findById(data.orderId);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order!.id);
});
