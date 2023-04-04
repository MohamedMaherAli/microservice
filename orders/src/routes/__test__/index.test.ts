import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket, TicketDoc } from '../../models/ticket';
import { OrderStatus } from '../../models/order';
import { signin } from '../../test/auth-helper';
import mongoose from 'mongoose';

let randomId = () => new mongoose.Types.ObjectId().toString();

const buildTicket = async (title: string, price: number, id: string) => {
  const ticket = Ticket.build({ title, price, id });
  await ticket.save();
  return ticket;
};

it('fetches orders for particular user', async () => {
  // build 3 tickets
  const ticket1 = await buildTicket('concert1', 20, randomId());
  const ticket2 = await buildTicket('concert2', 20, randomId());
  const ticket3 = await buildTicket('concert3', 20, randomId());

  const userOne = signin();
  const userTwo = signin();
  // build order with one ticket to user#1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket1.id })
    .expect(201);

  // build order with one ticket to user#2
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticket2.id })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticket3.id })
    .expect(201);

  // make request for user 2 and expect to get 2 orders
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
});
