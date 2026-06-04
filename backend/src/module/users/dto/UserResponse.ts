import type {User} from "../entity/User.js";

export type UserResponse = {
  id: string;
  name: string;
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
  }
}