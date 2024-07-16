import { CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BootstrapEntity {
  @PrimaryGeneratedColumn()
  id: number | undefined;
  @CreateDateColumn()
  createdAt: Date | undefined;
}
