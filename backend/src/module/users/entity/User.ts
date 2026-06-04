import {Column, Entity, type FindOptionsRelations, PrimaryColumn} from "typeorm";

@Entity()
export class User {
  @PrimaryColumn({type: "uuid"})
  id: string;

  @Column({ type: "varchar" })
  name: string;

  static readonly RELATIONS: FindOptionsRelations<User> = {}
}