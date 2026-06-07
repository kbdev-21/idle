import {Hono} from "hono";
import {getUserById, findUsers} from "../service/user.service.js";
import {authMiddleware} from "../../auth/auth.middleware.js";
import type {AppTypes} from "../../../core/core-types.js";

export const userController = new Hono<{Variables: AppTypes}>();

userController.get("/api/users/me",
  authMiddleware,
  async (c) => {
    const currentUser = c.get("currentUser");
    return c.json(currentUser);
  }
);

userController.get("/api/users",
  authMiddleware,
  async (c) => {
    const {
      search,
      offset,
      limit
    } = c.req.query();

    const users = await findUsers(
      search,
      offset ? Number(offset) : undefined,
      limit ? Number(limit) : undefined,
    );

    return c.json(users);
  }
);

userController.get("/api/users/:userId",
  authMiddleware,
  async (c) => {
    const userId = c.req.param("userId");
    const user = await getUserById(userId);
    return c.json(user);
  }
);