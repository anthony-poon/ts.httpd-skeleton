import { ConfirmationTokenEntity } from '@entity/confirmation-token.entity';
import Database from '../index';
import { Repository } from 'typeorm/repository/Repository';

const { dataSource } = Database;

export type ConfirmTokenRepository = Repository<ConfirmationTokenEntity> & {
  getOneByValue(tokenValue: string): Promise<ConfirmationTokenEntity | null>
}

const confirmTokenRepository: ConfirmTokenRepository = dataSource.getRepository(ConfirmationTokenEntity).extend({
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


export default confirmTokenRepository;