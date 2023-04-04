import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
} from '@fekatickets/common';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.patch(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }

    if (req.currentUser!.id !== ticket.userId) {
      throw new NotAuthorizedError();
    }

    if (ticket.orderId !== undefined) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }
    const client = natsWrapper.client;
    ticket.set({ title: req.body.title, price: req.body.price });
    await ticket.save();
    new TicketUpdatedPublisher(client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      userId: ticket.userId,
      price: ticket.price,
    });
    res.send(ticket);
  }
);

export { router as updateTicketRouter };
