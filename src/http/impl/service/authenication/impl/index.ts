import jwtEncoder from 'jsonwebtoken';

import { AppEnv } from '../../../../../env';
import { EmailConfirmationTokenEntity } from '../../../../../persistence/entity/email-confirmation-token.entity';
import { PasswordResetTokenEntity } from '../../../../../persistence/entity/password-reset-token.entity';
import {
  UserAuthority,
  UserEntity,
} from '../../../../../persistence/entity/user.entity';
import { Cipher } from '../../../../../infrastructure/cipher';
import loggerFactory from '../../../../../infrastructure/logger';
import { BadRequestError, UnauthorizedError } from '../../../error';
import { Authentication, UserPrincipal } from '../index';
import { Mailer } from '../../mailer';
import { UserRepository } from '../../../../../persistence/repository/user-repository';
import { EmailConfirmTokenRepository } from '../../../../../persistence/repository/email-confirm-token-repository';
import { PasswordResetTokenRepository } from '../../../../../persistence/repository/password-reset-token-repository';

const logger = loggerFactory.create('authentication');

class UserPrincipalImpl implements UserPrincipal {
  public readonly principal: UserEntity;
  public readonly authorities: string[];
  constructor(principal: UserEntity, authorities: string[]) {
    this.principal = principal;
    this.authorities = authorities;
  }

  static authenticated(user: UserEntity) {
    return new UserPrincipalImpl(user, user.authorities);
  }
}

interface JWT {
  userHash: string | undefined;
}

export class AuthenticationImpl implements Authentication {
  constructor(
    private readonly users: UserRepository,
    private readonly confirmTokens: EmailConfirmTokenRepository,
    private readonly resetTokens: PasswordResetTokenRepository,
    private readonly cipher: Cipher,
    private readonly mailer: Mailer,
    private readonly env: AppEnv,
  ) {}

  async authenticate(
    username: string,
    password: string,
  ): Promise<UserPrincipal> {
    const user = await this.users.getUserByUsername(username);
    if (!user || !user.password || !user.isEnabled) {
      throw new UnauthorizedError('Invalid login');
    }
    const isMatch = this.cipher.hashCompare(password, user.password);
    if (isMatch) {
      return UserPrincipalImpl.authenticated(user);
    } else {
      throw new UnauthorizedError('Invalid login');
    }
  }

  dehydrate(authentication: UserPrincipal) {
    const user = authentication.principal;
    return jwtEncoder.sign(
      {
        userHash: user.hash,
      },
      this.env.JWT_SECRET,
    );
  }

  async rehydrate(jwt: string) {
    const decoded = jwtEncoder.verify(jwt, this.env.JWT_SECRET) as JWT;
    if (!decoded.userHash) {
      throw new UnauthorizedError('Invalid authentication');
    }
    const user = await this.users.getUserByHash(decoded.userHash);
    if (!user || !user.isEnabled) {
      throw new UnauthorizedError('Invalid authentication');
    }
    return UserPrincipalImpl.authenticated(user);
  }

  async registration(username: string, email: string, password: string) {
    const existing = await this.users.getUserByUsername(username);
    if (existing) {
      throw new BadRequestError('Username already exist');
    }
    const hash = this.cipher.randomHex();
    const passwordHash = this.cipher.hash(password);
    const user = new UserEntity();
    user.username = username;
    user.password = passwordHash;
    user.authorities = [UserAuthority.USER];
    user.email = email;
    user.hash = hash;
    await this.users.save(user);
    await this.mailer.sendEmailConfirmation(user);
  }

  async resendEmailConfirmation(email: string) {
    const user = await this.users.getUserByEmail(email);
    if (!user) {
      logger.debug('Cannot find user by email');
      return;
    }
    if (AuthenticationImpl.isUserInvalid(user)) {
      return;
    }
    await this.mailer.sendEmailConfirmation(user);
  }

  async confirmEmail(tokenValue: string) {
    const token = await this.confirmTokens.getOneByValue(tokenValue);
    if (!token) {
      throw new BadRequestError('Token value is incorrect');
    }
    AuthenticationImpl.validateToken(token);
    token.consumedAt = new Date();
    if (!token.user) {
      throw new Error('Token is invalid');
    }
    token.user.isEmailConfirmed = true;
    await this.confirmTokens.save(token);
  }

  async requestResetPassword(email: string) {
    const user = await this.users.getUserByEmail(email);
    // Should not throw an error to prevent probing
    if (!user) {
      logger.debug('Cannot find user by email');
      return;
    }
    if (AuthenticationImpl.isUserInvalid(user)) {
      return;
    }
    await this.mailer.sendPasswordReset(user);
  }

  async resetPassword(tokenValue: string, password: string) {
    const token = await this.resetTokens.getOneByValue(tokenValue);
    if (!token) {
      throw new BadRequestError('Token value is incorrect');
    }
    AuthenticationImpl.validateToken(token);
    const passwordHash = this.cipher.hash(password);
    if (!token.user) {
      throw new BadRequestError('Token does not belong to a user');
    }
    token.user.password = passwordHash;
    token.user.authorities = [UserAuthority.USER];
    token.consumedAt = new Date();
    if (!token.user) {
      throw new Error('Token is invalid');
    }
    token.user.isEmailConfirmed = true;
    await this.resetTokens.save(token);
  }

  async changePassword(
    user: UserEntity,
    oldPassword: string,
    newPassword: string,
  ) {
    if (!user.password) {
      throw new BadRequestError('Cannot change password of this user');
    }
    const isValid = this.cipher.hashCompare(oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestError('Invalid current password');
    }
    user.password = this.cipher.hash(newPassword);
    await this.users.save(user);
  }

  private static isUserInvalid(user: UserEntity) {
    if (!user.isEnabled) {
      logger.debug('User is not active');
      return true;
    }
    return false;
  }

  private static validateToken(
    token: EmailConfirmationTokenEntity | PasswordResetTokenEntity,
  ) {
    if (!token.expireAt) {
      throw new BadRequestError('Token do not have a expire date');
    }
    if (token.expireAt < new Date()) {
      throw new BadRequestError('Token already expired');
    }
  }
}
