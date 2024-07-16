import Database from '../../persistence';
import { Repository } from 'typeorm/repository/Repository';
import { UserEntity } from '@entity/user.entity';

const { dataSource } = Database;

export type UserRepository = Repository<UserEntity> & {
  getUserByUsername: (username: string) => Promise<UserEntity | null>;
  getUserByHash: (hash: string) => Promise<UserEntity | null>;
  getUserByEmail: (email: string) => Promise<UserEntity | null>;
}

const userRepository: UserRepository = dataSource.getRepository(UserEntity).extend({
  async getUserByUsername(username: string): Promise<UserEntity | null> {
    return this.findOneBy({
      username,
    });
  },

  async getUserByHash(hash: string): Promise<UserEntity | null> {
    return this.findOneBy({
      hash,
    });
  },

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    return this.findOneBy({
      email,
    });
  },
});

export default userRepository;
