import express, { Request, Response } from 'express';
import { requireAuth, requestValidate } from '@zenitsu/sharedlogic';
import { body } from 'express-validator';
import Ticket from '../models/Tickets';
import { TicketUpdatePublisher } from '../events/publishers/ticket-update-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title must not be empty'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  ],
  requestValidate,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      // Send a JSON response.
      return res.status(404).json({ errors: [{ msg: 'tickets not existed' }] });
    }

    // ticket has been reserved
    if (ticket.orderId) {
      return res.status(400).json({ errors: [{ msg: 'Ticket has been reserved' }] });
    }
    if (ticket.userId !== req.currentUser!.id) {
      // Send a JSON response.
      return res.status(401).json({ errors: [{ msg: 'User is not authorized' }] });
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    // persist the db to mongodb
    await ticket.save();

    new TicketUpdatePublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      version: ticket.version,
      price: ticket.price,
      userId: ticket.id,
    });
    res.send(ticket);
  }
);

export { router as updateTicketRouter };
