import env from '@env';
import { UserEntity } from '@entity/user.entity';
import resetTokenRepository from '@repository/reset-token-repository';
import confirmTokenRepository from '@repository/confirm-token-repository';
import MailerImpl from './impl';
import client from '@client/email';

export interface Mailer {
  sendEmailConfirmation: (user: UserEntity) => Promise<void>;
  sendPasswordReset: (users: UserEntity) => Promise<void>;
}

const mailer = new MailerImpl(
  resetTokenRepository,
  confirmTokenRepository,
  client, env
);

export default mailer;
