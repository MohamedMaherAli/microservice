import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { signin } from '../../test/auth-helper';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

let randomId = new mongoose.Types.ObjectId().toString();

it('has a route handler listens for /api/orders/ ', async () => {
  const response = await request(app).post('/api/orders/').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const response = await request(app).post('/api/orders/').send({});
  expect(response.status).toEqual(401);
});

it('does not return 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns a 400 if ticket id is not provided', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: '' });
  expect(response.status).toEqual(400);
});

it('returns an error if the ticket doesnt exist', async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  let ticket = Ticket.build({ title: 'ticket', price: 20, id: randomId });
  await ticket.save();

  let order = Order.build({
    userId: '12sdfsd',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket: ticket,
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {
  let ticket = Ticket.build({ title: 'ticket2', price: 200, id: randomId });

  await ticket.save();
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('Emits an order:created event', async () => {
  let ticket = Ticket.build({ title: 'ticket2', price: 200, id: randomId });

  await Order.deleteMany({ ticket });

  await ticket.save();
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
