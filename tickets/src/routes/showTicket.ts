import express, { Request, Response } from "express";
import Ticket from "../models/Tickets";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    // Send a JSON response.
    return res.status(404).json({ errors: [{ msg: "tickets not existed" }] });
  }
  res.send(ticket);
});

export { router as showTicketRouter };
