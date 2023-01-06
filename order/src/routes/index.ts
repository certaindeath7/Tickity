import express, { Response, Request } from 'express';
import { requireAuth } from '@zenitsu/sharedlogic';
import Order from '../models/Orders';
const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate('ticket');
  console.log(orders);
  res.send(orders);
});

export { router as indexOrdersRouter };
