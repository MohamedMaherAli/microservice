import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import { errorHandler, NotFoundError, currentUser } from '@fekatickets/common';
import cookieSession from 'cookie-session';
import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { deleteOrderRouter } from './routes/delete';
import { indexOrderRouter } from './routes';

const app = express();

// thats because ingress nginx is not trust worthy for express, so we make express trust it and deal with it
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(
  cookieSession({
    name: 'session',
    signed: false, // that means dont encrypt
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);
app.use(indexOrderRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
