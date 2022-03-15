import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { IOrderCreatedEvent, OrderStatus } from '@zenitsu/sharedlogic';
import { Message } from 'node-nats-streaming';
import Order from '../../../model/Order';
const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: IOrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'dfasdfasdfa',
    userId: 'dsfasdfasd',
    status: OrderStatus.Created,
    tickets: {
      id: 'asdfasdf',
      price: 111,
    },
  };
  // create fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('order info is retrieved correctly', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  // expect the order ID is the same
  expect(order).toBeDefined();
  expect(order!.price).toEqual(data.tickets.price);
});

it('acks the message', async () => {
  // get data from the setup function
  const { listener, data, msg } = await setup();

  // call onMessage func with msg and data obj
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
