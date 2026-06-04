import {createMiddleware} from "hono/factory";
import {HTTPException} from "hono/http-exception";
import {userService} from "../users/service/userService.js";

export const authMiddleware = createMiddleware(async (c, next) => {
  const testUserId = c.req.header("x-test-user-id");
  if (!testUserId) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  try {
    const currentUser = await userService.getUserById(testUserId);
    c.set("currentUser", currentUser);
  } catch (e) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  await next();
})