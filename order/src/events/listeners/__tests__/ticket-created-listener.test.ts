import { TicketCreatedListener } from '../ticket-created-listener';
import { ITicketCreatedEvent } from '@zenitsu/sharedlogic';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import Ticket from '../../../models/Ticket';
const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // fake data event
  const data: ITicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'hello',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    orderId: undefined,
  };
  // create fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it('creates and saves the ticket', async () => {
  const { listener, data, msg } = await setup();

  // call onMessage func with msg and data obj
  await listener.onMessage(data, msg);
  const ticket = await Ticket.findById(data.id);
  // write assertion to make sure ticket was created

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  // get data from the setup function
  const { listener, data, msg } = await setup();

  // call onMessage func with msg and data obj
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
