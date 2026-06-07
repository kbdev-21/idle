import {HTTPException} from "hono/http-exception";
import {uuidv7} from "uuidv7";
import {ILike, In} from "typeorm";
import {Friendship, friendshipRelations} from "../entity/friendship.entity.js";
import {User, userRelations} from "../entity/user.entity.js";
import {dataSource} from "../../../core/data-source.js";

const friendshipRepo = dataSource.getRepository(Friendship);
const userRepo = dataSource.getRepository(User);

export async function getFriendshipById(id: string): Promise<Friendship> {
  const friendship = await friendshipRepo.findOne({
    where: { id },
    relations: friendshipRelations,
  });
  if (!friendship) {
    throw new HTTPException(404, { message: "Friendship not found" });
  }
  return friendship;
}

export async function findFriendsByUserId(userId: string, search?: string, offset: number = 0, limit: number = 10): Promise<User[]> {
  const friendships = await friendshipRepo.find({
    where: [
      { user1Id: userId, status: "FRIENDS" },
      { user2Id: userId, status: "FRIENDS" },
    ],
    select: { user1Id: true, user2Id: true },
  });

  const friendIds = friendships.map((f) =>
    f.user1Id === userId ? f.user2Id : f.user1Id
  );

  if (friendIds.length === 0) {
    return [];
  }

  return await userRepo.find({
    where: {
      id: In(friendIds),
      ...(search ? { name: ILike(`%${search}%`) } : {}),
    },
    skip: offset,
    take: limit,
    relations: userRelations,
  });
}

export async function sendFriendRequest(requesterId: string, receiverId: string): Promise<Friendship> {
  if (requesterId === receiverId) {
    throw new HTTPException(400, { message: "Cannot send friend request to yourself" });
  }

  const existing = await friendshipRepo.findOne({
    where: [
      { user1Id: requesterId, user2Id: receiverId },
      { user1Id: receiverId, user2Id: requesterId },
    ],
  });
  if (existing) {
    throw new HTTPException(409, { message: "Friendship already exists" });
  }

  const id = uuidv7();
  const now = new Date();
  await friendshipRepo.insert({
    id,
    user1Id: requesterId,
    user2Id: receiverId,
    status: "REQUESTING",
    requesterId,
    requestedAt: now,
    acceptedAt: null,
  });

  return await getFriendshipById(id);
}

export async function acceptFriendRequest(friendshipId: string, accepterId: string): Promise<Friendship> {
  const friendship = await getFriendshipById(friendshipId);

  if (friendship.status !== "REQUESTING") {
    throw new HTTPException(409, { message: "Friendship is not in REQUESTING status" });
  }

  if (friendship.requesterId === accepterId) {
    throw new HTTPException(403, { message: "Requester cannot accept their own friend request" });
  }

  if (friendship.user1Id !== accepterId && friendship.user2Id !== accepterId) {
    throw new HTTPException(403, { message: "You are not part of this friendship" });
  }

  await friendshipRepo.update(friendshipId, {
    status: "FRIENDS",
    acceptedAt: new Date(),
  });

  return await getFriendshipById(friendshipId);
}

