import {HTTPException} from "hono/http-exception";
import {ILike} from "typeorm";
import {uuidv7} from "uuidv7";
import {User} from "../entity/User.js";
import type {CreateUserRequest} from "../dto/CreateUserRequest.js";
import type {FindUsersQuery} from "../dto/FindUsersQuery.js";
import {appDataSource} from "../../../core/appDataSource.js";

const userRepo = appDataSource.getRepository(User);

export const userService = {
  async getUserById(id: string): Promise<User> {
    const user = await userRepo.findOne({
      where: {id},
      relations: User.RELATIONS,
    });
    if(!user) {
      throw new HTTPException(404, {message: "User not found"});
    }
    return user;
  },

  async findUsers(query: FindUsersQuery): Promise<User[]> {
    return await userRepo.find({
      where: query.search ? { name: ILike(`%${query.search}%`) } : {},
      order: { [query.sortBy]: query.sortDir },
      skip: query.offset,
      take: query.limit,
      relations: User.RELATIONS,
    });
  },

  async createUser(dto: CreateUserRequest): Promise<User> {
    const newUserId = uuidv7();
    await userRepo.insert({
      id: newUserId,
      name: dto.name,
    });
    return await this.getUserById(newUserId);
  }
}