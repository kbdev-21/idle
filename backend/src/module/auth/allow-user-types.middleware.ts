import {createMiddleware} from "hono/factory";
import type {User} from "../users/service/user.service.js";
import {HTTPException} from "hono/http-exception";
import type {UserType} from "../../database/schema.js";

export const allowUserTypesMiddleware = (allowedUserTypes: UserType[]) =>
  createMiddleware(async (c, next) => {
    const currentUser: User | null = c.get("currentUser");
    if(!currentUser) {
      throw new HTTPException(500, { message: "Dev: allowUserTypesMiddleware used without/before authMiddleware" });
    }
    const currentUserType = currentUser.type;
    if(!allowedUserTypes.includes(currentUserType)) {
      throw new HTTPException(403, { message: "Not allowed" });
    }

    await next();
});