import ejs from 'ejs';
import { SmtpEnv } from '@env';
import { UserEntity } from '@entity/user.entity';
import { EmailClient } from '@client/email';
import { ResetTokenRepository } from '@repository/reset-token-repository';
import { Mailer } from '../index';
import { ConfirmTokenRepository } from '@repository/confirm-token-repository';

const TOKEN_TTL = 3600;

class MailerImpl implements Mailer {
  constructor(
    private readonly resetTokenRepository: ResetTokenRepository,
    private readonly confirmTokenRepository: ConfirmTokenRepository,
    private readonly client: EmailClient,
    private readonly env: SmtpEnv,
  ) {}

  async sendEmailConfirmation(user: UserEntity) {
    if (!user.email) {
      throw new Error('User does not have a email address');
    }
    const subject = 'Account Confirmation';
    const expireAt = new Date(Date.now() + TOKEN_TTL);
    const token = this.confirmTokenRepository.create();
    token.user = user;
    token.expireAt = expireAt;
    await this.confirmTokenRepository.insert(token);
    const url = `${this.env.LINK_URL_PREFIX}/${token.value}`;
    const html = await ejs.renderFile(
      `${__dirname}/templates/email-confirmation.ejs`,
      {
        url,
      },
    );
    const destinations = [user.email];
    await this.client.send([{ destinations, subject, html }]);
  }

  async sendPasswordReset(user: UserEntity) {
    if (!user.email) {
      throw new Error('User does not have a email address');
    }
    const subject = 'Password Reset';
    const expireAt = new Date(Date.now() + TOKEN_TTL);
    const token = this.resetTokenRepository.create();
    token.user = user;
    token.expireAt = expireAt;
    await this.resetTokenRepository.insert(token);
    const url = `${this.env.LINK_URL_PREFIX}/${token.value}`;
    const html = await ejs.renderFile(
      `${__dirname}/templates/email-password-reset.ejs`,
      {
        url,
      },
    );
    const destinations = [user.email];
    await this.client.send([{ destinations, subject, html }]);
  }
}

export default MailerImpl;
