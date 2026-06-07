import {Column, CreateDateColumn, Entity, type FindOptionsRelations, PrimaryColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class User {
  @PrimaryColumn({type: "uuid"})
  id: string;

  @Column({type: "varchar"})
  type: UserType;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  avtUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export type UserType = "GUEST" | "USER" | "ADMIN";

export const userRelations: FindOptionsRelations<User> = {};