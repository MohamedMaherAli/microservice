import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/auth-helper';
import mongoose from 'mongoose';

it('returns 404 if ticket NOT found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('return ticket if found', async () => {
  const title = 'cinema';
  const price = 20;
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({ title, price })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

it('', async () => {});

it('', async () => {});
