import express, { Express } from 'express';
import path from 'path';

import { HttpEnv } from '@env';
import loggerFactory from '@core/logger';
import configRoutes from './route';
import bootstrapper from '@service/bootstrapper';
import './type';

const logger = loggerFactory.create('app');

class ExpressHttp {
  private app: Express;
  constructor(private readonly env: HttpEnv) {
    this.app = express();
  }

  public async initialize() {
    logger.info('Starting HTTP server');
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.static(path.join(__dirname, 'public')));
    await bootstrapper.run();
    configRoutes(this.app);
    logger.info('Server start');
  }

  public listen() {
    if (!this.app) {
      throw new Error('Services have not been started yet');
    }
    this.app.listen(this.env.PORT);
  }
}

export default ExpressHttp;
