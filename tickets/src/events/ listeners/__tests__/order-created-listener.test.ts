import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import Ticket from '../../../models/Tickets';
import { IOrderCreatedEvent, OrderStatus } from '@zenitsu/sharedlogic';
import mongoose from 'mongoose';
const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'hello',
    price: 12,
    userId: 'dfsdfasdf',
  });

  await ticket.save();

  // create the data event
  const data: IOrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'dddddd',
    expiresAt: 'dd',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // create fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, data, msg };
};

it('sets the userId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});
it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const updatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  console.log(updatedData);

  expect(data.id).toEqual(updatedData.orderId);
});
