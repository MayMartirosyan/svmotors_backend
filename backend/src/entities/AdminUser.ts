import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class AdminUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, nullable: false })
  username!: string;

  @Column({ length: 100, nullable: false })
  password!: string;

  @Column({ default: true })
  isActive!: boolean;
}
