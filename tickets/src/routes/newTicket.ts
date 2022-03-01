import express, { Request, Response } from 'express';
import { requireAuth, requestValidate } from '@zenitsu/sharedlogic';
import { body } from 'express-validator';
import Ticket from '../models/Tickets';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();

// create a new ticket
router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title must not be empty'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  ],
  requestValidate,
  async (req: Request, res: Response) => {
    // destructure the response from req.body
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await ticket.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      version: ticket.version,
      price: ticket.price,
      userId: ticket.userId,
    });
    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
