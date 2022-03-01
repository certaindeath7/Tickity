import express, { Response, Request } from 'express';
import { requireAuth } from '@zenitsu/sharedlogic';
import Order from '../models/Orders';

const router = express.Router();

router.get('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.orderId).populate('ticket');
  if (!order) {
    // Send a JSON response.
    return res.status(404).json({ errors: [{ msg: 'orders not existed' }] });
  }

  if (order.userId !== req.currentUser!.id) {
    return res.status(401).json({ errors: [{ msg: 'not authorized user' }] });
  }
  res.send(order);
});

export { router as showOrdersRouter };
