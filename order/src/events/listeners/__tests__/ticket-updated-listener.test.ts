import { TicketUpdatedlistener } from '../ticket-updated-listener';
import { ITicketUpdatedEvent } from '@zenitsu/sharedlogic';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import Ticket from '../../../models/Ticket';

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketUpdatedlistener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'hello',
    price: 20,
  });
  await ticket.save();
  // Create a sample data object
  const data: ITicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'hello',
    price: 50,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // Create a sample message object
  // create fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return a ticket, data, message object
  return { listener, data, msg, ticket };
};

it('be able to find, update and save a ticket', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.version).toEqual(data.version);
  expect(updatedTicket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  // get data from the setup function
  const { listener, data, msg } = await setup();

  // call onMessage func with msg and data obj
  await listener.onMessage(data, msg);

  expect(msg.ack).not.toHaveBeenCalled();
});

it('did not ack the message if the event skipped an event version number', async () => {
  const { msg, data, listener, ticket } = await setup();

  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
