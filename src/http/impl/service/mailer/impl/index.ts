import ejs from 'ejs';
import { SmtpEnv } from '../../../../../env';
import { UserEntity } from '../../../../../persistence/entity/user.entity';
import { EmailClient } from '../../../../../infrastructure/client/email';
import { PasswordResetTokenRepository } from '../../../../../persistence/repository/password-reset-token-repository';
import { Mailer } from '../index';

const TOKEN_TTL = 3600;

class MailerImpl implements Mailer {
  constructor(
    private readonly repository: PasswordResetTokenRepository,
    private readonly client: EmailClient,
    private readonly env: SmtpEnv,
  ) {}

  async sendEmailConfirmation(user: UserEntity) {
    if (!user.email) {
      throw new Error('User does not have a email address');
    }
    const subject = 'Account Confirmation';
    const expireAt = new Date(Date.now() + TOKEN_TTL);
    const token = await this.repository.create(
      user,
      expireAt,
    );
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
    const token = await this.repository.createPasswordResetToken(
      user,
      expireAt,
    );
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
