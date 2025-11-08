import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Order } from "./Order";

@Entity("checkouts")
export class Checkout {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  surname!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  email!: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  tel!: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  deliveryType!: "replace_oil" | "pickup";

  @Column({ type: "time", nullable: true })
  timeFrom?: string;

  @Column({ type: "time", nullable: true })
  timeTo?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  totalAmount!: number;

  @Column({ type: "json", nullable: false })
  cartItems!: { productId: number; qty: number }[];

  // @ManyToOne(() => User, (user) => user.id)
  // @JoinColumn({ name: "user_id" })
  // user!: User;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user?: User;

  @OneToMany(() => Order, (order) => order.checkout)
  orders!: Order[];
  
  @Column({ type: "varchar", length: 50, nullable: false })
  paymentMethod!: "cash" | "bankCard";

  @CreateDateColumn()
  created_at!: Date;
}
