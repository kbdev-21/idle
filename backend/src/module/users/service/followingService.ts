import {HTTPException} from "hono/http-exception";
import {uuidv7} from "uuidv7";
import {UserFollower} from "../entity/UserFollower.js";
import {appDataSource} from "../../../core/appDataSource.js";

const userFollowerRepo = appDataSource.getRepository(UserFollower);

export const followingService = {
  async follow(userId: string, followerId: string): Promise<UserFollower> {
    const existing = await userFollowerRepo.findOne({
      where: { userId, followerId },
    });
    if (existing) {
      throw new HTTPException(409, { message: "Already following" });
    }

    const id = uuidv7();
    await userFollowerRepo.insert({ id, userId, followerId });

    return await this.getFollowRecord(userId, followerId);
  },

  async unfollow(userId: string, followerId: string): Promise<void> {
    const result = await userFollowerRepo.delete({ userId, followerId });
    if (result.affected === 0) {
      throw new HTTPException(404, { message: "Follow relationship not found" });
    }
  },

  async findFollowers(userId: string): Promise<UserFollower[]> {
    return await userFollowerRepo.find({
      where: { userId },
      relations: UserFollower.RELATIONS,
    });
  },

  async findFollowing(followerId: string): Promise<UserFollower[]> {
    return await userFollowerRepo.find({
      where: { followerId },
      relations: UserFollower.RELATIONS,
    });
  },

  async getFollowRecord(userId: string, followerId: string): Promise<UserFollower> {
    const record = await userFollowerRepo.findOne({
      where: { userId, followerId },
      relations: UserFollower.RELATIONS,
    });
    if (!record) {
      throw new HTTPException(404, { message: "Follow relationship not found" });
    }
    return record;
  },
}
