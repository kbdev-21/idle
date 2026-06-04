import {Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import type {FindOptionsRelations} from "typeorm";
import {User} from "./User.js";

@Entity()
@Index(["userId", "followerId"], { unique: true })
export class UserFollower {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Index()
  @Column({ type: "uuid" })
  userId: string;

  @Index()
  @Column({ type: "uuid" })
  followerId: string;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "follower_id" })
  follower: User;

  static readonly RELATIONS: FindOptionsRelations<UserFollower> = {
    user: true,
    follower: true,
  }
}
