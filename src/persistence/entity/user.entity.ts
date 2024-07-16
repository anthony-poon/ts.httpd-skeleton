import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserAuthority {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number | undefined;
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  username: string | undefined;
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  hash: string | undefined;
  @Column({
    type: 'varchar',
  })
  password: string | undefined;
  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string | undefined;
  @Column()
  isEmailConfirmed: boolean = false;
  @Column()
  isEnabled: boolean = true;
  @Column({
    type: 'simple-array',
  })
  authorities: UserAuthority[] = [];
  @CreateDateColumn()
  createdAt: Date | undefined;
  @UpdateDateColumn()
  updatedAt: Date | undefined;
}
