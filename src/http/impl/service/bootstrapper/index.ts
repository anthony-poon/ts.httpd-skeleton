import env from '../../../../env';
import { UserEntity } from '../../../../persistence/entity/user.entity';
import cipher from '../../../../infrastructure/cipher';
import loggerFactory from '../../../../infrastructure/logger';
import { Bootstrapper } from './impl';
import repository from './repository';

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

const bootstrapper = new Bootstrapper(repository, cipher, env, logger);

export default bootstrapper;
