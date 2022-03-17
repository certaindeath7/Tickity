import request from 'supertest';
import { app } from '../../app'; // express app
import mongoose from 'mongoose';
import { OrderStatus } from '@zenitsu/sharedlogic';
import Order from '../../model/Order';
import Payment from '../../model/Payment';
import stripe from '../../stripe';

it('throws 401 error if the user is not authenticated', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 14,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .send({
      token: 'asdfasdf',
      id: order.id,
    })
    .expect(401);
});

it('throws 404 error when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'sadfasdfa',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('throws 400 error when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 14,
    status: OrderStatus.Cancelled,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'asdfasdf',
      id: order.id,
    })
    .expect(400);
});

it('returns 201 with a valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: price,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  // list of the charges
  const stripeCharges = await stripe.charges.list({ limit: 10 });
  const stripeCharge = stripeCharges.data.find(({ amount }) => {
    // return the first charge element that has the price equal to the order's price
    return amount === price * 100;
  });
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('aud');

  const payment = Payment.findOne({
    id: stripeCharge!.id,
    orderId: order.id,
  });

  expect(payment).not.toBeNull();
});
