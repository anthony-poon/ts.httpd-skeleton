import 'reflect-metadata';

import {
  UserAuthority,
  UserEntity,
} from '@entity/user.entity';
import { Cipher } from '@core/cipher';
import { Bootstrapper } from './index';
import { BootstrapRepository } from '@repository/bootstrap-repository';
import { UserRepository } from '@repository/user-repository';

const mock = (hasToken = false) => {
  const bootstraps = {
    addOne: jest.fn(),
    hasAny: async () => {
      return hasToken;
    },
  } as Partial<BootstrapRepository>;
  const users = {
    save: jest.fn()
  }  as Partial<UserRepository>
  const cipher: Cipher = {
    hash: jest.fn().mockReturnValue('some-password-hash'),
    hashCompare: jest.fn(),
    randomHex: jest.fn().mockReturnValue('some-random-hash'),
  };
  const env = {
    DEFAULT_USERNAME: 'some-username',
    DEFAULT_PASSWORD: 'some-password',
    DEFAULT_USER_EMAIL: 'some-email@example.com',
  }
  return { bootstraps, users, cipher, env };
};

const getExpectation = () => {
  const user = new UserEntity();
  user.username = 'some-username';
  user.password = 'some-password-hash';
  user.email = 'some-email@example.com';
  user.authorities = [UserAuthority.ADMIN];
  user.hash = 'some-random-hash';
  return user;
};

describe('Application Initialization', () => {
  it('should create a user if no token', async () => {
    const { bootstraps, users, cipher, env } = mock();

    const service = new Bootstrapper(
      bootstraps as BootstrapRepository,
      users as UserRepository,
      cipher,
      env
    );
    await service.run();
    expect(bootstraps.addOne).toHaveBeenCalled();
    expect(users.save).toBeCalledWith([getExpectation()]);
  });

  it('should not create a user if token is found', async () => {
    const { bootstraps, users, cipher, env } = mock(true);
    const bootstrap = new Bootstrapper(
      bootstraps as BootstrapRepository,
      users as UserRepository,
      cipher,
      env
    );
    await bootstrap.run();
    expect(bootstraps.addOne).not.toHaveBeenCalled();
  });
});
