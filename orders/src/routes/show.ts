import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
} from '@fekatickets/common';
import { Order } from '../models/order';
import mongoose from 'mongoose';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new BadRequestError('Invalid id');
    }
    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
