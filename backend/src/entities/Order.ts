import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from "typeorm";
import { Checkout } from "./Checkout";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "integer", unique: true })
  orderId!: number;

  @Column({
    type: "varchar",
    length: 50,
    nullable: false,
    default: "pending",
  })
  status!: "pending" | "approved" | "rejected";

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  totalAmount!: number;

  @ManyToOne(() => Checkout, (checkout) => checkout.orders)
  @JoinColumn({ name: "checkout_id" })
  checkout!: Checkout;

  @CreateDateColumn()
  created_at!: Date;

  @BeforeInsert()
  generateOrderId() {
    const minOrderId = 10000;
    const maxOrderId = 99999;
    const timestamp = Date.now();
    let orderId =
      (Math.floor(timestamp / 1000) % (maxOrderId - minOrderId + 1)) +
      minOrderId;

    this.orderId = orderId;
  }
}
