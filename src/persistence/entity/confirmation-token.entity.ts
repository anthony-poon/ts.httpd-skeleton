import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class ConfirmationTokenEntity {
  @PrimaryGeneratedColumn()
  id: number | undefined;
  @Column({
    type: 'varchar',
    nullable: false,
  })
  value!: string;
  @ManyToOne(() => UserEntity, {
    cascade: ['update'],
    nullable: false,
  })
  user!: UserEntity;
  consumedAt: Date | undefined;
  expireAt: Date | undefined;
  @CreateDateColumn()
  createdAt: Date | undefined;
}
