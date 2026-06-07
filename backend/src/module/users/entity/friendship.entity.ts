import {Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import type {FindOptionsRelations} from "typeorm";
import {User} from "./user.entity.js";
import {dataSource} from "../../../core/data-source.js";

@Entity()
@Index(["user1Id", "user2Id"], { unique: true })
export class Friendship {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Index()
  @Column({ type: "uuid" })
  user1Id: string;

  @Index()
  @Column({ type: "uuid" })
  user2Id: string;

  @Column({ type: "varchar" })
  status: FriendshipStatus;

  @Index()
  @Column({ type: "uuid" })
  requesterId: string;

  @Column({ type: "timestamp" })
  requestedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  acceptedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user1_id" })
  user1: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user2_id" })
  user2: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "requester_id" })
  requester: User;
}

export const friendshipRelations: FindOptionsRelations<Friendship> = {
  user1: true,
  user2: true,
  requester: true,
};

export type FriendshipStatus = "REQUESTING" | "FRIENDS";