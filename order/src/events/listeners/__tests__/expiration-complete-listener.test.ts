import mongoose from 'mongoose';
import Ticket from '../../../models/Ticket';
import Order from '../../../models/Orders';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complte-listener';
import { IExpirationComplete, OrderStatus } from '@zenitsu/sharedlogic';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // Create an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'hello',
    price: 20,
  });
  await ticket.save();

  // Create an order;
  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'ueddddd',
    expiresAt: new Date(),
    tickets: ticket,
  });
  await order.save();

  // Emmit fake event
  const data: IExpirationComplete['data'] = {
    orderId: order.id,
  };

  // Create a sample message object
  // create fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket, order };
};

it('updates the order status to cancelled', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const udpatedOrder = await Order.findById(order.id);
  expect(udpatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  console.log(eventData);

  expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
