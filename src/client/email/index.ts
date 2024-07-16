import { SMTPClient } from './impl/smtp';
import NodeMailer from 'nodemailer';
import env from '@env';

export interface Email {
  destinations: string[],
  subject: string,
  html: string,
}

export interface EmailClient {
  send: (emails: Email[]) => Promise<void>;
}

const emailClient = new SMTPClient(
  NodeMailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: true,
    auth: {
      user: env.SMTP_USERNAME,
      pass: env.SMTP_PASSWORD,
    },
  }),
  env
);
export default emailClient;