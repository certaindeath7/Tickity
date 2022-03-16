import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, requestValidate, OrderStatus } from '@zenitsu/sharedlogic';
import Order from '../model/Order';
const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  requestValidate,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ errors: [{ msg: 'tickets not existed' }] });
    }
    if (order.userId !== req.currentUser!.id) {
      return res.status(401).json({ errors: [{ msg: 'Not authorized' }] });
    }
    if (order.status === OrderStatus.Cancelled) {
      return res.status(400).json({ errors: [{ msg: 'order has been cancelled' }] });
    }
  }
);

export { router as newChargeRouter };
