import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import Order from '../../../model/Order';
import mongoose from 'mongoose';
import { IOrderCancelledEvent, OrderStatus } from '@zenitsu/sharedlogic';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create and save an order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 19,
    userId: 'sdfasdfas',
    version: 0,
  });

  await order.save();

  const data: IOrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'asdfasdfasd',
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(), // a mock function
  };

  return { msg, data, order, listener };
};

it('updates order status to cancelled', async () => {
  const { msg, data, order, listener } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(data.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
