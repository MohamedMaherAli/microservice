import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/auth-helper';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

let randomId = new mongoose.Types.ObjectId().toString();

it('fetches order', async () => {
  // create a ticket
  const ticket = Ticket.build({ title: 'concert', price: 20, id: randomId });
  await ticket.save();
  const cookie = signin();
  // create a request to build order with that ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // request to getch this order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);
});
