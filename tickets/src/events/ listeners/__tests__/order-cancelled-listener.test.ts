import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import Ticket from '../../../models/Tickets';
import { IOrderCancelledEvent, OrderStatus } from '@zenitsu/sharedlogic';
import mongoose from 'mongoose';
const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create and save a ticket
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'hello',
    price: 12,
    userId: 'dfsdfasdf',
  });
  ticket.set({ orderId });
  await ticket.save();

  const data: IOrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(), // a mock function
  };

  return { msg, data, ticket, orderId, listener };
};

it('updates the ticket, publishes the event and acks the message', async () => {
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const updatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  console.log(updatedData);

  expect(data.version).toEqual(updatedData.version - 1);
});
