import request from 'supertest';
import Order from '../../models/Orders';
import Ticket from '../../models/Ticket';
import mongoose from 'mongoose';
import { app } from '../../app';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'hello',
    price: 20,
  });
  await ticket.save();

  return ticket;
};
it('fetches order for a particular user', async () => {
  // create 3 tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  //create user1
  const userOne = global.signin();
  //create user2
  const userTwo = global.signin();
  // create 1 order for user #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
      ticketId: ticketOne.id,
    })
    .expect(201);

  // create 2 orders to user #2
  const { body: order1 } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({
      ticketId: ticketTwo.id,
    })
    .expect(201);

  const { body: order2 } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({
      ticketId: ticketThree.id,
    })
    .expect(201);

  // make request to get orders from user2
  const response = await request(app).get('/api/orders').set('Cookie', userTwo).expect(200);

  // make sure we only received back orders from user2
  expect(response.body.length).toEqual(2);
  expect(order1.id).toEqual(response.body[0].id);
  expect(order2.id).toEqual(response.body[1].id);
});
