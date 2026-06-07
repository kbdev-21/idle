import {HTTPException} from "hono/http-exception";
import {ILike} from "typeorm";
import {User, userRelations} from "../entity/user.entity.js";
import {dataSource} from "../../../core/data-source.js";
import {randomGuestIdentify} from "./user-naming.service.js";

const userRepo = dataSource.getRepository(User);

export async function getUserById(id: string): Promise<User> {
  const user = await userRepo.findOne({
    where: { id },
    relations: userRelations,
  });
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }
  return user;
}

export async function getOrCreateUserById(id: string): Promise<User> {
  const existingUser = await userRepo.findOne({
    where: { id },
    relations: userRelations,
  });

  if (existingUser) {
    return existingUser;
  }

  const {name, avtUrl} = randomGuestIdentify();
  await userRepo.insert({
    id: id,
    name: name,
    avtUrl: avtUrl
  });

  return getUserById(id);
}

export async function findUsers(search?: string, offset: number = 0, limit: number = 10): Promise<User[]> {
  return await userRepo.find({
    where: search ? { name: ILike(`%${search}%`) } : {},
    skip: offset,
    take: limit,
    relations: userRelations,
  });
}