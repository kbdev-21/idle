import {db} from "../../../database/db.js";
import {HTTPException} from "hono/http-exception";
import {randomGuestIdentify} from "./user-identify.service.js";
import {userCaroStats, users} from "../../../database/schema.js";
import {uuidv7} from "uuidv7";
import {eq} from "drizzle-orm";
import type {UpdateUserRequest} from "../dtos.js";

const userFullRelations = {
  caroStat: true
}

const userFullQuery = db.query.users.findFirst({
  with: userFullRelations
});

export type User = NonNullable<Awaited<typeof userFullQuery>>;

export async function getUserById(id: string): Promise<User> {
  const user = await db.query.users.findFirst({
    where: {
      id: id
    },
    with: userFullRelations
  });

  if(!user) {
    throw new HTTPException(404, {message: "User not found"});
  }

  return user;
}

export async function findUsers(search?: string, offset: number = 0, limit: number = 10): Promise<User[]> {
  return await db.query.users.findMany({
    where: search ? {
      name: {like: `%${search}%`}
    } : undefined,
    offset: offset,
    limit: limit,
    with: userFullRelations
  });
}

export async function updateUserById(id: string, updateRequest: UpdateUserRequest): Promise<User> {
  if(updateRequest.name === undefined && updateRequest.avtCode === undefined) {
    return await getUserById(id);
  }

  await db.update(users).set({
    name: updateRequest.name,
    avtCode: updateRequest.avtCode
  }).where(eq(users.id, id));

  return await getUserById(id);
}

export async function syncUserWithAuthData(userId: string, isAnonymous: boolean, email?: string): Promise<User> {
  const existingUser = await db.query.users.findFirst({
    where: {
      id: userId,
    },
    with: userFullRelations
  });

  const newType = isAnonymous ? "GUEST" : "USER";

  if(existingUser) {
    if(isAnonymous) return existingUser;

    await db.update(users).set({
      type: existingUser.type === "ADMIN" ? "ADMIN" : newType,
      email: email
    }).where(eq(users.id, existingUser.id));

    return getUserById(existingUser.id);
  }

  const {name, avtCode} = randomGuestIdentify();
  const baseRating = 1000;

  await db.transaction(async tx => {
    await tx.insert(users).values({
      id: userId,
      name: name,
      avtCode: avtCode,
      type: newType
    });
    await tx.insert(userCaroStats).values({
      id: uuidv7(),
      userId: userId,
      rating: baseRating,
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0
    })
  });

  return getUserById(userId);
}


