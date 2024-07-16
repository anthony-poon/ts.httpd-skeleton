import { BootstrapEntity } from '@entity/bootstrap.entity';
import Database from '@database';
import { Repository } from 'typeorm/repository/Repository';

const { dataSource } = Database;

export type BootstrapRepository = Repository<BootstrapEntity> & {
  hasAny: () => Promise<boolean>;
  addOne: () => Promise<void>
}

const bootstrapRepository: BootstrapRepository = dataSource.getRepository(BootstrapEntity).extend({
  async hasAny(){
    return (await this.count()) >= 1;
  },

  async addOne() {
    await this.insert(new BootstrapEntity());
  }
})

export default bootstrapRepository;