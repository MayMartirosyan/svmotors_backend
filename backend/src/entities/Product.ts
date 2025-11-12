// src/entities/Product.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Category } from "./Category";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "jsonb", nullable: true })
  product_image!: {
    original?: string;
    large?: string;
    medium?: string;
    small?: string;
    thumb?: string;
  } | null;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  price!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  discounted_price!: number | null;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "text", nullable: true })
  short_description?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  sku?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  article?: string;

  @Column({ type: "boolean", default: false })
  is_new!: boolean;

  @Column({ type: "boolean", default: false })
  is_recommended!: boolean;

  @Column({ name: "category_id" })
  category_id!: number;

  @ManyToOne(() => Category, (category) => category.id, { nullable: false })
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @Column({ type: "varchar", length: 255, nullable: true })
  slug!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
