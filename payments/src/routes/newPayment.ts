import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, requestValidate, OrderStatus } from '@zenitsu/sharedlogic';
import Order from '../model/Order';
import Payment from '../model/Payment';
import stripe from '../stripe';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

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

    const charge = await stripe.charges.create({
      currency: 'aud',
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({
      id: charge.id,
      orderId: orderId,
    });

    await payment.save();

    // publish an event that a payment has been made
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as newChargeRouter };
