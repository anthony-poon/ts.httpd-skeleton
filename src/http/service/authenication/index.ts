import env from '@env';
import { UserEntity } from '@entity/user.entity';
import cipher from '@core/cipher';
import { AuthenticationImpl } from './impl';
import mailer from '../mailer';
import userRepository from '@repository/user-repository';
import emailConfirmTokenRepository from '@repository/confirm-token-repository';
import passwordResetTokenRepository from '@repository/reset-token-repository';

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
