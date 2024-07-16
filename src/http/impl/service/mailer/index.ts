import env from '../../../../env';
import { UserEntity } from '../../../../persistence/entity/user.entity';
import tokenRepository from '../../../../persistence/repository/password-reset-token-repository';
import MailerImpl from './impl';
import emailClient from '../../../../infrastructure/client/email';

export interface Mailer {
  sendEmailConfirmation: (user: UserEntity) => Promise<void>;
  sendPasswordReset: (users: UserEntity) => Promise<void>;
}

const mailer = new MailerImpl(tokenRepository, emailClient, env);

export default mailer;
