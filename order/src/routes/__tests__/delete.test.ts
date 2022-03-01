import request from 'supertest';
import { app } from '../../app';
import Ticket from '../../models/Ticket';
import mongoose from 'mongoose';
import { OrderStatus } from '@zenitsu/sharedlogic';
import Order from '../../models/Orders';

it('marks an order as cancelled', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'hello',
    price: 20,
  });
  await ticket.save();

  const user = global.signin();
  // make request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  // make a request to cancel the order
  await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user).send().expect(204);

  // make sure the order has tbeen cancelled
  const updateOrder = await Order.findById(order.id);
  expect(updateOrder!.status).toEqual(OrderStatus.Cancelled);
});

it.todo('emits an order has been cancelled event');
