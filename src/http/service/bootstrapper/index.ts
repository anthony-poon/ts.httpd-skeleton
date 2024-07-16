import env from '@env';
import { UserEntity } from '@entity/user.entity';
import cipher from '@core/cipher';
import loggerFactory from '@core//logger';
import { Bootstrapper } from './impl';
import bootstrapRepository from '@repository/bootstrap-repository';
import userRepository from '@repository/user-repository';

const logger = loggerFactory.create('bootstrap');

export interface BootstrapEnv {
  DEFAULT_USERNAME: string;
  DEFAULT_PASSWORD: string;
  DEFAULT_USER_EMAIL: string;
}

export interface Repository {
  doBootstrap: (users: UserEntity[]) => Promise<void>;
  isDone: () => Promise<boolean>;
}

const bootstrapper = new Bootstrapper(
  bootstrapRepository,
  userRepository,
  cipher,
  env,
  logger
);

export default bootstrapper;
