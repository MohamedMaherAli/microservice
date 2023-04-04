import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { signin } from '../../test/auth-helper';
import { Order } from '../../models/order';
import { OrderStatus } from '@fekatickets/common';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';

it('throws 404 error if order not found', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
      token: 'adasd',
    })
    .expect(404);
});

it('returns 401 error if the order doesnt belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({ token: 'asdasd', orderId: order.id })
    .expect(401);
});

it('returns a 400 if the order is cancelled or expired', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Cancelled,
    userId,
    price: 20,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      token: 'asdsgfd',
      orderId: order.id,
    })
    .expect(400);
});

it('returns 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId,
    price,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    chargeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();
});
