import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/auth-helper';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns 404 if provided id doesnt exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .patch(`/api/tickets/${id}`)
    .set('Cookie', signin())
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(404);
});

it('returns 401 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .patch(`/api/tickets/${id}`)
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(401);
});

it('returns 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(201);

  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set('Cookie', signin())
    .send({ title: 'concert2', price: 40 })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(201);

  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: -10 })
    .expect(400);
});

it('returns a 400 if the ticket is reserved', async () => {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket?.save();

  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'heyyy', price: 1000 })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(201);
  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'newConcert', price: 10 })
    .expect(200);
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();
  expect(ticketResponse.body.title).toEqual('newConcert');
});

it(' to publish an event', async () => {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(201);
  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'newConcert', price: 10 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
