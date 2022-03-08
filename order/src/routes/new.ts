import express, { Response, Request } from 'express';
import mongoose from 'mongoose';
import { requireAuth, requestValidate, OrderStatus } from '@zenitsu/sharedlogic';
import { body } from 'express-validator';
import Ticket from '../models/Ticket';
import Order from '../models/Orders';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 15 * 60;
router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  requestValidate,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    // Look for the ticket that user is trying to order in db
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ errors: [{ msg: 'tickets not existed' }] });
    }
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      return res.status(400).json({ errors: [{ msg: 'tickets already reserved' }] });
    }

    // Calculate an expiration period for the order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the db
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      tickets: ticket,
    });

    await order.save();

    // Publish an event that an order has been created
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      userId: order.userId,
      version: order.version,
      status: order.status,
      expiresAt: order.expiresAt.toISOString(),
      tickets: {
        id: ticket.id,
        price: ticket.price,
      },
    });
    res.status(201).send(order);
  }
);

export { router as newOrdersRouter };
