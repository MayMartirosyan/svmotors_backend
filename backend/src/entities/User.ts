// src/entities/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  BeforeInsert,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "./Product";
import * as bcrypt from "bcryptjs";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  surname?: string;

  @Column({ type: "varchar", length: 255, nullable: false, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  password?: string;

  @Column({ type: "date", nullable: true })
  birthday_date?: Date;

  @Column({ type: "varchar", length: 10, nullable: true })
  gender?: string; // 'male', 'female', 'other'

  @Column({ type: "varchar", length: 20, nullable: true })
  tel?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  cart_summary!: number;

  @Column({ type: "boolean", default: false })
  is_payed!: boolean;

  @ManyToMany(() => Product, { cascade: true })
  @JoinTable({
    name: "user_favorite_products",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "product_id", referencedColumnName: "id" },
  })
  favorite_products!: Product[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user, { cascade: true })
  cart!: CartItem[];

  @Column({ type: "varchar", length: 255, nullable: true }) // api_token
  api_token?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) { 
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}

@Entity("cart_items")
export class CartItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "integer", nullable: false })
  product_id!: number;

  @Column({ type: "integer", nullable: false })
  qty!: number;

  @ManyToOne(() => User, (user) => user.cart)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: "product_id" })
  product?: Product;

  @CreateDateColumn()
  created_at!: Date;
}