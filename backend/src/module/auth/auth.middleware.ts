import {createMiddleware} from "hono/factory";
import {HTTPException} from "hono/http-exception";
import {getOrCreateUserById} from "../users/service/user.service.js";
import {auth} from "../../core/auth.js";

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  if (!authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const token = authHeader.slice(7);

  const authUser = await auth.getUser(token);
  if(authUser.error || !authUser.data.user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const userId = authUser.data.user.id;

  try {
    const currentUser = await getOrCreateUserById(userId);
    c.set("currentUser", currentUser);
  } catch (e) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  await next();
})