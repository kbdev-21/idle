import {Column, Entity, type FindOptionsRelations, PrimaryColumn} from "typeorm";

@Entity()
export class User {
  @PrimaryColumn({type: "uuid"})
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  avtUrl: string;
}

export const userRelations: FindOptionsRelations<User> = {};