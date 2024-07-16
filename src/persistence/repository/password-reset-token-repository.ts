import { UserEntity } from '../entity/user.entity';
import { EmailConfirmationTokenEntity } from '../entity/email-confirmation-token.entity';
import Database from '../index';
import { PasswordResetTokenEntity } from '../entity/password-reset-token.entity';
import { Repository } from 'typeorm/repository/Repository';

const { dataSource } = Database;

export type PasswordResetTokenRepository = Repository<PasswordResetTokenEntity> & {
  getOneByValue: (tokenValue: string) => Promise<PasswordResetTokenEntity | null>;
}

const passwordResetTokenRepository: PasswordResetTokenRepository = dataSource.getRepository(PasswordResetTokenEntity).extend({
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

export default passwordResetTokenRepository;