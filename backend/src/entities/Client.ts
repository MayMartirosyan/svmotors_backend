import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  surname!: string;

  @Column({ type: "varchar", length: 20, nullable: false, unique: true })
  phone_number!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  vehicle!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  win_code!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  oil_name!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  oil_filter!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  air_filter!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  salon_filter!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  fuel_filter!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  pads_code!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  transmission_fluid!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  spark_code!: string; 

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
