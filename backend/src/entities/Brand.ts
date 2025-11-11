import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("brands")
export class Brand {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  // @Column({ type: "varchar", length: 255, nullable: true })
  // brand_image!: string;

  @Column({ type: "jsonb", nullable: true })
  brand_image!: {
    original?: string;
    large?: string;
    medium?: string;
    small?: string;
    thumb?: string;
  } | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
