import env from '../../../../env';
import { EmailConfirmationTokenEntity } from '../../../../persistence/entity/email-confirmation-token.entity';
import { PasswordResetTokenEntity } from '../../../../persistence/entity/password-reset-token.entity';
import { UserEntity } from '../../../../persistence/entity/user.entity';
import cipher from '../../../../infrastructure/cipher';
import { AuthenticationImpl } from './impl';
import mailer from '../mailer';
import userRepository from '../../../../persistence/repository/user-repository';
import emailConfirmTokenRepository from '../../../../persistence/repository/email-confirm-token-repository';
import passwordResetTokenRepository from '../../../../persistence/repository/password-reset-token-repository';

export interface AuthenticationPrincipal<T> {
  principal: T;
  authorities: string[];
}

export interface UserPrincipal extends AuthenticationPrincipal<UserEntity> {}

export interface Authentication {
  authenticate: (username: string, password: string) => Promise<UserPrincipal>;
  dehydrate: (principal: UserPrincipal) => string;
  rehydrate: (jwt: string) => Promise<UserPrincipal>;
  registration: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  resendEmailConfirmation: (email: string) => Promise<void>;
  confirmEmail: (tokenValue: string) => Promise<void>;
  requestResetPassword: (email: string) => Promise<void>;
  resetPassword: (tokenValue: string, password: string) => Promise<void>;
  changePassword: (
    user: UserEntity,
    oldPassword: string,
    newPassword: string,
  ) => Promise<void>;
}

const authentication: Authentication = new AuthenticationImpl(
  userRepository,
  emailConfirmTokenRepository,
  passwordResetTokenRepository,
  cipher,
  mailer,
  env,
);
export default authentication;
