import {
  UserAuthority,
  UserEntity,
} from '../../../../../persistence/entity/user.entity';
import { Cipher } from '../../../../../infrastructure/cipher';
import { Logger } from '../../../../../infrastructure/logger';
import { BootstrapEnv, Repository } from '../index';
import { BootstrapRepository } from '../../../../../persistence/repository/bootstrap-repository';
import { UserRepository } from '../../../../../persistence/repository/user-repository';

export class Bootstrapper {
  constructor(
    private readonly bootstraps: BootstrapRepository,
    private readonly users: UserRepository,
    private readonly cipher: Cipher,
    private readonly env: BootstrapEnv,
    private readonly logger?: Logger,
  ) {}

  async run() {
    if (await this.bootstraps.hasAny()) {
      return;
    }
    this.logger?.info('Initializing application data');
    this.validate();
    await this.createDefaultUser();
    await this.bootstraps.addOne();
  }

  private validate() {
    const { DEFAULT_USERNAME, DEFAULT_PASSWORD, DEFAULT_USER_EMAIL } = this.env;
    if (!DEFAULT_USERNAME || !DEFAULT_PASSWORD || !DEFAULT_USER_EMAIL) {
      throw new Error('Default config is not set.');
    }
  }

  private async createDefaultUser() {
    const { DEFAULT_USERNAME, DEFAULT_PASSWORD, DEFAULT_USER_EMAIL } = this.env;
    this.logger?.info('Creating default user');
    const user = new UserEntity();
    user.username = DEFAULT_USERNAME;
    user.password = this.cipher.hash(DEFAULT_PASSWORD);
    user.email = DEFAULT_USER_EMAIL;
    user.authorities = [UserAuthority.ADMIN];
    user.hash = this.cipher.randomHex();
    await this.users.save([user]);
  }
}
