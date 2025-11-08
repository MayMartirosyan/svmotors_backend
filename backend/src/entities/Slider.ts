import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("sliders")
export class Slider {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  slider_image!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  slider_title!: string;

  @Column({ type: "text", nullable: true })
  slider_desc!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  slider_link!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
