import Database from '../index';
import { ResetTokenEntity } from '@entity/reset-token.entity';
import { Repository } from 'typeorm/repository/Repository';

const { dataSource } = Database;

export type ResetTokenRepository = Repository<ResetTokenEntity> & {
  getOneByValue: (tokenValue: string) => Promise<ResetTokenEntity | null>;
}

const resetTokenRepository: ResetTokenRepository = dataSource.getRepository(ResetTokenEntity).extend({
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

export default resetTokenRepository;