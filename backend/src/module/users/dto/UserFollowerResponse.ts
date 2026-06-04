import type {UserFollower} from "../entity/UserFollower.js";
import {toUserResponse, type UserResponse} from "./UserResponse.js";

export type UserFollowerResponse = {
  id: string;
  userId: string;
  followerId: string;
  user: UserResponse;
  follower: UserResponse;
  createdAt: Date;
  updatedAt: Date;
}

export function toUserFollowerResponse(userFollower: UserFollower): UserFollowerResponse {
  return {
    id: userFollower.id,
    userId: userFollower.userId,
    followerId: userFollower.followerId,
    user: toUserResponse(userFollower.user),
    follower: toUserResponse(userFollower.follower),
    createdAt: userFollower.createdAt,
    updatedAt: userFollower.updatedAt,
  }
}
