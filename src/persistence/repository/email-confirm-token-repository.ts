import { EmailConfirmationTokenEntity } from '../entity/email-confirmation-token.entity';
import Database from '../index';
import { Repository } from 'typeorm/repository/Repository';

const { dataSource } = Database;

export type EmailConfirmTokenRepository = Repository<EmailConfirmationTokenEntity> & {
  getOneByValue(tokenValue: string): Promise<EmailConfirmationTokenEntity | null>
}

const emailConfirmTokenRepository: EmailConfirmTokenRepository = dataSource.getRepository(EmailConfirmationTokenEntity).extend({
  async getOneByValue(tokenValue: string) {
    return await this.findOne({
      where: {
        value: tokenValue,
      },
      relations: {
        user: true,
      },
    });
  },
});


export default emailConfirmTokenRepository;