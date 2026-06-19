import {Hono} from "hono";
import {zValidator} from "@hono/zod-validator";
import {getUserById, findUsers, updateUserById} from "../service/user.service.js";
import {authMiddleware} from "../../auth/auth.middleware.js";
import {UpdateUserRequestSchema} from "../dtos.js";
import type {AppTypes} from "../../../core/types.js";
import {allowUserTypesMiddleware} from "../../auth/allow-user-types.middleware.js";

export const userRouter = new Hono<{Variables: AppTypes}>();

userRouter.get("/api/users/me",
  authMiddleware,
  async (c) => {
    const currentUser = c.get("currentUser");
    return c.json(currentUser);
  }
);

userRouter.get("/api/users",
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

userRouter.get("/api/users/:userId",
  authMiddleware,
  async (c) => {
    const userId = c.req.param("userId");
    const user = await getUserById(userId);
    return c.json(user);
  }
);

userRouter.patch("/api/users/me",
  authMiddleware,
  zValidator("json", UpdateUserRequestSchema),
  async (c) => {
    const currentUser = c.get("currentUser")!;
    const updateRequest = c.req.valid("json");
    const updatedUser = await updateUserById(currentUser.id, updateRequest);
    return c.json(updatedUser);
  }
);