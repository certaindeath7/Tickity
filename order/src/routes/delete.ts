import express, { Response, Request } from 'express';
import { requireAuth } from '@zenitsu/sharedlogic';
import Order from '../models/Orders';
import { OrderStatus } from '@zenitsu/sharedlogic';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId).populate('ticket');

  if (!order) {
    return res.status(404).json({ errors: [{ msg: 'orders not existed' }] });
  }
  if (order.userId !== req.currentUser!.id) {
    return res.status(401).json({ errors: [{ msg: 'not authorized user' }] });
  }
  order.status = OrderStatus.Cancelled;
  await order.save();

  // publish an event announcing the order has been cancelled
  await new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    tickets: {
      id: order._id,
    },
  });

  res.status(204).send(order);
});

export { router as deleteOrdersRouter };
