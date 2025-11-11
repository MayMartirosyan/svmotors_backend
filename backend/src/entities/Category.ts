import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Tree, TreeChildren, TreeParent } from "typeorm";

@Entity("categories")
@Tree("materialized-path")
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  // @Column({ type: "varchar", length: 255, nullable: true })
  // category_image!: string | null;

  @Column({ type: "jsonb", nullable: true })
  category_image!: {
    original?: string;
    large?: string;
    medium?: string;
    small?: string;
    thumb?: string;
  } | null;

  @Column({ unique: true, nullable: true })
  slug?: string;

  @TreeChildren()
  children!: Category[];

  @TreeParent()
  parent!: Category | null;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;
}