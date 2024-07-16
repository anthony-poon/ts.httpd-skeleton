import express, { Express } from 'express';
import { ValidationError } from 'joi';

import { BadRequestError, HTTPError, InternalError } from '../error';
import logger from '../logger';
import authRoute from './auth';
import defaultRoute from './default';
import usersRoute from './users';

const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (err instanceof ValidationError) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid input',
      details: err.details.map((detail) => ({
        message: detail.message,
        path: detail.path.join('.'),
      })),
    });
  } else if (err instanceof InternalError) {
    logger.error(err.message);
    res.sendStatus(err.code);
  } else if (err instanceof BadRequestError) {
    res.status(err.code).json({
      error: err.constructor.name,
      message: err.message,
    });
  } else if (err instanceof HTTPError) {
    res.sendStatus(err.code);
  } else {
    logger.error(err.message);
    res.sendStatus(500);
  }
};

export const fallback = (req: express.Request, res: express.Response) => {
  res.sendStatus(404);
};

const configRoutes = (app: Express) => {
  app.use('/', defaultRoute);
  app.use('/auth', authRoute);
  app.use('/users', usersRoute);
  app.use(errorHandler);
  app.use(fallback);
};

export default configRoutes;
